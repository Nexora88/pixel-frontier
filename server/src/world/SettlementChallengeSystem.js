const PREPARATION_MS = 30_000;
const ACTIVE_MS = 180_000;
const COOLDOWN_MS = 60 * 60 * 1000;
const CAPTURE_RADIUS = 150;

class SettlementChallengeSystem {
  constructor(world, social, territory, clock = () => Date.now()) {
    this.world = world; this.social = social; this.territory = territory; this.clock = clock;
    this.challenges = new Map(); this.cooldowns = new Map(); this.nextId = 1;
  }
  restore(state = {}) {
    this.nextId = Math.max(1, Number(state.nextId) || 1);
    this.cooldowns = new Map(Array.isArray(state.cooldowns) ? state.cooldowns : []);
    this.challenges = new Map((Array.isArray(state.challenges) ? state.challenges : [])
      .filter(c => c && typeof c.id === "string" && ["preparing", "active"].includes(c.status))
      .map(c => [c.id, c]));
  }
  exportState() { return { nextId: this.nextId, cooldowns: [...this.cooldowns], challenges: [...this.challenges.values()] }; }
  snapshot(challenge) {
    if (!challenge) return null;
    const { id, totemId, defenderClanId, challengerClanId, startedAt, opensAt, endsAt, progress, status } = challenge;
    return { id, totemId, defenderClanId, challengerClanId, startedAt, opensAt, endsAt, progress: Math.round(progress), status };
  }
  list() {
    return [...this.world.buildings.values()].filter(b => b.type === "clan_totem" && b.clanId)
      .map(b => ({ id: b.id, clanId: b.clanId, clanName: this.social.clans.get(b.clanId)?.name || "Kabile", x: b.x, y: b.y }));
  }
  start(player, totemId, players) {
    const clan = this.social.clans.get(player?.clanId);
    if (!clan || clan.leaderId !== player.id) return { ok: false, reason: "leader-required" };
    if (typeof totemId !== "string" || totemId.length > 80) return { ok: false, reason: "invalid-target" };
    const totem = this.world.buildings.get(totemId);
    if (!totem || totem.type !== "clan_totem" || !totem.clanId || !this.social.clans.has(totem.clanId) || !Number.isFinite(totem.x) || !Number.isFinite(totem.y)) return { ok: false, reason: "target-unavailable" };
    if (totem.clanId === clan.id) return { ok: false, reason: "own-settlement" };
    if (this.territory.isSafeZone(totem.x, totem.y)) return { ok: false, reason: "safe-zone" };
    if (Math.hypot(player.x - totem.x, player.y - totem.y) > CAPTURE_RADIUS) return { ok: false, reason: "too-far" };
    if ((this.cooldowns.get(totemId) || 0) > this.clock()) return { ok: false, reason: "cooldown" };
    const active = [...this.challenges.values()].filter(c => ["preparing", "active"].includes(c.status));
    if (active.some(c => c.totemId === totemId)) return { ok: false, reason: "already-active" };
    if (active.some(c => c.challengerClanId === clan.id || c.defenderClanId === clan.id)) return { ok: false, reason: "clan-busy" };
    const defenderOnline = players.some(p => p.clanId === totem.clanId && Math.hypot(p.x - totem.x, p.y - totem.y) <= CAPTURE_RADIUS * 2);
    if (!defenderOnline) return { ok: false, reason: "defender-offline" };
    const now = this.clock(), id = `settlement_${this.nextId++}`;
    const challenge = { id, totemId, defenderClanId: totem.clanId, challengerClanId: clan.id, startedAt: now,
      opensAt: now + PREPARATION_MS, endsAt: now + PREPARATION_MS + ACTIVE_MS, progress: 0, lastTickAt: now, status: "preparing" };
    this.challenges.set(id, challenge);
    return { ok: true, challenge: this.snapshot(challenge) };
  }
  update(players, now = this.clock()) {
    const changed = [];
    for (const c of this.challenges.values()) {
      if (c.status === "preparing" && now >= c.opensAt) { c.status = "active"; c.lastTickAt = now; changed.push(c); }
      if (c.status !== "active") continue;
      const totem = this.world.buildings.get(c.totemId);
      if (!totem || totem.clanId !== c.defenderClanId) { c.status = "defended"; c.completedAt = now; changed.push(c); continue; }
      const nearby = players.filter(p => Math.hypot(p.x - totem.x, p.y - totem.y) <= CAPTURE_RADIUS);
      const attackers = nearby.filter(p => p.clanId === c.challengerClanId).length;
      const defenders = nearby.filter(p => p.clanId === c.defenderClanId).length;
      const elapsed = Math.min(2, Math.max(0, (now - c.lastTickAt) / 1000)); c.lastTickAt = now;
      if (defenders > 0 && attackers > defenders) c.progress = Math.min(100, c.progress + elapsed * 5 * (attackers - defenders));
      else if (defenders > attackers) c.progress = Math.max(0, c.progress - elapsed * 4 * (defenders - attackers));
      if (c.progress >= 100) {
        const winner = this.social.clans.get(c.challengerClanId);
        totem.clanId = c.challengerClanId; if (winner?.leaderId) totem.ownerId = winner.leaderId;
        c.status = "captured"; c.completedAt = now; changed.push(c);
      } else if (now >= c.endsAt) { c.status = "defended"; c.completedAt = now; changed.push(c); }
    }
    for (const c of changed) if (c.completedAt) this.cooldowns.set(c.totemId, now + COOLDOWN_MS);
    for (const [id, c] of this.challenges) if (c.completedAt && now - c.completedAt > 60_000) this.challenges.delete(id);
    return changed.map(c => this.snapshot(c));
  }
  activeSnapshots() { return [...this.challenges.values()].filter(c => ["preparing", "active"].includes(c.status)).map(c => this.snapshot(c)); }
}
module.exports = { SettlementChallengeSystem, SETTLEMENT_CHALLENGE_RULES: { PREPARATION_MS, ACTIVE_MS, COOLDOWN_MS, CAPTURE_RADIUS } };
