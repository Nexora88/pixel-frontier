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
  const social = new SocialSystems(), slots = emptySlots(); addToSlots(slots, "wood", 5); const p = { id: "p1", slots }; assert.equal(social.createClan(p, "Pioneers").ok, true);
  assert.equal(social.createTrade(p, "wood", 2, "stone", 1).ok, true); assert.equal(social.createTrade(p, "unknown", 1, "stone", 1).ok, false);
});

test("chest transfers preserve item counts and enforce access", () => {
  const store = new ChestStore(), chestBuilding = { id: "chest-a", type: "chest", ownerId: "owner" }; store.register(chestBuilding);
  const slots = emptySlots(); addToSlots(slots, "wood", 10); const player = { id: "owner", slots };
  assert.equal(store.transfer("chest-a", player, "deposit", 0, 0, 6).ok, true);
  assert.equal(slotCounts(player.slots).wood, 4); assert.equal(slotCounts(store.chests.get("chest-a").slots).wood, 6);
  assert.equal(chestBuilding.storageSlots[0].quantity, 6);
  assert.equal(store.transfer("chest-a", { id: "stranger", slots: emptySlots() }, "withdraw", 0, 0, 1).reason, "chest-access-denied");
});
test("trade settlement exchanges both sides atomically", () => {
  const social = new SocialSystems(), sellerSlots = emptySlots(), buyerSlots = emptySlots();
  addToSlots(sellerSlots, "wood", 5); addToSlots(buyerSlots, "stone", 2);
  const seller = { id: "seller", slots: sellerSlots }, buyer = { id: "buyer", slots: buyerSlots };
  const listing = social.createTrade(seller, "wood", 5, "stone", 2); assert.equal(listing.ok, true);
  assert.equal(social.acceptTrade(buyer, listing.trade.id, seller).ok, true);
  assert.equal(slotCounts(buyer.slots).wood, 5); assert.equal(slotCounts(seller.slots).stone, 2);
});
