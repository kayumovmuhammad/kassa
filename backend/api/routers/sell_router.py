from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from database.get_db import get_db
from database.models.item_models import Item
from database.models.sell_models import Check, CheckItem

router = APIRouter()


class SellItemModel(BaseModel):
    item_id: int | None = None
    name: str | None = None
    count: int
    sell_price: float


class SellModel(BaseModel):
    items: list[SellItemModel]
    taxes: float = 0.0


class SellEditModel(SellModel):
    id: int


@router.post("/sell")
async def create_sell(data: SellModel, db: Session = Depends(get_db)):
    for item in data.items:
        if item.item_id is None:
            continue

        stmt = select(Item).where(Item.id == item.item_id)
        dbItem = db.scalar(stmt)

        if not dbItem:
            raise HTTPException(
                status_code=404, detail="Some of the Items doesn't exist"
            )
        elif dbItem.amount < item.count:
            raise HTTPException(
                status_code=400, detail="You can't sell more items than you have"
            )
        else:
            item.name = dbItem.name
            dbItem.amount -= item.count

    check = Check(taxes=data.taxes)

    db.add(check)
    db.flush()

    for item in data.items:
        check_item = CheckItem(
            check_id=check.id,
            name=item.name,
            item_id=item.item_id,
            count=item.count,
            sell_price=item.sell_price,
        )
        db.add(check_item)

    db.commit()

    return {"message": "OK"}


@router.get("/sell/{id}")
async def get_sell(id: int, db: Session = Depends(get_db)):
    stmt = select(Check).where(Check.id == id).options(selectinload(Check.items))
    check = db.scalar(stmt)

    if not check:
        raise HTTPException(status_code=404, detail="This id doesn't exist")

    return {"check": check}


@router.get("/sells")
async def get_all_sells(db: Session = Depends(get_db)):
    stmt = select(Check).where(~Check.is_returned).options(selectinload(Check.items))
    checks = db.scalars(stmt).all()

    return {"checks": checks}


@router.delete("/sell/{id}")
async def delete_sell(id: int, db: Session = Depends(get_db)):
    stmt = select(Check).where(Check.id == id)
    check = db.scalar(stmt)

    if not check:
        raise HTTPException(status_code=404, detail="This id doesn't exist")

    check.is_returned = True

    stmt = select(CheckItem).where(CheckItem.check_id == check.id)
    check_items = db.scalars(stmt).all()

    for check_item in check_items:
        stmt = select(Item).where(Item.id == check_item.item_id)
        item = db.scalar(stmt)
        if item:
            item.amount += check_item.count
        db.delete(check_item)

    db.commit()
    db.refresh(check)

    return {"message": "OK"}


@router.patch("/sell")
async def update_sell(data: SellEditModel, db: Session = Depends(get_db)):
    stmt = select(Check).where(Check.id == data.id)
    check = db.scalar(stmt)

    if not check:
        raise HTTPException(status_code=404, detail="This check doesn't exist")

    stmt = select(CheckItem).where(CheckItem.check_id == check.id)
    check_items = db.scalars(stmt).all()

    for check_item in check_items:
        if check_item.item_id is not None:
            stmt = select(Item).where(Item.id == check_item.item_id)
            item = db.scalar(stmt)
            if item:
                item.amount += check_item.count
        db.delete(check_item)
        
    db.flush()

    for item in data.items:
        check_item = CheckItem(
            check_id=check.id,
            name=item.name,
            item_id=item.item_id,
            count=item.count,
            sell_price=item.sell_price,
        )

        if item.item_id is not None:
            stmt = select(Item).where(Item.id == check_item.item_id)
            dbItem = db.scalar(stmt)
            if dbItem:
                if dbItem.amount < item.count:
                    db.rollback()
                    raise HTTPException(
                        status_code=400, detail="You can't sell more items than you have"
                    )
                check_item.name = dbItem.name
                dbItem.amount -= item.count
            else:
                db.rollback()
                raise HTTPException(status_code=404, detail="Some of the Items doesn't exist")

        db.add(check_item)

    check.taxes = data.taxes

    db.commit()

    return {"message": "OK"}
