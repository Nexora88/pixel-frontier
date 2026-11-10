const { WORLD } = require("../config");
const { createInventory } = require("../world/ItemCatalog");
const { BIOMES, getBiomeAt } = require("../world/generateWorld");
const { emptySlots, addToSlots, slotCounts, canOccupy } = require("../world/SurvivalSystems");
const COLORS = [0x55c2ff, 0xd99aff, 0x7ed957, 0xffc857, 0xff7d87, 0xf1eee5];

class PlayerManager {
  constructor() {
    this.players = new Map();
    this.playersByChunk = new Map();
  }

  chunkKey(x, y) {
    return `${Math.floor(x / WORLD.chunkSize)},${Math.floor(y / WORLD.chunkSize)}`;
  }

  indexPlayer(player) {
    player.chunkKey = this.chunkKey(player.x, player.y);
    if (!this.playersByChunk.has(player.chunkKey)) this.playersByChunk.set(player.chunkKey, new Map());
    this.playersByChunk.get(player.chunkKey).set(player.id, player);
  }

  visibleTo(player) {
    const visible = new Map([[player.id, player]]);
    for (const key of player.subscribedChunks) {
      const bucket = this.playersByChunk.get(key);
      if (bucket) for (const [id, other] of bucket) visible.set(id, other);
    }
    return [...visible.values()];
  }

  add(id, socketId, restored, world) {
    const seed = world?.seed || WORLD.seed;
    let spawn = { x: restored?.x, y: restored?.y };
    if (!Number.isFinite(spawn.x) || !Number.isFinite(spawn.y) ||
        !(restored?.boat_state?.active && spawn.x >= 16 && spawn.y >= 16 && spawn.x <= WORLD.width - 16 && spawn.y <= WORLD.height - 16 && getBiomeAt(seed, spawn.x, spawn.y, world?.generationVersion) === "ocean") && !canOccupy(seed, spawn.x, spawn.y, WORLD.width, WORLD.height, [...(world?.buildings?.values() || [])], world?.generationVersion)) {
      spawn = null;
      const buildings = [...(world?.buildings?.values() || [])];
      for (let i = 0; i < 2000 && !spawn; i++) {
        const x = 80 + Math.random() * (WORLD.width - 160);
        const y = 80 + Math.random() * (WORLD.height - 160);
        if (canOccupy(seed, x, y, WORLD.width, WORLD.height, buildings, world?.generationVersion)) spawn = { x, y };
      }
    }
    if (!spawn) spawn = { x: WORLD.width / 2, y: WORLD.height / 2 };
    const player = {
      id, socketId, name: restored?.name || `Survivor-${id.slice(0, 4)}`,
      x: spawn.x, y: spawn.y, color: COLORS[Math.floor(Math.random() * COLORS.length)],
      input: { up: false, down: false, left: false, right: false },
      vx: 0, vy: 0,
      inventory: createInventory(),
      slots: Array.isArray(restored?.slots) && restored.slots.length ? restored.slots : emptySlots(),
      equipment: restored?.equipment || { tool: "primitive_stone" },
      boat: restored?.boat_state && typeof restored.boat_state === "object" && restored.boat_state.active ? restored.boat_state : null,
      farmingXp: Number.isInteger(restored?.farming_xp) ? Math.max(0, restored.farming_xp) : 0,
      farmingQuests: restored?.farming_quests && typeof restored.farming_quests === "object" ? restored.farming_quests : {},
      lastInputAt: 0, subscribedChunks: new Set(), clanId: restored?.clan_id || null,
      spawnProtectionUntil: restored ? 0 : Date.now() + 15000
    };
    if (restored?.inventory && !player.slots.some(Boolean)) {
      for (const [item, qty] of Object.entries(restored.inventory)) {
        if (Number.isInteger(qty) && qty > 0) addToSlots(player.slots, item, qty);
      }
    }
    if (!player.slots.some(slot => slot?.item === "primitive_stone")) addToSlots(player.slots, "primitive_stone", 1);
    player.inventory = slotCounts(player.slots);
    this.players.set(id, player);
    this.indexPlayer(player);
    return player;
  }

  remove(id) {
    const player = this.players.get(id);
    if (!player) return false;
    const bucket = this.playersByChunk.get(player.chunkKey);
    bucket?.delete(id);
    if (bucket?.size === 0) this.playersByChunk.delete(player.chunkKey);
    return this.players.delete(id);
  }

  get(id) { return this.players.get(id); }

  getBySocket(socketId) {
    for (const player of this.players.values()) if (player.socketId === socketId) return player;
    return null;
  }

  publicPlayers(players = this.players.values(), ownerId = null) {
    return [...players].map(({ input, lastInputAt, subscribedChunks, socketId, spawnProtectionUntil, chunkKey, ...player }) => {
      const out = { ...player };
      if (out.id === ownerId) {
        out.inventory = { ...player.inventory };
        out.slots = player.slots.map(slot => slot && ({ ...slot }));
      } else {
        delete out.inventory;
        delete out.slots;
        delete out.farmingXp;
        delete out.farmingQuests;
        out.equipment = { tool: player.equipment?.tool || null };
      }
      return out;
    });
  }

  update(dt, speed, world, weather) {
    const step = Math.max(0, Math.min(Number(dt) || 0, 0.1));
    if (!step) return;
    const approach = (value, target, amount) => value < target
      ? Math.min(target, value + amount)
      : Math.max(target, value - amount);
    for (const player of this.players.values()) {
      let dx = Number(player.input.right) - Number(player.input.left);
      let dy = Number(player.input.down) - Number(player.input.up);
      const length = Math.hypot(dx, dy);
      if (length) { dx /= length; dy /= length; }
      const biome = getBiomeAt(world?.seed || WORLD.seed, player.x, player.y, world?.generationVersion);
      const factor = (BIOMES[biome]?.movement || 1) * (weather === "rain" ? 0.9 : 1);
      const maxSpeed = speed * factor * (player.boat?.active ? 0.84 : 1);
      const hasInput = length > 0;
      const acceleration = (hasInput ? 900 : 1200) * step;
      player.vx = approach(player.vx || 0, dx * maxSpeed, acceleration);
      player.vy = approach(player.vy || 0, dy * maxSpeed, acceleration);
      if (Math.abs(player.vx) < 0.5 && !hasInput) player.vx = 0;
      if (Math.abs(player.vy) < 0.5 && !hasInput) player.vy = 0;
      const nextX = player.x + player.vx * step;
      const nextY = player.y + player.vy * step;
      const nearby = world?.nearbyBuildings ? world.nearbyBuildings(player.x, player.y, 48) : [...(world?.buildings?.values() || [])];
      const collisionBuildings = nearby.filter(building =>
        !(building.type === "wood_door" &&
          (building.ownerId === player.id || (building.clanId && building.clanId === player.clanId))));
      const canMoveTo = (x, y) => {
        const targetBiome = getBiomeAt(world?.seed || WORLD.seed, x, y, world?.generationVersion);
        if (targetBiome === "ocean") return !!player.boat?.active;
        return canOccupy(world?.seed || WORLD.seed, x, y, WORLD.width, WORLD.height, collisionBuildings, world?.generationVersion);
      };
      if (canMoveTo(nextX, player.y)) player.x = nextX;
      else player.vx = 0;
      if (canMoveTo(player.x, nextY)) player.y = nextY;
      else player.vy = 0;
      player.moveSpeed = Math.hypot(player.vx, player.vy);

      const nextChunkKey = this.chunkKey(player.x, player.y);
      if (nextChunkKey !== player.chunkKey) {
        const oldBucket = this.playersByChunk.get(player.chunkKey);
        oldBucket?.delete(player.id);
        if (oldBucket?.size === 0) this.playersByChunk.delete(player.chunkKey);
        player.chunkKey = nextChunkKey;
        if (!this.playersByChunk.has(nextChunkKey)) this.playersByChunk.set(nextChunkKey, new Map());
        this.playersByChunk.get(nextChunkKey).set(player.id, player);
      }
    }
  }
}

module.exports = { PlayerManager };
