# ───────────────────────────────────────────────────────────────────
# Stage 1 — Dependencies: install node_modules
# ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./

# --ignore-scripts skips wrangler/esbuild postinstall (ETXTBSY on Docker overlay).
# Next.js uses SWC, not esbuild, so this is safe for `next build`.
RUN npm ci --ignore-scripts

# ───────────────────────────────────────────────────────────────────
# Stage 2 — Builder: produce Next.js standalone output
# ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Empty = relative /api via reverse proxy (Caddy). Do not default to localhost in production.
ARG NEXT_PUBLIC_API_URL=
ARG NEXT_PUBLIC_BYPASS_AUTH_TEMP=true
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BYPASS_AUTH_TEMP=${NEXT_PUBLIC_BYPASS_AUTH_TEMP}

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ───────────────────────────────────────────────────────────────────
# Stage 3 — Runner: minimal production image
# ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/dist/standalone ./

USER nextjs
EXPOSE 80
ENV PORT=80 \
    HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
