const test = require("node:test");
const assert = require("node:assert/strict");
const { WorldState } = require("../server/src/world/WorldState");
const { emptySlots } = require("../server/src/world/SurvivalSystems");
const { getBiomeAt } = require("../server/src/world/generateWorld");

function suitablePoint(world) {
  for (let x = 32; x < 3200; x += 32) {
    for (let y = 32; y < 2400; y += 32) {
      const biome = getBiomeAt(world.seed, x, y);
      if (biome === "forest" || biome === "meadow") return { x, y };
    }
  }
  throw new Error("No suitable test ground found");
}

function playerAt(x, y) {
  return { id: "farmer-1", x, y, slots: emptySlots(), inventory: {}, equipment: { tool: "wooden_hoe" } };
}

test("an equipped hoe tills suitable ground and loses one durability", () => {
  const world = new WorldState("farm-foundation");
  const point = suitablePoint(world);
  const player = playerAt(point.x, point.y);
  const result = world.till(player, point.x, point.y);
  assert.equal(result.ok, true);
  assert.equal(result.plot.state, "tilled");
  assert.equal(result.plot.ownerId, player.id);
  assert.equal(player.equipment.durability.wooden_hoe, 59);
  assert.equal(world.getChunk(Math.floor(point.x / 400), Math.floor(point.y / 400)).farmPlots.length, 1);
});

test("tilling rejects missing or broken hoes without creating plots", () => {
  const world = new WorldState("farm-foundation");
  const point = suitablePoint(world);
  const player = playerAt(point.x, point.y);
  player.equipment.tool = null;
  assert.equal(world.till(player, point.x, point.y).reason, "hoe-required");
  player.equipment = { tool: "wooden_hoe", durability: { wooden_hoe: 0 } };
  assert.equal(world.till(player, point.x, point.y).reason, "hoe-broken");
  assert.equal(world.getChunk(Math.floor(point.x / 400), Math.floor(point.y / 400)).farmPlots.length, 0);
});

test("tilling rejects unsuitable terrain, distant positions and duplicate plots", () => {
  const world = new WorldState("farm-foundation");
  const point = suitablePoint(world);
  const player = playerAt(point.x, point.y);
  assert.equal(world.till(player, point.x + 500, point.y + 500).reason, "too-far");
  let lake = null;
  for (let x = 16; x < 3200 && !lake; x += 32) {
    for (let y = 16; y < 2400; y += 32) {
      if (getBiomeAt(world.seed, x, y) === "lake") { lake = { x, y }; break; }
    }
  }
  assert.ok(lake);
  player.x = lake.x; player.y = lake.y;
  assert.equal(world.till(player, lake.x, lake.y).reason, "unsuitable-ground");
  player.x = point.x; player.y = point.y;
  assert.equal(world.till(player, point.x, point.y).ok, true);
  player.equipment.tool = "wooden_hoe";
  assert.equal(world.till(player, point.x, point.y).reason, "already-tilled");
});

test("farm plots survive world chunk restoration", () => {
  const world = new WorldState("farm-foundation");
  const point = suitablePoint(world);
  const player = playerAt(point.x, point.y);
  assert.equal(world.till(player, point.x, point.y).ok, true);
  const saved = { chunks: [...world.chunks.values()] };
  const restored = new WorldState("farm-foundation");
  restored.restore(saved);
  assert.equal(restored.getChunk(Math.floor(point.x / 400), Math.floor(point.y / 400)).farmPlots.length, 1);
});
