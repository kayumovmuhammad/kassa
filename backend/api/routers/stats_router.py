from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, extract, and_, or_
from sqlalchemy.orm import Session
from datetime import date
from typing import Literal
from sqlalchemy import func

from api.config import Config
from database.get_db import get_db
from database.models.category_models import Category
from database.models.item_models import Item
from database.models.sell_models import Check, CheckItem
from api.utils.get_sell_sum import get_sell_sum

router = APIRouter()


class SummaryStatsModel(BaseModel):
    start_date: date = date.today()
    end_date: date = date.today()
    point_type: Literal["daily", "monthly", "yearly"] = "daily"

class SummaryAnswerModel(BaseModel):
    total_sell_money: dict[str, float] = {}
    total_income_money: dict[str, float] = {}
    check_count: dict[str, int] = {}
    most_sell_items: dict[str, float] = {}
    most_income_items: dict[str, float] = {}


def get_sells_between(start: date, end: date, point_type: Literal["daily", "monthly", "yearly"], db: Session):
    stmt = select(Check).where(
        extract('year', Check.created_at) >= start.year,
        extract('year', Check.created_at) <= end.year,
        Check.is_returned == False,
    )
    if (point_type == "monthly"):
        stmt = stmt.where(
            extract('year', Check.created_at) * 12 + extract('month', Check.created_at) >= start.year * 12 + start.month,
            extract('year', Check.created_at) * 12 + extract('month', Check.created_at) <= end.year * 12 + end.month,
            Check.is_returned == False,
        )
    elif (point_type == "daily"):
        stmt = stmt.where(
            func.date(Check.created_at) >= start,
            func.date(Check.created_at) <= end,
            Check.is_returned == False,
        )

    sells = db.scalars(stmt).all()
    return sells

def get_time_point(created_at: date, point_type: Literal["daily", "monthly", "yearly"]):
    if point_type == "daily":
        return created_at.strftime("%Y-%m-%d")
    elif point_type == "monthly":
        return created_at.strftime("%Y-%m")
    elif point_type == "yearly":
        return created_at.strftime("%Y")

@router.post("/calc/summary")
async def get_summary(data: SummaryStatsModel, db: Session = Depends(get_db)):
    answer: SummaryAnswerModel = SummaryAnswerModel()
    
    sells = get_sells_between(data.start_date, data.end_date, data.point_type, db)

    for sell in sells:
        time_point = get_time_point(sell.created_at, data.point_type)
        sum = get_sell_sum(sell, db)
        total = sum["total"]
        income = sum["income"]
        total_items = sum["total_items"]
        income_items = sum["income_items"]

        answer.total_sell_money[time_point] = answer.total_sell_money.get(time_point, 0.0) + total
        answer.total_income_money[time_point] = answer.total_income_money.get(time_point, 0.0) + income
        answer.check_count[time_point] = answer.check_count.get(time_point, 0) + 1

        for item_name, item_money in total_items.items():
            answer.most_sell_items[item_name] = answer.most_sell_items.get(item_name, 0.0) + item_money
        for item_name, item_money in income_items.items():
            answer.most_income_items[item_name] = answer.most_income_items.get(item_name, 0.0) + item_money

    return answer
