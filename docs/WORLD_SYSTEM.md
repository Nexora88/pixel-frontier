# World Systems

## Implemented prototype systems
- Seeded forest, lake, mountain and meadow chunks with biome-specific resource nodes.
- Server-authoritative gathering, 24-slot inventory, stack limits and crafting.
- Primitive starter equipment, wooden axe and pickaxe recipes; equipment affects gathering yield.
- Structures with durability metadata, collision and owner/clan door passage.
- Owner/clan-gated chests with slot transfers; contents are stored on the structure snapshot.
- PostgreSQL persistence for player profiles, chunk state, structures, clans, trades and simulation clock.
- Signed anonymous player sessions restore the same player record on reconnect.
- Server-driven day/night, weather state and lightweight wandering wildlife.

## Data model
ITEMS, EQUIPMENT and BUILDINGS are separate catalogs. Materials stack; equipment is non-stackable; structures are world entities with owner, durability and collision metadata. The server owns all inventory and ownership changes.

## Remaining work
- Iron progression is catalog metadata only; mining, smelting and iron recipes are not yet playable.
- Weather is currently a state/clock with night tint; richer rain and biome effects remain.
- Wildlife is a lightweight ambient prototype, not a complete ecology or animal interaction system.
- PostgreSQL needs live-environment verification, backup/restore testing and operational monitoring.
- Add resource regeneration and chunk-level spatial indexes before scaling the world.
