from typing import Literal

from pydantic import BaseModel


Side = Literal["long", "short"]
AlertLevel = Literal["danger", "warn", "info"]


class Position(BaseModel):
    id: int
    symbol: str
    side: Side
    size: str
    entry: str
    mark: str
    pnl: str
    pct: str
    duration: str
    spark: list[float]


class Alert(BaseModel):
    level: AlertLevel
    icon: str
    title: str
    desc: str
    time: str


class Summary(BaseModel):
    totalPnl: str
    totalPnlPct: str
    openPositions: int
    winRate: str
    equity: str
