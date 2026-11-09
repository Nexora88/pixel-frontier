# Scaling and production topology

## Current implementation boundary

The current game server is a single authoritative world process. Socket.IO chunk rooms reduce unnecessary broadcasts, but they are not horizontal game-world sharding. A logical lobby allocator alone cannot make multiple Node.js processes safe: player movement, clan ownership, structures, chunk state and persistence must have one authoritative owner.

## Target topology

- Edge: Cloudflare proxy, TLS, WAF/rate-limit rules for HTTP and handshake endpoints.
- Gateway: stateless Socket.IO gateways with strict origin allow-list, payload caps, connection limits and handshake throttles.
- Realtime transport: Socket.IO Redis adapter for cross-gateway room broadcasts.
- Simulation: authoritative world shards. Each shard owns a set of world/lobby IDs and is the only writer for those entities.
- Persistence: PostgreSQL for durable state; Redis for ephemeral presence, gateway fan-out and shard routing, not as the sole source of truth.
- Matchmaking: allocate players to a shard/lobby with a hard target capacity of 50; reject or queue when all eligible lobbies are full.

## Capacity math

500,000 monthly active users is not the same as concurrent users. At 2,000–5,000 concurrent users, 50-player lobbies imply 40–100 full lobbies. This is a planning estimate, not a capacity guarantee. Each shard must be load-tested with realistic movement, chunk changes, snapshots, reconnects and persistence load before setting production limits.

## CPU and memory guardrails

- Keep the server authoritative and publish only nearby chunk state.
- Avoid allocating a full building list for every player every tick; query nearby chunks.
- Index players by chunk so each client snapshot visits nearby players rather than scanning all connections.
- Keep snapshot cadence separate from simulation tick cadence.
- Bound entity counts, per-socket event rates, payload sizes and lobby occupancy.
- Reuse cached territory/dominance snapshots and calculate dominance no more than once per second.
- Destroy Phaser objects and remove Map/Set/socket references when chunks unload or players leave.
- Track event-loop lag, heap/RSS, connected sockets, tick duration, snapshot bytes and per-shard occupancy.

## Cloudflare and WebSocket notes

Cloudflare can proxy supported WebSocket traffic and provide edge protections, but it does not replace application-level limits or protect an exposed origin that can be reached directly. Restrict origin ingress to trusted proxy/network paths where the hosting platform supports it. Apply WAF/rate-limit rules carefully so legitimate long-lived WebSocket connections are not challenged repeatedly.

## Not yet production-ready

Redis adapter, multi-process shard ownership, cross-shard persistence coordination, automatic lobby placement, autoscaling, origin restrictions, monitoring dashboards and repeatable 2k–5k concurrent-user load tests are future deployment milestones. Do not advertise the target capacity until those are implemented and measured.
