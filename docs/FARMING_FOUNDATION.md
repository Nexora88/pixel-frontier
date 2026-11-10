# Farming foundation and character-art milestone

## Implemented in this change

- Added a craftable wooden hoe recipe: 12 wood + 4 fiber.
- Added the hoe to the equipment catalogue and a 60-use durability definition.
- Added server-authoritative equipment validation and a till action.
- Tilling requires the wooden hoe to be equipped, checks player distance, rejects lake/mountain terrain, rejects occupied and already-tilled cells, and consumes one durability only after success.
- Farm plots are stored on their world chunk and included in chunk snapshots, so they survive the existing chunk persistence flow.
- Nearby clients receive plot placement through their subscribed chunk room.
- Added a distinct plowed-soil renderer and a UI till mode.
- Added a dedicated 32x32 player sprite sheet with four directional rows and four walk poses per direction.

## Not included yet

- Seed items, planting, crop growth, watering, harvest and offline crop progression.
- Farming profession XP and persistent quest integration.
- Island generation, boats, sea travel, wildlife and taming.
- Full character action set (gather, craft, carry, tool-specific use), additional character variants, and in-browser visual review on desktop/mobile.

## Validation gates

- Unit tests cover successful tilling, durability use, missing/broken hoe, unsuitable terrain, distance, duplicate plots and chunk restoration.
- CI must pass before merge.
- Visual acceptance still requires a browser review at native scale and on a phone; the new sprite sheet is a stronger base, not a claim that all character animation work is finished.

## Follow-up farming implementation

The seed-and-crop follow-up now adds wheat and carrot seed bundles, timestamp-based crop growth, a craftable watering can, server-validated planting/watering/harvest actions, crop visuals, and harvest output. Crop timestamps are persisted with their chunk, so growth is calculated after reconnect rather than relying on a per-player timer.

The same follow-up adds a farmer XP track and four persistent quest counters (prepare soil, plant seeds, water crops, harvest crops), stored on the player record. This remains an incremental foundation: balancing, richer crop variety, water-source/refill gameplay, food use, and desktop/mobile multiplayer QA are still open.
