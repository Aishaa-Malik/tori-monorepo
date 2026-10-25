#!/usr/bin/env bash
# Connect the Tori WhatsApp bot (workflow 06) to Meta: point the Meta app's webhook at this server's n8n
# (WEBHOOK_URL in .env, behind nginx), check the bot's token, and give the voice agent the board's tools.
# Run it once after the first deploy, and again whenever WEBHOOK_URL, BOARD_PUBLIC_URL or the Meta app changes.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a

if [ "${BOT_ENABLED:-0}" != 1 ] || [ -z "${BOT_META_APP_ID:-}" ] || [ -z "${BOT_META_APP_SECRET:-}" ]; then
  echo "Workflow 06 is not published: fill BOT_* in .env, set BOT_ENABLED=1, run docker compose up -d, then this script." >&2
  exit 1
fi
# Meta only delivers webhooks to HTTPS addresses
case "${WEBHOOK_URL:-}" in
  https://*) ;;
  *) echo "WEBHOOK_URL must be the public https:// address of n8n (e.g. https://tori.example.com/n8n/), not '${WEBHOOK_URL:-}'" >&2; exit 1 ;;
esac
url="${WEBHOOK_URL%/}"

until curl -sf http://localhost:5678/healthz >/dev/null; do sleep 2; done
read -r node_id hook_id < <(python3 -c "
import json; w = json.load(open('n8n/workflows/06-whatsapp-bot.json'))
t = next(n for n in w['nodes'] if n['name'] == 'WhatsApp Trigger'); print(t['id'], t['webhookId'])")
callback="${url}/webhook/${hook_id}/webhook"

curl -sf -o /dev/null --max-time 10 "$url/healthz" \
  || { echo "$url/healthz does not answer from the internet: check DNS, nginx, HTTPS and the security group" >&2; exit 1; }

# After a restart n8n sometimes serves the trigger's POST route but not the GET route Meta verifies
# with (404); a full stop / start fixes it. Meta checks the URL with that GET (verify token = trigger node ID).
check="http://localhost:5678/webhook/${hook_id}/webhook?hub.mode=subscribe&hub.challenge=1&hub.verify_token=${node_id}"
if ! curl -sf -o /dev/null "$check"; then
  echo "WhatsApp Trigger not answering Meta's check yet: restarting n8n once"
  docker compose stop n8n && docker compose up -d n8n
  until curl -sf http://localhost:5678/healthz >/dev/null; do sleep 2; done
  sleep 12
  curl -sf -o /dev/null "$check" || { echo "WhatsApp Trigger still doesn't answer $check: see docker compose logs n8n" >&2; exit 1; }
fi

app_token="${BOT_META_APP_ID}|${BOT_META_APP_SECRET}"
result=$(curl -s -X POST "https://graph.facebook.com/v19.0/${BOT_META_APP_ID}/subscriptions" \
  --data-urlencode "object=whatsapp_business_account" --data-urlencode "callback_url=$callback" \
  --data-urlencode "verify_token=$node_id" --data-urlencode 'fields=["messages","calls"]' \
  --data-urlencode "include_values=true" --data-urlencode "access_token=$app_token")
case "$result" in
  *'"success":true'*) echo "Meta webhook → $callback" ;;
  *) echo "Could not point the Meta webhook at $callback: $result" >&2; exit 1 ;;
esac

# The bot can't reply with an expired token (temporary tokens from API Setup last 24 hours)
token_check=$(curl -s "https://graph.facebook.com/v19.0/${BOT_WHATSAPP_PHONE_NUMBER_ID}?fields=display_phone_number" \
  -H "Authorization: Bearer ${BOT_WHATSAPP_TOKEN}")
case "$token_check" in
  *'"error"'*) echo "WARNING: BOT_WHATSAPP_TOKEN is not valid (expired?), so the bot can't reply: $token_check" >&2 ;;
esac

# the voice agent's Tori tools live on the board (/api/mcp, BOARD_PUBLIC_URL)
scripts/vapi-mcp.sh || echo "WARNING: couldn't update the voice agent's Tori tools: run scripts/vapi-mcp.sh" >&2
echo "Workflow 06 is published. Message the bot's WhatsApp number; runs show in n8n → Executions."
