FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates docker.io \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile \
    && pnpm db:generate \
    && pnpm build

WORKDIR /app/apps/server
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
