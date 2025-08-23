import { Item } from "./item.ts";
import { Allergens } from "./allergens.ts";
import { Nutrients } from "./nutrients.ts";

/**
 * Represents an ingredient extending Item with nutritional and allergen info.
 */
export interface Ingredient extends Item {
  /** Nutritional info per 100g */
  nutrients: Nutrients;

  /** Allergen info */
  allergens: Allergens;

  /** Danish ingredients description */
  ingredientsDescriptionDa: string;
}

/**
 * Represents usage of an ingredient with a specific quantity.
 */
export interface IngredientUsage {
  /** The ingredient */
  ingredient: Ingredient;

  /** Quantity in kilograms (kg) */
  quantity: number;
}
