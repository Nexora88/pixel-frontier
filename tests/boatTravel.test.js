const test=require("node:test"),assert=require("node:assert/strict");
const {WorldState}=require("../server/src/world/WorldState");
const {PlayerManager}=require("../server/src/game/PlayerManager");
const {emptySlots,addToSlots}=require("../server/src/world/SurvivalSystems");
const {getBiomeAt}=require("../server/src/world/generateWorld");

function coastalPoint(world){
  for(let y=32;y<2368;y+=24)for(let x=32;x<3168;x+=24){
    const biome=getBiomeAt(world.seed,x,y,world.generationVersion);
    if(["forest","meadow"].includes(biome)&&world.isNearCoast({x,y},112))return{x,y};
  }
  throw new Error("No deterministic coast point found");
}
function makePlayer(point,raft=true){
  const slots=emptySlots();
  if(raft)addToSlots(slots,"wooden_raft",1);
  return{id:"raft-player",x:point.x,y:point.y,slots,inventory:{wooden_raft:raft?1:0},boat:null};
}

test("raft launch requires a crafted raft and a safe shoreline",()=>{
  const world=new WorldState("raft-launch-test"),point=coastalPoint(world),without=makePlayer(point,false);
  assert.equal(world.launchBoat(without).reason,"raft-required");
  const player=makePlayer(point,true),launched=world.launchBoat(player);
  assert.equal(launched.ok,true);
  assert.equal(player.boat.active,true);
  assert.equal(player.inventory.wooden_raft,undefined);
});
test("raft can only be docked at shore and returns to inventory",()=>{
  const world=new WorldState("raft-dock-test"),point=coastalPoint(world),player=makePlayer(point,true);
  assert.equal(world.launchBoat(player).ok,true);
  const docked=world.dockBoat(player);
  assert.equal(docked.ok,true);
  assert.equal(player.boat,null);
  assert.equal(player.inventory.wooden_raft,1);
});
test("survivors cannot cross open ocean without a raft but can sail with one",()=>{
  const world=new WorldState("raft-movement-test"),manager=new PlayerManager();
  const player=manager.add("raft-mover","socket-raft",null,world);
  player.x=2100;player.y=1200;
  assert.equal(getBiomeAt(world.seed,player.x,player.y,world.generationVersion),"ocean");
  player.input={up:false,down:false,left:false,right:true};
  manager.update(.05,180,world,"clear");
  assert.equal(player.x,2100);
  player.boat={id:"test-raft",active:true,durability:100};
  manager.update(.05,180,world,"clear");
  assert.ok(player.x>2100);
});
test("saved raft passengers can reconnect at their persisted sea position",()=>{
  const world=new WorldState("raft-restore-test"),manager=new PlayerManager();
  const restored={x:2100,y:1200,boat_state:{id:"saved-raft",active:true,durability:80},slots:[]};
  const player=manager.add("saved-sailor","socket-saved",restored,world);
  assert.equal(player.x,2100);
  assert.equal(player.boat.id,"saved-raft");
});
