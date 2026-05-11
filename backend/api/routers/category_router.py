from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from api.config import Config
from database.db import SessionLocal
from database.get_db import get_db
from database.models.category_models import Category
from database.models.item_models import Item

router = APIRouter()


def init_all_category():
    db = SessionLocal()
    config = Config()
    all_id = config.ALL_CATEGORY_ID

    stmt = select(Category).where(Category.id == all_id)
    all_category = db.scalar(stmt)

    if not all_category:
        all_category = Category(id=all_id, name="Все")
        db.add(all_category)
        db.commit()


class CategoryModel(BaseModel):
    name: str
    parent_id: int


class CategoryWithIDModel(CategoryModel):
    id: int

@router.get("/categories")
async def get_all_categories(db: Session = Depends(get_db)):
    config = Config()
    all_id = config.ALL_CATEGORY_ID

    stmt = select(Category)
    all_categories = db.scalars(stmt).all()

    categories_by_id = {cat.id: {"id": cat.id, "name": cat.name, "children": []} for cat in all_categories}

    root_category = None
    for cat in all_categories:
        if cat.id == all_id:
            root_category = categories_by_id[cat.id]
        if cat.parent_id and cat.parent_id in categories_by_id:
            categories_by_id[cat.parent_id]["children"].append(categories_by_id[cat.id])

    if not root_category:
        raise HTTPException(status_code=404, detail="All category doesn't exist")

    return root_category


@router.post("/category")
async def create_category(data: CategoryModel, db: Session = Depends(get_db)):
    category = Category(name=data.name, parent_id=data.parent_id)
    db.add(category)
    db.commit()
    db.refresh(category)

    return {"message": "OK", "category": category}


@router.get("/category/{id}")
async def get_category(id: int, db: Session = Depends(get_db)):
    stmt = select(Category).where(Category.id == id)
    category = db.scalar(stmt)

    if not category:
        raise HTTPException(status_code=404, detail="This id doesn't exist")

    return {"message": "OK", "category": category}


@router.delete("/category/{id}")
async def delete_category(id: int, db: Session = Depends(get_db)):
    stmt = select(Category).where(Category.id == id)
    category = db.scalar(stmt)

    if not category:
        raise HTTPException(status_code=404, detail="This id doesn't exist")

    stmt_items = select(Item).where(Item.category_id == id).limit(1)
    if db.scalar(stmt_items):
        raise HTTPException(status_code=400, detail="Cannot delete category because it contains items")

    stmt_children = select(Category).where(Category.parent_id == id).limit(1)
    if db.scalar(stmt_children):
        raise HTTPException(status_code=400, detail="Cannot delete category because it contains subcategories")

    db.delete(category)
    db.commit()

    return {"message": "OK"}
