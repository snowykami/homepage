# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM joseluisq/static-web-server:2 AS runner

COPY sws.toml /sws.toml
COPY --from=builder /app/dist /public

EXPOSE 80

CMD ["--config-file", "/sws.toml"]
