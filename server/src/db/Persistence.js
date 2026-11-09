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
  async savePlayer(p) {
    if (!this.pool) return;
    await this.pool.query("INSERT INTO players(id,name,x,y,inventory,slots,clan_id) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,x=EXCLUDED.x,y=EXCLUDED.y,inventory=EXCLUDED.inventory,slots=EXCLUDED.slots,clan_id=EXCLUDED.clan_id,updated_at=NOW()", [p.id,p.name,p.x,p.y,JSON.stringify(p.inventory),JSON.stringify(p.slots || []),p.clanId || null]);
  }
  async loadPlayer(id) { if (!this.pool) return null; const r = await this.pool.query("SELECT * FROM players WHERE id=$1", [id]); return r.rows[0] || null; }
  async saveChunk(chunk, seed) {
    if (!this.pool) return;
    await this.pool.query("INSERT INTO world_chunks(chunk_key,seed,biome,state) VALUES($1,$2,$3,$4) ON CONFLICT(chunk_key) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()", [chunk.key,seed,chunk.biome,JSON.stringify(chunk)]);
  }
  async saveStructure(b) { if (!this.pool) return; await this.pool.query("INSERT INTO structures(id,chunk_key,owner_id,type,state) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()", [b.id,b.chunkKey,b.ownerId,b.type,JSON.stringify(b)]); }
  async close() { if (this.pool) await this.pool.end(); }
}
module.exports = { Persistence };
