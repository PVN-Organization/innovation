import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.models.initiative import LinhVuc, TrangThai


class InitiativeCreate(BaseModel):
    """DTO for ``POST /api/v1/initiatives`` — accepts frontend camelCase keys."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
    )

    ten: str = Field(min_length=1, max_length=500)
    linh_vuc: LinhVuc
    tac_gia: str = Field(min_length=1, max_length=255)
    dong_tac_gia: str = Field(default="", max_length=500)
    don_vi: str = Field(min_length=1, max_length=255)
    email: str | None = Field(default=None, max_length=255)
    tom_tat: str = Field(min_length=1)
    hieu_qua: str = Field(min_length=1)


class InitiativeUpdate(BaseModel):
    """DTO for ``PUT /api/v1/initiatives/{id}`` — partial update."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
    )

    ten: str | None = Field(default=None, max_length=500)
    linh_vuc: LinhVuc | None = None
    tac_gia: str | None = Field(default=None, max_length=255)
    dong_tac_gia: str | None = Field(default=None, max_length=500)
    don_vi: str | None = Field(default=None, max_length=255)
    tom_tat: str | None = None
    hieu_qua: str | None = None
    trang_thai: TrangThai | None = None
    diem: int | None = None
    giai_thuong: str | None = Field(default=None, max_length=255)


class InitiativeResponse(BaseModel):
    """DTO returned to frontend — serialises with camelCase aliases."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
    )

    id: int
    ten: str
    linh_vuc: LinhVuc
    tac_gia: str
    dong_tac_gia: str
    don_vi: str
    email: str | None = None
    tom_tat: str
    hieu_qua: str
    quan_tam: int
    trang_thai: TrangThai
    diem: int
    giai_thuong: str
    ngay_nop: datetime.datetime
    created_at: datetime.datetime
    updated_at: datetime.datetime


class InitiativeListResponse(BaseModel):
    """Paginated list wrapper."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
    )

    items: list[InitiativeResponse]
    total: int
    page: int
    page_size: int = Field(alias="pageSize")
    total_pages: int
