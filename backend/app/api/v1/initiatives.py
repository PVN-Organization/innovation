from typing import Annotated

from fastapi import (
    APIRouter,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import Response
from loguru import logger
from sqlalchemy import func, select, update

from app.core.config import settings
from app.core.database import DbDep
from app.core.security import CurrentUserDep
from app.models.audit_log import AuditLog
from app.models.file import File as FileModel
from app.models.initiative import Initiative, LinhVuc, TrangThai
from app.schemas.initiative import InitiativeListResponse, InitiativeResponse
from app.services.docx_service import generate_initiative_docx, generate_preview_docx
from app.services.minio_service import minio_service

router = APIRouter(prefix="/initiatives", tags=["Initiatives"])


# ── CREATE ─────────────────────────────────────────────────────────


@router.post(
    "/",
    response_model=InitiativeResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_initiative(
    db: DbDep,
    user: CurrentUserDep,
    request: Request,
    ten: Annotated[str, Form()],
    linh_vuc: Annotated[LinhVuc, Form(alias="linhVuc")],
    tac_gia: Annotated[str, Form(alias="tacGia")],
    don_vi: Annotated[str, Form(alias="donVi")],
    ly_do: Annotated[str, Form(alias="lyDo")],
    muc_tieu: Annotated[str, Form(alias="mucTieu")],
    thuc_trang: Annotated[str, Form(alias="thucTrang")],
    giai_phap: Annotated[str, Form(alias="giaiPhap")],
    cach_thuc: Annotated[str, Form(alias="cachThuc")],
    hieu_qua: Annotated[str, Form(alias="hieuQua")],
    dong_tac_gia: Annotated[str, Form(alias="dongTacGia")] = "",
    danh_sach_tac_gia: Annotated[str, Form(alias="danhSachTacGia")] = "",
    email: Annotated[str | None, Form()] = None,
    thoi_gian: Annotated[str, Form(alias="thoiGian")] = "",
    tom_tat: Annotated[str, Form(alias="tomTat")] = "",
    tinh_moi: Annotated[str, Form(alias="tinhMoi")] = "",
    nhan_rong: Annotated[str, Form(alias="nhanRong")] = "",
    file: UploadFile | None = None,
) -> InitiativeResponse:
    """Create a new initiative with optional file attachment."""
    initiative = Initiative(
        ten=ten,
        linh_vuc=linh_vuc,
        tac_gia=tac_gia,
        dong_tac_gia=dong_tac_gia,
        danh_sach_tac_gia=danh_sach_tac_gia,
        don_vi=don_vi,
        email=email,
        thoi_gian=thoi_gian,
        ly_do=ly_do,
        muc_tieu=muc_tieu,
        thuc_trang=thuc_trang,
        giai_phap=giai_phap,
        cach_thuc=cach_thuc,
        tom_tat=tom_tat,
        hieu_qua=hieu_qua,
        tinh_moi=tinh_moi,
        nhan_rong=nhan_rong,
    )
    db.add(initiative)
    await db.flush()

    if file and file.filename:
        content = await file.read()
        object_name = f"attachments/{initiative.id}/{file.filename}"
        await minio_service.upload_file_stream(
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=object_name,
            file_data=content,
            content_type=file.content_type or "application/octet-stream",
        )
        db.add(
            FileModel(
                initiative_id=initiative.id,
                file_name=file.filename,
                minio_object_name=object_name,
                file_size=len(content),
            )
        )

    db.add(
        AuditLog(
            user_email=user.email,
            action="CREATE_INITIATIVE",
            details=f"Created: {initiative.ten}",
            ip_address=request.client.host if request.client else None,
        )
    )

    await db.flush()
    await db.refresh(initiative)
    logger.info("Initiative created: {} by {}", initiative.ten, user.email)
    return InitiativeResponse.model_validate(initiative)


# ── LIST (public) ──────────────────────────────────────────────────


@router.get(
    "/",
    response_model=InitiativeListResponse,
    response_model_by_alias=True,
)
async def list_initiatives(
    db: DbDep,
    page: int = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 10,
    linh_vuc: Annotated[LinhVuc | None, Query(alias="linhVuc")] = None,
    don_vi: Annotated[str | None, Query(alias="donVi")] = None,
    trang_thai: Annotated[TrangThai | None, Query(alias="trangThai")] = None,
    search_query: Annotated[str | None, Query(alias="searchQuery")] = None,
) -> InitiativeListResponse:
    """Paginated list with optional field / department / status filters."""
    stmt = select(Initiative)

    if linh_vuc is not None:
        stmt = stmt.where(Initiative.linh_vuc == linh_vuc)
    if don_vi is not None:
        stmt = stmt.where(Initiative.don_vi == don_vi)
    if trang_thai is not None:
        stmt = stmt.where(Initiative.trang_thai == trang_thai)
    if search_query:
        pattern = f"%{search_query}%"
        stmt = stmt.where(
            Initiative.ten.ilike(pattern) | Initiative.tom_tat.ilike(pattern)
        )

    total = (
        await db.execute(select(func.count()).select_from(stmt.subquery()))
    ).scalar_one()

    rows = await db.execute(
        stmt.order_by(Initiative.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(rows.scalars().all())

    return InitiativeListResponse(
        items=[InitiativeResponse.model_validate(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size or 1,
    )


# ── INTEREST (public, atomic increment) ───────────────────────────


@router.post(
    "/{initiative_id}/interest",
    response_model=InitiativeResponse,
    response_model_by_alias=True,
)
async def increment_interest(
    initiative_id: int,
    db: DbDep,
) -> InitiativeResponse:
    """Atomically increment the ``quanTam`` counter (race-safe)."""
    stmt = (
        update(Initiative)
        .where(Initiative.id == initiative_id)
        .values(quan_tam=Initiative.quan_tam + 1)
        .returning(Initiative)
    )
    result = await db.execute(stmt)
    initiative = result.scalar_one_or_none()

    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found",
        )

    return InitiativeResponse.model_validate(initiative)


# ── EXPORT DOCX ───────────────────────────────────────────────────


@router.post("/{initiative_id}/export-docx")
async def export_initiative_docx(
    initiative_id: int,
    db: DbDep,
    user: CurrentUserDep,
) -> dict[str, str]:
    """Generate DOCX, upload to MinIO, return a presigned download link."""
    result = await db.execute(select(Initiative).where(Initiative.id == initiative_id))
    initiative = result.scalar_one_or_none()

    if not initiative:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Initiative not found",
        )

    data: dict[str, object] = {
        "ten": initiative.ten,
        "linh_vuc": initiative.linh_vuc.value,
        "tac_gia": initiative.tac_gia,
        "dong_tac_gia": initiative.dong_tac_gia,
        "danh_sach_tac_gia": initiative.danh_sach_tac_gia,
        "don_vi": initiative.don_vi,
        "email": initiative.email or "",
        "thoi_gian": initiative.thoi_gian,
        "ly_do": initiative.ly_do,
        "muc_tieu": initiative.muc_tieu,
        "thuc_trang": initiative.thuc_trang,
        "giai_phap": initiative.giai_phap,
        "cach_thuc": initiative.cach_thuc,
        "tom_tat": initiative.tom_tat,
        "hieu_qua": initiative.hieu_qua,
        "tinh_moi": initiative.tinh_moi,
        "nhan_rong": initiative.nhan_rong,
        "trang_thai": initiative.trang_thai.value,
        "giai_thuong": initiative.giai_thuong,
        "ngay_nop": str(initiative.ngay_nop),
    }
    docx_bytes = await generate_initiative_docx(data)

    object_name = f"exports/initiative-{initiative_id}.docx"
    await minio_service.upload_file_stream(
        bucket_name=settings.MINIO_BUCKET_NAME,
        object_name=object_name,
        file_data=docx_bytes,
        content_type=(
            "application/vnd.openxmlformats-officedocument"
            ".wordprocessingml.document"
        ),
    )

    download_url = await minio_service.generate_presigned_download_url(
        bucket_name=settings.MINIO_BUCKET_NAME,
        object_name=object_name,
    )

    logger.info("DOCX exported for initiative #{} by {}", initiative_id, user.email)
    return {"downloadUrl": download_url}


# ── PREVIEW DOCX (from form data, no DB save) ─────────────────────


@router.post("/preview-docx")
async def preview_docx(
    ten: Annotated[str, Form()] = "",
    linh_vuc: Annotated[str, Form(alias="linhVuc")] = "",
    thoi_gian: Annotated[str, Form(alias="thoiGian")] = "",
    danh_sach_tac_gia: Annotated[str, Form(alias="danhSachTacGia")] = "",
    ly_do: Annotated[str, Form(alias="lyDo")] = "",
    muc_tieu: Annotated[str, Form(alias="mucTieu")] = "",
    thuc_trang: Annotated[str, Form(alias="thucTrang")] = "",
    giai_phap: Annotated[str, Form(alias="giaiPhap")] = "",
    cach_thuc: Annotated[str, Form(alias="cachThuc")] = "",
    hieu_qua: Annotated[str, Form(alias="hieuQua")] = "",
    tinh_moi: Annotated[str, Form(alias="tinhMoi")] = "",
    nhan_rong: Annotated[str, Form(alias="nhanRong")] = "",
) -> Response:
    """Render DOCX template from form data and return file bytes."""
    form_data = {
        "ten": ten,
        "linhVuc": linh_vuc,
        "thoiGian": thoi_gian,
        "danhSachTacGia": danh_sach_tac_gia,
        "lyDo": ly_do,
        "mucTieu": muc_tieu,
        "thucTrang": thuc_trang,
        "giaiPhap": giai_phap,
        "cachThuc": cach_thuc,
        "hieuQua": hieu_qua,
        "tinhMoi": tinh_moi,
        "nhanRong": nhan_rong,
    }
    docx_bytes = await generate_preview_docx(form_data)
    return Response(
        content=docx_bytes,
        media_type=(
            "application/vnd.openxmlformats-officedocument"
            ".wordprocessingml.document"
        ),
        headers={
            "Content-Disposition": (
                'attachment; filename="sang-kien-preview.docx"'
            ),
        },
    )
