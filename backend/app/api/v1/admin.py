from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Request, status
from sqlalchemy import func, select

from app.core.database import DbDep
from app.core.security import CurrentUser, CurrentUserDep
from app.models.audit_log import AuditLog
from app.models.initiative import Initiative, TrangThai
from app.schemas.audit_log import AuditLogListResponse, AuditLogResponse
from app.schemas.initiative import InitiativeResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


def _require_admin(user: CurrentUser) -> None:
    """Guard clause — raises 403 if the caller is not an admin."""
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


# ── APPROVE ────────────────────────────────────────────────────────


@router.put(
    "/initiatives/{initiative_id}/approve",
    response_model=InitiativeResponse,
    response_model_by_alias=True,
)
async def approve_initiative(
    initiative_id: int,
    db: DbDep,
    user: CurrentUserDep,
    request: Request,
) -> InitiativeResponse:
    """Set initiative status to ``Đã duyệt`` and log the action."""
    _require_admin(user)

    result = await db.execute(select(Initiative).where(Initiative.id == initiative_id))
    initiative = result.scalar_one_or_none()

    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found",
        )

    initiative.trang_thai = TrangThai.DA_DUYET

    db.add(
        AuditLog(
            user_email=user.email,
            action="APPROVE_INITIATIVE",
            details=f"Approved initiative #{initiative_id}: {initiative.ten}",
            ip_address=request.client.host if request.client else None,
        )
    )

    await db.flush()
    await db.refresh(initiative)
    return InitiativeResponse.model_validate(initiative)


# ── AUDIT LOGS ─────────────────────────────────────────────────────


@router.get(
    "/logs",
    response_model=AuditLogListResponse,
    response_model_by_alias=True,
)
async def list_audit_logs(
    db: DbDep,
    user: CurrentUserDep,
    page: int = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 20,
) -> AuditLogListResponse:
    """Paginated system-log viewer (admin only)."""
    _require_admin(user)

    total = (await db.execute(select(func.count()).select_from(AuditLog))).scalar_one()

    result = await db.execute(
        select(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(result.scalars().all())

    return AuditLogListResponse(
        items=[AuditLogResponse.model_validate(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size or 1,
    )
