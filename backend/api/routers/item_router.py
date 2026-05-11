from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from api.config import Config
from database.get_db import get_db
from database.models.category_models import Category
from database.models.item_models import Item

router = APIRouter(prefix="/item")


class ItemModel(BaseModel):
    id: int | None = None
    name: str
    category_id: int
    description: str
    image_urls: list[str]
    image_preview_urls: list[str]
    original_price: float
    amount: int


@router.get("/by/category/{id}")
async def get_item_by_category_or_all(
    id: int, page: int = 0, config: Config = Depends(Config), db: Session = Depends(get_db)
):
    page_count = config.PAGE_COUNT
    page = max(1, page)
    
    stmt = select(Category)
    all_categories = db.scalars(stmt).all()

    children_map: dict[int, list[int]] = {}
    category_exists = False
    for cat in all_categories:
        if cat.id == id:
            category_exists = True
        if cat.parent_id is not None:
            if cat.parent_id not in children_map:
                children_map[cat.parent_id] = []
            children_map[cat.parent_id].append(cat.id)

    if not category_exists:
        raise HTTPException(status_code=404, detail="This category doesn't exist")

    valid_ids = []
    stack = [id]
    while stack:
        current = stack.pop()
        valid_ids.append(current)
        stack.extend(children_map.get(current, []))

    offset_value = (page - 1) * page_count

    stmt = (
        select(Item)
        .where(Item.category_id.in_(valid_ids))
        .offset(offset_value)
        .limit(page_count)
    )
    items = db.scalars(stmt).all()

    # if len(items) == 0 or page <= 0:
    #     raise HTTPException(status_code=404, detail="There aren't items")

    return items


@router.get("/all")
async def get_all_items(db: Session = Depends(get_db)):
    stmt = select(Item)
    items = db.scalars(stmt).all()
    return items


@router.post("")
async def create_item(data: ItemModel, db: Session = Depends(get_db)):
    stmt = select(Category).where(Category.id == data.category_id)
    category = db.scalar(stmt)

    if not category:
        raise HTTPException(status_code=404, detail="This category doesn't exist")

    item = Item(
        id=data.id,
        name=data.name,
        category_id=data.category_id,
        description=data.description,
        image_urls=data.image_urls,
        image_preview_urls=data.image_preview_urls,
        original_price=data.original_price,
        amount=data.amount,
    )
    try:
        db.add(item)
        db.commit()
        db.refresh(item)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=404, detail="This id is already used")

    return {"Message": "OK", "item": item}


@router.get("/{id}")
async def get_item(id: int, db: Session = Depends(get_db)):
    stmt = select(Item).where(Item.id == id)
    item = db.scalar(stmt)

    if not item:
        raise HTTPException(status_code=404, detail="Item doesn't exist")

    return {"message": "OK", "item": item}


@router.patch("")
async def update_item(data: ItemModel, db: Session = Depends(get_db)):
    stmt = select(Item).where(Item.id == data.id)
    item = db.scalar(stmt)

    if not item:
        raise HTTPException(status_code=404, detail="Item doesn't exist")

    stmt_cat = select(Category).where(Category.id == data.category_id)
    category = db.scalar(stmt_cat)
    if not category:
        raise HTTPException(status_code=400, detail="This category doesn't exist")

    item.name = data.name
    item.description = data.description
    item.category_id = data.category_id
    item.image_urls = data.image_urls
    item.image_preview_urls = data.image_preview_urls
    item.original_price = data.original_price
    item.amount = data.amount

    db.commit()
    db.refresh(item)

    return {"message": "OK", "item": item}


@router.delete("/{id}")
async def delete_item(id: int, db: Session = Depends(get_db)):
    stmt = select(Item).where(Item.id == id)
    item = db.scalar(stmt)

    if not item:
        raise HTTPException(status_code=404, detail="Item doesn't exist")

    db.delete(item)
    db.commit()

    return {"message": "OK"}
