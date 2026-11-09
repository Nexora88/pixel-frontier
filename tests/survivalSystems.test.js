const test = require("node:test");
const assert = require("node:assert/strict");
const { emptySlots, addToSlots, moveSlot, slotCounts, consumeFromSlots, ChestStore, canOccupy, EnvironmentSimulation, SocialSystems } = require("../server/src/world/SurvivalSystems");
test("slot inventory stacks, splits and moves items without duplication", () => {
  const slots = emptySlots(3); assert.equal(addToSlots(slots, "wood", 120).ok, true); assert.deepEqual(slotCounts(slots), { wood: 120 });
  assert.equal(moveSlot(slots, 0, 2, 20).ok, true); assert.deepEqual(slotCounts(slots), { wood: 120 });
  assert.equal(consumeFromSlots(slots, { wood: 25 }).ok, true); assert.deepEqual(slotCounts(slots), { wood: 95 });
});
test("slot inventory rejects overflow and invalid moves", () => {
  const slots = emptySlots(1); assert.equal(addToSlots(slots, "wood", 1000).ok, false); assert.equal(moveSlot(slots, 0, 3).ok, false);
});
test("chest storage is private to owner or clan", () => {
  const store = new ChestStore(); store.register({ id: "c1", type: "chest", ownerId: "p1" });
  assert.equal(store.canAccess(store.chests.get("c1"), { id: "p2" }), false);
  assert.equal(store.canAccess(store.chests.get("c1"), { id: "p1" }), true);
});
test("biome collision blocks lakes and mountains", () => {
  assert.equal(canOccupy("seed", 10, 10, 3200, 2400), false);
  assert.equal(typeof canOccupy("seed", 500, 500, 3200, 2400), "boolean");
});
test("environment exposes deterministic clock shape and wildlife species", () => {
  const env = new EnvironmentSimulation("seed", { startedAt: 0, dayLengthMs: 24000 });
  assert.equal(typeof env.snapshot(12000).isNight, "boolean"); assert.equal(env.spawnAnimal(10, 20, "meadow").species, "rabbit");
});
test("clans and trade listings validate input", () => {
  const social = new SocialSystems(), p = { id: "p1" }; assert.equal(social.createClan(p, "Pioneers").ok, true);
  assert.equal(social.createTrade(p, "wood", 2, "stone", 1).ok, true); assert.equal(social.createTrade(p, "unknown", 1, "stone", 1).ok, false);
});
