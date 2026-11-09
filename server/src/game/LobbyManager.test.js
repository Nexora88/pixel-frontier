const test = require("node:test");
const assert = require("node:assert/strict");
const { LobbyManager } = require("./LobbyManager");

test("lobbies enforce capacity and allocate a new room when full", () => {
  const manager = new LobbyManager(2);
  assert.equal(manager.assign("p1").id, "lobby-1");
  assert.equal(manager.assign("p2").id, "lobby-1");
  const third = manager.assign("p3");
  assert.equal(third.id, "lobby-2");
  assert.equal(third.count, 1);
});

test("reconnect assignment is idempotent and release frees capacity", () => {
  const manager = new LobbyManager(1);
  const first = manager.assign("p1");
  assert.equal(manager.assign("p1").id, first.id);
  assert.equal(manager.release("p1"), true);
  assert.equal(manager.assign("p2").id, "lobby-2");
});
