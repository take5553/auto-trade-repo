from abc import ABC, abstractmethod
from typing import Any

from schemas.nikkei_core_50 import DetailedPrediction
from services.nikkei_core_50_store import NikkeiDataStore


class PredictionContext:
    def __init__(self, store: NikkeiDataStore):
        self.store = store
        self._cache: dict[str, Any] = {}

    def get_cache(self, key: str) -> Any:
        return self._cache.get(key)

    def set_cache(self, key: str, value: Any) -> None:
        self._cache[key] = value


class BasePredictor(ABC):
    @abstractmethod
    def predict(self, symbol: str, context: PredictionContext) -> DetailedPrediction:
        """指定された銘柄に対する予測結果を返す"""
        pass
