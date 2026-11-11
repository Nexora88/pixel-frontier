const { WORLD } = require("../config");
function hashString(v){let h=2166136261;for(const c of String(v)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function createRandom(seed){let s=hashString(seed)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const BIOMES=Object.freeze({
 forest:{resources:[["tree",2],["berry",2],["woodland-herb",1]],movement:.92,tint:0x365c3b},
 lake:{resources:[["reed",2],["stone",1],["berry",1]],movement:.82,tint:0x315d70},
 ocean:{resources:[["reed",1],["wood",1]],movement:1,tint:0x294e70},
 mountain:{resources:[["stone",2],["ore",1],["crystal",1]],movement:.76,tint:0x777b83},
 meadow:{resources:[["berry",2],["fiber",2],["tree",1]],movement:1,tint:0x6b874b}
});
function legacyBiomeAt(seed,x,y){const roll=createRandom(`${seed}:biome:${Math.floor(x/800)}:${Math.floor(y/800)}`)();return roll<.24?"lake":roll<.48?"mountain":roll<.78?"forest":"meadow"}
const ISLANDS=[
 {name:"main",x:930,y:1210,rx:900,ry:1010,phase:0.7},
 {name:"north-east",x:2390,y:560,rx:510,ry:430,phase:2.1},
 {name:"south-east",x:2310,y:1840,rx:540,ry:455,phase:4.2}
];
function insideIsland(seed,x,y,island){
 const dx=(x-island.x)/island.rx,dy=(y-island.y)/island.ry,distance=Math.hypot(dx,dy);
 const angle=Math.atan2(dy,dx),phase=(hashString(`${seed}:${island.name}`)%6283)/1000;
 const edge=1+.075*Math.sin(angle*3+island.phase+phase)+.045*Math.sin(angle*5+phase*1.7)+.025*Math.sin(angle*9+phase*.6);
 return distance<=edge;
}
function isLandAt(seed,x,y){return ISLANDS.some(island=>insideIsland(seed,x,y,island));}
function getIslandIdAt(seed,x,y,version=WORLD.generationVersion||1){
 if(version<2||x<0||y<0||x>=WORLD.width||y>=WORLD.height)return null;
 return ISLANDS.find(island=>insideIsland(seed,x,y,island))?.name||null;
}
function getBiomeAt(seed,x,y,version=WORLD.generationVersion||1){
 if(version<2)return legacyBiomeAt(seed,x,y);
 if(x<0||y<0||x>=WORLD.width||y>=WORLD.height||!isLandAt(seed,x,y))return "ocean";
 const roll=createRandom(`${seed}:land-biome:${Math.floor(x/500)}:${Math.floor(y/500)}`)();
 return roll<.16?"mountain":roll<.57?"forest":"meadow";
}
function generateChunk(seed=WORLD.seed,cx=0,cy=0,version=WORLD.generationVersion||1){
 const size=WORLD.chunkSize,x=cx*size,y=cy*size;
 if(x<0||y<0||x>=WORLD.width||y>=WORLD.height)return null;
 const terrainCells=[],cellSize=25;
 for(let py=0;py<size;py+=cellSize)for(let px=0;px<size;px+=cellSize){
  const sx=x+px+cellSize/2,sy=y+py+cellSize/2,biome=getBiomeAt(seed,sx,sy,version);
  const coast=biome!=="ocean"&&[[0,-cellSize],[cellSize,0],[0,cellSize],[-cellSize,0]].some(([ox,oy])=>getBiomeAt(seed,sx+ox,sy+oy,version)==="ocean");
  terrainCells.push({x:x+px,y:y+py,size:cellSize,biome,coast});
 }
 const centerBiome=getBiomeAt(seed,x+size/2,y+size/2,version);
 const landCells=terrainCells.filter(cell=>cell.biome!=="ocean");
 const resourceBiome=landCells.length?landCells[Math.floor(landCells.length/2)].biome:centerBiome;
 const def=BIOMES[resourceBiome]||BIOMES.ocean,rand=createRandom(`${seed}:chunk:${cx}:${cy}`),resources=[];
 for(let i=0;i<Math.min(8,landCells.length?5+Math.floor(rand()*4):0);i++){
  let px,py,biome;
  for(let attempt=0;attempt<30;attempt++){
   px=x+32+rand()*(size-64);py=y+32+rand()*(size-64);biome=getBiomeAt(seed,px,py,version);
   if(biome!=="ocean")break;
  }
  if(!biome||biome==="ocean")continue;
  const local=BIOMES[biome]||def,item=local.resources[Math.floor(rand()*local.resources.length)];
  resources.push({id:`res_${cx}_${cy}_${i}`,type:item[0],x:px,y:py,amount:item[1],radius:item[0]==="tree"?15:9,chunkKey:`${cx},${cy}`});
 }
 return{key:`${cx},${cy}`,x,y,width:Math.min(size,WORLD.width-x),height:Math.min(size,WORLD.height-y),chunkX:cx,chunkY:cy,biome:centerBiome,movement:(BIOMES[centerBiome]||BIOMES.ocean).movement,tint:(BIOMES[centerBiome]||BIOMES.ocean).tint,terrainCells,resources};
}
function generateResources(seed=WORLD.seed,version=WORLD.generationVersion||1){const out=[];for(let y=0;y<Math.ceil(WORLD.height/WORLD.chunkSize);y++)for(let x=0;x<Math.ceil(WORLD.width/WORLD.chunkSize);x++)out.push(...generateChunk(seed,x,y,version).resources);return out}
module.exports={BIOMES,ISLANDS,createRandom,isLandAt,getIslandIdAt,getBiomeAt,generateChunk,generateResources};