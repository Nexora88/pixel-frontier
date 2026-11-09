const test = require("node:test");
const assert = require("node:assert/strict");
const { WorldState } = require("./WorldState");

test("clan totems require clan membership and cannot be placed in the protected perimeter", () => {
  const world = new WorldState("test-seed");
  const player = { id: "p1", clanId: null, x: 100, y: 100, slots: [], inventory: {} };
  assert.equal(world.build(player, "clan_totem", 100, 100).reason, "clan-required");
  player.clanId = "clan-1";
  player.x = 205; player.y = 500;
  assert.equal(world.build(player, "clan_totem", 205, 500).reason, "safe-zone");
});
