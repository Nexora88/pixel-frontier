const test = require("node:test");
const assert = require("node:assert/strict");
const { canPlaceTotem } = require("./ClanRules");

test("only the current clan leader can place a clan totem", () => {
  const clan = { id: "clan-1", leaderId: "leader-1" };
  assert.equal(canPlaceTotem({ id: "leader-1", clanId: "clan-1" }, clan), true);
  assert.equal(canPlaceTotem({ id: "member-1", clanId: "clan-1" }, clan), false);
  assert.equal(canPlaceTotem({ id: "leader-1", clanId: "clan-2" }, clan), false);
  assert.equal(canPlaceTotem(null, clan), false);
  assert.equal(canPlaceTotem({ id: "leader-1", clanId: "clan-1" }, null), false);
});
