from __future__ import annotations

import logging
import sys

from loguru import logger

from app.core.config import settings


class InterceptHandler(logging.Handler):
    """Bridge stdlib logging → Loguru so every library log is captured."""

    def emit(self, record: logging.LogRecord) -> None:
        level: str | int
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_back:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging() -> None:
    """Configure Loguru: human-readable in dev, structured JSON in prod."""
    logger.remove()

    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    if settings.DEBUG:
        logger.add(sys.stdout, format=log_format, level="DEBUG", colorize=True)
    else:
        logger.add(sys.stdout, level="INFO", serialize=True)

    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    for logger_name in logging.root.manager.loggerDict:
        intercepted = logging.getLogger(logger_name)
        intercepted.handlers = [InterceptHandler()]
        intercepted.propagate = False
