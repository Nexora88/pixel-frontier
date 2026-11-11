const test = require("node:test");
const assert = require("node:assert/strict");
const { SocialSystems, emptySlots, addToSlots, slotCounts } = require("./SurvivalSystems");

function player(id, item, amount) {
  const slots = emptySlots();
  assert.equal(addToSlots(slots, item, amount).ok, true);
  return { id, slots, inventory: slotCounts(slots) };
}

test("trade creation reserves offered items in server-side escrow", () => {
  const social = new SocialSystems();
  const seller = player("seller", "wood", 10);
  const result = social.createTrade(seller, "wood", 5, "stone", 2);
  assert.equal(result.ok, true);
  assert.equal(slotCounts(seller.slots).wood, 5);
  assert.deepEqual(result.trade.escrow, { item: "wood", quantity: 5 });
  assert.equal(result.trade.status, "open");
});

test("accepted trade settles both inventories and consumes escrow once", () => {
  const social = new SocialSystems();
  const seller = player("seller", "wood", 10);
  const buyer = player("buyer", "stone", 10);
  const offer = social.createTrade(seller, "wood", 5, "stone", 2);
  const result = social.acceptTrade(buyer, offer.trade.id, seller);
  assert.equal(result.ok, true);
  assert.equal(slotCounts(buyer.slots).wood, 5);
  assert.equal(slotCounts(buyer.slots).stone, 8);
  assert.equal(slotCounts(seller.slots).wood, 5);
  assert.equal(slotCounts(seller.slots).stone, 2);
  assert.equal(result.trade.status, "accepted");
  assert.equal(result.trade.escrow, null);
  assert.equal(social.acceptTrade(buyer, offer.trade.id, seller).ok, false);
});

test("seller can cancel an open offer and recover escrow", () => {
  const social = new SocialSystems();
  const seller = player("seller", "wood", 10);
  const offer = social.createTrade(seller, "wood", 5, "stone", 2);
  const result = social.cancelTrade(seller, offer.trade.id);
  assert.equal(result.ok, true);
  assert.equal(slotCounts(seller.slots).wood, 10);
  assert.equal(result.trade.status, "cancelled");
  assert.equal(result.trade.escrow, null);
  assert.equal(social.cancelTrade(seller, offer.trade.id).ok, false);
});

test("invalid offers and offers without inventory do not mutate the seller", () => {
  const social = new SocialSystems();
  const seller = player("seller", "wood", 3);
  const before = seller.slots.map(slot => slot && ({ ...slot }));
  assert.equal(social.createTrade(seller, "wood", 5, "stone", 2).ok, false);
  assert.equal(social.createTrade(seller, "wood", 1, "wood", 2).ok, false);
  assert.deepEqual(seller.slots, before);
});

test("failed settlement leaves both players and the offer unchanged", () => {
  const social = new SocialSystems();
  const seller = player("seller", "wood", 10);
  const buyer = { id: "buyer", slots: Array.from({ length: 24 }, (_, i) => i === 0
    ? { item: "stone", quantity: 10 }
    : { item: "berries", quantity: 30 }) };
  buyer.inventory = slotCounts(buyer.slots);
  const offer = social.createTrade(seller, "wood", 5, "stone", 2);
  const buyerBefore = buyer.slots.map(slot => ({ ...slot }));
  const sellerBefore = seller.slots.map(slot => slot && ({ ...slot }));
  const result = social.acceptTrade(buyer, offer.trade.id, seller);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "inventory-full");
  assert.deepEqual(buyer.slots, buyerBefore);
  assert.deepEqual(seller.slots, sellerBefore);
  assert.equal(offer.trade.status, "open");
  assert.deepEqual(offer.trade.escrow, { item: "wood", quantity: 5 });
});
