from abc import ABC, abstractmethod


class CardListService(ABC):

    @abstractmethod
    def get_positions(self) -> list[dict]:
        ...

    @abstractmethod
    def get_alerts(self) -> list[dict]:
        ...

    @abstractmethod
    def get_summary(self) -> dict:
        ...
