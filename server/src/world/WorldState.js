const { WORLD, GAME } = require("../config");
const { generateChunk } = require("./generateWorld");
const { ITEMS, RECIPES } = require("./ItemCatalog");
const { BUILDINGS, EQUIPMENT, addToSlots, slotCounts, consumeFromSlots, canOccupy } = require("./SurvivalSystems");

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
      this.chunks.set(key, chunk);
      for (const resource of chunk.resources) this.resources.set(resource.id, resource);
    }
    const chunk = this.chunks.get(key);
    return {
      ...chunk,
      resources: chunk.resources.filter(resource => this.resources.has(resource.id)),
      buildings: [...(this.buildingsByChunk.get(key)?.values() || [])]
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
    this.resources.delete(id);
    return { ok: true, resourceId: id, item, amount, chunkKey: resource.chunkKey, inventory: { ...player.inventory }, slots: player.slots };
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
