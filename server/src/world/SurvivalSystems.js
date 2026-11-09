const { BIOMES, getBiomeAt } = require("./generateWorld");
const { ITEMS } = require("./ItemCatalog");

const EQUIPMENT = Object.freeze({
  primitive_stone: { label: "Primitive Stone", category: "equipment", gatherPower: 1, damage: 5, starter: true },
  wooden_axe: { label: "Wooden Axe", category: "equipment", gatherPower: 2, damage: 12, costs: { wood: 15 } },
  wooden_pickaxe: { label: "Wooden Pickaxe", category: "equipment", gatherPower: 2, damage: 8, costs: { wood: 15 } },
  iron_sword: { label: "Iron Sword", category: "equipment", gatherPower: 1, damage: 25, costs: { wood: 30, stone: 20, iron: 5 }, progression: "future" },
  advanced_pickaxe: { label: "Advanced Pickaxe", category: "equipment", gatherPower: 4, damage: 10, costs: { wood: 30, stone: 20, iron: 5 }, progression: "future" }
});
const BUILDINGS = Object.freeze({
  wood_wall: { label: "Wood Wall", category: "building", hp: 200, costs: { wood: 10 }, solid: true },
  stone_wall: { label: "Stone Wall", category: "building", hp: 500, costs: { stone: 20 }, solid: true },
  wood_door: { label: "Wood Door", category: "building", hp: 200, costs: { wood: 20 }, solid: true, access: "owner_or_clan" },
  chest: { label: "Storage Chest", category: "building", hp: 160, costs: { wood: 8, stone: 2 }, solid: true, storageSlots: 20 }
});
const STARTER_SLOTS = 24;
function emptySlots(size = STARTER_SLOTS) { return Array.from({ length: size }, () => null); }
function addToSlots(slots, item, amount = 1) {
  if (!ITEMS[item] && !EQUIPMENT[item]) return { ok: false, reason: "unknown-item" };
  if (!Number.isInteger(amount) || amount < 1) return { ok: false, reason: "invalid-amount" };
  const max = ITEMS[item]?.stack || 1;
  let remaining = amount;
  for (const slot of slots) if (slot?.item === item && slot.quantity < max) {
    const moved = Math.min(max - slot.quantity, remaining); slot.quantity += moved; remaining -= moved;
    if (!remaining) return { ok: true, remaining: 0 };
  }
  for (let i = 0; i < slots.length && remaining; i++) if (!slots[i]) {
    const moved = Math.min(max, remaining); slots[i] = { item, quantity: moved }; remaining -= moved;
  }
  return remaining ? { ok: false, reason: "inventory-full", remaining } : { ok: true, remaining: 0 };
}
function moveSlot(slots, from, to, amount) {
  if (![from, to].every(Number.isInteger) || from < 0 || to < 0 || from >= slots.length || to >= slots.length || from === to) return { ok: false, reason: "invalid-slot" };
  const source = slots[from], target = slots[to]; if (!source) return { ok: false, reason: "empty-slot" };
  const count = amount == null ? source.quantity : amount;
  if (!Number.isInteger(count) || count < 1 || count > source.quantity) return { ok: false, reason: "invalid-amount" };
  if (!target) { slots[to] = { item: source.item, quantity: count }; source.quantity -= count; if (!source.quantity) slots[from] = null; return { ok: true }; }
  if (target.item === source.item) {
    const max = ITEMS[source.item]?.stack || 1, moved = Math.min(count, max - target.quantity);
    if (!moved) return { ok: false, reason: "stack-full" };
    target.quantity += moved; source.quantity -= moved; if (!source.quantity) slots[from] = null; return { ok: true, moved };
  }
  if (count !== source.quantity) return { ok: false, reason: "partial-swap-not-supported" };
  slots[from] = target; slots[to] = source; return { ok: true };
}
function slotCounts(slots) { const counts = {}; for (const slot of slots) if (slot) counts[slot.item] = (counts[slot.item] || 0) + slot.quantity; return counts; }
function consumeFromSlots(slots, costs) {
  const counts = slotCounts(slots);
  for (const [item, qty] of Object.entries(costs)) if ((counts[item] || 0) < qty) return { ok: false, reason: "not-enough-resources" };
  for (const [item, qty] of Object.entries(costs)) {
    let left = qty;
    for (let i = 0; i < slots.length && left; i++) if (slots[i]?.item === item) {
      const used = Math.min(left, slots[i].quantity); slots[i].quantity -= used; left -= used;
      if (!slots[i].quantity) slots[i] = null;
    }
  }
  return { ok: true };
}
class ChestStore {
  constructor() { this.chests = new Map(); }
  register(building) { if (building.type === "chest" || building.type === "storage_chest") this.chests.set(building.id, { ownerId: building.ownerId, clanId: building.clanId || null, slots: emptySlots(BUILDINGS.chest.storageSlots) }); }
  canAccess(chest, player) { return !!chest && (chest.ownerId === player.id || (!!chest.clanId && chest.clanId === player.clanId)); }
  transfer(chestId, player, from, to, amount) {
    const chest = this.chests.get(chestId); if (!this.canAccess(chest, player)) return { ok: false, reason: "chest-access-denied" };
    const source = from === "player" ? player.slots : chest.slots, target = from === "player" ? chest.slots : player.slots;
    const result = moveSlot(source, from === "player" ? to : from, from === "player" ? from : to, amount);
    if (result.ok) return { ok: true, playerSlots: player.slots, chestSlots: chest.slots };
    return result;
  }
}
function canOccupy(seed, x, y, worldWidth, worldHeight, buildings = []) {
  if (x < 16 || y < 16 || x > worldWidth - 16 || y > worldHeight - 16) return false;
  const biome = getBiomeAt(seed, x, y);
  if (biome === "lake" || biome === "mountain") return false;
  return !buildings.some(b => b.solid !== false && Math.abs(b.x - x) < 22 && Math.abs(b.y - y) < 22);
}
class EnvironmentSimulation {
  constructor(seed = "pixel-frontier", options = {}) { this.seed = seed; this.dayLengthMs = options.dayLengthMs || 24 * 60 * 1000; this.startedAt = options.startedAt || Date.now(); this.weather = "clear"; this.weatherChangedAt = this.startedAt; this.animals = new Map(); this.nextAnimal = 1; }
  snapshot(now = Date.now()) {
    const phase = ((now - this.startedAt) % this.dayLengthMs) / this.dayLengthMs;
    const hour = Math.floor(phase * 24), weatherCycle = Math.floor((now - this.weatherChangedAt) / 180000);
    if (weatherCycle > 0) { const choices = ["clear", "cloudy", "rain"]; this.weather = choices[(Math.floor(now / 180000) + this.seed.length) % choices.length]; this.weatherChangedAt = now; }
    return { hour, day: Math.floor((now - this.startedAt) / this.dayLengthMs) + 1, isNight: hour < 6 || hour >= 19, weather: this.weather };
  }
  spawnAnimal(x, y, biome = "forest") { const animal = { id: `animal_${this.nextAnimal++}`, species: biome === "meadow" ? "rabbit" : biome === "lake" ? "duck" : "deer", x, y, biome }; this.animals.set(animal.id, animal); return animal; }
  nearbyAnimals(x, y, range = 500) { return [...this.animals.values()].filter(a => Math.hypot(a.x - x, a.y - y) <= range); }
}
class SocialSystems {
  constructor() { this.clans = new Map(); this.trades = new Map(); this.nextTrade = 1; }
  createClan(player, name) { const clean = String(name || "").trim().slice(0, 24); if (clean.length < 3 || player.clanId) return { ok: false, reason: "invalid-clan" }; const id = `clan_${this.clans.size + 1}`; const clan = { id, name: clean, leaderId: player.id, members: [player.id] }; this.clans.set(id, clan); player.clanId = id; return { ok: true, clan }; }
  joinClan(player, clanId) { const clan = this.clans.get(clanId); if (!clan || player.clanId) return { ok: false, reason: "clan-unavailable" }; clan.members.push(player.id); player.clanId = clanId; return { ok: true, clan }; }
  createTrade(player, item, quantity, priceItem, priceQuantity) {
    if (!ITEMS[item] || !ITEMS[priceItem] || !Number.isInteger(quantity) || !Number.isInteger(priceQuantity) || quantity < 1 || priceQuantity < 1) return { ok: false, reason: "invalid-trade" };
    const id = `trade_${this.nextTrade++}`; this.trades.set(id, { id, sellerId: player.id, item, quantity, priceItem, priceQuantity, status: "open" }); return { ok: true, trade: this.trades.get(id) };
  }
  acceptTrade(player, tradeId, slots) {
    const trade = this.trades.get(tradeId); if (!trade || trade.status !== "open" || trade.sellerId === player.id) return { ok: false, reason: "trade-unavailable" };
    const counts = slotCounts(slots); if ((counts[trade.priceItem] || 0) < trade.priceQuantity) return { ok: false, reason: "not-enough-resources" };
    trade.status = "accepted"; trade.buyerId = player.id; return { ok: true, trade };
  }
}
module.exports = { EQUIPMENT, BUILDINGS, emptySlots, addToSlots, moveSlot, slotCounts, consumeFromSlots, ChestStore, canOccupy, EnvironmentSimulation, SocialSystems };
