from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.db import Base
from database.models.item_models import Item


class Check(Base):
    __tablename__ = "checks"
    id: Mapped[int] = mapped_column(primary_key=True)
    is_returned: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    taxes: Mapped[float] = mapped_column(default=0.0)

    items: Mapped[list["CheckItem"]] = relationship(back_populates="check")


class CheckItem(Base):
    __tablename__ = "check_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    check_id: Mapped[int | None] = mapped_column(ForeignKey("checks.id", ondelete="CASCADE"), nullable=True)
    name: Mapped[str | None] = mapped_column(nullable=True)
    item_id: Mapped[int | None] = mapped_column(ForeignKey("items.id", ondelete="SET NULL"), nullable=True)
    sell_price: Mapped[float] = mapped_column()
    count: Mapped[int] = mapped_column()

    check: Mapped["Check"] = relationship(back_populates="items")
    item: Mapped["Item"] = relationship()
