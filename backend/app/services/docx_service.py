"""Non-blocking DOCX export for initiative records.

The heavy ``python-docx`` work runs inside ``asyncio.to_thread`` so it
never blocks the FastAPI event loop.
"""

import asyncio
from io import BytesIO

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt

# ── Sync builder (runs in a worker thread) ─────────────────────────


def _build_initiative_document(data: dict[str, object]) -> bytes:
    """Create a professionally formatted DOCX byte stream."""
    doc = Document()

    style = doc.styles["Normal"]
    style.font.size = Pt(11)
    style.font.name = "Times New Roman"

    # ── Header ──────────────────────────────────────────────────
    title = doc.add_heading("CỔNG THÔNG TIN SÁNG KIẾN", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    subtitle = doc.add_heading("CÔNG ĐOÀN DẦU KHÍ VIỆT NAM", level=1)
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph()

    # ── Initiative title ────────────────────────────────────────
    name_heading = doc.add_heading(str(data.get("ten", "Sáng kiến")), level=1)
    name_heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

    # ── Metadata table ──────────────────────────────────────────
    metadata = [
        ("Lĩnh vực", data.get("linh_vuc", "")),
        ("Tác giả chính", data.get("tac_gia", "")),
        ("Đồng tác giả", data.get("dong_tac_gia", "")),
        ("Đơn vị / Phòng ban", data.get("don_vi", "")),
        ("Email liên hệ", data.get("email", "")),
        ("Ngày nộp", data.get("ngay_nop", "")),
        ("Trạng thái", data.get("trang_thai", "")),
        ("Giải thưởng", data.get("giai_thuong", "")),
    ]

    table = doc.add_table(rows=len(metadata), cols=2)
    table.style = "Table Grid"
    table.columns[0].width = Inches(2.0)
    table.columns[1].width = Inches(4.5)

    for idx, (label, value) in enumerate(metadata):
        label_cell = table.rows[idx].cells[0]
        value_cell = table.rows[idx].cells[1]

        label_cell.text = label
        value_cell.text = str(value) if value else ""

        for paragraph in label_cell.paragraphs:
            for run in paragraph.runs:
                run.bold = True
                run.font.size = Pt(11)

    doc.add_paragraph()

    # ── Content sections ────────────────────────────────────────
    doc.add_heading("Tóm tắt nội dung", level=2)
    summary_para = doc.add_paragraph(str(data.get("tom_tat", "")))
    summary_para.paragraph_format.space_after = Pt(12)

    doc.add_heading("Hiệu quả dự kiến", level=2)
    effect_para = doc.add_paragraph(str(data.get("hieu_qua", "")))
    effect_para.paragraph_format.space_after = Pt(12)

    # ── Serialize ───────────────────────────────────────────────
    buffer = BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


# ── Public async API ───────────────────────────────────────────────


async def generate_initiative_docx(data: dict[str, object]) -> bytes:
    """Generate a DOCX document without blocking the event loop.

    Offloads the CPU-bound ``python-docx`` work to a thread-pool worker
    via ``asyncio.to_thread``.
    """
    return await asyncio.to_thread(_build_initiative_document, data)
