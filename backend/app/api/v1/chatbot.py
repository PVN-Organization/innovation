from collections.abc import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.core.database import DbDep
from app.models.initiative import Initiative, TrangThai
from app.services.ai_service import ai_service

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class ChatRequest(BaseModel):
    """Incoming user prompt for the AI advisor."""

    prompt: str = Field(min_length=1, max_length=2000)


@router.post("/stream")
async def stream_chat(
    body: ChatRequest,
    db: DbDep,
) -> StreamingResponse:
    """Stream an AI-generated response as Server-Sent Events.

    1. Fetch approved initiatives from PostgreSQL as context.
    2. Pass the prompt + context into ``AIService.stream_chat_response``.
    3. Yield each token wrapped in ``data: …\\n\\n`` SSE framing.
    4. Send a final ``[DONE]`` sentinel so the client knows the stream ended.
    """
    result = await db.execute(
        select(Initiative).where(Initiative.trang_thai == TrangThai.DA_DUYET).limit(50)
    )
    initiatives = result.scalars().all()

    context: list[dict[str, str]] = [
        {
            "ten": i.ten,
            "linh_vuc": i.linh_vuc.value,
            "trang_thai": i.trang_thai.value,
            "tom_tat": i.tom_tat[:200],
            "don_vi": i.don_vi,
        }
        for i in initiatives
    ]

    async def event_generator() -> AsyncGenerator[str, None]:
        async for token in ai_service.stream_chat_response(body.prompt, context):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
