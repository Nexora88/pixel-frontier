# Production security checklist

- Put the public game origin behind Cloudflare with proxying enabled, TLS in Full (strict) mode where the origin supports it, managed WAF rules and conservative rate limits for page loads and Socket.IO handshakes.
- Set `ALLOWED_ORIGINS` to exact trusted origins, comma-separated (for example, `https://play.example.com`). Production browser connections are rejected unless their Origin matches this allow-list.
- Restrict direct origin access at the hosting/firewall layer where possible. Cloudflare protections can be bypassed if attackers can reach the origin directly.
- Keep `SESSION_SECRET` long, random and stable; never commit production secrets.
- Keep Socket.IO payload limits small. This project caps messages at 10 KB, disables per-message compression and applies per-player cooldowns to gameplay and social actions.
- Set a strong METRICS_TOKEN to protect the detailed /metrics endpoint; without it, detailed runtime metrics are not exposed.
- Add per-account/IP connection and action quotas at the edge/gateway before public clan events. Do not trust client-supplied player IDs, clan ownership, inventory or coordinates.
- Monitor connection churn, rejected handshakes, event-loop delay, tick duration, heap/RSS, PostgreSQL pool saturation and outbound bytes.
- Test WebSocket upgrades through Cloudflare and verify that legitimate long-lived connections are not repeatedly challenged.
- Maintain database backups and rehearse restore procedures.

Cloudflare is an edge layer, not a substitute for application validation, origin lockdown, capacity planning or load testing. This repository does not include a Cloudflare account configuration or claim DDoS immunity.
