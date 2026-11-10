const test=require("node:test"),assert=require("node:assert/strict"),crypto=require("node:crypto");const{PlayerManager}=require("../server/src/game/PlayerManager");const{WorldState}=require("../server/src/world/WorldState");const{getBiomeAt}=require("../server/src/world/generateWorld");
test("player manager chooses walkable spawn and keeps inventory private in remote snapshots",()=>{const world=new WorldState("spawn-test"),manager=new PlayerManager(),id=crypto.randomUUID(),p=manager.add(id,"socket-a",null,world);assert.ok(["forest","meadow"].includes(getBiomeAt(world.seed,p.x,p.y)));assert.equal(p.slots.some(s=>s?.item==="primitive_stone"),true);assert.equal(manager.publicPlayers([p])[0].slots,undefined);assert.ok(manager.publicPlayers([p],id)[0].slots)});
test("player manager restores stable identity and saved slot state",()=>{const world=new WorldState("restore-player"),manager=new PlayerManager(),id=crypto.randomUUID(),saved={name:"Saved Survivor",x:500,y:500,slots:[{item:"wood",quantity:12},...Array(23).fill(null)],inventory:{wood:12},equipment:{tool:"wooden_axe"},clan_id:"clan_1"};const p=manager.add(id,"socket-b",saved,world);assert.equal(p.id,id);assert.equal(p.name,"Saved Survivor");assert.equal(p.inventory.wood,12);assert.equal(p.equipment.tool,"wooden_axe");assert.equal(p.clanId,"clan_1")});

test("server movement accelerates, normalizes diagonal input and decelerates smoothly",()=>{
  const world=new WorldState("physics-test"),manager=new PlayerManager(),id=crypto.randomUUID(),p=manager.add(id,"socket-physics",null,world);
  p.input={up:false,down:false,left:false,right:true};
  manager.update(0.05,180,world,"clear");
  assert.ok(p.vx>0&&p.vx<180,"movement should ramp up instead of instantly reaching max speed");
  const firstSpeed=p.vx;
  manager.update(0.05,180,world,"clear");
  assert.ok(p.vx>firstSpeed,"continued input should accelerate toward target speed");
  p.input={up:false,down:true,left:false,right:true};
  manager.update(0.05,180,world,"clear");
  assert.ok(Math.abs(p.vx-p.vy)<1,"diagonal movement should remain normalized");
  p.input={up:false,down:false,left:false,right:false};
  const beforeStop=p.vx;
  manager.update(0.05,180,world,"clear");
  assert.ok(p.vx>=0&&p.vx<beforeStop,"releasing input should apply friction");
});
