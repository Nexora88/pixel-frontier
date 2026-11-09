const {WORLD}=require("../config");
const DEFAULT_SIZE=400;
class TerritorySystem{
 constructor({size=DEFAULT_SIZE,worldWidth=WORLD.width,worldHeight=WORLD.height}={}){this.size=size;this.worldWidth=worldWidth;this.worldHeight=worldHeight;this.byClan=new Map();this.byTotem=new Map()}
 restore(totems=[]){this.byClan.clear();this.byTotem.clear();for(const t of totems)this.register(t)}
 register(t){if(!t||typeof t.id!=="string"||typeof t.clanId!=="string"||!Number.isFinite(t.x)||!Number.isFinite(t.y))return{ok:false,reason:"invalid-totem"};if(this.byTotem.has(t.id)||this.byClan.has(t.clanId))return{ok:false,reason:"territory-exists"};const territory={id:t.id,clanId:t.clanId,x:t.x,y:t.y,size:this.size,createdAt:t.createdAt||Date.now()};this.byTotem.set(territory.id,territory);this.byClan.set(territory.clanId,territory);return{ok:true,territory}}
 place(player,{id,x,y,clan,leaderOnly=true}={}){if(!player||!clan||!player.clanId||player.clanId!==clan.id)return{ok:false,reason:"clan-required"};if(leaderOnly&&clan.leaderId!==player.id)return{ok:false,reason:"leader-required"};if(!Number.isFinite(x)||!Number.isFinite(y)||x<this.size/2||y<this.size/2||x>this.worldWidth-this.size/2||y>this.worldHeight-this.size/2)return{ok:false,reason:"invalid-position"};if(this.byClan.has(clan.id))return{ok:false,reason:"territory-exists"};const half=this.size/2;for(const t of this.byTotem.values())if(Math.abs(t.x-x)<this.size&&Math.abs(t.y-y)<this.size)return{ok:false,reason:"territory-overlap"};return this.register({id,clanId:clan.id,x,y})}
 at(x,y){for(const t of this.byTotem.values())if(Math.abs(x-t.x)<=this.size/2&&Math.abs(y-t.y)<=this.size/2)return t;return null}
 leaderboard(){return[...this.byTotem.values()].map(t=>({clanId:t.clanId,area:this.size*this.size,territoryCount:1})).sort((a,b)=>b.area-a.area||a.clanId.localeCompare(b.clanId))}
 remove(id){const t=this.byTotem.get(id);if(!t)return false;this.byTotem.delete(id);this.byClan.delete(t.clanId);return true}
 snapshot(){return[...this.byTotem.values()].map(t=>({...t}))}
}
module.exports={TerritorySystem,DEFAULT_TERRITORY_SIZE:DEFAULT_SIZE};
