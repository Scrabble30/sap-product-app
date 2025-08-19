import { assert, assertEquals, assertExists, assertFalse } from "@std/assert";
import {
  getIngredients,
  getItem,
  isValidItemCode,
} from "../src/sap/services/item-service.ts";

Deno.test(function isValidItemCode_Valid_ItemCode_Test() {
  const validItemCode = isValidItemCode("0021050008");

  assert(validItemCode);
});

Deno.test(function isValidItemCode_Invalid_ItemCode_Test() {
  const invalidItemCode = isValidItemCode("KS'ER");

  assertFalse(invalidItemCode);
});

Deno.test(async function getItemTest() {
  const itemCode = "0021050008";
  const item = await getItem(itemCode);

  assertExists(item);
  assertEquals(item.itemCode, itemCode);
});

Deno.test(async function getIngredientsTest() {
  const item = await getItem("0021050008");

  const expectedIngredients = [
    {
      ingredient: {
        itemCode: "0000005100",
        itemName: "Mørk chokolade Callebaut (CHD-P60ZV-105)",
      },
      quantity: 0.0147,
    },
    {
      ingredient: {
        itemCode: "0000005500",
        itemName: "Marcipan valencia 60% uden kons (560015)",
      },
      quantity: 0.02808,
    },
  ];

  const actualIngredients = await getIngredients(item);

  assertEquals(actualIngredients.length, expectedIngredients.length);

  for (let i = 0; i < actualIngredients.length; i++) {
    const expectedUsage = expectedIngredients[i];
    const expectedIngredient = expectedUsage.ingredient;

    const actualUsage = actualIngredients[i];
    const actualIngredient = actualUsage.ingredient;

    if (!expectedUsage) {
      throw new Error(
        `Missing expected: ${
          (actualIngredient.itemCode, actualIngredient.itemName)
        }`
      );
    }

    if (!actualUsage) {
      throw new Error(
        `Missing expected: ${
          (expectedIngredient.itemCode, expectedIngredient.itemName)
        }`
      );
    }

    assertEquals(actualIngredient.itemCode, expectedIngredient.itemCode);
    assertEquals(actualIngredient.itemName, expectedIngredient.itemName);
    assertEquals(actualUsage.quantity, expectedUsage.quantity);
  }
});
