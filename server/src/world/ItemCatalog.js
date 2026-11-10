const ITEMS=Object.freeze({
wood:{label:"Wood",category:"material",stack:99},stone:{label:"Stone",category:"material",stack:99},iron:{label:"Iron",category:"material",stack:50},berries:{label:"Berries",category:"material",stack:30},
"woodland-herb":{label:"Woodland Herb",category:"material",stack:20},reed:{label:"Reed",category:"material",stack:50},ore:{label:"Ore",category:"material",stack:50},crystal:{label:"Crystal",category:"material",stack:20},fiber:{label:"Fiber",category:"material",stack:50},wheat_seed:{label:"Wheat Seed",category:"seed",stack:50},carrot_seed:{label:"Carrot Seed",category:"seed",stack:50},wheat:{label:"Wheat",category:"food",stack:50},carrot:{label:"Carrot",category:"food",stack:50},wooden_raft:{label:"Wooden Raft",category:"transport",stack:1}
});
const RECIPES=Object.freeze({wooden_axe:{costs:{wood:15}},wooden_pickaxe:{costs:{wood:15}},wooden_hoe:{costs:{wood:12,fiber:4}},wooden_watering_can:{costs:{wood:6,fiber:4}},wheat_seed:{costs:{berries:1,fiber:1}},carrot_seed:{costs:{berries:1,fiber:1}},wooden_raft:{costs:{wood:35,reed:12,fiber:8}}});
function createInventory(){return Object.fromEntries(Object.keys(ITEMS).map(k=>[k,0]))}
module.exports={ITEMS,RECIPES,createInventory};
