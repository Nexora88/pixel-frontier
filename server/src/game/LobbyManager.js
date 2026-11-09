class LobbyManager {
  constructor(capacity = 50) {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 60) throw new RangeError("Lobby capacity must be between 1 and 60");
    this.capacity = capacity;
    this.nextId = 1;
    this.lobbies = new Map();
    this.playerLobby = new Map();
  }

  assign(playerId) {
    const existingId = this.playerLobby.get(playerId);
    if (existingId) return this.snapshot(existingId);
    let target = null;
    for (const lobby of this.lobbies.values()) {
      if (lobby.players.size < this.capacity && (!target || lobby.players.size < target.players.size)) target = lobby;
    }
    if (!target) {
      const id = `lobby-${this.nextId++}`;
      target = { id, players: new Set() };
      this.lobbies.set(id, target);
    }
    target.players.add(playerId);
    this.playerLobby.set(playerId, target.id);
    return this.snapshot(target.id);
  }

  release(playerId) {
    const lobbyId = this.playerLobby.get(playerId);
    if (!lobbyId) return false;
    const lobby = this.lobbies.get(lobbyId);
    lobby?.players.delete(playerId);
    this.playerLobby.delete(playerId);
    if (lobby && lobby.players.size === 0) this.lobbies.delete(lobbyId);
    return true;
  }

  snapshot(lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    return lobby ? { id: lobby.id, count: lobby.players.size, capacity: this.capacity } : null;
  }
}

module.exports = { LobbyManager };
