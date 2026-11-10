const test = require("node:test");
const assert = require("node:assert/strict");
const { WorldState } = require("../server/src/world/WorldState");
const { emptySlots, addToSlots } = require("../server/src/world/SurvivalSystems");
const { getBiomeAt } = require("../server/src/world/generateWorld");

function suitablePoint(world) {
  for (let x = 32; x < 3200; x += 32) for (let y = 32; y < 2400; y += 32) {
    const biome = getBiomeAt(world.seed, x, y);
    if (biome === "forest" || biome === "meadow") return { x, y };
  }
  throw new Error("No suitable test ground found");
}
function farmer(x, y) {
  const slots = emptySlots();
  addToSlots(slots, "wheat_seed", 2);
  addToSlots(slots, "carrot_seed", 1);
  return { id: "farmer-crops", x, y, slots, inventory: {}, equipment: { tool: "wooden_watering_can" } };
}
function makePlot(world, player) {
  player.equipment.tool = "wooden_hoe";
  const result = world.till(player, player.x, player.y);
  assert.equal(result.ok, true);
  player.equipment.tool = "wooden_watering_can";
  return result.plot;
}

test("planting consumes one seed and crop growth is timestamp based", () => {
  const world = new WorldState("crop-tests"), point = suitablePoint(world), player = farmer(point.x, point.y), plot = makePlot(world, player);
  const planted = world.plant(player, plot.id, "wheat_seed");
  assert.equal(planted.ok, true);
  assert.equal(player.inventory.wheat_seed, 1);
  assert.equal(player.farmingXp, 13); // tilling + planting
  assert.equal(player.farmingQuests.plant_seeds.progress, 1);
  assert.equal(world.cropStage(planted.plot, planted.plot.plantedAt + 600000), "ripe");
  assert.equal(world.cropStage(planted.plot, planted.plot.plantedAt + 1000), "seedling");
});

test("watering requires a watering can and accelerates offline growth", () => {
  const world = new WorldState("crop-water-tests"), point = suitablePoint(world), player = farmer(point.x, point.y), plot = makePlot(world, player);
  const planted = world.plant(player, plot.id, "carrot_seed");
  assert.equal(planted.ok, true);
  player.equipment.tool = "wooden_hoe";
  assert.equal(world.water(player, plot.id).reason, "watering-can-required");
  player.equipment.tool = "wooden_watering_can";
  const watered = world.water(player, plot.id);
  assert.equal(watered.ok, true);
  assert.equal(player.farmingXp, 17); // tilling + planting + watering
  assert.equal(player.farmingQuests.water_crops.progress, 1);
  assert.equal(world.water(player, plot.id).reason, "already-watered");
  assert.equal(world.cropStage(watered.plot, watered.plot.plantedAt + 300000), "ripe");
});

test("harvest only succeeds when ripe and returns crop plus optional seed", () => {
  const world = new WorldState("crop-harvest-tests"), point = suitablePoint(world), player = farmer(point.x, point.y), plot = makePlot(world, player);
  const planted = world.plant(player, plot.id, "wheat_seed");
  assert.equal(planted.ok, true);
  assert.equal(world.harvest(player, plot.id).reason, "not-ripe");
  const saved = [...world.chunks.values()].flatMap(c => c.farmPlots).find(p => p.id === plot.id);
  saved.plantedAt = Date.now() - 600001;
  const harvested = world.harvest(player, plot.id);
  assert.equal(harvested.ok, true);
  assert.ok(player.farmingXp >= 24);
  assert.ok(player.farmingQuests.harvest_crops.progress >= 2);
  assert.equal(player.inventory.wheat, 2);
  assert.equal(world.chunks.get(plot.chunkKey).farmPlots.length, 0);
});
