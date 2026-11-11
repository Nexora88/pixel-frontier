const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..","public","assets");
function frames(file){const svg=fs.readFileSync(path.join(root,file),"utf8");return {svg,count:(svg.match(/<g transform=/g)||[]).length};}
test("survivor atlas has four directions and four frames per direction",()=>{
  const {svg,count}=frames("survivor-32.svg");
  assert.match(svg,/width="128" height="128"/);
  assert.match(svg,/shape-rendering="crispEdges"/);
  assert.equal(count,16);
});
test("wildlife atlas has four frames for each supported species",()=>{
  const {svg,count}=frames("wildlife-32.svg");
  assert.match(svg,/width="128" height="96"/);
  assert.match(svg,/shape-rendering="crispEdges"/);
  assert.equal(count,12);
});
