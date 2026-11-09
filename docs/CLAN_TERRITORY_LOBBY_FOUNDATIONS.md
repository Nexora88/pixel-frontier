# Clan, Territory and Lobby Foundations

This branch adds isolated, testable server-side building blocks. It deliberately does not switch the live game loop to multi-world routing yet.

## Included

- `CombatRules`: shared clan/faction membership policy and safe-zone denial. Any future damage handler must call this on the server before applying damage. The current game has no complete combat/damage event, so this module is not presented as an active combat feature.
- `TerritorySystem`: server-authoritative 400x400 territory records, leader-only placement, overlap prevention, restore/snapshot helpers and a basic ownership query. Totem placement is not yet exposed as a live socket action or persisted by the current database adapter.
- `LobbyManager`: deterministic in-process allocation with a configurable 60-player default, automatic new lobby allocation, duplicate-session idempotency and empty-lobby cleanup. It is an allocation primitive, not yet wired into GameServer; each lobby still needs an isolated WorldState/GameServer lifecycle.
- Unit tests for all three modules.

## Required next integration steps

1. Add database migrations for totems, dropped loot and lobby metadata; make inventory/structure mutations transactional.
2. Wire territory placement, entry notifications and leaderboard snapshots through authenticated server events and chunk-scoped broadcasts.
3. Add a real combat/durability loop, then invoke `canDamage` and safe-zone checks before any health mutation. No client may decide damage.
4. Connect lobby allocation to isolated world instances and session routing. Add Redis-backed leases/heartbeats and cross-process coordination before running more than one server process. Socket.IO Redis fan-out alone is not world sharding.
5. Add structure HP, chest destruction, atomic loot drops and pickup validation; preserve item quantities and prevent duplication.
6. Implement streamer mode as a privacy-first opt-in (hide sensitive UI/identity details); Twitch OAuth and viewer-to-party actions require a separate permission and abuse-control design.
7. Replace placeholder geometry with original 32x32 survivor and 64x64 tree/biome/wall/door assets, with pooled animation/VFX. The existing PR #8 rendering foundation already adds low-frequency depth/occlusion updates and a bounded debris pool.
8. Add repeatable load tests at 1/10/30/60 players, then multiple isolated worlds; record CPU, RSS, event-loop delay, p50/p95/p99 latency and bytes/sec. Do not publish 2k–5k CCU or 500k MAU capacity claims until measured.

## Performance and compatibility guardrails

- Keep the existing movement, gathering, crafting, inventory, chest, trade and persistence paths unchanged until their integration tests cover the new behavior.
- Keep the 50ms simulation tick free of world-wide scans and unbounded allocations.
- Broadcast only to relevant world/chunk subscribers.
- Use server-side validation for ownership, distance, cooldowns, capacity and item transfers.
- The 60-player limit is a target per isolated world, not a claim that the current single-process server can host many worlds efficiently.
