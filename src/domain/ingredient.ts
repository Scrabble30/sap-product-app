import { Item } from "./item.ts";
import {
  aggregateAllergens,
  Allergens,
  buildAllergensDescriptionDa,
} from "./allergens.ts";
import { Nutrients } from "./nutrition.ts";

// Ingredient nutritional and allergens information
export interface Ingredient extends Item {
  /** Nutritional info per 100g */
  nutrients: Nutrients;

  /** Allergen info */
  allergens: Allergens;

  /** Danish ingredients description */
  ingredientsDescriptionDa: string;
}

export interface IngredientUsage {
  /** The ingredient */
  ingredient: Ingredient;

  /** Quantity in kilograms (kg) */
  quantity: number;
}

export function isIngredient(item: Item): item is Ingredient {
  return (
    item.uCCFType === "Råvare" &&
    item.nutrients !== undefined &&
    item.allergens !== undefined
  );
}

export function buildIngridientsDescriptionDa(
  ingredients: IngredientUsage[]
): string {
  // Total quantity of all ingredients (in kg)
  const totalQuantity = ingredients.reduce(
    (sum, usage) => usage.quantity + sum,
    0
  );

  if (totalQuantity === 0) {
    throw new Error("Total quantity of ingredients is zero.");
  }

  let hasDarkChocolate = false;
  let hasMilkChocolate = false;

  const ingredientsDescriptions = ingredients
    .slice()
    .sort((a, b) => b.quantity - a.quantity)
    .map((usage) => {
      const ingredient = usage.ingredient;
      const description = ingredient.ingredientsDescriptionDa ?? "";
      // TO-DO. Fix potential rounding error
      const ratio = Math.round((usage.quantity / totalQuantity) * 100);

      const splitIndex = description.indexOf(" (");

      let name: string;
      let details: string;

      if (splitIndex > 0) {
        name = description.substring(0, splitIndex).trim();
        details = description.substring(splitIndex).trim();
      } else {
        name = description.trim();
        details = "";
      }

      const lowerDescription = description.toLowerCase();
      if (!hasDarkChocolate && lowerDescription.includes("mørk chokolade")) {
        hasDarkChocolate = true;
      }
      if (!hasMilkChocolate && lowerDescription.includes("mælke-chokolade")) {
        hasMilkChocolate = true;
      }

      return `${name} (${ratio}%)${details ? " " + details : ""}`;
    });

  let resultIngredientsDescription = ingredientsDescriptions.join(", ");

  if (hasDarkChocolate) {
    resultIngredientsDescription += ". Mørk chokolade: Mindst 60% kakaotørstof";
  }
  if (hasMilkChocolate) {
    resultIngredientsDescription += ". Mælkechokolade: Mindst 35% kakaotørstof";
  }

  const productAllergens = aggregateAllergens(ingredients);
  const allergenDescription = buildAllergensDescriptionDa(productAllergens);
  if (allergenDescription) {
    resultIngredientsDescription += `. ${allergenDescription}`;
  }

  return resultIngredientsDescription;
}
