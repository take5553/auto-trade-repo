from abc import ABC, abstractmethod

from schemas.card_list import Alert, Position, Summary


class CardListService(ABC):

    @abstractmethod
    def get_positions(self) -> list[Position]:
        ...

    @abstractmethod
    def get_alerts(self) -> list[Alert]:
        ...

    @abstractmethod
    def get_summary(self) -> Summary:
        ...
