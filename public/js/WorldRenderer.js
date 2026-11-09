export class WorldRenderer {
  constructor(scene) { this.scene=scene; this.resourceObjects=new Map(); this.buildingObjects=new Map(); this.chunkObjects=new Map(); this.territoryGraphics=scene.add.graphics().setDepth(-4); }
  drawGround(width,height,seed){this.worldWidth=width;this.worldHeight=height;this.seed=seed}
  addChunk(chunk){
    if(this.chunkObjects.has(chunk.key))return;
    const graphics=this.scene.add.graphics().setDepth(-10),colors={forest:0x304b35,lake:0x294e65,mountain:0x62656c,meadow:0x607b43};
    graphics.fillStyle(colors[chunk.biome]||0x304b35,1).fillRect(chunk.x,chunk.y,chunk.width,chunk.height);
    let seed=this.hash(`${this.seed}:${chunk.key}`);const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    for(let i=0;i<30;i++)graphics.fillStyle(chunk.biome==="lake"?0x5d8794:chunk.biome==="mountain"?0x92969b:0x8ba56a,.25).fillCircle(chunk.x+random()*chunk.width,chunk.y+random()*chunk.height,3+random()*8);
    graphics.lineStyle(1,0xc4d4ad,.1).strokeRect(chunk.x,chunk.y,chunk.width,chunk.height);
    const label=this.scene.add.text(chunk.x+10,chunk.y+8,chunk.biome.toUpperCase(),{fontFamily:"monospace",fontSize:"9px",color:"#d9e6cc",backgroundColor:"#17251b",padding:{x:3,y:2}}).setDepth(-8);
    this.chunkObjects.set(chunk.key,{ground:graphics,label});chunk.resources.forEach(r=>this.addResource(r));chunk.buildings.forEach(b=>this.addBuilding(b));
  }
  removeChunk(key){
    const chunk=this.chunkObjects.get(key);if(chunk){chunk.ground.destroy();chunk.label.destroy();this.chunkObjects.delete(key)}
    for(const[id,o]of this.resourceObjects)if(o.chunkKey===key)this.removeResource(id);
    for(const[id,o]of this.buildingObjects)if(o.chunkKey===key){o.shape.destroy();o.shadow?.destroy();o.glow?.destroy();this.buildingObjects.delete(id)}
  }
  addResource(r){
    if(this.resourceObjects.has(r.id))return;
    const frames={tree:0,stone:1,berry:2,"woodland-herb":3,reed:4,ore:5,crystal:6,fiber:7};
    const shadow=this.scene.add.ellipse(r.x+2,r.y+7,24,8,0x17251b,.35).setDepth(r.y-2);
    const shape=this.scene.add.sprite(r.x,r.y,"items",frames[r.type]??1).setOrigin(.5,.75).setScale(2).setDepth(r.y+8);
    const canopy=r.type==="tree"?this.scene.add.ellipse(r.x,r.y-5,27,13,0x4c8b4e,.58).setDepth(r.y+9):null;
    this.resourceObjects.set(r.id,{shape,shadow,canopy,chunkKey:r.chunkKey,type:r.type,x:r.x,y:r.y});
  }
  removeResource(id){const o=this.resourceObjects.get(id);if(!o)return;o.shape.destroy();o.shadow.destroy();o.canopy?.destroy();this.resourceObjects.delete(id)}
  updateCanopies(x,y){for(const o of this.resourceObjects.values())if(o.canopy){const under=Math.abs(x-o.x)<18&&y>o.y-20&&y<o.y+18;o.canopy.setAlpha(under?.18:.58)}}
  setTerritories(items=[]){
    const g=this.territoryGraphics;g.clear();
    for(const t of items){const color=this.colorFor(t.clanId);g.lineStyle(2,color,.65);const l=t.x-t.width/2,r=t.x+t.width/2,top=t.y-t.height/2,b=t.y+t.height/2;this.dash(g,l,top,r,top);this.dash(g,r,top,r,b);this.dash(g,r,b,l,b);this.dash(g,l,b,l,top)}
  }
  dash(g,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;for(let n=0;n<len;n+=18){const end=Math.min(n+9,len);g.lineBetween(Math.round(x1+ux*n),Math.round(y1+uy*n),Math.round(x1+ux*end),Math.round(y1+uy*end))}}
  colorFor(id){let h=2166136261;for(const c of String(id)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return Phaser.Display.Color.HSLToColor((h>>>0)%360/360,.78,.62).color}
  addBuilding(b){
    if(this.buildingObjects.has(b.id))return;
    const wall=["wall","wood_wall","stone_wall"].includes(b.type),totem=b.type==="clan_totem";
    const fill=totem?this.colorFor(b.clanId):b.type==="stone_wall"?0x858b91:wall?0x98734d:b.type==="wood_door"?0x7c5438:b.type==="chest"?0x9b7047:0xf08b43;
    const shape=this.scene.add.rectangle(b.x,b.y,totem?32:wall?34:28,totem?64:wall?13:25,fill).setStrokeStyle(2,0x30291e).setDepth(b.y+(totem?32:13));
    const shadow=this.scene.add.ellipse(b.x,b.y+8,totem?25:30,8,0x17251b,.3).setDepth(b.y-2);
    const glow=b.type==="campfire"||totem?this.scene.add.circle(b.x,b.y,totem?22:7,totem?fill:0xffd17a,totem ? 0.12 : 1).setDepth(b.y+1):null;
    this.buildingObjects.set(b.id,{shape,shadow,glow,chunkKey:b.chunkKey,type:b.type});
  }
  addBuildings(items){items.forEach(b=>this.addBuilding(b))}
  hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
}
