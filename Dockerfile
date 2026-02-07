FROM node:24-slim AS base
WORKDIR /app

FROM base AS deps
ENV NODE_ENV=development
COPY package.json ./
RUN npm config set registry https://registry.npmmirror.com \
  && npm install

FROM base AS build
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY vite.config.ts tsconfig.json ./
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh \
  && npm cache clean --force

EXPOSE 4173
ENTRYPOINT ["/app/docker-entrypoint.sh"]
