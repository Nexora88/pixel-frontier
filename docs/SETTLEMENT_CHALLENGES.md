# Settlement Challenges

Pixel Frontier uses a server-authoritative, non-destructive settlement contest rather than a full settlement wipe.

## Rules
- Only the leader of a clan can start a challenge against another clan's totem.
- The challenger must be near the target totem.
- The defending clan must have an online member near its settlement before a challenge can begin.
- A 30-second preparation phase is followed by a three-minute contest window.
- Control progress changes only while at least one defender remains nearby. A larger challenger group advances the meter; defenders can hold or reverse it.
- Success transfers the clan marker on the totem. It does not damage buildings, remove stored items, or take player inventory.
- Protected zones cannot be challenged. A completed challenge places the totem on a one-hour cooldown.
- A clan can participate in only one active challenge at a time.

## Persistence and integration
- Active challenge state and cooldowns are stored in world_meta through the existing persistence layer.
- Captured totem ownership is saved immediately; normal world saves continue to persist the rest of the settlement.
- Challenge completion feeds the weekly settlement quest for nearby members of both clans.
- Island arrival, animal care, and completed trades also feed their respective daily/weekly quest goals.

The contest is intentionally based on presence and territory control. It does not add destructive siege actions or offline settlement attacks.
