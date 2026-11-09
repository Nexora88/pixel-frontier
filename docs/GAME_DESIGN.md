# Pixel Frontier — Game Design

## North star
A persistent shared wilderness where player-made settlements, trade routes and local stories become the world's history. Pixel art is the visual language; systemic depth is the differentiator.

## Non-negotiable architecture and fairness principles
These principles apply to every feature and every future refactor:

1. **Authoritative server:** The client sends intent, never trusted outcomes. The server validates movement, gathering, crafting, building, combat and ownership. Client-side position, damage, inventory or resource claims are never accepted as truth.
2. **Chunk-based interest management:** The server tracks each player's current chunk and subscribes them only to nearby chunks. Resource changes, structures and player snapshots are scoped to relevant subscribers; global broadcasts are reserved for truly global events.
3. **Protected onboarding:** New survivors spawn in protected outer regions with clear routes into the frontier. Spawn protection, safe-zone boundaries and anti-camping rules are server-enforced. The central frontier can carry greater risk and reward.
4. **Persistent world memory:** Player settlements, discovered landmarks, resource changes and world history survive restarts through durable storage and recoverable backups.
5. **Fair multiplayer:** Progression must create meaningful specialization without allowing permanent domination. Offline protection, ownership permissions, recovery paths and non-combat play remain first-class systems.
6. **Performance is a feature:** Bound per-tick work, validate and rate-limit inputs, avoid unbounded broadcasts, and measure server load before increasing player caps.

## First playable loop
Explore → find a resource → gather → manage inventory → place a useful structure → meet another survivor → cooperate or trade.

## Differentiators to prototype
- Settlement chronicle recording who founded, expanded or repaired a place.
- Player-made trails and signposts as shared navigation infrastructure.
- Regional ecology: overharvested areas recover slowly; responsible gathering preserves yields.
- Asynchronous world events that create shared goals beyond combat.
- Specialization through tools and professions, not permanent class locks.

## Fairness
Combat, if introduced, remains fictional and stylized. Protected starter areas, consent-based duels, raid windows, offline protection and non-combat alternatives must be designed before competitive systems ship.
