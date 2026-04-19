from datetime import date, timedelta

import pandas as pd

from schemas.nikkei_core_50 import (
    IndicatorRecord,
    MarketSummary,
    OHLCVRecord,
    PredictionSignal,
    StockHistory,
    StockIndicators,
    StockPrediction,
    StockQuote,
)
from services.nikkei_core_50 import NikkeiCore50Service
from services.nikkei_core_50_store import ALL_SYMBOLS, TICKER_INFO, NikkeiDataStore


class NikkeiCore50YFinanceService(NikkeiCore50Service):

    def __init__(self) -> None:
        self._store = NikkeiDataStore()

    # ------------------------------------------------------------------
    # public
    # ------------------------------------------------------------------

    def get_quotes(self) -> list[StockQuote]:
        self._store.ensure_all()
        quotes: list[StockQuote] = []
        for symbol in ALL_SYMBOLS:
            try:
                df = self._store.get_ohlcv(symbol)
                quotes.append(self._build_quote(symbol, df))
            except Exception as e:
                print(f"[Service] {symbol} の quote 取得に失敗: {e}")
        return quotes

    def get_history(self, symbol: str, days: int = 365) -> StockHistory:
        self._store.ensure_all()
        df = self._store.get_ohlcv(symbol)
        cutoff = pd.Timestamp(date.today() - timedelta(days=days))
        df = df[df.index >= cutoff]
        info = TICKER_INFO.get(symbol, {"name": symbol, "sector": ""})
        records = [
            OHLCVRecord(
                date=str(idx.date()),
                open=round(float(row["Open"]), 2),
                high=round(float(row["High"]), 2),
                low=round(float(row["Low"]), 2),
                close=round(float(row["Close"]), 2),
                volume=int(row["Volume"]),
            )
            for idx, row in df.iterrows()
        ]
        return StockHistory(symbol=symbol, name=info["name"], records=records)

    def get_summary(self) -> MarketSummary:
        quotes = self.get_quotes()
        advances = sum(1 for q in quotes if q.change is not None and q.change > 0)
        declines = sum(1 for q in quotes if q.change is not None and q.change < 0)
        unchanged = len(quotes) - advances - declines
        return MarketSummary(
            as_of=str(date.today()),
            advances=advances,
            declines=declines,
            unchanged=unchanged,
            total_stocks=len(quotes),
        )

    def get_predictions(self) -> list[StockPrediction]:
        self._store.ensure_all()
        predictions: list[StockPrediction] = []
        for symbol in ALL_SYMBOLS:
            try:
                df = self._store.get_ohlcv(symbol)
                predictions.append(self._build_prediction(symbol, df))
            except Exception as e:
                print(f"[Service] {symbol} の prediction 取得に失敗: {e}")
        return predictions

    def get_prediction(self, symbol: str) -> StockPrediction:
        self._store.ensure_all()
        df = self._store.get_ohlcv(symbol)
        return self._build_prediction(symbol, df)

    def get_indicators(self, symbol: str, days: int = 365) -> StockIndicators:
        self._store.ensure_all()
        df = self._store.get_ohlcv(symbol)
        close = df["Close"].dropna()

        # 52週高値安値は直近252営業日で計算（表示期間に関わらず固定）
        high_52w = round(float(close.tail(252).max()), 2) if len(close) >= 252 else None
        low_52w = round(float(close.tail(252).min()), 2) if len(close) >= 252 else None

        # MA5/MA25/RSI14 は表示期間より長い範囲で計算してからカット
        buffer = max(days + 30, 300)
        close_buf = close.tail(buffer)

        ma5_series = close_buf.rolling(5).mean()
        ma25_series = close_buf.rolling(25).mean()

        delta = close_buf.diff()
        gain = delta.clip(lower=0).ewm(com=13, adjust=False).mean()
        loss = (-delta.clip(upper=0)).ewm(com=13, adjust=False).mean()
        rsi_series = (100 - (100 / (1 + gain / loss))).round(2)

        cutoff = pd.Timestamp(date.today() - timedelta(days=days))
        info = TICKER_INFO.get(symbol, {"name": symbol, "sector": ""})

        def to_records(series: pd.Series) -> list[IndicatorRecord]:
            sliced = series[series.index >= cutoff]
            return [
                IndicatorRecord(
                    date=str(idx.date()),
                    value=round(float(v), 2) if pd.notna(v) else None,
                )
                for idx, v in sliced.items()
            ]

        return StockIndicators(
            symbol=symbol,
            name=info["name"],
            ma5=to_records(ma5_series),
            ma25=to_records(ma25_series),
            rsi14=to_records(rsi_series),
            high_52w=high_52w,
            low_52w=low_52w,
        )

    # ------------------------------------------------------------------
    # private helpers
    # ------------------------------------------------------------------

    def _build_quote(self, symbol: str, df: pd.DataFrame) -> StockQuote:
        info = TICKER_INFO.get(symbol, {"name": symbol, "sector": ""})
        spark = df["Close"].dropna().tail(5).tolist()
        spark = [round(float(v), 2) for v in spark]

        if len(df) >= 2:
            price = round(float(df["Close"].iloc[-1]), 2)
            prev = round(float(df["Close"].iloc[-2]), 2)
            change = round(price - prev, 2)
            change_pct = round((price - prev) / prev * 100, 2) if prev else None
            volume = int(df["Volume"].iloc[-1])
        elif len(df) == 1:
            price = round(float(df["Close"].iloc[-1]), 2)
            change = None
            change_pct = None
            volume = int(df["Volume"].iloc[-1])
        else:
            price = change = change_pct = volume = None  # type: ignore[assignment]

        return StockQuote(
            symbol=symbol,
            name=info["name"],
            sector=info["sector"],
            price=price,
            change=change,
            change_pct=change_pct,
            volume=volume,
            spark=spark,
        )

    def _build_prediction(self, symbol: str, df: pd.DataFrame) -> StockPrediction:
        info = TICKER_INFO.get(symbol, {"name": symbol, "sector": ""})
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
                    if signal != "buy":
                        signal = "buy"
                    confidence = min(confidence + 0.15, 1.0)
                elif dead:
                    reasons.append("5MA が 25MA をデッドクロス")
                    if signal != "sell":
                        signal = "sell"
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

        return StockPrediction(
            symbol=symbol,
            name=info["name"],
            sector=info["sector"],
            signal=signal,
            confidence=confidence,
            reasons=reasons if reasons else ["有効な判断材料なし"],
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
