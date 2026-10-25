#!/usr/bin/env bash
# Get the first Let's Encrypt certificate for bot.toriate.com, then start nginx with HTTPS and the certbot
# service that renews it. Needs the domain's DNS pointing at this server and ports 80 + 443 open.
# Only needed once (or after the letsencrypt volume is deleted): renewals happen on their own.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
domain=bot.toriate.com

if docker compose run --rm --no-deps --entrypoint test certbot -f "/etc/letsencrypt/live/$domain/fullchain.pem"; then
  echo "certificate for $domain already there"
else
  # nginx can't start without the certificate, so certbot answers Let's Encrypt's check on port 80 itself
  docker compose stop nginx
  if [ -n "${CERTBOT_EMAIL:-}" ]; then contact=(--email "$CERTBOT_EMAIL"); else contact=(--register-unsafely-without-email); fi
  docker compose run --rm --no-deps -p 80:80 --entrypoint certbot certbot \
    certonly --standalone --non-interactive --agree-tos "${contact[@]}" -d "$domain"
fi

docker compose up -d nginx certbot
echo "https://$domain is up"
