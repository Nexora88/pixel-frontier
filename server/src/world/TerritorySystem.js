const { WORLD } = require("../config");

const TERRITORY_SIZE = 400;
const TERRITORY_HALF = TERRITORY_SIZE / 2;

class TerritorySystem {
  constructor(world, social) {
    this.world = world;
    this.social = social;
    this.playerTerritories = new Map();
    this.lastDominanceAt = 0;
    this.cachedDominance = [];
    this.cachedTerritories = [];\n    this.dirty = true;
  }

  isSafeZone(x, y) {
    return x < 200 || y < 200 || x > WORLD.width - 200 || y > WORLD.height - 200;
  }

  snapshot() {
    const territories = [];
    for (const building of this.world.buildings.values()) {
      if (building.type !== "clan_totem" || !building.clanId) continue;
      const clan = this.social.clans.get(building.clanId);
      if (!clan) continue;
      territories.push({
        id: building.id,
        clanId: clan.id,
        clanName: clan.name,
        x: building.x,
        y: building.y,
        width: TERRITORY_SIZE,
        height: TERRITORY_SIZE,
        color: this.colorFor(clan.id)
      });
    }
    return territories;
  }

  colorFor(id) {
    let hash = 2166136261;
    for (const char of String(id)) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    const hue = hash % 360;
    return `hsl(${hue} 78% 62%)`;
  }

  territoryAt(x, y, territories = this.snapshot()) {
    for (const territory of territories) {
      if (Math.abs(x - territory.x) <= TERRITORY_HALF &&
          Math.abs(y - territory.y) <= TERRITORY_HALF) return territory;
    }
    return null;
  }

  updatePlayer(player, socket, territories) {
    const current = this.territoryAt(player.x, player.y, territories);
    const previous = this.playerTerritories.get(player.id) || null;
    const nextId = current?.clanId || null;
    if (nextId !== previous) {
      this.playerTerritories.set(player.id, nextId);
      if (current && current.clanId !== player.clanId) {
        socket.emit("territory:entered", {
          clanName: current.clanName,
          clanId: current.clanId
        });
      }
    }
  }

  dominance(now = Date.now()) {
    if (now - this.lastDominanceAt < 1000) return this.cachedDominance;
    this.lastDominanceAt = now;
    const areas = new Map();
    for (const territory of this.snapshot()) {
      areas.set(territory.clanId, (areas.get(territory.clanId) || 0) + TERRITORY_SIZE * TERRITORY_SIZE);
    }
    const mapArea = WORLD.width * WORLD.height;
    this.cachedDominance = [...areas.entries()]
      .map(([clanId, area]) => ({
        clanId,
        clanName: this.social.clans.get(clanId)?.name || "Unknown clan",
        dominance: Math.min(100, Math.round(area / mapArea * 100)),
        claimedArea: area
      }))
      .sort((a, b) => b.claimedArea - a.claimedArea)
      .slice(0, 10);
    return this.cachedDominance;
  }

  removePlayer(playerId) {
    this.playerTerritories.delete(playerId);
  }
}

module.exports = { TerritorySystem, TERRITORY_SIZE };
