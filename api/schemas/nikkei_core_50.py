from typing import Literal

from pydantic import BaseModel


PredictionSignal = Literal["buy", "sell", "neutral"]


class StockQuote(BaseModel):
    symbol: str
    name: str
    sector: str
    price: float | None
    change: float | None
    change_pct: float | None
    volume: int | None
    spark: list[float]


class OHLCVRecord(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockHistory(BaseModel):
    symbol: str
    name: str
    records: list[OHLCVRecord]


class MarketSummary(BaseModel):
    as_of: str
    advances: int
    declines: int
    unchanged: int
    total_stocks: int


class StockPrediction(BaseModel):
    symbol: str
    name: str
    sector: str
    signal: PredictionSignal
    confidence: float
    reasons: list[str]
