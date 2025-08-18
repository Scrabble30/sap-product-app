import { assert, assertEquals, assertExists, assertFalse } from "@std/assert";
import { login } from "./sap-auth.ts";
import {
  Allergens,
  AllergenStatus,
  calculateNutritionalContent,
  getItem,
  getProductAllergens,
  getRawMaterials,
  isValidItemCode,
  Nutrients,
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

Deno.test(async function getNutrientsTest() {
  const itemCode = "0021050008";
  const rawMaterials = await getRawMaterials(itemCode);

  const expectedNutritionalContent: Nutrients = {
    energyKj: 2132.1,
    energyKcal: 509.39,
    fat: 34.78,
    fattyAcid: 10.23,
    carbohydrate: 35.37,
    sugars: 31.82,
    protein: 10.35,
    salt: 0.02,
  };

  const actualNutritionalContent = calculateNutritionalContent(rawMaterials);

  for (const key of Object.keys(
    expectedNutritionalContent
  ) as (keyof typeof expectedNutritionalContent)[]) {
    const expected = expectedNutritionalContent[key];
    const actual = Math.round(actualNutritionalContent[key] * 100) / 100;

    if (Math.abs(expected - actual) > 0.001) {
      throw new Error(
        `Value mismatch on ${key}: expected approx ${expected} ±${0.001}, got ${actual}`
      );
    }
  }
});

Deno.test(async function getProductAllergensTest() {
  const itemCode = "0021050008";
  const rawMaterials = await getRawMaterials(itemCode);

  const expectedAllergens: Allergens = {
    glutenAllergen: AllergenStatus.FreeFrom,
    shellfishAllergen: AllergenStatus.FreeFrom,
    eggAllergen: AllergenStatus.FreeFrom,
    fishAllergen: AllergenStatus.FreeFrom,
    peanutAllergen: AllergenStatus.FreeFrom,
    soyAllergen: AllergenStatus.InProduct,
    milkAllergen: AllergenStatus.FreeFrom,
    almondAllergen: AllergenStatus.InProduct,
    hazelnutAllergen: AllergenStatus.FreeFrom,
    walnutAllergen: AllergenStatus.FreeFrom,
    cashewAllergen: AllergenStatus.FreeFrom,
    pecanAllergen: AllergenStatus.FreeFrom,
    brazilNutAllergen: AllergenStatus.FreeFrom,
    pistachioAllergen: AllergenStatus.FreeFrom,
    macadamiaNutAllergen: AllergenStatus.FreeFrom,
    celeryAllergen: AllergenStatus.FreeFrom,
    mustardAllergen: AllergenStatus.FreeFrom,
    sesameSeedAllergen: AllergenStatus.FreeFrom,
    sulphurDioxideAllergen: AllergenStatus.FreeFrom,
    lupinAllergen: AllergenStatus.FreeFrom,
    molluscAllergen: AllergenStatus.FreeFrom,
  };

  const actualAllergens = getProductAllergens(rawMaterials);

  for (const key in expectedAllergens) {
    const allergenKey = key as keyof Allergens;

    const expectedAllergen = expectedAllergens[allergenKey];
    const actualAllergen = actualAllergens[allergenKey];

    assertEquals(actualAllergen, expectedAllergen);
  }
});
