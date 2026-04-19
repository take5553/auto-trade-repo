from datetime import date, timedelta

import pandas as pd

from schemas.nikkei_core_50 import (
    IndicatorRecord,
    MarketSummary,
    OHLCVRecord,
    StockHistory,
    StockIndicators,
    StockPrediction,
    StockQuote,
)
from services.nikkei_core_50 import NikkeiCore50Service
from services.nikkei_core_50_store import ALL_SYMBOLS, TICKER_INFO, NikkeiDataStore
from services.predictions.engine import PredictionEngine


class NikkeiCore50YFinanceService(NikkeiCore50Service):

    def __init__(self) -> None:
        self._store = NikkeiDataStore()
        self._engine = PredictionEngine(self._store)

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
                predictions.append(self._engine.build_prediction(symbol))
            except Exception as e:
                print(f"[Service] {symbol} の prediction 取得に失敗: {e}")
        return predictions

    def get_prediction(self, symbol: str) -> StockPrediction:
        self._store.ensure_all()
        return self._engine.build_prediction(symbol)

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


