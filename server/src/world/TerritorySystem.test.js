const test = require("node:test");
const assert = require("node:assert/strict");
const { TerritorySystem } = require("./TerritorySystem");

test("territory bounds are 400 by 400 and identify the owning clan", () => {
  const world = { buildings: new Map([["totem-1", { id: "totem-1", type: "clan_totem", clanId: "clan-1", x: 500, y: 500 }]]) };
  const social = { clans: new Map([["clan-1", { id: "clan-1", name: "North" }]]) };
  const system = new TerritorySystem(world, social);
  const territories = system.snapshot();
  assert.equal(territories[0].width, 400);
  assert.equal(system.territoryAt(300, 500, territories).clanId, "clan-1");
  assert.equal(system.territoryAt(701, 500, territories), null);
});

test("safe perimeter is protected and dominance is measured against total map area", () => {
  const world = { buildings: new Map([["totem-1", { id: "totem-1", type: "clan_totem", clanId: "clan-1", x: 500, y: 500 }]]) };
  const social = { clans: new Map([["clan-1", { id: "clan-1", name: "North" }]]) };
  const system = new TerritorySystem(world, social);
  assert.equal(system.isSafeZone(100, 100), true);
  assert.equal(system.isSafeZone(500, 500), false);
  assert.equal(system.dominance(2000)[0].dominance, 2);
});
