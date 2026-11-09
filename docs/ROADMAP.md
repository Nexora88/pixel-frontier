# 90-Day Roadmap

Scope plan; unchecked items are not implemented.

## Month 1 — Playable foundation
- [x] Node/Express/Socket.io server and server-authoritative movement
- [x] Deterministic gathering and starter inventory
- [x] Directional pixel survivor animations
- [x] Seeded forest, lake, mountain and meadow biome generation
- [x] Biome-specific resource tables and movement metadata
- [x] 3×3 chunk interest management, chunk load/unload and scoped world deltas
- [x] Server-owned item catalog and validated crafting recipes
- [x] Expanded structures: walls, campfires, doors and chests
- [ ] PostgreSQL persistence

## Month 2 — Survival and settlement
- [ ] Inventory slots, stack limits, transfer UI and chest storage permissions
- [ ] Crafting stations, progression, placement preview and collision
- [ ] Hunger, rest, health and survival pressure
- [ ] Day/night, weather, wildlife and resource regeneration
- [ ] Save migrations and backup/restore tests

## Month 3 — Shared-world identity
- [ ] Account/session authentication and reconnect recovery
- [ ] Persistent chunk snapshots and region migrations
- [ ] Party, clan and settlement permissions
- [ ] Player trade board and economy sinks
- [ ] Protected regions, anti-camping and fair competitive rules
- [ ] Load tests, abuse/rate-limit tests, observability and deployment runbook

## Exit criteria
A small group can gather, craft and establish a settlement, reconnect without losing progress, and play without whole-world broadcasts.