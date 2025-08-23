import { assertEquals } from "@std/assert";
import { Allergens, AllergenStatus } from "../src/models/allergens.ts";
import { AllergensService } from "../src/services/allergens-service.ts";
import { ItemService } from "../src/sap/services/item-service.ts";

Deno.test(async function aggregateAllergensTest() {
  const item = await ItemService.getItem("0021050008");
  const ingredients = await ItemService.getIngredients(item);

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

  const actualAllergens = AllergensService.aggregateAllergens(ingredients);

  for (const key in expectedAllergens) {
    const allergenKey = key as keyof Allergens;

    const expectedAllergen = expectedAllergens[allergenKey];
    const actualAllergen = actualAllergens[allergenKey];

    assertEquals(actualAllergen, expectedAllergen);
  }
});
