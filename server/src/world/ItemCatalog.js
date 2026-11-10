const ITEMS=Object.freeze({
wood:{label:"Wood",category:"material",stack:99},stone:{label:"Stone",category:"material",stack:99},iron:{label:"Iron",category:"material",stack:50},berries:{label:"Berries",category:"material",stack:30},
"woodland-herb":{label:"Woodland Herb",category:"material",stack:20},reed:{label:"Reed",category:"material",stack:50},ore:{label:"Ore",category:"material",stack:50},crystal:{label:"Crystal",category:"material",stack:20},fiber:{label:"Fiber",category:"material",stack:50}
});
const RECIPES=Object.freeze({wooden_axe:{costs:{wood:15}},wooden_pickaxe:{costs:{wood:15}},wooden_hoe:{costs:{wood:12,fiber:4}}});
function createInventory(){return Object.fromEntries(Object.keys(ITEMS).map(k=>[k,0]))}
module.exports={ITEMS,RECIPES,createInventory};
