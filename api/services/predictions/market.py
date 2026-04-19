from schemas.nikkei_core_50 import DetailedPrediction, PredictionScope
from services.predictions.base import BasePredictor, PredictionContext

class MarketStubPredictor(BasePredictor):
    def predict(self, symbol: str, context: PredictionContext) -> DetailedPrediction:
        return DetailedPrediction(
            name="日経全体モメンタム（準備中）",
            scope=PredictionScope.MARKET,
            signal="neutral",
            confidence=0.0,
            reasons=["市場全体からの予測ロジックは今後追加予定です。"]
        )
