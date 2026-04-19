from schemas.nikkei_core_50 import DetailedPrediction, PredictionScope
from services.predictions.base import BasePredictor, PredictionContext
from services.nikkei_core_50_store import TICKER_INFO

class SectorStubPredictor(BasePredictor):
    def predict(self, symbol: str, context: PredictionContext) -> DetailedPrediction:
        info = TICKER_INFO.get(symbol, {"name": symbol, "sector": ""})
        sector = info.get("sector", "不明")
        return DetailedPrediction(
            name=f"{sector}セクター動向（準備中）",
            scope=PredictionScope.SECTOR,
            signal="neutral",
            confidence=0.0,
            reasons=[f"{sector}全体からの予測ロジックは今後追加予定です。"]
        )
