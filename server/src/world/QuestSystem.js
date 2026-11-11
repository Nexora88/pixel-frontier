const { addToSlots, slotCounts } = require("./SurvivalSystems");

const DEFINITIONS = Object.freeze([
  { id:"pioneer_gather", title:"Sınırın Kaynakları", description:"15 odun veya taş topla", cadence:"once", action:"gather", goal:15, matches:e=>["wood","stone"].includes(e.item), reward:{xp:35,item:"berries",quantity:3} },
  { id:"first_tool", title:"İlk Ustalık", description:"Tahta balta üret", cadence:"once", action:"craft", goal:1, matches:e=>e.item==="wooden_axe", reward:{xp:45,item:"fiber",quantity:4} },
  { id:"first_shelter", title:"Bir Yuva Kur", description:"İlk yapını inşa et", cadence:"once", action:"build", goal:1, reward:{xp:50,item:"wood",quantity:8} },
  { id:"first_harvest", title:"Toprağın Bereketi", description:"3 ürün hasat et", cadence:"once", action:"harvest", goal:3, reward:{xp:45,item:"wheat_seed",quantity:2} },
  { id:"daily_forager", title:"Günlük Toplayıcı", description:"12 kaynak topla", cadence:"daily", action:"gather", goal:12, reward:{xp:20,item:"berries",quantity:3} },
  { id:"daily_crafter", title:"Günlük Zanaat", description:"2 eşya üret", cadence:"daily", action:"craft", goal:2, reward:{xp:25,item:"fiber",quantity:3} },
  { id:"daily_harvest", title:"Günlük Hasat", description:"3 ürün hasat et", cadence:"daily", action:"harvest", goal:3, reward:{xp:25,item:"carrot_seed",quantity:2} },
  { id:"daily_trade", title:"Pazar Günü", description:"Bir oyuncuyla takas tamamla", cadence:"daily", action:"trade", goal:1, reward:{xp:30,item:"berries",quantity:4} },
  { id:"weekly_explorer", title:"Diyarın İzinde", description:"Bir hafta içinde 3 farklı biyom keşfet", cadence:"weekly", action:"explore", goal:3, unique:true, reward:{xp:80,item:"crystal",quantity:1} }
]);

function utcDay(now) { return new Date(now).toISOString().slice(0,10); }
function utcWeek(now) {
  const date = new Date(now), day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(),0,4));
  const firstDay = (firstThursday.getUTCDay()+6)%7;
  firstThursday.setUTCDate(firstThursday.getUTCDate()-firstDay+3);
  const week = 1 + Math.round((date-firstThursday)/604800000);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2,"0")}`;
}

class QuestSystem {
  constructor(clock = () => Date.now()) { this.clock = clock; }
  ensure(player) {
    const now = this.clock(), day = utcDay(now), week = utcWeek(now);
    let state = player.questState;
    if (!state || typeof state !== "object" || Array.isArray(state)) state = { xp:0, progress:{}, completed:{}, pendingRewards:[], visitedBiomes:[] };
    state.progress ||= {}; state.completed ||= {}; state.pendingRewards ||= []; state.visitedBiomes ||= [];
    state.xp = Math.max(0, Number(state.xp)||0);
    if (state.dailyKey !== day) {
      for (const q of DEFINITIONS.filter(item=>item.cadence==="daily")) { delete state.progress[q.id]; delete state.completed[q.id]; }
      state.dailyKey = day;
    }
    if (state.weeklyKey !== week) {
      for (const q of DEFINITIONS.filter(item=>item.cadence==="weekly")) { delete state.progress[q.id]; delete state.completed[q.id]; }
      state.visitedBiomes = [];
      state.weeklyKey = week;
    }
    player.questState = state;
    return state;
  }
  snapshot(player) {
    const state = this.ensure(player);
    const quests = DEFINITIONS.map(definition => ({
      id:definition.id, title:definition.title, description:definition.description,
      cadence:definition.cadence, goal:definition.goal,
      progress:Math.min(definition.goal, Number(state.progress[definition.id])||0),
      completed:!!state.completed[definition.id]
    }));
    return { xp:state.xp, level:Math.floor(state.xp/100)+1, quests, pendingRewards:state.pendingRewards.length, dailyKey:state.dailyKey, weeklyKey:state.weeklyKey };
  }
  record(player, action, event = {}) {
    const state = this.ensure(player), newlyCompleted = [];
    for (const definition of DEFINITIONS) {
      if (definition.action !== action || state.completed[definition.id]) continue;
      if (definition.matches && !definition.matches(event)) continue;
      let amount = Math.max(0, Number(event.amount)||1);
      if (definition.unique) {
        const biome = typeof event.biome === "string" ? event.biome : "";
        if (!biome || state.visitedBiomes.includes(biome)) continue;
        state.visitedBiomes.push(biome);
        amount = 1;
      }
      if (!Number.isFinite(amount) || amount <= 0) continue;
      state.progress[definition.id] = Math.min(definition.goal, (Number(state.progress[definition.id])||0)+amount);
      if (state.progress[definition.id] >= definition.goal) {
        state.completed[definition.id] = this.clock();
        state.xp += definition.reward.xp;
        const reward = { questId:definition.id, item:definition.reward.item, quantity:definition.reward.quantity };
        const added = addToSlots(player.slots, reward.item, reward.quantity);
        if (!added.ok) state.pendingRewards.push(reward);
        newlyCompleted.push({ id:definition.id, title:definition.title, xp:definition.reward.xp, item:reward.item, quantity:reward.quantity, rewardPending:!added.ok });
      }
    }
    player.inventory = slotCounts(player.slots);
    return { ...this.snapshot(player), newlyCompleted, slots:player.slots, inventory:player.inventory };
  }
  claimPending(player) {
    const state = this.ensure(player), claimed = [], remaining = [];
    for (const reward of state.pendingRewards) {
      const added = addToSlots(player.slots, reward.item, reward.quantity);
      if (added.ok) claimed.push(reward); else remaining.push(reward);
    }
    state.pendingRewards = remaining;
    player.inventory = slotCounts(player.slots);
    return { ok:claimed.length>0, claimed, pendingRewards:remaining.length, slots:player.slots, inventory:player.inventory, ...this.snapshot(player) };
  }
}
module.exports = { QuestSystem, QUEST_DEFINITIONS:DEFINITIONS };