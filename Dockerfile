FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile \
    && pnpm db:generate \
    && pnpm build

WORKDIR /app/apps/server
ENV NODE_ENV=production
# Runtime mounts the host's Docker CLI and rootless socket for sandbox execution.
EXPOSE 3000
CMD ["node", "dist/index.js"]
