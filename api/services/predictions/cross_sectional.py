from schemas.nikkei_core_50 import DetailedPrediction, PredictionScope
from services.predictions.base import BasePredictor, PredictionContext

class CrossSectionalStubPredictor(BasePredictor):
    def predict(self, symbol: str, context: PredictionContext) -> DetailedPrediction:
        return DetailedPrediction(
            name="相対モメンタム検証（準備中）",
            scope=PredictionScope.CROSS_SECTIONAL,
            signal="neutral",
            confidence=0.0,
            reasons=["他銘柄との比較ロジックは今後追加予定です。"]
        )
