# Inventory and tool durability — first implementation slice

This change introduces server-owned durability for gathering tools. Durability is stored inside the existing persisted `players.equipment` JSON field, so no database migration is required.

## Current behavior
- Primitive stone: 40 durability.
- Wooden axe and wooden pickaxe: 80 durability each.
- Advanced pickaxe: 160 durability.
- Iron sword: 120 durability (combat integration remains a later step).
- A successful gather action consumes one durability point from the currently equipped supported tool.
- When a tool reaches zero, it is unequipped; the player can continue gathering at the base rate.
- Failed gathering attempts and inventory-full failures do not consume durability.
- Durability state is returned with the gather result and is saved through the existing player persistence flow.

## Scope and follow-up
This is the first vertical slice, not the complete inventory redesign. Item categories and slot validation helpers are introduced, while equipment UI, repair recipes, armor slots, station-gated recipes, and full catalog expansion remain future work. Existing item IDs and inventory slot saves are preserved for compatibility.
