FROM node:24-slim AS build
WORKDIR /app

ENV NODE_ENV=development
COPY package.json ./
RUN npm config set registry https://registry.npmmirror.com \
  && npm install

COPY . .
RUN npm run build

FROM nginx:alpine AS runner

# Serve static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Generate nginx reverse-proxy config and runtime env.js at container start
COPY docker/nginx/40-gen-config.sh /docker-entrypoint.d/40-gen-config.sh
RUN chmod +x /docker-entrypoint.d/40-gen-config.sh

EXPOSE 80
