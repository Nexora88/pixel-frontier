# 90-Day Roadmap

This is a scope plan, not a claim that every feature is already implemented. Each phase ends with a playable, testable milestone.

## Month 1 — Playable foundation
- [x] Node/Express/Socket.io server skeleton
- [x] Server-authoritative movement and player lifecycle
- [x] Deterministic starter resource field
- [x] Basic gathering, inventory counters and two build recipes
- [x] CI and unit-test baseline
- [ ] Sprite sheets, animation states and sound
- [ ] Chunk subscriptions and interest management
- [ ] PostgreSQL player/world persistence

## Month 2 — Survival and settlement
- [ ] Inventory slots, item definitions and stack rules
- [ ] Crafting stations and recipe progression
- [ ] Placement preview, rotation, collision and ownership
- [ ] Storage, repair and structure durability
- [ ] Hunger, rest, health and non-combat survival pressure
- [ ] Day/night and weather simulation
- [ ] Wildlife and resource regeneration
- [ ] Save migrations and backup/restore tests

## Month 3 — Shared-world identity
- [ ] Account/session authentication and reconnect recovery
- [ ] Region persistence and server-side interest management
- [ ] Party, clan and settlement permissions
- [ ] Player trade board and economy sinks
- [ ] Protected regions and fair competitive rules
- [ ] Load tests, abuse/rate-limit tests and observability
- [ ] Deployment runbook and production monitoring
- [ ] Closed playtest and balance pass

## Exit criteria
A small group can join one world, gather and craft, establish a settlement, disconnect and reconnect without losing progress, and play without the server broadcasting the entire world to every client.
