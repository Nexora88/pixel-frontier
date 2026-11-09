const {GAME,WORLD}=require("../config");
const {PlayerManager}=require("./PlayerManager");
const {WorldState}=require("../world/WorldState");
const {ChestStore,EnvironmentSimulation,SocialSystems,moveSlot,slotCounts}=require("../world/SurvivalSystems");
class GameServer {
  constructor(io,options={}) {
    this.io=io;this.players=options.players||new PlayerManager();this.world=options.world||new WorldState(options.seed||WORLD.seed);
    this.persistence=options.persistence||null;this.chests=new ChestStore();this.environment=new EnvironmentSimulation(this.world.seed);this.social=new SocialSystems();
    this.lastSnapshotAt=0;this.lastSaveAt=0;this.interval=null;
  }
  async restore(){
    if(!this.persistence?.enabled)return;
    const state=await this.persistence.loadWorld();
    this.world.restore(state);
    for(const b of this.world.buildings.values())this.chests.register(b);
  }
  start(){this.io.on("connection",s=>this.handleConnection(s));this.interval=setInterval(()=>this.tick(),GAME.tickMs);this.interval.unref?.()}
  stop(){if(this.interval)clearInterval(this.interval);this.interval=null}
  async save(){
    if(!this.persistence?.enabled)return;
    for(const p of this.players.players.values())await this.persistence.savePlayer(p);
    for(const c of this.world.chunks.values())await this.persistence.saveChunk({...c,resources:c.resources.filter(r=>this.world.resources.has(r.id)),buildings:[...this.world.buildings.values()].filter(b=>b.chunkKey===c.key)},this.world.seed);
    for(const b of this.world.buildings.values())await this.persistence.saveStructure(b);
    for(const clan of this.social.clans.values())await this.persistence.saveClan(clan);
    for(const trade of this.social.trades.values())await this.persistence.saveTrade(trade);
  }
  syncChunks(p,s){
    const chunks=this.world.getNearbyChunks(p.x,p.y),next=new Set(chunks.map(c=>c.key));
    for(const key of p.subscribedChunks)if(!next.has(key)){s.leave(`chunk:${key}`);s.emit("world:chunk:unload",{key})}
    for(const c of chunks)if(!p.subscribedChunks.has(c.key)){s.join(`chunk:${c.key}`);s.emit("world:chunk:load",c)}
    p.subscribedChunks=next;
  }
  visiblePlayers(p){return[...this.players.players.values()].filter(o=>o.id===p.id||p.subscribedChunks.has(`${Math.floor(o.x/WORLD.chunkSize)},${Math.floor(o.y/WORLD.chunkSize)}`))}
  notifyVisible(event,payload,p){for(const other of this.players.players.values())if(other.id!==p.id&&other.subscribedChunks.has(`${Math.floor(p.x/WORLD.chunkSize)},${Math.floor(p.y/WORLD.chunkSize)}`))this.io.to(other.id).emit(event,payload)}
  handleConnection(s){
    if(this.players.players.size>=GAME.maxPlayers){s.emit("server:full");s.disconnect(true);return}
    const p=this.players.add(s.id);
    // world:init must precede chunk deltas so the renderer exists before load events.
    const initial=this.world.getNearbyChunks(p.x,p.y);
    s.emit("world:init",{ownId:p.id,world:{width:WORLD.width,height:WORLD.height,chunkSize:WORLD.chunkSize},players:this.players.publicPlayers(this.visiblePlayers(p)),worldState:{seed:this.world.seed,chunks:initial},environment:this.environment.snapshot(),inventory:{slots:p.slots,equipment:p.equipment}});
    this.syncChunks(p,s);this.notifyVisible("player:joined",this.players.publicPlayers([p])[0],p);
    s.on("player:input",i=>{const player=this.players.get(s.id);if(!player||!this.validInput(i))return;const now=Date.now();if(now-player.lastInputAt<GAME.inputRateLimitMs)return;player.lastInputAt=now;player.input={up:i.up,down:i.down,left:i.left,right:i.right}});
    s.on("world:gather",({resourceId}={})=>{const player=this.players.get(s.id);if(!player||typeof resourceId!=="string"||resourceId.length>60)return;const r=this.world.gather(player,resourceId);s.emit("world:gather:result",r);if(r.ok)this.io.to(`chunk:${r.chunkKey}`).emit("world:resource:removed",{id:resourceId})});
    s.on("world:build",({type,x,y}={})=>{const player=this.players.get(s.id);if(!player)return;const r=this.world.build(player,type,x,y);s.emit("world:build:result",r);if(r.ok){this.io.to(`chunk:${r.building.chunkKey}`).emit("world:building:placed",r.building);this.chests.register(r.building);if(this.persistence?.enabled)this.persistence.saveStructure(r.building).catch(()=>{})}});
    s.on("world:craft",({recipe}={})=>{const player=this.players.get(s.id);if(player&&typeof recipe==="string")s.emit("world:craft:result",this.world.craft(player,recipe))});
    s.on("inventory:move",({from,to,amount}={})=>{const player=this.players.get(s.id);if(!player)return;const r=moveSlot(player.slots,from,to,amount);if(r.ok)player.inventory=slotCounts(player.slots);s.emit("inventory:result",{...r,slots:player.slots,inventory:player.inventory})});
    s.on("chest:transfer",({chestId,direction,playerSlot,chestSlot,amount}={})=>{const player=this.players.get(s.id),building=this.world.buildings.get(chestId);if(!player||!building||Math.hypot(player.x-building.x,player.y-building.y)>GAME.interactionRange*1.5){s.emit("chest:result",{ok:false,reason:"too-far"});return}const r=this.chests.transfer(chestId,player,direction,playerSlot,chestSlot,amount);if(r.ok)player.inventory=slotCounts(player.slots);s.emit("chest:result",r)});
    s.on("clan:create",({name}={})=>{const r=this.social.createClan(p,name);s.emit("clan:result",r)});
    s.on("clan:join",({clanId}={})=>{const r=this.social.joinClan(p,clanId);s.emit("clan:result",r)});
    s.on("trade:create",({item,quantity,priceItem,priceQuantity}={})=>s.emit("trade:result",this.social.createTrade(p,item,quantity,priceItem,priceQuantity)));
    s.on("trade:accept",({tradeId}={})=>{const trade=this.social.trades.get(tradeId),seller=trade&&this.players.get(trade.sellerId);const r=this.social.acceptTrade(p,tradeId,seller);if(r.ok){p.inventory=slotCounts(p.slots);seller.inventory=slotCounts(seller.slots);this.io.emit("trade:updated",r.trade)}s.emit("trade:result",r)});
    s.on("world:environment",()=>s.emit("world:environment",this.environment.snapshot()));
    s.on("disconnect",()=>{this.notifyVisible("player:left",{id:s.id},p);if(this.persistence?.enabled)this.persistence.savePlayer(p).catch(()=>{});this.players.remove(s.id)});
  }
  validInput(i){return!!i&&typeof i==="object"&&["up","down","left","right"].every(k=>typeof i[k]==="boolean")}
  tick(){
    this.players.update(GAME.tickMs/1000,GAME.playerSpeed,this.world);
    for(const p of this.players.players.values()){const s=this.io.sockets.sockets.get(p.id);if(s)this.syncChunks(p,s)}
    const now=Date.now();
    if(this.persistence?.enabled&&now-this.lastSaveAt>15000){this.lastSaveAt=now;this.save().catch(err=>console.error("Persistence save failed:",err.message))}
    if(now-this.lastSnapshotAt<GAME.snapshotMs)return;this.lastSnapshotAt=now;
    const environment=this.environment.snapshot(now);
    for(const p of this.players.players.values()){const s=this.io.sockets.sockets.get(p.id);if(s)s.emit("world:state",{players:this.players.publicPlayers(this.visiblePlayers(p)),serverTime:now,environment,animals:this.environment.nearbyAnimals(p.x,p.y)})}
  }
}
module.exports={GameServer};
