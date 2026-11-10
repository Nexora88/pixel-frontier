const test = require("node:test");
const assert = require("node:assert/strict");
const { WorldState } = require("../server/src/world/WorldState");
const { emptySlots } = require("../server/src/world/SurvivalSystems");

test("successful gathering consumes one durability point and returns updated equipment", () => {
  const world = new WorldState("durability-test");
  world.resources.set("tree-test", { id: "tree-test", x: 100, y: 100, type: "tree", amount: 1, chunkKey: "0,0" });
  const player = { id: "p1", x: 100, y: 100, slots: emptySlots(), equipment: { tool: "wooden_axe" } };
  const result = world.gather(player, "tree-test");
  assert.equal(result.ok, true);
  assert.equal(player.equipment.durability.wooden_axe, 79);
  assert.equal(result.equipment.tool, "wooden_axe");
});

test("failed gathering does not consume tool durability", () => {
  const world = new WorldState("durability-test");
  world.resources.set("tree-test", { id: "tree-test", x: 100, y: 100, type: "tree", amount: 1, chunkKey: "0,0" });
  const player = { id: "p1", x: 100, y: 100, slots: emptySlots(0), equipment: { tool: "wooden_axe" } };
  const result = world.gather(player, "tree-test");
  assert.equal(result.ok, false);
  assert.equal(player.equipment.durability, undefined);
});
