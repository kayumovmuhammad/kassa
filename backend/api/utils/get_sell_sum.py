from database.models.sell_models import Check
from database.models.item_models import Item
from sqlalchemy.orm import Session
from sqlalchemy import select


def get_sell_sum(check: Check, db: Session) -> dict:
    income = 0
    total = 0
    total_items: dict[str, float] = {}
    income_items: dict[str, float] = {}
    
    for item in check.items:
        item_total = item.sell_price * item.count

        total += item_total
        total_items[item.name] = total_items.get(item.name, 0) + item_total
        
        if item.item_id:
            stmt = select(Item).where(Item.id == item.item_id)
            item_db = db.scalar(stmt)
            if item_db:
                item_income = item_total - item_db.original_price * item.count
                income += item_income
                income_items[item.name] = income_items.get(item.name, 0) + item_income

    total += (total * (check.taxes / 100))

    return {
        "total": total,
        "income": income,
        "total_items": total_items,
        "income_items": income_items,
    }