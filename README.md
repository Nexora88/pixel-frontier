# Pixel Frontier

**A living multiplayer pixel-art survival world.** Explore a shared wilderness, gather resources, build a settlement and leave a mark other players can discover.

> Pixel art on the surface. A systemic, persistent world underneath.

## Playable foundation
- Phaser 3 browser client, top-down camera and pixel rendering.
- Node.js, Express and Socket.io server.
- Server-authoritative movement, input validation and player lifecycle.
- Deterministic seeded trees, stones and berries.
- Server-validated gathering, inventory counters, walls and campfires.
- Multiplayer join/leave and world snapshots.
- Node test runner and GitHub Actions CI.

## Run locally
Requires Node.js 20+.

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000 in two browser windows.

## Controls
- WASD / Arrow keys — move
- E — gather nearest resource
- Gather button — gather on touch devices
- Build wall / Campfire — select a structure, then click/tap nearby in the world

Recipes: wall (3 wood + 1 stone), campfire (4 wood + 2 stone).

## Structure
- `public/` — Phaser client and UI
- `server/` — authoritative game server and world systems
- `tests/` — automated tests
- `docs/` — design, world, networking and 90-day roadmap

## Design promise
Not another disposable survival arena: Pixel Frontier is built around player-authored settlements, meaningful cooperation, regional ecology, trade routes and a world with memory. Competitive systems will be balanced around protected starter regions and fair offline rules.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the 90-day plan. MIT License.
