import { Allergens } from "./allergens.ts";
import { Nutrients } from "./nutrition.ts";

// Generic item interface
export interface Item {
  /** Unique item identifier */
  itemCode: string;

  /** Item name */
  itemName: string;

  /** Indicates if the item is a product tree or a leaf node */
  treeType: string;

  /** Internal item type classification */
  uCCFType: string;

  /** Nutritional info per 100g */
  nutrients?: Nutrients;

  /** Allergen info */
  allergens?: Allergens;

  /** Danish ingredients description */
  ingredientsDescriptionDa?: string;
}
