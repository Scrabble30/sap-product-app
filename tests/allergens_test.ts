import { assertEquals } from "@std/assert";
import {
  aggregateAllergens,
  Allergens,
  AllergenStatus,
} from "../src/domain/allergens.ts";
import { getIngredients, getItem } from "../src/sap/services/item-service.ts";

Deno.test(async function aggregateAllergensTest() {
  const item = await getItem("0021050008");
  const ingredients = await getIngredients(item);

  const expectedAllergens: Allergens = {
    gluten: AllergenStatus.FreeFrom,
    shellfish: AllergenStatus.FreeFrom,
    egg: AllergenStatus.FreeFrom,
    fish: AllergenStatus.FreeFrom,
    peanut: AllergenStatus.FreeFrom,
    soy: AllergenStatus.InProduct,
    milk: AllergenStatus.FreeFrom,
    almond: AllergenStatus.InProduct,
    hazelnut: AllergenStatus.FreeFrom,
    walnut: AllergenStatus.FreeFrom,
    cashew: AllergenStatus.FreeFrom,
    pecan: AllergenStatus.FreeFrom,
    brazilNut: AllergenStatus.FreeFrom,
    pistachio: AllergenStatus.FreeFrom,
    macadamiaNut: AllergenStatus.FreeFrom,
    celery: AllergenStatus.FreeFrom,
    mustard: AllergenStatus.FreeFrom,
    sesameSeed: AllergenStatus.FreeFrom,
    sulphurDioxide: AllergenStatus.FreeFrom,
    lupin: AllergenStatus.FreeFrom,
    mollusc: AllergenStatus.FreeFrom,
  };

  const actualAllergens = aggregateAllergens(ingredients);

  for (const key in expectedAllergens) {
    const allergenKey = key as keyof Allergens;

    const expectedAllergen = expectedAllergens[allergenKey];
    const actualAllergen = actualAllergens[allergenKey];

    assertEquals(actualAllergen, expectedAllergen);
  }
});
