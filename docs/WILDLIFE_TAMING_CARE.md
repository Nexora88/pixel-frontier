# Wildlife, Taming and Care

- The server owns animal positions, species, trust, hunger, affection and ownership.
- Deer, rabbits and ducks have different movement speeds and terrain preferences.
- Wild animals wander and move away from nearby players; tamed companions follow their online owner.
- Feeding a wild animal consumes one berry and builds trust. Three successful feeds establish ownership.
- Feeding a companion restores hunger and increases affection.
- Owners can perform a separate care interaction to improve affection and condition.
- Other players cannot take over an already-owned animal.
- Animal state is saved in world metadata and restored after a server restart.
- Nearby animals are replicated through the existing world-state snapshots; clients interpolate movement and show a distinct tamed outline.

Animals are environmental wildlife, not player slots or simulated population. This milestone does not include breeding, offspring, animal inventory, combat mounts, complex shelter needs or death. Expanded species sprites, feeding/petting animation frames, sound and detailed animal pixel art remain part of the later visual milestone.

Desktop/mobile interaction testing and multi-player persistence testing remain required.
