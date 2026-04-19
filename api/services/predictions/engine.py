from schemas.nikkei_core_50 import StockPrediction, DetailedPrediction
from services.nikkei_core_50_store import NikkeiDataStore, TICKER_INFO
from services.predictions.base import BasePredictor, PredictionContext
from services.predictions.individual import TechnicalPredictor
from services.predictions.cross_sectional import CrossSectionalStubPredictor
from services.predictions.sector import SectorStubPredictor
from services.predictions.market import MarketStubPredictor

class PredictionEngine:
    def __init__(self, store: NikkeiDataStore):
        self._store = store
        self._predictors: list[BasePredictor] = [
            TechnicalPredictor(),
            CrossSectionalStubPredictor(),
            SectorStubPredictor(),
            MarketStubPredictor(),
        ]

    def build_prediction(self, symbol: str) -> StockPrediction:
        context = PredictionContext(self._store)
        details: list[DetailedPrediction] = []
        for predictor in self._predictors:
            try:
                detail = predictor.predict(symbol, context)
                details.append(detail)
            except Exception as e:
                print(f"[Engine] Predictor error for {symbol} ({type(predictor).__name__}): {e}")

        info = TICKER_INFO.get(symbol, {"name": symbol, "sector": "Unknown"})
        return StockPrediction(
            symbol=symbol,
            name=info["name"],
            sector=info["sector"],
            details=details,
        )
