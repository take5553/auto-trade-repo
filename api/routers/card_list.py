from fastapi import APIRouter, Depends

from schemas.card_list import Alert, Position, Summary
from services.card_list import CardListService
from services.card_list_mock import CardListMockService

router = APIRouter(prefix="/api/card-list")


def get_service() -> CardListService:
    return CardListMockService()


@router.get("/positions", response_model=list[Position])
def get_positions(service: CardListService = Depends(get_service)):
    return service.get_positions()


@router.get("/alerts", response_model=list[Alert])
def get_alerts(service: CardListService = Depends(get_service)):
    return service.get_alerts()


@router.get("/summary", response_model=Summary)
def get_summary(service: CardListService = Depends(get_service)):
    return service.get_summary()
