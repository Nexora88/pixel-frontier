const test = require("node:test");
const assert = require("node:assert/strict");
const { WorldState } = require("../server/src/world/WorldState");
const { emptySlots } = require("../server/src/world/SurvivalSystems");

function playerAt(world, x = 100, y = 100) {
  return { id: "farmer-1", x, y, slots: emptySlots(), inventory: {}, equipment: { tool: "wooden_hoe" } };
}

test("a crafted and equipped hoe tills suitable ground and loses one durability", () => {
  const world = new WorldState("farm-foundation");
  const player = playerAt(world);
  const result = world.till(player, 100, 100);
  assert.equal(result.ok, true);
  assert.equal(result.plot.state, "tilled");
  assert.equal(result.plot.ownerId, player.id);
  assert.equal(player.equipment.durability.wooden_hoe, 59);
  assert.equal(world.getChunk(0, 0).farmPlots.length, 1);
});

test("tilling rejects missing or broken hoes without creating plots", () => {
  const world = new WorldState("farm-foundation");
  const player = playerAt(world);
  player.equipment.tool = null;
  assert.equal(world.till(player, 100, 100).reason, "hoe-required");
  player.equipment = { tool: "wooden_hoe", durability: { wooden_hoe: 0 } };
  assert.equal(world.till(player, 100, 100).reason, "hoe-broken");
  assert.equal(world.getChunk(0, 0).farmPlots.length, 0);
});

test("tilling rejects unsuitable terrain, distant positions and duplicate plots", () => {
  const world = new WorldState("farm-foundation");
  const player = playerAt(world);
  assert.equal(world.till(player, 900, 900).reason, "too-far");
  const lake = (() => { for (let x=16;x<3200;x+=32) for(let y=16;y<2400;y+=32) if(require("../server/src/world/generateWorld").getBiomeAt(world.seed,x,y)==="lake") return {x,y}; })();
  assert.ok(lake);
  player.x=lake.x;player.y=lake.y;
  assert.equal(world.till(player,lake.x,lake.y).reason,"unsuitable-ground");
  player.x=100;player.y=100;
  assert.equal(world.till(player,100,100).ok,true);
  player.equipment.tool="wooden_hoe";
  assert.equal(world.till(player,100,100).reason,"already-tilled");
});

test("farm plots survive world chunk restoration", () => {
  const world = new WorldState("farm-foundation");
  const player = playerAt(world);
  assert.equal(world.till(player,100,100).ok,true);
  const saved = { chunks: [...world.chunks.values()] };
  const restored = new WorldState("farm-foundation");
  restored.restore(saved);
  assert.equal(restored.getChunk(0,0).farmPlots.length,1);
});
