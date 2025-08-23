import { assertEquals } from "@std/assert";
import { ItemService } from "../sap/services/item-service.ts";
import { IngredientService } from "./ingredient-service.ts";

Deno.test(async function buildIngridientsDescriptionDaTest() {
  const item = await ItemService.getItem("0021050008");
  const ingredients = await ItemService.getIngredients(item);

  const expectedIngredientsDescriptionDa =
    "marcipan (66%) (Valencia-MANDLER, sukker, vand, glukosesirup, rønnebærekstrakt), mørk chokolade (34%) (kakaomasse, sukker, kakaosmør, emulgator (SOJALECITIN)). Mørk chokolade: Mindst 60% kakaotørstof";
  const actualIngredientsDescriptionDa =
    IngredientService.buildIngridientsDescriptionDa(ingredients);

  assertEquals(
    actualIngredientsDescriptionDa,
    expectedIngredientsDescriptionDa
  );
});
