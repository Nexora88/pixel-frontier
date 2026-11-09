# Clan, Territory and Lobby Foundations

The main branch now contains the integrated performance, lobby and territory work from PR #7. This document records the remaining boundaries and the additional isolated friendly-fire policy primitive.

## Included foundations

- `CombatRules`: shared clan/faction membership policy and safe-zone denial. It is a reusable policy module; the current game does not yet have a complete combat/damage event, so it is not represented as an active combat feature.
- PR #7 provides process-local lobby allocation, server-validated clan totems and 400x400 territory snapshots, territory-entry alerts, dominance summaries, bounded socket events, chunk-indexed queries and runtime metrics.
- PR #7 provides crisp pixel rendering, Y-based depth sorting, canopy transparency and short gather particles.

## Remaining production work

1. Add persistent territory, dropped-loot and lobby metadata with transactional inventory/structure changes.
2. Add a complete server-authoritative combat/durability loop and invoke `canDamage` before any health mutation.
3. Add isolated per-lobby world instances, shard ownership/routing and Redis-backed leases/heartbeats before multi-process operation. Socket.IO Redis fan-out alone is not world sharding.
4. Add structure HP, atomic chest loot drops and validated pickup; preserve quantities and prevent duplication.
5. Add privacy-first streamer mode; Twitch OAuth/viewer actions need separate consent and abuse controls.
6. Replace prototype art with original 32x32 survivor, 64x64 trees, biome tiles and wall/door sprites; keep animation and VFX pools bounded.
7. Run repeatable 1/10/30/60-player tests, then multi-world tests; record CPU, RSS, event-loop delay, p50/p95/p99 latency and bytes/sec. Do not claim 2k–5k CCU or 500k MAU until measured.

## Compatibility guardrails

- Preserve movement, gathering, crafting, inventory, trade and persistence behavior.
- Avoid world-wide scans and unbounded allocations in the simulation tick.
- Broadcast only to relevant world/chunk subscribers.
- Validate ownership, distance, cooldowns, capacity and item transfers on the server.
- The current 50-player lobby allocator is process-local, not a claim of horizontally scaled capacity.
