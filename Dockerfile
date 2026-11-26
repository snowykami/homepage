# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ARG NEO_BLOG_API_URL=""
ENV NEO_BLOG_API_URL=${NEO_BLOG_API_URL}

COPY . .
ARG CACHEBUST=1
RUN pnpm build

FROM joseluisq/static-web-server:2 AS runner

COPY sws.toml /sws.toml
COPY --from=builder /app/dist /public

EXPOSE 80

CMD ["--config-file", "/sws.toml"]
