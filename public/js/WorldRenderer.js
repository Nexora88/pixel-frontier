export class WorldRenderer {
  constructor(scene) {
    this.scene=scene;this.resourceObjects=new Map();this.buildingObjects=new Map();this.chunkObjects=new Map();this.farmPlotObjects=new Map();
    this.territoryGraphics=scene.add.graphics().setDepth(-4);
  }
  drawGround(width,height,seed){this.worldWidth=width;this.worldHeight=height;this.seed=seed}
  addChunk(chunk){
    if(this.chunkObjects.has(chunk.key))return;
    const graphics=this.scene.add.graphics().setDepth(-10);
    const palettes={
      forest:{base:0x304a32,patch:0x49623a,detail:0x71804b,dark:0x243a2a},
      meadow:{base:0x657844,patch:0x7b8b4c,detail:0xa0a264,dark:0x4a6038},
      mountain:{base:0x62615a,patch:0x77766b,detail:0xa19a82,dark:0x494a47},
      lake:{base:0x294e61,patch:0x35677a,detail:0x6a9ba0,dark:0x203e50}
    };
    const p=palettes[chunk.biome]||palettes.forest;
    graphics.fillStyle(p.base,1).fillRect(chunk.x,chunk.y,chunk.width,chunk.height);
    let seed=this.hash(`${this.seed}:${chunk.key}`);
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    // Static, seeded ground detail: small enough to stay cheap on low-end devices.
    for(let i=0;i<54;i++){
      const x=Math.floor((chunk.x+random()*chunk.width)/4)*4,y=Math.floor((chunk.y+random()*chunk.height)/4)*4;
      const w=4+Math.floor(random()*12),h=3+Math.floor(random()*8);
      graphics.fillStyle(random()>.48?p.patch:p.dark,.16+random()*.13).fillRect(x,y,w,h);
      if(chunk.biome==="lake"&&i%3===0)graphics.lineStyle(1,p.detail,.25).lineBetween(x,y,x+w+8,y);
      else if((chunk.biome==="forest"||chunk.biome==="meadow")&&i%4===0){
        graphics.lineStyle(1,p.detail,.55).lineBetween(x,y+3,x+2,y-2);
        graphics.lineBetween(x+3,y+4,x+5,y);
      }else if(chunk.biome==="mountain"&&i%4===0){
        graphics.fillStyle(p.detail,.28).fillRect(x+2,y+1,5,2);
      }
    }
    // Occasional worn stone remnants hint at an older civilization.
    if(this.hash(chunk.key+this.seed)%4===0&&chunk.biome!=="lake"){
      const rx=chunk.x+chunk.width*.52,ry=chunk.y+chunk.height*.48;
      graphics.fillStyle(0x2a2925,.22).fillEllipse(rx,ry+8,74,24);
      for(let n=0;n<5;n++){
        const sx=rx-34+n*15,sy=ry+(n%2)*8;
        graphics.fillStyle(0x8d8978,.72).fillRect(sx,sy,12,9);
        graphics.lineStyle(1,0xc0b18e,.35).lineRect(sx,sy,12,9);
      }
    }
    graphics.lineStyle(1,0xd0c19a,.12).strokeRect(chunk.x,chunk.y,chunk.width,chunk.height);
    const names={forest:"ESKİ ORMAN",lake:"SİS GÖLÜ",mountain:"TAŞ SIRTI",meadow:"YABAN OTLUĞU"};
    const label=this.scene.add.text(chunk.x+10,chunk.y+8,names[chunk.biome]||"SINIR TOPRAĞI",{
      fontFamily:"Georgia,serif",fontSize:"9px",color:"#ead8b4",backgroundColor:"#21180f99",padding:{x:4,y:3}
    }).setDepth(-8);
    this.chunkObjects.set(chunk.key,{ground:graphics,label});
    chunk.resources.forEach(r=>this.addResource(r));chunk.buildings.forEach(b=>this.addBuilding(b));(chunk.farmPlots||[]).forEach(plot=>this.addFarmPlot(plot));
  }
  removeChunk(key){
    const chunk=this.chunkObjects.get(key);if(chunk){chunk.ground.destroy();chunk.label.destroy();this.chunkObjects.delete(key)}
    for(const[id,o]of this.resourceObjects)if(o.chunkKey===key)this.removeResource(id);
    for(const[id,o]of this.buildingObjects)if(o.chunkKey===key){o.shape.destroy();o.shadow?.destroy();o.glow?.destroy();this.buildingObjects.delete(id)}
    for(const[id,o]of this.farmPlotObjects)if(o.chunkKey===key){o.destroy();this.farmPlotObjects.delete(id)}
  }
  addFarmPlot(plot){
    if(!plot?.id||this.farmPlotObjects.has(plot.id))return;
    const g=this.scene.add.graphics().setDepth(plot.y-1);
    g.fillStyle(0x332218,0.45).fillEllipse(plot.x,plot.y+12,34,10);
    g.fillStyle(0x65452b,1).fillRect(plot.x-14,plot.y-13,28,26);
    g.fillStyle(0x8b633d,1).fillRect(plot.x-12,plot.y-11,24,22);
    g.fillStyle(0x4c3321,1);
    for(let row=0;row<4;row++)g.fillRect(plot.x-11,plot.y-9+row*6,22,2);
    g.lineStyle(1,0x2e2118,0.9).strokeRect(plot.x-14,plot.y-13,28,26);
    this.farmPlotObjects.set(plot.id,g);
  }
  addResource(r){
    if(this.resourceObjects.has(r.id))return;
    const frames={tree:0,stone:1,berry:2,"woodland-herb":3,reed:4,ore:5,crystal:6,fiber:7};
    const shadow=this.scene.add.ellipse(r.x+2,r.y+7,24,8,0x17130e,.38).setDepth(r.y-2);
    const shape=this.scene.add.sprite(r.x,r.y,"items",frames[r.type]??1).setOrigin(.5,.75).setScale(2).setDepth(r.y+8);
    const canopy=r.type==="tree"?this.scene.add.ellipse(r.x,r.y-5,29,15,0x527b3b,.7).setStrokeStyle(1,0x9aaa62,.28).setDepth(r.y+9):null;
    this.resourceObjects.set(r.id,{shape,shadow,canopy,chunkKey:r.chunkKey,type:r.type,x:r.x,y:r.y,phase:this.hash(r.id)%628/100});
  }
  removeResource(id){const o=this.resourceObjects.get(id);if(!o)return;o.shape.destroy();o.shadow.destroy();o.canopy?.destroy();this.resourceObjects.delete(id)}
  updateCanopies(x,y,time=0){for(const o of this.resourceObjects.values())if(o.canopy){const under=Math.abs(x-o.x)<18&&y>o.y-20&&y<o.y+18;o.canopy.setAlpha(under?.2:.7);const nearby=Math.hypot(x-o.x,y-o.y)<260;if(nearby)o.canopy.setAngle(Math.sin(time/950+(o.phase||0))*1.7)}}
  setTerritories(items=[]){
    const g=this.territoryGraphics;g.clear();
    for(const t of items){const color=this.colorFor(t.clanId);g.lineStyle(3,color,.13);g.strokeRect(t.x-t.width/2,t.y-t.height/2,t.width,t.height);g.lineStyle(2,color,.7);const l=t.x-t.width/2,r=t.x+t.width/2,top=t.y-t.height/2,b=t.y+t.height/2;this.dash(g,l,top,r,top);this.dash(g,r,top,r,b);this.dash(g,r,b,l,b);this.dash(g,l,b,l,top)}
  }
  dash(g,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;for(let n=0;n<len;n+=18){const end=Math.min(n+9,len);g.lineBetween(Math.round(x1+ux*n),Math.round(y1+uy*n),Math.round(x1+ux*end),Math.round(y1+uy*end))}}
  colorFor(id){let h=2166136261;for(const c of String(id)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return Phaser.Display.Color.HSLToColor((h>>>0)%360/360,.72,.62).color}
  addBuilding(b){
    if(this.buildingObjects.has(b.id))return;
    const wall=["wall","wood_wall","stone_wall"].includes(b.type),totem=b.type==="clan_totem",door=b.type==="wood_door",chest=b.type==="chest"||b.type==="storage_chest",campfire=b.type==="campfire";
    const workbench=b.type==="workbench";
    const width=totem?32:wall?38:door?22:chest?27:campfire?22:workbench?34:28,height=totem?64:wall?16:door?31:chest?22:campfire?12:workbench?22:25;
    const depth=b.y+(totem?34:wall?10:door?18:chest?13:campfire?7:workbench?12:13);
    const shape=this.scene.add.graphics({x:b.x,y:b.y}).setDepth(depth);
    if(totem){
      const color=this.colorFor(b.clanId);
      shape.fillStyle(0x28231b,.4).fillEllipse(0,24,34,12);
      shape.fillStyle(0x777064,1).fillRect(-15,17,30,8);shape.lineStyle(2,0xc2b18c,1).strokeRect(-15,17,30,8);
      shape.fillStyle(0x68472a,1).fillRect(-6,-22,12,41);shape.lineStyle(2,0x2c1d12,1).strokeRect(-6,-22,12,41);
      shape.fillStyle(0xa77b42,1).fillRect(-10,-25,20,5);
      shape.fillStyle(color,1).fillTriangle(6,-20,22,-14,6,-7);shape.lineStyle(1,0xf1d49a,.9).lineBetween(6,-20,6,-7);
      shape.fillStyle(0xe4bd71,1).fillCircle(0,-14,3);shape.lineStyle(1,0xf4d99b,.8).strokeCircle(0,-14,5);
    }else if(wall&&b.type!=="stone_wall"){
      shape.fillStyle(0x684326,1).fillRect(-width/2,-height/2,width,height);
      for(let row=0;row<3;row++){shape.fillStyle(row%2?0xb17a43:0x966337,1).fillRect(-width/2+1,-height/2+2+row*4,width-2,3);shape.lineStyle(1,0x4b2d1a,.8).lineBetween(-width/2,-height/2+5+row*4,width/2,-height/2+5+row*4)}
      shape.lineStyle(2,0x4b2d1a,1).strokeRect(-width/2,-height/2,width,height);
    }else if(wall){
      shape.fillStyle(0x66665e,1).fillRect(-width/2,-height/2,width,height);
      for(let row=0;row<2;row++)for(let col=0;col<3;col++){const x=-width/2+col*12+(row%2?5:0);shape.fillStyle((row+col)%2?0xaaa18d:0x8d8878,1).fillRect(x,-height/2+row*7,11,6);shape.lineStyle(1,0x4b4942,.8).strokeRect(x,-height/2+row*7,11,6)}
    }else if(door){
      shape.fillStyle(0x59371f,1).fillRect(-9,-15,18,30);shape.fillStyle(0x9b6b3b,1).fillRect(-7,-13,14,26);shape.lineStyle(1,0x4b2d1a,1).lineBetween(0,-12,0,12);shape.fillStyle(0xe2b96d,1).fillCircle(5,0,2);shape.lineStyle(2,0x2e2117,1).strokeRect(-9,-15,18,30);
    }else if(chest){
      shape.fillStyle(0x6c4528,1).fillRect(-13,-9,26,18);shape.fillStyle(0xb17b42,1).fillRect(-12,-8,24,7);shape.fillStyle(0x4b2c19,1).fillRect(-12,0,24,7);shape.fillStyle(0xd3a45d,1).fillRect(-2,-8,4,16);shape.fillStyle(0xe4c17a,1).fillRect(-2,-1,4,4);shape.lineStyle(2,0x342116,1).strokeRect(-13,-9,26,18);
    }else if(workbench){
      shape.fillStyle(0x57371f,1).fillRect(-16,-5,32,13);
      shape.fillStyle(0x9b6a3a,1).fillRect(-17,-9,34,6);
      shape.fillStyle(0x4a2d1b,1).fillRect(-13,8,4,8);shape.fillRect(9,8,4,8);
      shape.fillStyle(0xb78a4e,1).fillRect(-7,-8,8,4);shape.fillStyle(0x7e8b79,1).fillRect(5,-8,7,3);
      shape.lineStyle(1,0x2d1d12,1).strokeRect(-17,-9,34,17);
    }else if(campfire){
      shape.lineStyle(4,0x6a4528,1).lineBetween(-9,5,8,-4);shape.lineBetween(-9,-4,8,5);shape.fillStyle(0xd65d28,1).fillTriangle(-6,3,0,-12,6,3);shape.fillStyle(0xf3bc50,1).fillTriangle(-3,2,1,-7,4,2);
    }else{
      shape.fillStyle(0x8b7551,1).fillRect(-width/2,-height/2,width,height);shape.lineStyle(2,0x392c1d,1).strokeRect(-width/2,-height/2,width,height);
    }
    const shadow=this.scene.add.ellipse(b.x,b.y+height*.35,width+5,9,0x17130e,.36).setDepth(b.y-2);
    const glow=totem?this.scene.add.circle(b.x,b.y-13,23,this.colorFor(b.clanId),.1).setDepth(b.y+1):campfire?this.scene.add.circle(b.x,b.y,15,0xffc56b,.14).setDepth(b.y+1):null;
    this.buildingObjects.set(b.id,{shape,shadow,glow,chunkKey:b.chunkKey,type:b.type});
  }
  addBuildings(items){items.forEach(b=>this.addBuilding(b))}
  hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
  destroy(){for(const chunk of this.chunkObjects.values()){chunk.ground.destroy();chunk.label.destroy()}for(const o of this.resourceObjects.values()){o.shape.destroy();o.shadow.destroy();o.canopy?.destroy()}for(const o of this.buildingObjects.values()){o.shape.destroy();o.shadow.destroy();o.glow?.destroy()}for(const o of this.farmPlotObjects.values())o.destroy();this.farmPlotObjects.clear();this.chunkObjects.clear();this.resourceObjects.clear();this.buildingObjects.clear();this.territoryGraphics.destroy()}
}
