const { Pool } = require("pg");
class Persistence {
  constructor(connectionString) { this.pool = connectionString ? new Pool({ connectionString, ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined, max: 5 }) : null; }
  get enabled() { return !!this.pool; }
  async migrate() {
    if (!this.pool) return false;
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT NOT NULL, x DOUBLE PRECISION NOT NULL, y DOUBLE PRECISION NOT NULL, inventory JSONB NOT NULL DEFAULT '{}'::jsonb, slots JSONB NOT NULL DEFAULT '[]'::jsonb, clan_id TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS world_chunks (chunk_key TEXT PRIMARY KEY, seed TEXT NOT NULL, biome TEXT NOT NULL, state JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS structures (id TEXT PRIMARY KEY, chunk_key TEXT NOT NULL, owner_id TEXT NOT NULL, type TEXT NOT NULL, state JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS clans (id TEXT PRIMARY KEY, name TEXT NOT NULL, leader_id TEXT NOT NULL, members JSONB NOT NULL DEFAULT '[]'::jsonb);
      CREATE TABLE IF NOT EXISTS trades (id TEXT PRIMARY KEY, seller_id TEXT NOT NULL, state JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    `);
    return true;
  }
  async loadWorld() {
    if (!this.pool) return { chunks: [], structures: [] };
    const [chunks,structures]=await Promise.all([this.pool.query("SELECT chunk_key,seed,biome,state FROM world_chunks"),this.pool.query("SELECT state FROM structures")]);
    return { chunks: chunks.rows.map(r=>r.state), structures: structures.rows.map(r=>r.state) };
  }
  async savePlayer(p) {
    if (!this.pool) return;
    await this.pool.query("INSERT INTO players(id,name,x,y,inventory,slots,clan_id) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,x=EXCLUDED.x,y=EXCLUDED.y,inventory=EXCLUDED.inventory,slots=EXCLUDED.slots,clan_id=EXCLUDED.clan_id,updated_at=NOW()", [p.id,p.name,p.x,p.y,JSON.stringify(p.inventory),JSON.stringify(p.slots || []),p.clanId || null]);
  }
  async saveChunk(chunk, seed) {
    if (!this.pool) return;
    await this.pool.query("INSERT INTO world_chunks(chunk_key,seed,biome,state) VALUES($1,$2,$3,$4) ON CONFLICT(chunk_key) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()", [chunk.key,seed,chunk.biome,JSON.stringify(chunk)]);
  }
  async saveStructure(b) { if (!this.pool) return; await this.pool.query("INSERT INTO structures(id,chunk_key,owner_id,type,state) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()", [b.id,b.chunkKey,b.ownerId,b.type,JSON.stringify(b)]); }
  async saveClan(c) { if (!this.pool) return; await this.pool.query("INSERT INTO clans(id,name,leader_id,members) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,members=EXCLUDED.members", [c.id,c.name,c.leaderId,JSON.stringify(c.members)]); }
  async saveTrade(t) { if (!this.pool) return; await this.pool.query("INSERT INTO trades(id,seller_id,state) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()", [t.id,t.sellerId,JSON.stringify(t)]); }
  async close() { if (this.pool) await this.pool.end(); }
}
module.exports = { Persistence };
