const test = require("node:test");
const assert = require("node:assert/strict");
const { damageEquippedTool, getDurability, maxDurability, validateSlot } = require("./InventoryRules");

test("tool durability starts at its catalog maximum and decreases", () => {
  const equipment = { tool: "wooden_axe" };
  assert.equal(getDurability(equipment), 80);
  const result = damageEquippedTool(equipment, 3);
  assert.equal(result.ok, true);
  assert.equal(result.durability, 77);
  assert.equal(getDurability(equipment), 77);
});

test("a broken tool is unequipped instead of retaining negative durability", () => {
  const equipment = { tool: "primitive_stone", durability: { primitive_stone: 1 } };
  const result = damageEquippedTool(equipment);
  assert.equal(result.broke, "primitive_stone");
  assert.equal(equipment.tool, null);
  assert.equal(equipment.durability.primitive_stone, 0);
});

test("unknown and unequipped tools do not gain invented durability", () => {
  assert.equal(maxDurability("unknown"), 0);
  const equipment = { tool: null };
  assert.equal(damageEquippedTool(equipment).changed, false);
});

test("inventory slots reject malformed quantities and equipment stacks", () => {
  assert.equal(validateSlot(null), true);
  assert.equal(validateSlot({ item: "wood", quantity: 99 }), true);
  assert.equal(validateSlot({ item: "wood", quantity: 100 }), false);
  assert.equal(validateSlot({ item: "wooden_axe", quantity: 2 }), false);
  assert.equal(validateSlot({ item: "not-a-real-item", quantity: 1 }), false);
});
