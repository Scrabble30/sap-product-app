import { IngredientUsage } from "../models/ingredient.ts";
import { Nutrients } from "../models/nutrients.ts";

export class NutrientsService {
  /**
   * Creates a complete Nutrients object with provided values,
   * defaulting all unspecified fields to zero.
   *
   * @param overrides Partial fields to override.
   * @returns Fully populated Nutrients object.
   */
  static createNutrients(overrides: Partial<Nutrients> = {}): Nutrients {
    // Initialize all nutrients to zero
    const base: Nutrients = {
      energyKj: 0,
      energyKcal: 0,
      fat: 0,
      fattyAcid: 0,
      carbohydrate: 0,
      sugars: 0,
      protein: 0,
      salt: 0,
    };

    return { ...base, ...overrides };
  }

  /**
   * Calculates the combined nutritional values per 100g
   * based on given ingredients and their quantities.
   *
   * @param ingredients List of ingredients with quantities in kg.
   * @returns Nutritional content per 100g based on the ingredients.
   * @throws If the total quantity is zero.
   */
  static calculateNutrition(ingredients: IngredientUsage[]): Nutrients {
    // Total quantity of all ingredients (in kg)
    const totalQuantity = ingredients.reduce(
      (sum, usage) => usage.quantity + sum,
      0
    );

    if (totalQuantity === 0) {
      throw new Error("Total quantity of ingredients is zero.");
    }

    const resultNutrition: Nutrients = this.createNutrients();

    for (const usage of ingredients) {
      const nutrients = usage.ingredient.nutrients;
      const ratio = usage.quantity / totalQuantity;

      for (const key in nutrients) {
        const nutrientKey = key as keyof Nutrients;
        resultNutrition[nutrientKey] += nutrients[nutrientKey] * ratio;
      }
    }

    return resultNutrition;
  }
}
