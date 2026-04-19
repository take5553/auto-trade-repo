import pandas as pd

from schemas.nikkei_core_50 import DetailedPrediction, PredictionScope, PredictionSignal
from services.nikkei_core_50_store import TICKER_INFO
from services.predictions.base import BasePredictor, PredictionContext
from services.sector_etf_store import SectorEtfStore


class SectorRelativeStrengthPredictor(BasePredictor):
    """
    レシオチャート（銘柄終値 / セクターETF終値）を用いたレラティブ・ストレングス予測。

    シグナル生成の4指標:
      1. レシオ MA5/MA25 ゴールデン・デッドクロス（転換点シグナル）
      2. レシオ MA5 vs MA25 のトレンド方向（継続シグナル）
      3. 20日レシオ変化率（相対モメンタム）
      4. 60日Zスコア（過熱・売られすぎ判定）

    信頼度の算出:
      - ベース 0.5 から加算方式
      - クロス発生時: +0.25、トレンド継続: +0.10
      - モメンタム確認で同方向: +0.10
      - Zスコア極値が逆方向シグナルの場合: -0.10
    """

    def __init__(self, etf_store: SectorEtfStore) -> None:
        self._etf_store = etf_store

    def predict(self, symbol: str, context: PredictionContext) -> DetailedPrediction:
        info = TICKER_INFO.get(symbol, {"name": symbol, "sector": ""})
        sector = info.get("sector", "")
        etf_ticker = self._etf_store.get_etf_ticker(sector)

        if etf_ticker is None:
            return DetailedPrediction(
                name="セクター相対強度（レシオチャート）",
                scope=PredictionScope.SECTOR,
                signal="neutral",
                confidence=0.0,
                reasons=[f"セクター「{sector}」に対応するETFが未登録です。"],
            )

        context.store.ensure_all()
        self._etf_store.ensure_all()

        stock_df = context.store.get_ohlcv(symbol)
        etf_df = self._etf_store.get_ohlcv(etf_ticker)

        ratio = self._calc_ratio(stock_df["Close"], etf_df["Close"])

        if len(ratio) < 26:
            return DetailedPrediction(
                name="セクター相対強度（レシオチャート）",
                scope=PredictionScope.SECTOR,
                signal="neutral",
                confidence=0.0,
                reasons=["レシオ算出に必要なデータが不足しています（最低26営業日分が必要）。"],
            )

        etf_name = f"{etf_ticker}"
        signal, confidence, reasons = self._analyze(ratio, sector, etf_name)

        return DetailedPrediction(
            name="セクター相対強度（レシオチャート）",
            scope=PredictionScope.SECTOR,
            signal=signal,
            confidence=confidence,
            reasons=reasons,
        )

    @staticmethod
    def _calc_ratio(stock_close: pd.Series, etf_close: pd.Series) -> pd.Series:
        """日付を内部結合し、銘柄終値 / ETF終値 の比率系列を返す（最大100営業日分）。"""
        aligned = pd.concat(
            [stock_close.rename("stock"), etf_close.rename("etf")],
            axis=1,
            join="inner",
        ).dropna()
        ratio = aligned["stock"] / aligned["etf"]
        return ratio.tail(100)

    def _analyze(
        self, ratio: pd.Series, sector: str, etf_ticker: str
    ) -> tuple[PredictionSignal, float, list[str]]:
        signal: PredictionSignal = "neutral"
        confidence = 0.5
        reasons: list[str] = []

        ma5 = ratio.rolling(5).mean()
        ma25 = ratio.rolling(25).mean()
        curr_ma5 = float(ma5.iloc[-1])
        curr_ma25 = float(ma25.iloc[-1])
        prev_ma5 = float(ma5.iloc[-2])
        prev_ma25 = float(ma25.iloc[-2])

        # ① ゴールデン・デッドクロス（最優先シグナル）
        golden = prev_ma5 < prev_ma25 and curr_ma5 >= curr_ma25
        dead = prev_ma5 > prev_ma25 and curr_ma5 <= curr_ma25

        if golden:
            signal = "buy"
            confidence += 0.25
            reasons.append(
                f"レシオMA5がMA25をゴールデンクロス → {sector}ETFに対しアウトパフォームへ転換"
            )
        elif dead:
            signal = "sell"
            confidence += 0.25
            reasons.append(
                f"レシオMA5がMA25をデッドクロス → {sector}ETFに対しアンダーパフォームへ転換"
            )
        # ② トレンド継続
        elif curr_ma5 > curr_ma25:
            signal = "buy"
            confidence += 0.10
            reasons.append(
                f"レシオMA5({curr_ma5:.4f}) > MA25({curr_ma25:.4f})："
                f"{sector}ETFに対してアウトパフォーム継続中"
            )
        else:
            signal = "sell"
            confidence += 0.10
            reasons.append(
                f"レシオMA5({curr_ma5:.4f}) < MA25({curr_ma25:.4f})："
                f"{sector}ETFに対してアンダーパフォーム継続中"
            )

        # ③ 20日レシオ変化率（モメンタム）
        if len(ratio) >= 21:
            roc_20 = (float(ratio.iloc[-1]) / float(ratio.iloc[-21]) - 1) * 100
            if roc_20 > 3.0:
                reasons.append(f"20日レシオ変化率 +{roc_20:.1f}%：相対モメンタム良好")
                if signal == "buy":
                    confidence += 0.10
            elif roc_20 < -3.0:
                reasons.append(f"20日レシオ変化率 {roc_20:.1f}%：相対モメンタム悪化")
                if signal == "sell":
                    confidence += 0.10
            else:
                reasons.append(f"20日レシオ変化率 {roc_20:+.1f}%（横ばい圏）")

        # ④ 60日Zスコア（過熱・売られすぎ判定）
        if len(ratio) >= 60:
            window = ratio.tail(60)
            mean = float(window.mean())
            std = float(window.std())
            if std > 0:
                z = (float(ratio.iloc[-1]) - mean) / std
                if z > 2.0:
                    reasons.append(
                        f"レシオZスコア={z:.2f}：短期的に過熱（平均回帰に注意）"
                    )
                    # 買いシグナルに対して過熱は割引
                    if signal == "buy":
                        confidence -= 0.10
                elif z < -2.0:
                    reasons.append(
                        f"レシオZスコア={z:.2f}：短期的に売られすぎ（反発余地あり）"
                    )
                    # 売りシグナルに対して売られすぎは割引
                    if signal == "sell":
                        confidence -= 0.10
                else:
                    reasons.append(f"レシオZスコア={z:.2f}（正常範囲）")

        confidence = round(min(max(confidence, 0.0), 1.0), 2)
        return signal, confidence, reasons
