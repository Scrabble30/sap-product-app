import { IngredientUsage } from "../../src/models/ingredient.ts";

export function sortIngredientUsagesByItemCode(arr: IngredientUsage[]) {
  return [...arr].sort((a, b) =>
    a.ingredient.itemCode.localeCompare(b.ingredient.itemCode)
  );
}
