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
        !canOccupy(seed, spawn.x, spawn.y, WORLD.width, WORLD.height, [...(world?.buildings?.values() || [])])) {
      spawn = null;
      const buildings = [...(world?.buildings?.values() || [])];
      for (let i = 0; i < 2000 && !spawn; i++) {
        const x = 80 + Math.random() * (WORLD.width - 160);
        const y = 80 + Math.random() * (WORLD.height - 160);
        if (canOccupy(seed, x, y, WORLD.width, WORLD.height, buildings)) spawn = { x, y };
      }
    }
    if (!spawn) spawn = { x: WORLD.width / 2, y: WORLD.height / 2 };
    const player = {
      id, socketId, name: restored?.name || `Survivor-${id.slice(0, 4)}`,
      x: spawn.x, y: spawn.y, color: COLORS[Math.floor(Math.random() * COLORS.length)],
      input: { up: false, down: false, left: false, right: false },
      inventory: createInventory(),
      slots: Array.isArray(restored?.slots) && restored.slots.length ? restored.slots : emptySlots(),
      equipment: restored?.equipment || { tool: "primitive_stone" },
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
        out.equipment = { tool: player.equipment?.tool || null };
      }
      return out;
    });
  }

  update(dt, speed, world, weather) {
    for (const player of this.players.values()) {
      let dx = Number(player.input.right) - Number(player.input.left);
      let dy = Number(player.input.down) - Number(player.input.up);
      const length = Math.hypot(dx, dy);
      if (length) { dx /= length; dy /= length; }
      const biome = getBiomeAt(world?.seed || WORLD.seed, player.x, player.y);
      const factor = (BIOMES[biome]?.movement || 1) * (weather === "rain" ? 0.9 : 1);
      const nextX = player.x + dx * speed * factor * dt;
      const nextY = player.y + dy * speed * factor * dt;
      const nearby = world?.nearbyBuildings ? world.nearbyBuildings(player.x, player.y, 48) : [...(world?.buildings?.values() || [])];
      const collisionBuildings = nearby.filter(building =>
        !(building.type === "wood_door" &&
          (building.ownerId === player.id || (building.clanId && building.clanId === player.clanId))));
      if (canOccupy(world?.seed || WORLD.seed, nextX, player.y, WORLD.width, WORLD.height, collisionBuildings)) player.x = nextX;
      if (canOccupy(world?.seed || WORLD.seed, player.x, nextY, WORLD.width, WORLD.height, collisionBuildings)) player.y = nextY;

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
