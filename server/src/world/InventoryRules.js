const TOOL_DURABILITY = Object.freeze({
  primitive_stone: 40,
  wooden_axe: 80,
  wooden_pickaxe: 80,
  advanced_pickaxe: 160,
  iron_sword: 120
});

const ITEM_CATEGORIES = Object.freeze({
  material: ["wood", "stone", "iron", "berries", "woodland-herb", "reed", "ore", "crystal", "fiber"],
  equipment: Object.keys(TOOL_DURABILITY),
  consumable: [],
  building: ["wood_wall", "stone_wall", "wood_door", "chest", "workbench", "clan_totem"]
});

function maxDurability(item) {
  return TOOL_DURABILITY[item] || 0;
}

function getDurability(equipment, item = equipment?.tool) {
  const maximum = maxDurability(item);
  if (!maximum) return null;
  const current = equipment?.durability?.[item];
  return Number.isInteger(current) ? Math.max(0, Math.min(maximum, current)) : maximum;
}

function damageEquippedTool(equipment, amount = 1) {
  if (!equipment || !Number.isInteger(amount) || amount < 1) {
    return { ok: false, reason: "invalid-durability-change" };
  }
  const item = equipment.tool;
  const maximum = maxDurability(item);
  if (!maximum) return { ok: true, changed: false, equipment };
  if (!equipment.durability || typeof equipment.durability !== "object") equipment.durability = {};
  const current = getDurability(equipment, item);
  const next = Math.max(0, current - amount);
  equipment.durability[item] = next;
  if (next === 0) {
    equipment.tool = null;
    return { ok: true, changed: true, broke: item, durability: 0, equipment };
  }
  return { ok: true, changed: true, durability: next, maxDurability: maximum, equipment };
}

function validateSlot(slot) {
  if (slot == null) return true;
  if (!slot || typeof slot.item !== "string" || !Number.isInteger(slot.quantity) || slot.quantity < 1) return false;
  if (ITEM_CATEGORIES.equipment.includes(slot.item)) return slot.quantity === 1;
  return ITEM_CATEGORIES.material.includes(slot.item) && slot.quantity <= 99;
}

module.exports = { TOOL_DURABILITY, ITEM_CATEGORIES, maxDurability, getDurability, damageEquippedTool, validateSlot };
