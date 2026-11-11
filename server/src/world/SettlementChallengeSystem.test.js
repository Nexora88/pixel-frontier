const test=require("node:test");
const assert=require("node:assert/strict");
const {SettlementChallengeSystem,SETTLEMENT_CHALLENGE_RULES}=require("./SettlementChallengeSystem");

function fixture(safe=false){
  let now=1_000_000;
  const totem={id:"totem_b",type:"clan_totem",clanId:"clan_b",ownerId:"leader_b",x:1000,y:1000,hp:800};
  const world={buildings:new Map([[totem.id,totem]])};
  const social={clans:new Map([
    ["clan_a",{id:"clan_a",name:"North",leaderId:"leader_a",members:["leader_a","member_a"]}],
    ["clan_b",{id:"clan_b",name:"South",leaderId:"leader_b",members:["leader_b"]}]
  ])};
  const territory={isSafeZone:()=>safe};
  const system=new SettlementChallengeSystem(world,social,territory,()=>now);
  const attacker={id:"leader_a",clanId:"clan_a",x:1000,y:1000};
  const ally={id:"member_a",clanId:"clan_a",x:1010,y:1000};
  const defender={id:"leader_b",clanId:"clan_b",x:1020,y:1000};
  return {system,world,social,totem,attacker,ally,defender,get now(){return now},set now(v){now=v}};
}

test("only a clan leader can challenge an enemy settlement with an online defender",()=>{
  const f=fixture();
  assert.equal(f.system.start({...f.attacker,id:"member_a"},f.totem.id,[f.attacker,f.defender]).reason,"leader-required");
  assert.equal(f.system.start(f.attacker,f.totem.id,[f.attacker]).reason,"defender-offline");
  assert.equal(f.system.start(f.attacker,f.totem.id,[f.attacker,f.defender]).ok,true);
});

test("a clan already involved in a challenge cannot start a second one",()=>{
  const f=fixture();
  f.world.buildings.set("totem_c",{id:"totem_c",type:"clan_totem",clanId:"clan_c",ownerId:"leader_c",x:1150,y:1000});
  f.social.clans.set("clan_c",{id:"clan_c",name:"East",leaderId:"leader_c",members:["leader_c"]});
  const third={id:"leader_c",clanId:"clan_c",x:1150,y:1000};
  assert.equal(f.system.start(f.attacker,f.totem.id,[f.attacker,f.defender]).ok,true);
  assert.equal(f.system.start(f.defender,"totem_c",[f.attacker,f.defender,third]).reason,"clan-busy");
});

test("own settlements and protected zones cannot be challenged",()=>{
  const f=fixture();
  f.totem.clanId="clan_a";
  assert.equal(f.system.start(f.attacker,f.totem.id,[f.attacker,f.defender]).reason,"own-settlement");
  const safe=fixture(true);
  assert.equal(safe.system.start(safe.attacker,safe.totem.id,[safe.attacker,safe.defender]).reason,"safe-zone");
});

test("challenge has a preparation phase and requires defenders to remain present",()=>{
  const f=fixture();
  const started=f.system.start(f.attacker,f.totem.id,[f.attacker,f.defender]);
  const challenge=f.system.challenges.get(started.challenge.id);
  assert.equal(challenge.status,"preparing");
  f.system.update([f.attacker],f.now+SETTLEMENT_CHALLENGE_RULES.PREPARATION_MS);
  assert.equal(challenge.status,"active");
  f.system.update([f.attacker],f.now+SETTLEMENT_CHALLENGE_RULES.PREPARATION_MS+20_000);
  assert.equal(challenge.progress,0);
  assert.equal(f.totem.clanId,"clan_b");
});

test("presence contest can transfer only the settlement marker and preserves structures",()=>{
  const f=fixture();
  const started=f.system.start(f.attacker,f.totem.id,[f.attacker,f.defender]);
  const challenge=f.system.challenges.get(started.challenge.id);
  f.system.update([f.attacker,f.ally,f.defender],f.now+SETTLEMENT_CHALLENGE_RULES.PREPARATION_MS);
  let result=[];
  for(let i=1;i<=10;i++)result=f.system.update([f.attacker,f.ally,f.defender],f.now+SETTLEMENT_CHALLENGE_RULES.PREPARATION_MS+i*2_000);
  assert.equal(result[0].status,"captured");
  assert.equal(f.totem.clanId,"clan_a");
  assert.equal(f.totem.ownerId,"leader_a");
  assert.equal(f.totem.hp,800);
  assert.equal(challenge.progress,100);
});

test("defenders can hold or reverse the contest and cooldown blocks repeated challenges",()=>{
  const f=fixture();
  const started=f.system.start(f.attacker,f.totem.id,[f.attacker,f.defender]);
  const challenge=f.system.challenges.get(started.challenge.id);
  f.system.update([f.attacker,f.defender],f.now+SETTLEMENT_CHALLENGE_RULES.PREPARATION_MS);
  challenge.progress=40;
  f.system.update([f.attacker,f.defender],f.now+SETTLEMENT_CHALLENGE_RULES.PREPARATION_MS+2_000);
  assert.equal(challenge.progress,40);
  f.system.update([f.attacker,f.defender,f.defender],f.now+SETTLEMENT_CHALLENGE_RULES.PREPARATION_MS+4_000);
  assert.equal(challenge.progress,32);
  let result=[];
  for(let i=3;i<=12;i++){result=f.system.update([f.attacker,f.ally,f.defender],f.now+SETTLEMENT_CHALLENGE_RULES.PREPARATION_MS+i*2_000);if(result.length)break;}
  assert.equal(result[0].status,"captured");
  assert.equal(f.system.start(f.defender,f.totem.id,[f.attacker,f.defender]).reason,"cooldown");
});

test("active challenges and cooldowns survive export and restore",()=>{
  const f=fixture();
  f.system.start(f.attacker,f.totem.id,[f.attacker,f.defender]);
  const restored=new SettlementChallengeSystem(f.world,f.social,{isSafeZone:()=>false},()=>f.now);
  restored.restore(f.system.exportState());
  assert.equal(restored.activeSnapshots().length,1);
  assert.equal(restored.activeSnapshots()[0].status,"preparing");
});
