const test = require("node:test");
const assert = require("node:assert/strict");
const { PlayerManager } = require("./PlayerManager");

test("player visibility reads only subscribed chunk buckets", () => {
  const manager = new PlayerManager();
  const a = { id: "a", x: 100, y: 100, subscribedChunks: new Set(["0,0"]) };
  const b = { id: "b", x: 150, y: 150, subscribedChunks: new Set() };
  const c = { id: "c", x: 900, y: 900, subscribedChunks: new Set() };
  manager.players.set(a.id, a); manager.indexPlayer(a);
  manager.players.set(b.id, b); manager.indexPlayer(b);
  manager.players.set(c.id, c); manager.indexPlayer(c);
  assert.deepEqual(manager.visibleTo(a).map(player => player.id).sort(), ["a", "b"]);
  manager.remove("b");
  assert.deepEqual(manager.visibleTo(a).map(player => player.id), ["a"]);
  assert.equal(manager.playersByChunk.has("0,0"), true);
});
