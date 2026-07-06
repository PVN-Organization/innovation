import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class File(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    initiative_id: Mapped[int] = mapped_column(
        ForeignKey("initiatives.id", ondelete="CASCADE"),
    )
    file_name: Mapped[str] = mapped_column(String(500))
    minio_object_name: Mapped[str] = mapped_column(String(500))
    file_size: Mapped[int] = mapped_column(BigInteger, default=0)
    uploaded_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
