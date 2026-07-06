"""Keyword-based AI advisor with streaming output.

Production upgrade path: replace ``_synthesize_response`` with a real
OpenAI / LangChain call and yield streamed tokens directly.
"""

from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING

from loguru import logger

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator


class AIService:
    """Simulated AI advisor that streams responses token-by-token."""

    async def stream_chat_response(
        self,
        user_prompt: str,
        database_context: list[dict[str, str]],
    ) -> AsyncGenerator[str, None]:
        """Yield response tokens with simulated streaming delay.

        Drop-in replacement point: swap the body with an async iterator
        over ``openai.ChatCompletion.acreate(stream=True)`` chunks.
        """
        logger.debug("Chat prompt: {}", user_prompt[:80])
        response = _synthesize_response(user_prompt, database_context)

        for token in response.split():
            yield token + " "
            await asyncio.sleep(0.05)


# ── Private helpers ────────────────────────────────────────────────


def _matches(text: str, keywords: list[str]) -> bool:
    return any(kw in text for kw in keywords)


def _top_initiatives(context: list[dict[str, str]], limit: int = 3) -> str:
    approved = [c for c in context if c.get("trang_thai") == "Đã duyệt"]
    if not approved:
        return "  (chưa có sáng kiến nào được phê duyệt)"
    return "\n".join(
        f"  • {c.get('ten', 'N/A')} — {c.get('linh_vuc', '')}" for c in approved[:limit]
    )


def _synthesize_response(
    prompt: str,
    context: list[dict[str, str]],
) -> str:
    """Build a contextual response from keyword matching + DB context."""
    prompt_lower = prompt.lower()
    total = len(context)
    approved = [c for c in context if c.get("trang_thai") == "Đã duyệt"]
    approved_count = len(approved)

    if _matches(prompt_lower, ["gợi ý", "đề xuất", "nên làm", "sáng kiến gì"]):
        top = _top_initiatives(context)
        return (
            f"Dựa trên {approved_count} sáng kiến đã phê duyệt, "
            "tôi gợi ý:\n"
            "1. Tập trung vào giải pháp đo lường hiệu quả rõ ràng.\n"
            "2. Ưu tiên cải tiến quy trình hoặc tiết kiệm chi phí.\n"
            "3. Tham khảo sáng kiến tiêu biểu:\n"
            f"{top}"
        )

    if _matches(prompt_lower, ["thống kê", "bao nhiêu", "số lượng"]):
        return (
            f"Tổng quan hệ thống: {total} sáng kiến — "
            f"{approved_count} đã phê duyệt, "
            f"{total - approved_count} đang chờ duyệt."
        )

    if _matches(prompt_lower, ["tiết kiệm", "chi phí", "khcn", "đmst"]):
        return (
            "Về tiết kiệm chi phí & KHCN-ĐMST, bạn có thể xem xét: "
            "tối ưu quy trình vận hành, ứng dụng công nghệ số, "
            "nghiên cứu giải pháp năng lượng tái tạo, "
            "và tự động hóa các tác vụ lặp lại."
        )

    if _matches(prompt_lower, ["an toàn", "sức khỏe", "hse", "môi trường"]):
        return (
            "Lĩnh vực An toàn - Sức khỏe - Môi trường (HSE) là trọng "
            "tâm tại Petrovietnam. Hướng đi: hệ thống cảnh báo sớm "
            "rủi ro, IoT giám sát môi trường, và quy trình ứng phó "
            "sự cố nhanh."
        )

    return (
        f"Xin chào! Hệ thống hiện có {total} sáng kiến "
        f"({approved_count} đã duyệt). "
        "Tôi có thể gợi ý ý tưởng, tra cứu thống kê, "
        "hoặc tư vấn quy trình nộp sáng kiến cho bạn."
    )


ai_service = AIService()
