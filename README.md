# Pixel Frontier

**A living multiplayer pixel-art survival world.** Explore a shared wilderness, gather resources, build a settlement and leave a mark other players can discover.

> Pixel art on the surface. A systemic, persistent world underneath.

## Playable foundation
- Phaser 3 browser client, top-down camera and pixel rendering.
- Node.js, Express and Socket.io server.
- Server-authoritative movement, input validation and player lifecycle.
- Deterministic seeded trees, stones and berries.
- Server-validated gathering, a 24-slot inventory, primitive equipment, crafting, structures and chest storage.
- Seeded biome chunks, collision rules, day/night, weather and ambient wildlife.
- Optional PostgreSQL persistence for player sessions, chunks, structures, clans, trades and world clock.
- Signed anonymous player sessions that restore inventory and position on reconnect.
- Multiplayer join/leave and world snapshots.
- Node test runner and GitHub Actions CI.

## Run locally
Requires Node.js 20+.

```bash
npm install
cp .env.example .env
# Set DATABASE_URL and SESSION_SECRET in .env for persistent saves.
npm run dev
```

Open http://localhost:3000 in two browser windows.

## Controls
- WASD / Arrow keys — move
- E — gather nearest resource
- Gather button — gather on touch devices
- Build wall / Campfire — select a structure, then click/tap nearby in the world

Gather with E. Craft wooden axe or pickaxe from 15 wood. Use the 24-slot backpack to move items and equip tools.

Structures: wood wall (10 wood), stone wall (20 stone), wood door (20 wood), chest (8 wood + 2 stone). Press F near an accessible chest. Clan owners can share their doors and chests with clan members.

PostgreSQL is optional for local prototyping. Without DATABASE_URL the world runs in memory; set DATABASE_URL and a stable SESSION_SECRET to persist player/world data across restarts.

## Structure
- `public/` — Phaser client and UI
- `server/` — authoritative game server and world systems
- `tests/` — automated tests
- `docs/` — design, world, networking and 90-day roadmap

## Design promise
Not another disposable survival arena: Pixel Frontier is built around player-authored settlements, meaningful cooperation, regional ecology, trade routes and a world with memory. Competitive systems will be balanced around protected starter regions and fair offline rules.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the 90-day plan. MIT License.
