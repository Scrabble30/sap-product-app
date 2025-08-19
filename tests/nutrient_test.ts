import { assertEquals } from "@std/assert/equals";
import { calculateNutrition, Nutrients } from "../src/domain/nutrition.ts";
import { getIngredients, getItem } from "../src/sap/services/item-service.ts";

Deno.test(async function getNutrientsTest() {
  const item = await getItem("0021050008");
  const ingredients = await getIngredients(item);

  const expectedNutrients: Nutrients = {
    energyKj: 2132.1,
    energyKcal: 509.39,
    fat: 34.78,
    fattyAcid: 10.23,
    carbohydrate: 35.37,
    sugars: 31.82,
    protein: 10.35,
    salt: 0.02,
  };

  const actualNutrients = calculateNutrition(ingredients);

  for (const key in expectedNutrients) {
    const nutrientKey = key as keyof Nutrients;
    const expected = expectedNutrients[nutrientKey];
    const actual = Math.round(actualNutrients[nutrientKey] * 100) / 100;

    assertEquals(actual, expected);
  }
});
