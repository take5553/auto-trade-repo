from fastapi import APIRouter, Depends, HTTPException, Query

from schemas.nikkei_core_50 import MarketSummary, StockHistory, StockPrediction, StockQuote
from services.nikkei_core_50 import NikkeiCore50Service
from services.nikkei_core_50_store import ALL_SYMBOLS
from services.nikkei_core_50_yfinance import NikkeiCore50YFinanceService

router = APIRouter(prefix="/api/nikkei-core-50")

_service: NikkeiCore50YFinanceService | None = None


def get_service() -> NikkeiCore50Service:
    global _service
    if _service is None:
        _service = NikkeiCore50YFinanceService()
    return _service


@router.get("/quotes", response_model=list[StockQuote])
def get_quotes(service: NikkeiCore50Service = Depends(get_service)):
    return service.get_quotes()


@router.get("/summary", response_model=MarketSummary)
def get_summary(service: NikkeiCore50Service = Depends(get_service)):
    return service.get_summary()


@router.get("/predictions", response_model=list[StockPrediction])
def get_predictions(service: NikkeiCore50Service = Depends(get_service)):
    return service.get_predictions()


@router.get("/stocks/{symbol}/history", response_model=StockHistory)
def get_history(
    symbol: str,
    days: int = Query(default=365, ge=1, le=1825),
    service: NikkeiCore50Service = Depends(get_service),
):
    if symbol not in ALL_SYMBOLS:
        raise HTTPException(status_code=404, detail=f"銘柄 {symbol} は対象外です")
    return service.get_history(symbol, days)


@router.get("/stocks/{symbol}/prediction", response_model=StockPrediction)
def get_prediction(
    symbol: str,
    service: NikkeiCore50Service = Depends(get_service),
):
    if symbol not in ALL_SYMBOLS:
        raise HTTPException(status_code=404, detail=f"銘柄 {symbol} は対象外です")
    return service.get_prediction(symbol)
