const test=require("node:test"),assert=require("node:assert/strict");
const {EnvironmentSimulation,emptySlots,addToSlots}=require("../server/src/world/SurvivalSystems");

function keeper(id="keeper"){
  const slots=emptySlots();addToSlots(slots,"berries",5);
  return{id,x:930,y:1210,slots,inventory:{berries:5}};
}
test("wildlife requires repeated feeding before it becomes a player's companion",()=>{
  const env=new EnvironmentSimulation("wildlife-test"),animal=env.spawnAnimal(930,1210,"forest"),player=keeper();
  assert.equal(env.feedAnimal(player,animal.id).tamed,false);
  assert.equal(env.feedAnimal(player,animal.id).animal.trust,2);
  const final=env.feedAnimal(player,animal.id);
  assert.equal(final.tamed,true);
  assert.equal(final.animal.ownerId,player.id);
  assert.equal(player.inventory.berries,2);
});
test("owned animals reject other players and allow owner care",()=>{
  const env=new EnvironmentSimulation("wildlife-care-test"),animal=env.spawnAnimal(930,1210,"meadow"),owner=keeper("owner");
  env.feedAnimal(owner,animal.id);env.feedAnimal(owner,animal.id);env.feedAnimal(owner,animal.id);
  const stranger=keeper("stranger");
  assert.equal(env.feedAnimal(stranger,animal.id).reason,"animal-owned");
  const before=animal.affection,care=env.careAnimal(owner,animal.id);
  assert.equal(care.ok,true);
  assert.ok(animal.affection>before);
  assert.equal(env.careAnimal(stranger,animal.id).reason,"animal-not-owned");
});
test("tamed wildlife state persists and companions follow their online owner",()=>{
  const env=new EnvironmentSimulation("wildlife-save-test"),animal=env.spawnAnimal(930,1210,"forest"),owner=keeper("owner");
  env.feedAnimal(owner,animal.id);env.feedAnimal(owner,animal.id);env.feedAnimal(owner,animal.id);
  const saved=env.exportState(),restored=new EnvironmentSimulation("wildlife-save-test");
  restored.restoreState(saved);
  const companion=restored.animals.get(animal.id);
  assert.equal(companion.ownerId,owner.id);
  assert.equal(companion.tamed,true);
  const before=companion.x;
  owner.x=1100;owner.y=1210;
  restored.update(.1,[owner]);
  assert.ok(companion.x>before);
});
test("wildlife care and feeding enforce interaction range and berry costs",()=>{
  const env=new EnvironmentSimulation("wildlife-range-test"),animal=env.spawnAnimal(930,1210,"meadow"),player=keeper();
  player.x=1200;
  assert.equal(env.feedAnimal(player,animal.id).reason,"animal-too-far");
  player.x=930;player.slots=emptySlots();player.inventory={};
  assert.equal(env.feedAnimal(player,animal.id).reason,"berries-required");
});
