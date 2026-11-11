const test=require("node:test"),assert=require("node:assert/strict");const{generateResources,generateChunk,getBiomeAt,getIslandIdAt,isLandAt}=require("../server/src/world/generateWorld");
test("chunk generation is deterministic for seed and coordinate",()=>assert.deepEqual(generateChunk("seed",2,1),generateChunk("seed",2,1)));
test("resource nodes remain within their chunk",()=>{const c=generateChunk("bounds",3,2);assert.ok(c.resources.every(r=>r.x>=c.x&&r.x<=c.x+c.width&&r.y>=c.y&&r.y<=c.y+c.height))});
test("world resource ids are unique and bounded",()=>{const a=generateResources("bounds");assert.equal(new Set(a.map(r=>r.id)).size,a.length);assert.ok(a.every(r=>r.x>=0&&r.x<=3200&&r.y>=0&&r.y<=2400))});
test("biome selector returns supported biome",()=>assert.ok(["forest","lake","mountain","meadow","ocean"].includes(getBiomeAt("seed",200,200))));
test("version 2 creates deterministic separated islands and open-water channels",()=>{
  const seed="island-layout-test";
  assert.equal(isLandAt(seed,930,1210),true);
  assert.equal(isLandAt(seed,2390,560),true);
  assert.equal(isLandAt(seed,2310,1840),true);
  assert.equal(isLandAt(seed,2100,1200),false);
  assert.equal(getBiomeAt(seed,2100,1200,2),"ocean");
  assert.equal(getBiomeAt(seed,930,1210,2),getBiomeAt(seed,930,1210,2));
});
test("island identity is deterministic and distinguishes the three landmasses",()=>{
  const seed="island-layout-test";
  assert.equal(getIslandIdAt(seed,930,1210,2),"main");
  assert.equal(getIslandIdAt(seed,2390,560,2),"north-east");
  assert.equal(getIslandIdAt(seed,2310,1840,2),"south-east");
  assert.equal(getIslandIdAt(seed,2100,1200,2),null);
  assert.equal(getIslandIdAt(seed,930,1210,1),null);
});
test("legacy terrain version retains the old biome map",()=>{
  const seed="legacy-map";
  assert.equal(getBiomeAt(seed,200,200,1),getBiomeAt(seed,200,200,1));
  assert.ok(["forest","lake","mountain","meadow"].includes(getBiomeAt(seed,200,200,1)));
});
test("new chunks contain deterministic pixel-scale coastline cells and no ocean resources",()=>{
  const a=generateChunk("coast-cells",3,2,2),b=generateChunk("coast-cells",3,2,2);
  assert.deepEqual(a.terrainCells,b.terrainCells);
  assert.equal(a.terrainCells.length,256);
  assert.ok(a.terrainCells.every(cell=>cell.size===25&&["ocean","forest","meadow","mountain"].includes(cell.biome)));
  assert.ok(a.resources.every(resource=>getBiomeAt("coast-cells",resource.x,resource.y,2)!=="ocean"));
});
