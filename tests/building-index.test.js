const test = require("node:test");
const assert = require("node:assert/strict");
const { WorldState } = require("../server/src/world/WorldState");

test("restored buildings are indexed by chunk and nearby queries stay local", () => {
  const world = new WorldState("index-test");
  world.restore({ structures: [
    { id: "building_1", type: "wood_wall", x: 120, y: 140, chunkKey: "0,0" },
    { id: "building_2", type: "stone_wall", x: 980, y: 980, chunkKey: "2,2" }
  ] });
  assert.deepEqual(world.getNearbyBuildings(120, 140).map(b => b.id), ["building_1"]);
  assert.deepEqual(world.getNearbyBuildings(980, 980).map(b => b.id), ["building_2"]);
  assert.deepEqual(world.getNearbyBuildings(500, 500), []);
});

test("newly registered buildings are immediately indexed", () => {
  const world = new WorldState("index-test");
  const building = { id: "building_3", type: "wood_wall", x: 144, y: 168, chunkKey: "0,0" };
  world.buildings.set(building.id, building);
  world.indexBuilding(building);
  assert.deepEqual(world.getNearbyBuildings(144, 168).map(b => b.id), ["building_3"]);
});