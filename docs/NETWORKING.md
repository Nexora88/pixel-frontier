# Networking Architecture

- Server owns player positions, inventory slots, resource nodes, structures, chest permissions, clan membership and trade settlement.
- Clients send input and action intent only; they never submit authoritative coordinates or inventory values.
- Anonymous player identity uses a server-signed session token; raw client-supplied player IDs are not trusted.
- Inputs are validated and rate-limited.
- Each player subscribes to their current chunk and adjacent chunks; resource/building deltas and player snapshots are scoped to those rooms. Player presence is indexed by chunk to avoid scanning every connected player for every snapshot.\n- Connections are assigned to process-local Socket.IO lobby rooms with a hard capacity of 50. These rooms are matchmaking/presence partitions only; they are not independent world shards.
- Initial world state is emitted before chunk-load deltas so the renderer is initialized before it receives chunk events.
- PostgreSQL stores player profiles, chunks, structures, clans, trades and world simulation metadata.
- Configure a stable high-entropy SESSION_SECRET to preserve signed sessions across server restarts; configure DATABASE_URL for persistence.
- Socket.IO payloads are capped at 10 KB and per-message compression is disabled to reduce CPU overhead. Production requires an exact ALLOWED_ORIGINS allow-list.\n- Production still requires Cloudflare/WAF configuration, origin ingress restrictions, abuse/rate limits, backups, monitoring and multiplayer load testing. See SCALING_ARCHITECTURE.md and PRODUCTION_SECURITY.md.
