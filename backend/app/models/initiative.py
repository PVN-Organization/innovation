import datetime
import enum

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class LinhVuc(str, enum.Enum):
    """Maps to frontend ``type Field``."""

    CONG_NGHE = "Công nghệ"
    QUY_TRINH = "Quy trình"
    AN_TOAN = "An toàn"
    MOI_TRUONG = "Môi trường"
    KHAC = "Khác"


class TrangThai(str, enum.Enum):
    """Maps to frontend ``type Status``."""

    CHO_DUYET = "Chờ duyệt"
    DA_DUYET = "Đã duyệt"


class Initiative(TimestampMixin, Base):
    """Core domain model — maps 1-to-1 with the frontend ``Initiative`` type.

    Frontend key mapping (camelCase → snake_case):
        linhVuc   → linh_vuc     dongTacGia → dong_tac_gia
        tacGia    → tac_gia      donVi      → don_vi
        tomTat    → tom_tat      hieuQua    → hieu_qua
        quanTam   → quan_tam     trangThai  → trang_thai
        giaiThuong→ giai_thuong  ngayNop    → ngay_nop
    """

    __tablename__ = "initiatives"

    ten: Mapped[str] = mapped_column(String(500))
    linh_vuc: Mapped[LinhVuc]
    tac_gia: Mapped[str] = mapped_column(String(255))
    dong_tac_gia: Mapped[str] = mapped_column(String(500), default="")
    danh_sach_tac_gia: Mapped[str] = mapped_column(Text, default="")
    don_vi: Mapped[str] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, default=None)
    thoi_gian: Mapped[str] = mapped_column(Text, default="")
    ly_do: Mapped[str] = mapped_column(Text, default="")
    muc_tieu: Mapped[str] = mapped_column(Text, default="")
    thuc_trang: Mapped[str] = mapped_column(Text, default="")
    giai_phap: Mapped[str] = mapped_column(Text, default="")
    cach_thuc: Mapped[str] = mapped_column(Text, default="")
    tom_tat: Mapped[str] = mapped_column(Text, default="")
    hieu_qua: Mapped[str] = mapped_column(Text, default="")
    tinh_moi: Mapped[str] = mapped_column(Text, default="")
    nhan_rong: Mapped[str] = mapped_column(Text, default="")
    quan_tam: Mapped[int] = mapped_column(Integer, default=0)
    trang_thai: Mapped[TrangThai] = mapped_column(default=TrangThai.CHO_DUYET)
    diem: Mapped[int] = mapped_column(Integer, default=0)
    giai_thuong: Mapped[str] = mapped_column(String(255), default="Chờ xét chọn")
    ngay_nop: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
