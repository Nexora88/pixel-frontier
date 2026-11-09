const ITEMS=Object.freeze({wood:{label:"Wood",stack:99},stone:{label:"Stone",stack:99},berries:{label:"Berries",stack:30},"woodland-herb":{label:"Woodland Herb",stack:20},reed:{label:"Reed",stack:50},ore:{label:"Ore",stack:50},crystal:{label:"Crystal",stack:20},fiber:{label:"Fiber",stack:50}});
const RECIPES=Object.freeze({wall:{costs:{wood:3,stone:1}},campfire:{costs:{wood:4,stone:2}},door:{costs:{wood:5}},chest:{costs:{wood:8,stone:2}}});
function createInventory(){return Object.fromEntries(Object.keys(ITEMS).map(k=>[k,0]))}
module.exports={ITEMS,RECIPES,createInventory};