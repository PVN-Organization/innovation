# ───────────────────────────────────────────────────────────────────
# Stage 1 — Builder: install OS deps + Python deps into a venv
# ───────────────────────────────────────────────────────────────────
FROM python:3.11-slim-bookworm AS builder

# Corporate networks often block outbound HTTP (port 80) but allow HTTPS.
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g; s|http://security.debian.org|https://security.debian.org|g' \
    /etc/apt/sources.list.d/debian.sources 2>/dev/null || \
    sed -i 's|http://|https://|g' /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ───────────────────────────────────────────────────────────────────
# Stage 2 — Runner: minimal image with only the venv + app source
# ───────────────────────────────────────────────────────────────────
FROM python:3.11-slim-bookworm AS runner

RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g; s|http://security.debian.org|https://security.debian.org|g' \
    /etc/apt/sources.list.d/debian.sources 2>/dev/null || \
    sed -i 's|http://|https://|g' /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY app/ ./app/
COPY migrations/ ./migrations/
COPY alembic.ini .

USER appuser
EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
