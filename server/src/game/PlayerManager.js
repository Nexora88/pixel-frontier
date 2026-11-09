const {WORLD}=require("../config");
const {createInventory}=require("../world/ItemCatalog");
const {BIOMES,getBiomeAt}=require("../world/generateWorld");
const {emptySlots,addToSlots,slotCounts,canOccupy}=require("../world/SurvivalSystems");
const COLORS=[0x55c2ff,0xd99aff,0x7ed957,0xffc857,0xff7d87,0xf1eee5];
class PlayerManager {
  constructor(){this.players=new Map()}
  add(id){
    const p={id,name:`Survivor-${id.slice(0,4)}`,x:WORLD.width/2+(Math.random()-.5)*160,y:WORLD.height/2+(Math.random()-.5)*160,color:COLORS[Math.floor(Math.random()*COLORS.length)],input:{up:false,down:false,left:false,right:false},inventory:createInventory(),slots:emptySlots(),equipment:{tool:"primitive_stone"},lastInputAt:0,subscribedChunks:new Set(),clanId:null};
    addToSlots(p.slots,"primitive_stone",1);p.inventory=slotCounts(p.slots);this.players.set(id,p);return p;
  }
  remove(id){return this.players.delete(id)}
  get(id){return this.players.get(id)}
  publicPlayers(players=this.players.values()){return[...players].map(({input,lastInputAt,subscribedChunks,...p})=>({...p,inventory:{...p.inventory},slots:p.slots.map(s=>s&&({...s}))}))}
  update(dt,speed,world){
    for(const p of this.players.values()){
      let dx=Number(p.input.right)-Number(p.input.left),dy=Number(p.input.down)-Number(p.input.up),len=Math.hypot(dx,dy);
      if(len){dx/=len;dy/=len}
      const biome=getBiomeAt(world?.seed||WORLD.seed,p.x,p.y),factor=BIOMES[biome]?.movement||1;
      const nx=p.x+dx*speed*factor*dt,ny=p.y+dy*speed*factor*dt;
      if(canOccupy(world?.seed||WORLD.seed,nx,p.y,WORLD.width,WORLD.height,[...(world?.buildings?.values()||[])]))p.x=nx;
      if(canOccupy(world?.seed||WORLD.seed,p.x,ny,WORLD.width,WORLD.height,[...(world?.buildings?.values()||[])]))p.y=ny;
    }
  }
}
module.exports={PlayerManager};
