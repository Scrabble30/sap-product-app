import { aggregateAllergens } from "./domain/allergens.ts";
import { buildIngridientsDescriptionDa } from "./domain/ingredient.ts";
import { calculateNutrition } from "./domain/nutrition.ts";
import { ItemService } from "./sap/services/item-service.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const item = await ItemService.getItem("0021050008");

  console.log(item);

  const ingredients = await ItemService.getIngredients(item);

  console.log("Ingredients:", ingredients.length);
  console.log(ingredients);

  const nutritionalContent = calculateNutrition(ingredients);

  console.log("NutritionalContent:", nutritionalContent);

  const allergens = aggregateAllergens(ingredients);

  console.log("Allergens:", allergens);

  const ingredientsDescriptionDa = buildIngridientsDescriptionDa(ingredients);

  console.log(ingredientsDescriptionDa);
}
