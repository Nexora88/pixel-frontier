const {Pool}=require("pg");
class Persistence{
constructor(connectionString){this.pool=connectionString?new Pool({connectionString,ssl:process.env.PGSSL==="true"?{rejectUnauthorized:false}:undefined,max:5}):null}
get enabled(){return!!this.pool}
async migrate(){if(!this.pool)return false;await this.pool.query(`
CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY,name TEXT NOT NULL,x DOUBLE PRECISION NOT NULL,y DOUBLE PRECISION NOT NULL,inventory JSONB NOT NULL DEFAULT '{}'::jsonb,slots JSONB NOT NULL DEFAULT '[]'::jsonb,equipment JSONB NOT NULL DEFAULT '{}'::jsonb,clan_id TEXT,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE players ADD COLUMN IF NOT EXISTS equipment JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS world_chunks(chunk_key TEXT PRIMARY KEY,seed TEXT NOT NULL,biome TEXT NOT NULL,state JSONB NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS structures(id TEXT PRIMARY KEY,chunk_key TEXT NOT NULL,owner_id TEXT NOT NULL,type TEXT NOT NULL,state JSONB NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS clans(id TEXT PRIMARY KEY,name TEXT NOT NULL,leader_id TEXT NOT NULL,members JSONB NOT NULL DEFAULT '[]'::jsonb);
CREATE TABLE IF NOT EXISTS trades(id TEXT PRIMARY KEY,seller_id TEXT NOT NULL,state JSONB NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS world_meta(meta_key TEXT PRIMARY KEY,value JSONB NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);return true}
async loadWorld(){if(!this.pool)return{chunks:[],structures:[],clans:[],trades:[]};const [chunks,structures,clans,trades,meta]=await Promise.all([this.pool.query("SELECT state FROM world_chunks"),this.pool.query("SELECT state FROM structures"),this.pool.query("SELECT id,name,leader_id,members FROM clans"),this.pool.query("SELECT state FROM trades"),this.pool.query("SELECT meta_key,value FROM world_meta")]);return{chunks:chunks.rows.map(r=>r.state),structures:structures.rows.map(r=>r.state),clans:clans.rows.map(r=>({id:r.id,name:r.name,leaderId:r.leader_id,members:r.members})),trades:trades.rows.map(r=>r.state),meta:Object.fromEntries(meta.rows.map(r=>[r.meta_key,r.value]))}}
async savePlayer(p){if(!this.pool)return;await this.pool.query("INSERT INTO players(id,name,x,y,inventory,slots,equipment,clan_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,x=EXCLUDED.x,y=EXCLUDED.y,inventory=EXCLUDED.inventory,slots=EXCLUDED.slots,equipment=EXCLUDED.equipment,clan_id=EXCLUDED.clan_id,updated_at=NOW()",[p.id,p.name,p.x,p.y,JSON.stringify(p.inventory),JSON.stringify(p.slots||[]),JSON.stringify(p.equipment||{}),p.clanId||null])}
async loadPlayer(id){if(!this.pool)return null;const r=await this.pool.query("SELECT * FROM players WHERE id=$1",[id]);return r.rows[0]||null}
async saveChunk(c,seed){if(!this.pool)return;await this.pool.query("INSERT INTO world_chunks(chunk_key,seed,biome,state) VALUES($1,$2,$3,$4) ON CONFLICT(chunk_key) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()",[c.key,seed,c.biome,JSON.stringify(c)])}
async saveStructure(b){if(!this.pool)return;await this.pool.query("INSERT INTO structures(id,chunk_key,owner_id,type,state) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()",[b.id,b.chunkKey,b.ownerId,b.type,JSON.stringify(b)])}
async saveClan(c){if(!this.pool)return;await this.pool.query("INSERT INTO clans(id,name,leader_id,members) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,members=EXCLUDED.members",[c.id,c.name,c.leaderId,JSON.stringify(c.members)])}
async saveTrade(t){if(!this.pool)return;await this.pool.query("INSERT INTO trades(id,seller_id,state) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET state=EXCLUDED.state,updated_at=NOW()",[t.id,t.sellerId,JSON.stringify(t)])}
async saveMeta(key,value){if(!this.pool)return;await this.pool.query("INSERT INTO world_meta(meta_key,value) VALUES($1,$2) ON CONFLICT(meta_key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()",[key,JSON.stringify(value)])}
async close(){if(this.pool)await this.pool.end()}
}
module.exports={Persistence};
