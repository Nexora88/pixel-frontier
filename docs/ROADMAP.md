# 90-Day Roadmap

Implemented in the current development branch:
- [x] Node/Express/Socket.io server and server-authoritative movement
- [x] Directional pixel survivor animations
- [x] Seeded forest, lake, mountain and meadow biomes with biome resources
- [x] 3×3 chunk interest management and scoped deltas
- [x] 24-slot server-authoritative inventory and stack-aware movement
- [x] Primitive starter tool and wooden axe/pickaxe crafting
- [x] Wood/stone walls, owner/clan doors and private chest storage
- [x] PostgreSQL migrations for players, chunks, structures, clans, trades and world clock
- [x] Signed anonymous session token and reconnect restoration
- [x] Biome movement modifiers, blocked terrain and structure collision
- [x] Server-driven day/night, weather state and basic wildlife wandering
- [x] Clan membership and validated barter settlement

## Remaining milestones
- [ ] Live PostgreSQL deployment verification with production credentials and backup/restore drill
- [ ] Browser visual QA and two-device multiplayer playtest
- [ ] Resource regeneration, animal behavior/interaction and richer weather visuals
- [ ] Building placement preview, rotation, damage/repair and more detailed door controls
- [ ] Account recovery, moderation, invite-based clan permissions and offline trade escrow
- [ ] Hunger, rest, health and non-combat survival pressure
- [ ] Protected starter regions, anti-camping and fair competitive rules
- [ ] Load tests, abuse/rate-limit tests, observability and production runbook

## Performance exit criteria
Nearby chunk subscriptions remain bounded; no full-world broadcast is introduced. Capacity claims require repeatable load tests and profiling.
