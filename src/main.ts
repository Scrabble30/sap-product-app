import { AllergensService } from "./services/allergens-service.ts";
import { IngredientService } from "./services/ingredient-service.ts";
import { ItemService } from "./sap/services/item-service.ts";
import { NutrientsService } from "./services/nutrients-service.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const item = await ItemService.getItem("0021050008");

  console.log(item);

  const ingredients = await ItemService.getIngredients(item);

  console.log("Ingredients:", ingredients.length);
  console.log(ingredients);

  const nutritionalContent = NutrientsService.calculateNutrition(ingredients);

  console.log("NutritionalContent:", nutritionalContent);

  const allergens = AllergensService.aggregateAllergens(ingredients);

  console.log("Allergens:", allergens);

  const ingredientsDescriptionDa =
    IngredientService.buildIngridientsDescriptionDa(ingredients);

  console.log(ingredientsDescriptionDa);
}
