#!/usr/bin/env bash
set -euo pipefail

APP_DOMAIN="${APP_DOMAIN:-hololive.com.cn}"
MAP_PROXY_PORT="${MAP_PROXY_PORT:-18090}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/${APP_DOMAIN}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_SRC="${SCRIPT_DIR}/map-proxy.service"
SERVICE_DST="/etc/systemd/system/map-proxy.service"

if [[ "${EUID}" -ne 0 ]]; then
  echo "[setup_map_proxy] Please run as root."
  exit 1
fi

if [[ ! -f "${SERVICE_SRC}" ]]; then
  echo "[setup_map_proxy] Missing service file: ${SERVICE_SRC}"
  exit 1
fi

if [[ ! -f "${NGINX_SITE}" ]]; then
  echo "[setup_map_proxy] Missing nginx site config: ${NGINX_SITE}"
  exit 1
fi

install -m 644 "${SERVICE_SRC}" "${SERVICE_DST}"
systemctl daemon-reload
systemctl enable map-proxy
systemctl restart map-proxy

if ! grep -q "location /map-proxy/" "${NGINX_SITE}"; then
  MAP_PROXY_BLOCK="$(cat <<EOF
    location /map-proxy/ {
        proxy_pass http://127.0.0.1:${MAP_PROXY_PORT}/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
EOF
)"

  tmp_file="$(mktemp)"
  awk -v block="${MAP_PROXY_BLOCK}" '
    { lines[NR] = $0 }
    END {
      inserted = 0
      target = 0
      for (i = 1; i <= NR; i++) {
        if (lines[i] ~ /location \/_\//) {
          target = i
          break
        }
      }
      if (target == 0) {
        for (i = NR; i >= 1; i--) {
          if (lines[i] ~ /^}/) {
            target = i
            break
          }
        }
      }
      for (i = 1; i <= NR; i++) {
        if (!inserted && i == target) {
          print block
          inserted = 1
        }
        print lines[i]
      }
    }
  ' "${NGINX_SITE}" > "${tmp_file}"

  install -m 644 "${tmp_file}" "${NGINX_SITE}"
  rm -f "${tmp_file}"
fi

nginx -t
systemctl reload nginx

echo "[setup_map_proxy] map-proxy service and nginx route are ready."
