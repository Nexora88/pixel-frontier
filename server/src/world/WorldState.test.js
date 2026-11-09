const test = require("node:test");
const assert = require("node:assert/strict");
const { WorldState } = require("./WorldState");

test("clan totems require clan membership and cannot be placed in the protected perimeter", () => {
  const world = new WorldState("test-seed");
  const player = { id: "p1", clanId: null, x: 100, y: 100, slots: [], inventory: {} };
  assert.equal(world.build(player, "clan_totem", 100, 100).reason, "clan-required");

  // Keep the attempted placement clearly inside the 200px safe perimeter.
  // The production placement grid snaps coordinates to 24px increments.
  player.clanId = "clan-1";
  player.x = 180;
  player.y = 500;
  assert.equal(world.build(player, "clan_totem", 180, 500).reason, "safe-zone");
});
