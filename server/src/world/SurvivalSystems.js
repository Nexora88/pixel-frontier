const { getBiomeAt } = require("./generateWorld");
const { ITEMS } = require("./ItemCatalog");

const EQUIPMENT = Object.freeze({
  primitive_stone: { label: "Primitive Stone", category: "equipment", gatherPower: 1, damage: 5, starter: true },
  wooden_axe: { label: "Wooden Axe", category: "equipment", gatherPower: 2, damage: 12, costs: { wood: 15 } },
  wooden_pickaxe: { label: "Wooden Pickaxe", category: "equipment", gatherPower: 2, damage: 8, costs: { wood: 15 } },
  wooden_hoe: { label: "Wooden Hoe", category: "equipment", gatherPower: 1, damage: 1, costs: { wood: 12, fiber: 4 } },
  wooden_watering_can: { label: "Wooden Watering Can", category: "equipment", gatherPower: 1, damage: 1, costs: { wood: 6, fiber: 4 } },
  iron_sword: { label: "Iron Sword", category: "equipment", gatherPower: 1, damage: 25, costs: { wood: 30, stone: 20, iron: 5 }, progression: "future" },
  advanced_pickaxe: { label: "Advanced Pickaxe", category: "equipment", gatherPower: 4, damage: 10, costs: { wood: 30, stone: 20, iron: 5 }, progression: "future" }
});
const BUILDINGS = Object.freeze({
  wood_wall: { label: "Wood Wall", category: "building", hp: 200, costs: { wood: 10 }, solid: true },
  stone_wall: { label: "Stone Wall", category: "building", hp: 500, costs: { stone: 20 }, solid: true },
  wood_door: { label: "Wood Door", category: "building", hp: 200, costs: { wood: 20 }, solid: true, access: "owner_or_clan" },
  chest: { label: "Storage Chest", category: "building", hp: 160, costs: { wood: 8, stone: 2 }, solid: true, storageSlots: 20 },
  workbench: { label: "Crafting Workbench", category: "building", hp: 220, costs: { wood: 12, stone: 4 }, solid: true },
  clan_totem: { label: "Clan Totem", category: "building", hp: 800, costs: { wood: 30, stone: 20 }, solid: true, footprint: { width: 32, height: 64 } }
});
const STARTER_SLOTS = 24;
function emptySlots(size = STARTER_SLOTS) { return Array.from({ length: size }, () => null); }
function addToSlots(slots, item, amount = 1) {
  if (!ITEMS[item] && !EQUIPMENT[item]) return { ok: false, reason: "unknown-item" };
  if (!Number.isInteger(amount) || amount < 1) return { ok: false, reason: "invalid-amount" };
  const next = slots.map(slot => slot && ({ ...slot }));
  const max = ITEMS[item]?.stack || 1;
  let remaining = amount;
  for (const slot of next) if (slot?.item === item && slot.quantity < max) {
    const moved = Math.min(max - slot.quantity, remaining); slot.quantity += moved; remaining -= moved;
    if (!remaining) { slots.splice(0, slots.length, ...next); return { ok: true, remaining: 0 }; }
  }
  for (let i = 0; i < next.length && remaining; i++) if (!next[i]) {
    const moved = Math.min(max, remaining); next[i] = { item, quantity: moved }; remaining -= moved;
  }
  if (remaining) return { ok: false, reason: "inventory-full", remaining };
  slots.splice(0, slots.length, ...next); return { ok: true, remaining: 0 };
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
  register(building) { if (building.type === "chest" || building.type === "storage_chest") this.chests.set(building.id, { ownerId: building.ownerId, clanId: building.clanId || null, building, slots: Array.isArray(building.storageSlots) ? building.storageSlots : emptySlots(BUILDINGS.chest.storageSlots) }); }
  canAccess(chest, player) { return !!chest && (chest.ownerId === player.id || (!!chest.clanId && chest.clanId === player.clanId)); }
  transfer(chestId, player, direction, playerSlot, chestSlot, amount) {
    const chest = this.chests.get(chestId); if (!this.canAccess(chest, player)) return { ok: false, reason: "chest-access-denied" };
    if (!Number.isInteger(playerSlot) || !Number.isInteger(chestSlot) || playerSlot < 0 || chestSlot < 0) return { ok: false, reason: "invalid-slot" };
    const source = direction === "deposit" ? player.slots : chest.slots;
    const target = direction === "deposit" ? chest.slots : player.slots;
    const from = direction === "deposit" ? playerSlot : chestSlot, to = direction === "deposit" ? chestSlot : playerSlot;
    if (!["deposit", "withdraw"].includes(direction) || !source?.[from]) return { ok: false, reason: "empty-slot" };
    const sourceCopy = source.map(s => s && ({ ...s })), targetCopy = target.map(s => s && ({ ...s }));
    const count = amount == null ? sourceCopy[from].quantity : amount;
    if (!Number.isInteger(count) || count < 1 || count > sourceCopy[from].quantity || to >= targetCopy.length) return { ok: false, reason: "invalid-amount" };
    const item = sourceCopy[from].item, destination = targetCopy[to], max = ITEMS[item]?.stack || 1;
    if (!destination) targetCopy[to] = { item, quantity: count };
    else if (destination.item === item && destination.quantity + count <= max) destination.quantity += count;
    else if (count === sourceCopy[from].quantity) { targetCopy[to] = sourceCopy[from]; sourceCopy[from] = destination; }
    else return { ok: false, reason: "slot-unavailable" };
    if (sourceCopy[from] && sourceCopy[from].item === item) { sourceCopy[from].quantity -= count; if (sourceCopy[from].quantity <= 0) sourceCopy[from] = null; }
    source.splice(0, source.length, ...sourceCopy); target.splice(0, target.length, ...targetCopy);
    chest.building.storageSlots = chest.slots;
    return { ok: true, playerSlots: player.slots, chestSlots: chest.slots };
  }
}
function canOccupy(seed, x, y, worldWidth, worldHeight, buildings = []) {
  if (x < 16 || y < 16 || x > worldWidth - 16 || y > worldHeight - 16) return false;
  const biome = getBiomeAt(seed, x, y);
  if (biome === "lake" || biome === "mountain") return false;
  return !buildings.some(b => b.solid !== false && Math.abs(b.x - x) < 22 && Math.abs(b.y - y) < 22);
}
class EnvironmentSimulation {
  constructor(seed = "pixel-frontier", options = {}) { this.seed = seed; this.dayLengthMs = options.dayLengthMs || 24 * 60 * 1000; this.startedAt = options.startedAt ?? Date.now(); this.weather = "clear"; this.weatherChangedAt = this.startedAt; this.animals = new Map(); this.nextAnimal = 1; }
  snapshot(now = Date.now()) {
    const phase = ((now - this.startedAt) % this.dayLengthMs) / this.dayLengthMs;
    const hour = Math.floor(phase * 24), weatherCycle = Math.floor((now - this.weatherChangedAt) / 180000);
    if (weatherCycle > 0) { const choices = ["clear", "cloudy", "rain"]; this.weather = choices[(Math.floor(now / 180000) + this.seed.length) % choices.length]; this.weatherChangedAt = now; }
    return { hour, day: Math.floor((now - this.startedAt) / this.dayLengthMs) + 1, isNight: hour < 6 || hour >= 19, weather: this.weather };
  }
  spawnAnimal(x, y, biome = "forest") { const animal = { id: `animal_${this.nextAnimal++}`, species: biome === "meadow" ? "rabbit" : biome === "lake" ? "duck" : "deer", x, y, biome, vx: 0, vy: 0 }; this.animals.set(animal.id, animal); return animal; }
  update(dt) { for (const animal of this.animals.values()) { if (Math.random() < 0.025) { animal.vx = (Math.random() - 0.5) * 18; animal.vy = (Math.random() - 0.5) * 18; } animal.x = Math.max(20, Math.min(3180, animal.x + animal.vx * dt)); animal.y = Math.max(20, Math.min(2380, animal.y + animal.vy * dt)); } }
  nearbyAnimals(x, y, range = 500) { return [...this.animals.values()].filter(a => Math.hypot(a.x - x, a.y - y) <= range); }
}
class SocialSystems {
  constructor() { this.clans = new Map(); this.trades = new Map(); this.nextTrade = 1; }
  createClan(player, name) { const clean = String(name || "").trim().slice(0, 24); if (clean.length < 3 || player.clanId) return { ok: false, reason: "invalid-clan" }; const id = `clan_${Math.max(0,...[...this.clans.keys()].map(key=>Number(key.split("_").at(-1))||0))+1}`; const clan = { id, name: clean, leaderId: player.id, members: [player.id] }; this.clans.set(id, clan); player.clanId = id; return { ok: true, clan }; }
  joinClan(player, clanId) { const clan = this.clans.get(clanId); if (!clan || player.clanId) return { ok: false, reason: "clan-unavailable" }; clan.members.push(player.id); player.clanId = clanId; return { ok: true, clan }; }
  createTrade(player, item, quantity, priceItem, priceQuantity) {
    if ((slotCounts(player.slots)[item] || 0) < quantity) return { ok: false, reason: "not-enough-resources" };
    if (!ITEMS[item] || !ITEMS[priceItem] || !Number.isInteger(quantity) || !Number.isInteger(priceQuantity) || quantity < 1 || priceQuantity < 1) return { ok: false, reason: "invalid-trade" };
    const id = `trade_${this.nextTrade++}`; this.trades.set(id, { id, sellerId: player.id, item, quantity, priceItem, priceQuantity, status: "open" }); return { ok: true, trade: this.trades.get(id) };
  }
  acceptTrade(buyer, tradeId, seller) {
    const trade = this.trades.get(tradeId); if (!trade || trade.status !== "open" || trade.sellerId === buyer.id || !seller || seller.id !== trade.sellerId) return { ok: false, reason: "trade-unavailable" };
    const buyerSlots = buyer.slots.map(s => s && ({ ...s })), sellerSlots = seller.slots.map(s => s && ({ ...s }));
    if (!consumeFromSlots(buyerSlots, { [trade.priceItem]: trade.priceQuantity }).ok || !consumeFromSlots(sellerSlots, { [trade.item]: trade.quantity }).ok) return { ok: false, reason: "not-enough-resources" };
    if (!addToSlots(buyerSlots, trade.item, trade.quantity).ok || !addToSlots(sellerSlots, trade.priceItem, trade.priceQuantity).ok) return { ok: false, reason: "inventory-full" };
    buyer.slots.splice(0, buyer.slots.length, ...buyerSlots); seller.slots.splice(0, seller.slots.length, ...sellerSlots);
    buyer.inventory = slotCounts(buyer.slots); seller.inventory = slotCounts(seller.slots);
    trade.status = "accepted"; trade.buyerId = buyer.id; return { ok: true, trade };
  }
}
module.exports = { EQUIPMENT, BUILDINGS, emptySlots, addToSlots, moveSlot, slotCounts, consumeFromSlots, ChestStore, canOccupy, EnvironmentSimulation, SocialSystems };
