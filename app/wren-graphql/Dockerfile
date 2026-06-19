FROM node:18-bookworm-slim AS base

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

WORKDIR /app

RUN corepack enable
COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn/releases/yarn-4.5.3.cjs .yarn/releases/yarn-4.5.3.cjs
RUN corepack prepare yarn@4.5.3 --activate

FROM base AS deps
WORKDIR /app

RUN yarn install --immutable

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY .eslintrc.json ./
COPY .eslintignore ./
COPY .prettierrc ./
COPY next.config.js ./
COPY tsconfig.json ./

RUN yarn build

FROM base AS runner
WORKDIR /app

RUN mkdir .next

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY migrations ./migrations
COPY knexfile.js ./knexfile.js
COPY --from=builder /app/node_modules ./node_modules
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 3001

ENV PORT 3001

ENTRYPOINT ["/app/entrypoint.sh"]
