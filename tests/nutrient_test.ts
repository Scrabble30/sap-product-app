import { assertEquals } from "@std/assert/equals";
import { Nutrients } from "../src/models/nutrients.ts";
import { ItemService } from "../src/sap/services/item-service.ts";
import { NutrientsService } from "../src/services/nutrients-service.ts";

Deno.test(async function getNutrientsTest() {
  const item = await ItemService.getItem("0021050008");
  const ingredients = await ItemService.getIngredients(item);

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

  const actualNutrients = NutrientsService.calculateNutrition(ingredients);

  for (const key in expectedNutrients) {
    const nutrientKey = key as keyof Nutrients;
    const expected = expectedNutrients[nutrientKey];
    const actual = Math.round(actualNutrients[nutrientKey] * 100) / 100;

    assertEquals(actual, expected);
  }
});
