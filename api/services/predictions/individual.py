import pandas as pd
from schemas.nikkei_core_50 import DetailedPrediction, PredictionScope, PredictionSignal
from services.predictions.base import BasePredictor, PredictionContext


class TechnicalPredictor(BasePredictor):
    def predict(self, symbol: str, context: PredictionContext) -> DetailedPrediction:
        context.store.ensure_all()
        df = context.store.get_ohlcv(symbol)
        close = df["Close"].dropna()

        signal: PredictionSignal = "neutral"
        confidence = 0.5
        reasons: list[str] = []

        # RSI (14日)
        rsi = self._calc_rsi(close, 14)
        if rsi is not None:
            if rsi < 30:
                reasons.append(f"RSI={rsi:.1f}（売られすぎ）")
                signal = "buy"
                confidence += 0.2
            elif rsi > 70:
                reasons.append(f"RSI={rsi:.1f}（買われすぎ）")
                signal = "sell"
                confidence += 0.2
            else:
                reasons.append(f"RSI={rsi:.1f}（中立圏）")

        # 5日MA vs 25日MA ゴールデン/デッドクロス
        if len(close) >= 25:
            ma5 = float(close.tail(5).mean())
            ma25 = float(close.tail(25).mean())
            ma5_prev = float(close.iloc[-6:-1].mean()) if len(close) >= 26 else None
            ma25_prev = float(close.iloc[-26:-1].mean()) if len(close) >= 26 else None

            if ma5_prev is not None and ma25_prev is not None:
                golden = ma5_prev < ma25_prev and ma5 >= ma25
                dead = ma5_prev > ma25_prev and ma5 <= ma25
                if golden:
                    reasons.append("5MA が 25MA をゴールデンクロス")
                    signal = "buy"  # 強いシグナルで上書き
                    confidence = min(confidence + 0.15, 1.0)
                elif dead:
                    reasons.append("5MA が 25MA をデッドクロス")
                    signal = "sell" # 強いシグナルで上書き
                    confidence = min(confidence + 0.15, 1.0)
                elif ma5 > ma25:
                    reasons.append(f"5MA({ma5:.0f}) > 25MA({ma25:.0f})（上昇トレンド）")
                else:
                    reasons.append(f"5MA({ma5:.0f}) < 25MA({ma25:.0f})（下降トレンド）")

        # 52週高値・安値からの乖離
        if len(close) >= 252:
            high_52w = float(close.tail(252).max())
            low_52w = float(close.tail(252).min())
            current = float(close.iloc[-1])
            dist_from_high = (current - high_52w) / high_52w * 100
            dist_from_low = (current - low_52w) / low_52w * 100
            if dist_from_high > -5:
                reasons.append(f"52週高値付近（乖離 {dist_from_high:.1f}%）")
            elif dist_from_low < 10:
                reasons.append(f"52週安値付近（安値から +{dist_from_low:.1f}%）")

        confidence = round(min(max(confidence, 0.0), 1.0), 2)
        if not reasons:
            reasons.append("有効な判断材料なし")

        return DetailedPrediction(
            name="テクニカル基本指標",
            scope=PredictionScope.INDIVIDUAL,
            signal=signal,
            confidence=confidence,
            reasons=reasons,
        )

    @staticmethod
    def _calc_rsi(close: pd.Series, period: int = 14) -> float | None:
        if len(close) < period + 1:
            return None
        delta = close.diff().dropna()
        gain = delta.clip(lower=0).ewm(com=period - 1, adjust=False).mean()
        loss = (-delta.clip(upper=0)).ewm(com=period - 1, adjust=False).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return round(float(rsi.iloc[-1]), 2)
