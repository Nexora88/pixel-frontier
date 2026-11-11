const test=require("node:test");
const assert=require("node:assert/strict");
const {QuestSystem}=require("./QuestSystem");
const {emptySlots,addToSlots,slotCounts}=require("./SurvivalSystems");

function makePlayer(id="tester",items={}) {
  const slots=emptySlots();
  for(const [item,quantity] of Object.entries(items)) assert.equal(addToSlots(slots,item,quantity).ok,true);
  return {id,slots,inventory:slotCounts(slots),questState:{}};
}

test("quest progress is server-owned, persists on player state, and rewards once",()=>{
  let now=Date.UTC(2026,10,11,12);
  const quests=new QuestSystem(()=>now),player=makePlayer();
  const first=quests.record(player,"gather",{item:"wood",amount:15});
  assert.equal(first.quests.find(q=>q.id==="pioneer_gather").completed,true);
  assert.equal(first.xp,55);
  assert.equal(player.inventory.berries,6);
  const second=quests.record(player,"gather",{item:"wood",amount:15});
  assert.equal(second.xp,55);
  assert.equal(player.inventory.berries,3);
});

test("daily quests reset at UTC day boundary while permanent progress remains",()=>{
  let now=Date.UTC(2026,10,11,23,59);
  const quests=new QuestSystem(()=>now),player=makePlayer();
  quests.record(player,"gather",{item:"wood",amount:5});
  assert.equal(quests.snapshot(player).quests.find(q=>q.id==="daily_forager").progress,5);
  now+=2*60*1000;
  const snapshot=quests.snapshot(player);
  assert.equal(snapshot.quests.find(q=>q.id==="daily_forager").progress,0);
  assert.equal(snapshot.quests.find(q=>q.id==="pioneer_gather").progress,5);
});

test("weekly exploration counts distinct biomes only",()=>{
  const quests=new QuestSystem(()=>Date.UTC(2026,10,11)),player=makePlayer();
  quests.record(player,"explore",{biome:"forest"});
  quests.record(player,"explore",{biome:"forest"});
  quests.record(player,"explore",{biome:"meadow"});
  let snapshot=quests.record(player,"explore",{biome:"lake"});
  assert.equal(snapshot.quests.find(q=>q.id==="weekly_explorer").progress,3);
  assert.equal(snapshot.quests.find(q=>q.id==="weekly_explorer").completed,true);
});

test("full inventory stores quest rewards for later claiming",()=>{
  const quests=new QuestSystem(()=>Date.UTC(2026,10,11));
  const slots=Array.from({length:24},()=>({item:"berries",quantity:30}));
  const player={id:"full",slots,inventory:slotCounts(slots),questState:{}};
  const result=quests.record(player,"craft",{item:"wooden_axe"});
  assert.equal(result.quests.find(q=>q.id==="first_tool").completed,true);
  assert.equal(result.pendingRewards,1);
  assert.equal(result.newlyCompleted.find(q=>q.id==="first_tool").rewardPending,true);
  player.slots[0]=null;
  const claimed=quests.claimPending(player);
  assert.equal(claimed.ok,true);
  assert.equal(claimed.pendingRewards,0);
  assert.equal(player.inventory.fiber,4);
});

test("daily trade quest completes only on a completed trade event",()=>{
  const quests=new QuestSystem(()=>Date.UTC(2026,10,11)),player=makePlayer();
  const snapshot=quests.record(player,"trade",{amount:1});
  assert.equal(snapshot.quests.find(q=>q.id==="daily_trade").completed,true);
  assert.equal(snapshot.xp,30);
});
