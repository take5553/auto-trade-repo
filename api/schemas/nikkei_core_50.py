from enum import Enum
from typing import Literal

from pydantic import BaseModel


PredictionSignal = Literal["buy", "sell", "neutral"]


class PredictionScope(str, Enum):
    INDIVIDUAL = "individual"
    CROSS_SECTIONAL = "cross_sectional"
    SECTOR = "sector"
    MARKET = "market"


class DetailedPrediction(BaseModel):
    name: str
    scope: PredictionScope
    signal: PredictionSignal
    confidence: float
    reasons: list[str]


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
    details: list[DetailedPrediction]


class IndicatorRecord(BaseModel):
    date: str
    value: float | None


class StockIndicators(BaseModel):
    symbol: str
    name: str
    ma5: list[IndicatorRecord]
    ma25: list[IndicatorRecord]
    rsi14: list[IndicatorRecord]
    high_52w: float | None
    low_52w: float | None
