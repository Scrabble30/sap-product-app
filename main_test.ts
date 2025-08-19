import { assert, assertEquals, assertExists, assertFalse } from "@std/assert";
import { login } from "./sap-auth.ts";
import {
  getItem,
  getRawMaterials,
  isValidItemCode,
} from "./sap-item-service.ts";

Deno.test(async function loginTest() {
  const session = await login();

  assertExists(session);
  assertExists(session.id);
});

Deno.test(function isValidItemCodeTest() {
  const validItemCode = isValidItemCode("0021050008");

  assert(validItemCode);

  const invalidItemCode = isValidItemCode("KS'ER");

  assertFalse(invalidItemCode);
});

Deno.test(async function getItemTest() {
  const itemCode = "0021050008";
  const item = await getItem(itemCode);

  assertExists(item);
  assertEquals(item.ItemCode, itemCode);
});

Deno.test(async function getRawMaterialsTest() {
  const itemCode = "0021050008";

  const expectedRawMaterials = [
    {
      rawMaterial: {
        itemCode: "0000005100",
        itemName: "Mørk chokolade Callebaut (CHD-P60ZV-105)",
      },
      quantity: 0.0147,
    },
    {
      rawMaterial: {
        itemCode: "0000005500",
        itemName: "Marcipan valencia 60% uden kons (560015)",
      },
      quantity: 0.02808,
    },
  ];

  const actualRawMaterials = await getRawMaterials(itemCode);

  assertEquals(actualRawMaterials.length, expectedRawMaterials.length);

  for (let i = 0; i < actualRawMaterials.length; i++) {
    const expectedRawMaterialLine = expectedRawMaterials[i];
    const expectedRawMaterial = expectedRawMaterialLine.rawMaterial;

    const actualRawMaterialLine = actualRawMaterials[i];
    const actualRawMaterial = actualRawMaterialLine.rawMaterial;

    if (!expectedRawMaterialLine) {
      throw new Error(
        `Missing expected: ${
          (actualRawMaterial.itemCode, actualRawMaterial.itemName)
        }`
      );
    }

    if (!actualRawMaterialLine) {
      throw new Error(
        `Missing expected: ${
          (expectedRawMaterial.itemCode, expectedRawMaterial.itemName)
        }`
      );
    }

    assertEquals(actualRawMaterial.itemCode, expectedRawMaterial.itemCode);
    assertEquals(actualRawMaterial.itemName, expectedRawMaterial.itemName);
    assertEquals(
      actualRawMaterialLine.quantity,
      expectedRawMaterialLine.quantity
    );
  }
});
