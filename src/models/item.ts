import { Allergens } from "./allergens.ts";
import { Nutrients } from "./nutrients.ts";

/**
 * Represents a generic item.
 */
export interface Item {
  /** Unique item identifier */
  itemCode: string;

  /** Item name */
  itemName: string;

  /** Indicates if the item is a product tree or a leaf node */
  treeType: string;

  /** Internal item type classification */
  uCCFType: string;

  /** Nutritional info per 100g (optional) */
  nutrients?: Nutrients;

  /** Allergen info (optional) */
  allergens?: Allergens;

  /** Danish ingredients description (optional) */
  ingredientsDescriptionDa?: string;
}
