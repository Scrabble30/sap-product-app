import { IngredientUsage } from "../../models/ingredient.ts";
import { Item } from "../../models/item.ts";
import { ProductTreeService } from "./product-tree-service.ts";
import { SapService } from "./sap-service.ts";
import { IngredientService } from "../../services/ingredient-service.ts";
import { SapItemData } from "../models/sap-item-data.ts";
import { mapSapItemDataToItem } from "../mapper/sap-item-mapper.ts";
import { ProductTree } from "../../models/ProductTree.ts";

export class ItemService {
  /**
   * Validates if the given item code string consists only of digits.
   *
   * @param itemCode The item code to validate.
   * @returns True if valid numeric code.
   */
  static isValidItemCode(itemCode: string): boolean {
    return Boolean(itemCode) && /^\d+$/.test(itemCode);
  }

  /**
   * Retrieves a single item with selected fields.
   *
   * @param itemCode Identifier of the item to retrieve.
   * @returns A promise resolving to the fetched Item object.
   */
  static async getItem(itemCode: string): Promise<Item> {
    const fields = [
      "ItemCode",
      "ItemName",
      "TreeType",
      "U_CCF_Type",
      // Nutrients
      "U_BOYX_Energi",
      "U_BOYX_Energik",
      "U_BOYX_fedt",
      "U_BOYX_fedtsyre",
      "U_BOYX_Kulhydrat",
      "U_BOYX_sukkerarter",
      "U_BOYX_Protein",
      "U_BOYX_salt",
      // Allergen fields
      "U_BOYX_gluten",
      "U_BOYX_Krebsdyr",
      "U_BOYX_aag",
      "U_BOYX_fisk",
      "U_BOYX_JN",
      "U_BOYX_soja",
      "U_BOYX_ML",
      "U_BOYX_mandel",
      "U_BOYX_hassel",
      "U_BOYX_val",
      "U_BOYX_Cashe",
      "U_BOYX_Pekan",
      "U_BOYX_peka",
      "U_BOYX_Pistacie",
      "U_BOYX_Queensland",
      "U_BOYX_Selleri",
      "U_BOYX_Sennep",
      "U_BOYX_Sesam",
      "U_BOYX_Svovldioxid",
      "U_BOYX_Lupin",
      "U_BOYX_BL",
      // Ingredients description
      "U_CCF_Ingrediens_DA",
    ];

    const selectQuery = fields.join(",");

    const data: SapItemData = await SapService.sapFetch(
      `/Items('${itemCode}')?$select=${selectQuery}`
    );

    return mapSapItemDataToItem(data);
  }

  /**
   * Traverses the product tree of a finished or partial product item and collects all leaf ingredients with their usage quantities.
   *
   * @param item The starting product item. Must be a finished or partial product.
   * @returns A promise resolving to an array of IngredientUsage objects representing all leaf ingredients and their quantities.
   * @throws If the given item is not a finished or partial product.
   */
  static async getIngredients(item: Item): Promise<IngredientUsage[]> {
    if (!["Færdigvare", "HF"].includes(item.uCCFType)) {
      throw new Error(
        `Item is not a finished product or a partial product. UFFCType: ${item.uCCFType}`
      );
    }

    const ingredientMap = new Map<string, IngredientUsage>();

    const itemMap = new Map<string, Item>();
    const productTreeMap = new Map<string, ProductTree>();

    // Retrieve initial product tree for the top-level item.
    const rootTree = await ProductTreeService.getProductTree(item.itemCode);
    const rootTreeLines = rootTree.productTreeLines;

    // Use stack to process all product tree lines.
    const stack = [...rootTreeLines];

    while (stack.length > 0) {
      // Pop the next tree line.
      const currentTreeLine = stack.pop();

      if (!currentTreeLine) continue;

      const itemCode = currentTreeLine.itemCode;

      // Skip invalid item codes.
      if (!this.isValidItemCode(itemCode)) continue;

      try {
        let item: Item;

        // Use cached item if available.
        if (itemMap.has(itemCode)) {
          item = itemMap.get(itemCode)!;
        } else {
          item = await this.getItem(itemCode);
          itemMap.set(itemCode, item);
        }

        // If item is an assembly, traverse its sub-product tree.
        if (item.treeType === "iProductionTree") {
          let productTree;

          if (productTreeMap.has(itemCode)) {
            productTree = productTreeMap.get(itemCode)!;
          } else {
            productTree = await ProductTreeService.getProductTree(itemCode);
            productTreeMap.set(itemCode, productTree);
          }

          for (const productTreeLine of productTree.productTreeLines) {
            stack.push({
              ...productTreeLine,
              quantity: currentTreeLine.quantity * productTreeLine.quantity,
            });
          }
        }

        // If item is an ingredient, accumulate its quantity.
        if (IngredientService.isIngredient(item)) {
          if (ingredientMap.has(itemCode)) {
            ingredientMap.get(itemCode)!.quantity += currentTreeLine.quantity;
          } else {
            ingredientMap.set(itemCode, {
              ingredient: item,
              quantity: currentTreeLine.quantity,
            });
          }
        }
      } catch (error) {
        console.error(
          `Failed to fetch item (${currentTreeLine.itemCode})`,
          error
        );
      }
    }

    return Array.from(ingredientMap.values());
  }
}
