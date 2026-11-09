const test = require("node:test");
const assert = require("node:assert/strict");
const { WorldState } = require("./WorldState");

test("clan totems require clan membership and reject every protected map edge", () => {
  const world = new WorldState("test-seed");
  const player = { id: "p1", clanId: null, x: 100, y: 100, slots: [], inventory: {} };

  assert.equal(world.build(player, "clan_totem", 100, 100).reason, "clan-required");

  player.clanId = "clan-1";
  const protectedEdgeTargets = [
    { x: 205, y: 500 },                 // left: snapped footprint reaches x=200
    { x: 3000, y: 500 },                // right: footprint reaches x=3000
    { x: 500, y: 205 },                 // top: footprint reaches y=200
    { x: 500, y: 2200 },                // bottom: footprint reaches y=2200
    { x: 205, y: 205 },                 // top-left corner
    { x: 3000, y: 2200 }                // bottom-right corner
  ];

  for (const target of protectedEdgeTargets) {
    // Keep the player within interaction range so this assertion tests the
    // protected-perimeter rule rather than the independent distance guard.
    player.x = target.x;
    player.y = target.y;
    assert.equal(
      world.build(player, "clan_totem", target.x, target.y).reason,
      "safe-zone",
      `totem footprint should be rejected at (${target.x}, ${target.y})`
    );
  }
});
