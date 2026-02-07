#!/bin/sh
set -eu

# Example: API_UPSTREAM=http://backend:8000
API_UPSTREAM="${API_UPSTREAM:-http://backend:8000}"
API_UPSTREAM="${API_UPSTREAM%/}"

cat >/etc/nginx/conf.d/default.conf <<CONF
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # OCR image payloads can be large (base64 image in JSON)
    client_max_body_size 20m;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass ${API_UPSTREAM}/;
        proxy_http_version 1.1;

        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
CONF

# Browser always calls same-origin /api, nginx forwards to backend container.
cat >/usr/share/nginx/html/env.js <<'ENVJS'
window.__APP_CONFIG__ = {
  VITE_API_BASE_URL: '/api'
};
ENVJS
