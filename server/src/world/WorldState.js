const { WORLD, GAME } = require("../config");
const { generateChunk, getBiomeAt } = require("./generateWorld");
const { ITEMS, RECIPES } = require("./ItemCatalog");
const { BUILDINGS, EQUIPMENT, addToSlots, slotCounts, consumeFromSlots, canOccupy } = require("./SurvivalSystems");
const { damageEquippedTool } = require("./InventoryRules");

class WorldState {
  constructor(seed = WORLD.seed) {
    this.seed = seed;
    this.resources = new Map();
    this.buildings = new Map();
    this.buildingsByChunk = new Map();
    this.chunks = new Map();
    this.nextBuildingId = 1;
  }

  indexBuilding(building) {
    this.buildings.set(building.id, building);
    if (!this.buildingsByChunk.has(building.chunkKey)) this.buildingsByChunk.set(building.chunkKey, new Map());
    this.buildingsByChunk.get(building.chunkKey).set(building.id, building);
  }

  restore(state = {}) {
    for (const chunk of state.chunks || []) {
      if (!chunk?.key) continue;
      this.chunks.set(chunk.key, chunk);
      for (const resource of chunk.resources || []) this.resources.set(resource.id, resource);
      for (const building of chunk.buildings || []) this.indexBuilding(building);
    }
    for (const building of state.structures || []) {
      if (!building?.id) continue;
      this.indexBuilding(building);
      const n = Number(String(building.id).split("_").at(-1));
      if (Number.isFinite(n)) this.nextBuildingId = Math.max(this.nextBuildingId, n + 1);
    }
  }

  getChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (!this.chunks.has(key)) {
      const chunk = generateChunk(this.seed, cx, cy);
      if (!chunk) return null;
      chunk.farmPlots = Array.isArray(chunk.farmPlots) ? chunk.farmPlots : [];
      this.chunks.set(key, chunk);
      for (const resource of chunk.resources) this.resources.set(resource.id, resource);
    }
    const chunk = this.chunks.get(key);
    return {
      ...chunk,
      resources: chunk.resources.filter(resource => this.resources.has(resource.id)),
      buildings: [...(this.buildingsByChunk.get(key)?.values() || [])],
      farmPlots: (chunk.farmPlots || []).map(plot => ({ ...plot, stage: this.cropStage(plot) }))
    };
  }

  getNearbyChunks(x, y, radius = 1) {
    const cx = Math.floor(x / WORLD.chunkSize), cy = Math.floor(y / WORLD.chunkSize), out = [];
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      const chunk = this.getChunk(cx + dx, cy + dy);
      if (chunk) out.push(chunk);
    }
    return out;
  }

  nearbyBuildings(x, y, radius = 48) {
    const minX = Math.floor((x - radius) / WORLD.chunkSize), maxX = Math.floor((x + radius) / WORLD.chunkSize);
    const minY = Math.floor((y - radius) / WORLD.chunkSize), maxY = Math.floor((y + radius) / WORLD.chunkSize);
    const result = [];
    for (let cy = minY; cy <= maxY; cy++) for (let cx = minX; cx <= maxX; cx++) {
      const bucket = this.buildingsByChunk.get(`${cx},${cy}`);
      if (bucket) for (const building of bucket.values()) result.push(building);
    }
    return result;
  }

  snapshot() {
    return { seed: this.seed, chunks: this.getNearbyChunks(WORLD.width / 2, WORLD.height / 2) };
  }

  till(player, x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 16 || y < 16 || x > WORLD.width - 16 || y > WORLD.height - 16) return { ok: false, reason: "invalid-position" };
    if (Math.hypot(player.x - x, player.y - y) > GAME.interactionRange * 1.5) return { ok: false, reason: "too-far" };
    if (player.equipment?.tool !== "wooden_hoe") return { ok: false, reason: "hoe-required" };
    const durability = player.equipment?.durability?.wooden_hoe;
    if (Number.isInteger(durability) && durability <= 0) return { ok: false, reason: "hoe-broken" };
    const biome = getBiomeAt(this.seed, x, y);
    if (biome === "lake" || biome === "mountain") return { ok: false, reason: "unsuitable-ground" };
    const plotX = Math.round(x / 32) * 32, plotY = Math.round(y / 32) * 32;
    if (Math.hypot(player.x - plotX, player.y - plotY) > GAME.interactionRange * 1.5) return { ok: false, reason: "too-far" };
    const nearby = this.nearbyBuildings(plotX, plotY, 24);
    if (nearby.some(b => b.solid !== false && Math.abs(b.x - plotX) < 24 && Math.abs(b.y - plotY) < 24)) return { ok: false, reason: "blocked-ground" };
    const cx = Math.floor(plotX / WORLD.chunkSize), cy = Math.floor(plotY / WORLD.chunkSize);
    const chunkKey = `${cx},${cy}`;
    this.getChunk(cx, cy);
    const chunk = this.chunks.get(chunkKey);
    if (!chunk) return { ok: false, reason: "invalid-position" };
    chunk.farmPlots = Array.isArray(chunk.farmPlots) ? chunk.farmPlots : [];
    if (chunk.farmPlots.some(plot => Math.abs(plot.x - plotX) < 28 && Math.abs(plot.y - plotY) < 28)) return { ok: false, reason: "already-tilled" };
    const toolWear = damageEquippedTool(player.equipment, 1);
    const plot = { id: `plot_${cx}_${cy}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, ownerId: player.id, x: plotX, y: plotY, chunkKey, state: "tilled", createdAt: Date.now() };
    chunk.farmPlots.push(plot);
    return { ok: true, plot, equipment: player.equipment, toolWear };
  }

  cropStage(plot, now = Date.now()) {
    if (!plot?.crop) return plot?.state || "tilled";
    const duration = Math.max(60000, (plot.growthDurationMs || 600000) - (plot.growthBonusMs || 0));
    const progress = Math.max(0, now - plot.plantedAt) / duration;
    return progress >= 1 ? "ripe" : progress >= 0.66 ? "growing" : "seedling";
  }

  plant(player, plotId, seedItem) {
    if (typeof plotId !== "string" || plotId.length > 100) return { ok: false, reason: "invalid-plot" };
    const crops = { wheat_seed: "wheat", carrot_seed: "carrot" };
    const crop = crops[seedItem];
    if (!crop) return { ok: false, reason: "invalid-seed" };
    let target = null;
    for (const chunk of this.chunks.values()) {
      const plot = (chunk.farmPlots || []).find(item => item.id === plotId);
      if (plot) { target = { chunk, plot }; break; }
    }
    if (!target) return { ok: false, reason: "plot-not-found" };
    const { plot } = target;
    if (plot.ownerId !== player.id) return { ok: false, reason: "plot-not-owned" };
    if (Math.hypot(player.x - plot.x, player.y - plot.y) > GAME.interactionRange * 1.5) return { ok: false, reason: "too-far" };
    if (plot.crop) return { ok: false, reason: "already-planted" };
    const next = player.slots.map(slot => slot && ({ ...slot }));
    const used = consumeFromSlots(next, { [seedItem]: 1 });
    if (!used.ok) return used;
    player.slots.splice(0, player.slots.length, ...next);
    player.inventory = slotCounts(player.slots);
    Object.assign(plot, { crop, seedItem, plantedAt: Date.now(), growthDurationMs: 600000, growthBonusMs: 0, wateredAt: null });
    return { ok: true, plot: { ...plot, stage: this.cropStage(plot) }, slots: player.slots, inventory: player.inventory };
  }

  water(player, plotId) {
    if (typeof plotId !== "string" || plotId.length > 100) return { ok: false, reason: "invalid-plot" };
    const target = [...this.chunks.values()].flatMap(chunk => (chunk.farmPlots || []).map(plot => ({ chunk, plot }))).find(item => item.plot.id === plotId);
    if (!target) return { ok: false, reason: "plot-not-found" };
    const { plot } = target;
    if (plot.ownerId !== player.id) return { ok: false, reason: "plot-not-owned" };
    if (!plot.crop) return { ok: false, reason: "not-planted" };
    if (this.cropStage(plot) === "ripe") return { ok: false, reason: "already-ripe" };
    if (plot.wateredAt) return { ok: false, reason: "already-watered" };
    if (Math.hypot(player.x - plot.x, player.y - plot.y) > GAME.interactionRange * 1.5) return { ok: false, reason: "too-far" };
    if (player.equipment?.tool !== "wooden_watering_can") return { ok: false, reason: "watering-can-required" };
    const durability = player.equipment?.durability?.wooden_watering_can;
    if (Number.isInteger(durability) && durability <= 0) return { ok: false, reason: "watering-can-broken" };
    const toolWear = damageEquippedTool(player.equipment, 1);
    plot.wateredAt = Date.now();
    plot.growthBonusMs = 300000;
    return { ok: true, plot: { ...plot, stage: this.cropStage(plot) }, equipment: player.equipment, toolWear };
  }

  harvest(player, plotId) {
    if (typeof plotId !== "string" || plotId.length > 100) return { ok: false, reason: "invalid-plot" };
    const target = [...this.chunks.values()].flatMap(chunk => (chunk.farmPlots || []).map(plot => ({ chunk, plot }))).find(item => item.plot.id === plotId);
    if (!target) return { ok: false, reason: "plot-not-found" };
    const { plot } = target;
    if (plot.ownerId !== player.id) return { ok: false, reason: "plot-not-owned" };
    if (!plot.crop) return { ok: false, reason: "not-planted" };
    if (this.cropStage(plot) !== "ripe") return { ok: false, reason: "not-ripe" };
    if (Math.hypot(player.x - plot.x, player.y - plot.y) > GAME.interactionRange * 1.5) return { ok: false, reason: "too-far" };
    const crop = plot.crop, seedItem = plot.seedItem;
    const next = player.slots.map(slot => slot && ({ ...slot }));
    const amount = 2 + (plot.wateredAt ? 1 : 0);
    const added = addToSlots(next, crop, amount);
    if (!added.ok) return added;
    if (Math.random() < 0.5) {
      const seedAdded = addToSlots(next, seedItem, 1);
      if (!seedAdded.ok) return seedAdded;
    }
    player.slots.splice(0, player.slots.length, ...next);
    player.inventory = slotCounts(player.slots);
    const chunk = target.chunk;
    chunk.farmPlots = chunk.farmPlots.filter(item => item.id !== plotId);
    return { ok: true, crop, amount, slots: player.slots, inventory: player.inventory, chunkKey: plot.chunkKey };
  }

  gather(player, id) {
    const resource = this.resources.get(id);
    if (!resource) return { ok: false, reason: "resource-unavailable" };
    if (Math.hypot(player.x - resource.x, player.y - resource.y) > GAME.interactionRange) return { ok: false, reason: "too-far" };
    const item = resource.type === "tree" ? "wood" : resource.type === "berry" ? "berries" : resource.type;
    if (!ITEMS[item]) return { ok: false, reason: "unknown-resource" };
    const power = EQUIPMENT[player.equipment?.tool]?.gatherPower || 1;
    const amount = resource.amount * power;
    const added = addToSlots(player.slots, item, amount);
    if (!added.ok) return added;
    player.inventory = slotCounts(player.slots);
    const toolWear = damageEquippedTool(player.equipment, 1);
    this.resources.delete(id);
    return { ok: true, resourceId: id, item, amount, chunkKey: resource.chunkKey, inventory: { ...player.inventory }, slots: player.slots, equipment: player.equipment, toolWear };
  }

  craft(player, name) {
    const recipe = RECIPES[name];
    if (!recipe || (!ITEMS[name] && !EQUIPMENT[name])) return { ok: false, reason: "unknown-recipe" };
    const next = player.slots.map(slot => slot && ({ ...slot }));
    const used = consumeFromSlots(next, recipe.costs);
    if (!used.ok) return used;
    const added = addToSlots(next, name, 1);
    if (!added.ok) return added;
    player.slots.splice(0, player.slots.length, ...next);
    player.inventory = slotCounts(player.slots);
    return { ok: true, recipe: name, inventory: { ...player.inventory }, slots: player.slots };
  }

  build(player, type, x, y) {
    const canonical = type === "wall" ? "wood_wall" : type === "door" ? "wood_door" : type;
    const definition = BUILDINGS[canonical];
    if (!definition && canonical !== "campfire") return { ok: false, reason: "unknown-building" };
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 24 || y < 24 || x > WORLD.width - 24 || y > WORLD.height - 24) return { ok: false, reason: "invalid-position" };
    if (Math.hypot(player.x - x, player.y - y) > GAME.interactionRange * 1.5) return { ok: false, reason: "too-far" };
    if (canonical === "clan_totem" && !player.clanId) return { ok: false, reason: "clan-required" };
    const buildX = Math.round(x / 24) * 24, buildY = Math.round(y / 24) * 24;
    if (canonical === "clan_totem") {
      const halfWidth = (definition.footprint?.width || 0) / 2;
      const halfHeight = (definition.footprint?.height || 0) / 2;
      const safeEdge = 200;
      const overlapsSafePerimeter = buildX - halfWidth <= safeEdge || buildY - halfHeight <= safeEdge ||
        buildX + halfWidth >= WORLD.width - safeEdge || buildY + halfHeight >= WORLD.height - safeEdge;
      if (overlapsSafePerimeter) return { ok: false, reason: "safe-zone" };
    }
    const nearby = this.nearbyBuildings(buildX, buildY, 48);
    if (!canOccupy(this.seed, buildX, buildY, WORLD.width, WORLD.height, nearby)) return { ok: false, reason: "blocked-position" };
    const costs = definition?.costs || (canonical === "campfire" ? { wood: 4, stone: 2 } : null);
    const used = consumeFromSlots(player.slots, costs);
    if (!used.ok) return used;
    const chunkKey = `${Math.floor(buildX / WORLD.chunkSize)},${Math.floor(buildY / WORLD.chunkSize)}`;
    const building = {
      id: `building_${this.nextBuildingId++}`, ownerId: player.id, clanId: player.clanId || null,
      type: canonical, x: buildX, y: buildY,
      chunkKey, hp: definition?.hp || 100, solid: definition?.solid ?? false, createdAt: Date.now()
    };
    this.indexBuilding(building);
    player.inventory = slotCounts(player.slots);
    return { ok: true, building, inventory: { ...player.inventory }, slots: player.slots };
  }
}
module.exports = { WorldState, RECIPES };
