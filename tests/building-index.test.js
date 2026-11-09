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

test("newly placed buildings are immediately added to the chunk index", () => {
  const world = new WorldState("index-test");
  const player = {
    id: "player_1", x: 120, y: 140, clanId: null,
    slots: [{ item: "wood", quantity: 20 }],
    inventory: { wood: 20 }
  };
  const result = world.build(player, "wood_wall", 144, 144);
  assert.equal(result.ok, true);
  assert.equal(world.getNearbyBuildings(144, 144)[0].id, result.building.id);
});