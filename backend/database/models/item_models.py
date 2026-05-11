from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from database.db import Base


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    image_urls: Mapped[list] = mapped_column(JSON, default=list)
    image_preview_urls: Mapped[list] = mapped_column(JSON, default=list)
    description: Mapped[str] = mapped_column()
    original_price: Mapped[float] = mapped_column()
    amount: Mapped[int] = mapped_column()
