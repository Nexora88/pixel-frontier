# World Systems

## Current prototype
A deterministic seed creates resource nodes. Gathering is distance-checked and server-owned. Building recipes consume server-owned inventory and require nearby placement.

## Planned simulation
- Chunk-addressed terrain and entity storage.
- Biome resource tables and regeneration timers.
- Day/night and weather clocks driven by server time.
- Wildlife schedules and ecological recovery.
- Persistent structure ownership and permissions.
- Versioned snapshots and migrations.

## Performance
Use spatial indexes per chunk for nearby entity queries. Do not send the complete world to every player as the map and population grow.
