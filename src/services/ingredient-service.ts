import { Ingredient, IngredientUsage } from "../models/ingredient.ts";
import { Item } from "../models/item.ts";
import { AllergensService } from "./allergens-service.ts";

export class IngredientService {
  /**
   * Type guard to check if an Item is an Ingredient with nutrients and allergens info.
   *
   * @param item The item to check.
   * @returns True if the item is an Ingredient.
   */
  static isIngredient(item: Item): item is Ingredient {
    return (
      item.uCCFType === "Råvare" &&
      item.nutrients !== undefined &&
      item.allergens !== undefined
    );
  }

  /**
   * Builds a Danish description string for given ingredient usages,
   * including percentages and allergen info.
   *
   * @param ingredients List of ingredient usages.
   * @returns Localized Danish description string summarizing ingredients and potential allergens.
   * @throws If total quantity is zero.
   */
  static buildIngridientsDescriptionDa(ingredients: IngredientUsage[]): string {
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

    if (resultIngredientsDescription) {
      resultIngredientsDescription += ".";
    }

    if (hasDarkChocolate) {
      resultIngredientsDescription +=
        " Mørk chokolade: Mindst 60% kakaotørstof.";
    }
    if (hasMilkChocolate) {
      resultIngredientsDescription +=
        " Mælkechokolade: Mindst 35% kakaotørstof.";
    }

    const productAllergens = AllergensService.aggregateAllergens(ingredients);
    const allergenDescription =
      AllergensService.buildAllergensDescriptionDa(productAllergens);
    if (allergenDescription) {
      resultIngredientsDescription += `. ${allergenDescription}`;
    }

    return resultIngredientsDescription;
  }
}
