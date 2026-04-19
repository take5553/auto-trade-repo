from abc import ABC, abstractmethod

from schemas.nikkei_core_50 import MarketSummary, StockHistory, StockIndicators, StockPrediction, StockQuote


class NikkeiCore50Service(ABC):

    @abstractmethod
    def get_quotes(self) -> list[StockQuote]: ...

    @abstractmethod
    def get_history(self, symbol: str, days: int = 365) -> StockHistory: ...

    @abstractmethod
    def get_summary(self) -> MarketSummary: ...

    @abstractmethod
    def get_predictions(self) -> list[StockPrediction]: ...

    @abstractmethod
    def get_prediction(self, symbol: str) -> StockPrediction: ...

    @abstractmethod
    def get_indicators(self, symbol: str, days: int = 365) -> StockIndicators: ...
