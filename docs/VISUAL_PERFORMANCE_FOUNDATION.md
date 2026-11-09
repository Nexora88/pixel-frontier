# Pixel Frontier — Visual & Performance Foundation

## Implemented in this branch

- Phaser rendering explicitly enables pixel-art mode, disables antialiasing and rounds render coordinates.
- Dynamic Y-depth is refreshed at 10 Hz instead of traversing and sorting the entire display list every frame. Static world objects receive their initial depth when created.
- Trees fade only when the local player is behind them; tweens are created only when the occlusion state changes.
- Resource removal uses a bounded 32-object debris pool with short-lived wood/stone-colored pixel fragments.
- Player labels use a compact monospace style and display clanmates in green, unaligned players in white and other clans in red.
- Server collision checks use a chunk-keyed building index and query nearby buckets rather than constructing/scanning the entire building collection for each movement axis.

## Performance guardrails

- Keep loaded world entities scoped to nearby chunks.
- Keep effects bounded and cosmetic; do not let clients decide resource, combat, territory or inventory truth.
- Avoid per-frame full display-list sorts and unbounded particle creation.
- Destroy chunk-owned Phaser objects when a chunk unloads.
- Profile frame time, heap/RSS, event-loop lag, tick duration and outbound bytes at increasing client counts.

## Scaling boundary

The current game is still one authoritative process. Chunk Socket.IO rooms are interest management, not world sharding. The next multiplayer milestone is a matchmaker that assigns players to isolated authoritative world instances capped at 50–60 players, followed by Redis-backed gateway fan-out and measured multi-instance load tests. Cloudflare should proxy the public edge, with origin access restricted where the hosting platform permits it; application-level validation and rate limits remain mandatory.

The 2,000–5,000 concurrent-player and 500,000 monthly-active-player figures are goals, not current capacity claims. A 50-player world implies approximately 40–100 active worlds at 2,000–5,000 concurrent players. Prove capacity with repeatable tests before advertising it.

## Next visual milestone

Replace prototype geometric resource/building placeholders and the current 16×16 survivor sheet with a cohesive original 32×32 character set, layered 64×64 trees, biome-specific ground tiles, hand-authored walls/doors, clan banners, and a consistent animation/VFX atlas. Browser screenshots and device QA are required before calling the art pass complete.
