import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class AuditLogResponse(BaseModel):
    """DTO for the admin dashboard system-log viewer."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
    )

    id: int
    user_email: str
    action: str
    details: str | None = None
    ip_address: str | None = None
    timestamp: datetime.datetime


class AuditLogListResponse(BaseModel):
    """Paginated list wrapper for admin log viewer."""

    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
    )

    items: list[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
