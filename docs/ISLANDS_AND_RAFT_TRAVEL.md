# Seeded Islands and Raft Travel

## Terrain generation v2
- New worlds use deterministic seed-based landmasses: one large homeland and two separated satellite islands.
- A warped radial coastline produces irregular bays, capes and peninsula-like projections.
- Chunks contain a 25px terrain-cell mask so shore edges are rendered as pixel-scale water/land transitions.
- Resources spawn only on land cells.
- Open ocean is a distinct biome and blocks walking, farming and building.
- Terrain generation is versioned. Existing saved worlds without a generation-version marker stay on legacy terrain; new worlds use version 2. The version is persisted in world metadata.

## Raft travel
- Wooden raft recipe: 35 wood, 12 reed and 8 fiber.
- Launch is server-authoritative and requires a raft item plus a safe land position close to open water.
- A player without an active raft cannot move into ocean cells.
- An active raft permits ocean movement at a reduced travel speed.
- Docking requires a shoreline position and returns the raft item to inventory.
- Active raft state is persisted with the player so reconnecting at sea remains possible.
- Nearby players see a small animated raft under the passenger.

## Deliberate follow-up work
- This milestone does not yet include deep-water swimming, boat damage, cargo storage, wind/current simulation, ports or multiple boat classes.
- Water and shoreline sprite animation, wake effects, paddling frames and the final detailed boat art belong to the later animation/art milestone.
- Desktop/mobile browser QA and multi-player sea-travel load testing are still required.
