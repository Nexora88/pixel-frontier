const {WORLD,GAME}=require("../config");
const {generateChunk}=require("./generateWorld");
const {ITEMS,RECIPES}=require("./ItemCatalog");
const {BUILDINGS,addToSlots,slotCounts,consumeFromSlots}=require("./SurvivalSystems");
class WorldState {
  constructor(seed=WORLD.seed){this.seed=seed;this.resources=new Map();this.buildings=new Map();this.chunks=new Map();this.nextBuildingId=1}
  getChunk(cx,cy){const key=`${cx},${cy}`;if(!this.chunks.has(key)){const c=generateChunk(this.seed,cx,cy);if(!c)return null;this.chunks.set(key,c);for(const r of c.resources)this.resources.set(r.id,r)}const c=this.chunks.get(key);return{...c,resources:c.resources.filter(r=>this.resources.has(r.id)),buildings:[...this.buildings.values()].filter(b=>b.chunkKey===key)}}
  getNearbyChunks(x,y,radius=1){const cx=Math.floor(x/WORLD.chunkSize),cy=Math.floor(y/WORLD.chunkSize),out=[];for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){const c=this.getChunk(cx+dx,cy+dy);if(c)out.push(c)}return out}
  snapshot(){return{seed:this.seed,chunks:this.getNearbyChunks(WORLD.width/2,WORLD.height/2)}}
  gather(p,id){
    const r=this.resources.get(id);if(!r)return{ok:false,reason:"resource-unavailable"};
    if(Math.hypot(p.x-r.x,p.y-r.y)>GAME.interactionRange)return{ok:false,reason:"too-far"};
    const item=r.type==="tree"?"wood":r.type==="berry"?"berries":r.type;if(!ITEMS[item])return{ok:false,reason:"unknown-resource"};
    const power=({primitive_stone:1,wooden_axe:2,wooden_pickaxe:2,advanced_pickaxe:4})[p.equipment?.tool]||1;
    const amount=r.amount*power,added=addToSlots(p.slots,item,amount);if(!added.ok)return added;
    p.inventory=slotCounts(p.slots);this.resources.delete(id);
    return{ok:true,resourceId:id,item,amount,chunkKey:r.chunkKey,inventory:{...p.inventory},slots:p.slots};
  }
  craft(p,name){
    const recipe=RECIPES[name];if(!recipe)return{ok:false,reason:"unknown-recipe"};
    const consumed=consumeFromSlots(p.slots,recipe.costs);if(!consumed.ok)return consumed;
    const added=addToSlots(p.slots,name,1);if(!added.ok)return added;
    p.inventory=slotCounts(p.slots);return{ok:true,recipe:name,inventory:{...p.inventory},slots:p.slots};
  }
  build(p,type,x,y){
    const canonical=type==="wall"?"wood_wall":type,definition=BUILDINGS[canonical],legacy=RECIPES[type];
    if(!definition&&!legacy)return{ok:false,reason:"unknown-building"};
    if(!Number.isFinite(x)||!Number.isFinite(y)||x<24||y<24||x>WORLD.width-24||y>WORLD.height-24)return{ok:false,reason:"invalid-position"};
    if(Math.hypot(p.x-x,p.y-y)>GAME.interactionRange*1.5)return{ok:false,reason:"too-far"};
    const costs=definition?.costs||legacy.costs,consumed=consumeFromSlots(p.slots,costs);if(!consumed.ok)return consumed;
    const chunkKey=`${Math.floor(x/WORLD.chunkSize)},${Math.floor(y/WORLD.chunkSize)}`;
    const b={id:`building_${this.nextBuildingId++}`,ownerId:p.id,type:canonical,x:Math.round(x/24)*24,y:Math.round(y/24)*24,chunkKey,hp:definition?.hp||100,solid:definition?.solid??true,createdAt:Date.now()};
    this.buildings.set(b.id,b);p.inventory=slotCounts(p.slots);return{ok:true,building:b,inventory:{...p.inventory},slots:p.slots};
  }
}
module.exports={WorldState,RECIPES};
