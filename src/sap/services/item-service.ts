import { IngredientUsage, isIngredient } from "../../domain/ingredient.ts";
import { AllergenStatus } from "../../domain/allergens.ts";
import { Item } from "../../domain/item.ts";
import { ProductTreeService } from "./product-tree-service.ts";
import { SapService } from "./sap-service.ts";

export class ItemService {
  /**
   * Parses a localized string-represented number to a float.
   *
   * @param value The string value to parse.
   * @returns Parsed floating point number.
   * @throws If the value is missing, empty, or not a valid number.
   */
  private static parseLocalizedNumber(value?: string): number {
    if (!value) {
      throw new Error("Numeric value is missing or empty");
    }

    const parsed = parseFloat(value.replace(",", "."));

    if (isNaN(parsed)) {
      throw new Error(`Invalid numeric value: ${value}`);
    }

    return parsed;
  }

  /**
   * Converts a string value to an AllergenStatus enum value.
   *
   * @param value The string representation of allergen status.
   * @returns Corresponding AllergenStatus enum.
   * @throws If the value is missing or unknown.
   */
  private static parseAllergenStatus(value?: string): AllergenStatus {
    if (!value) {
      throw new Error("Allergen status is missing or empty");
    }
    switch (value) {
      case "Free from":
        return AllergenStatus.FreeFrom;
      case "May contain traces of":
        return AllergenStatus.MayContainTraces;
      case "In product":
        return AllergenStatus.InProduct;
      default:
        throw new Error(`Unknown allergen status: ${value}`);
    }
  }

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

    const data = await SapService.sapFetch(
      `/Items('${itemCode}')?$select=${selectQuery}`
    );

    const item: Item = {
      itemCode: data.ItemCode,
      itemName: data.ItemName,
      treeType: data.TreeType,
      uCCFType: data.U_CCF_Type,
    };

    if (item.uCCFType === "Råvare") {
      item.nutrients = {
        energyKj: this.parseLocalizedNumber(data.U_BOYX_Energi),
        energyKcal: this.parseLocalizedNumber(data.U_BOYX_Energik),
        fat: this.parseLocalizedNumber(data.U_BOYX_fedt),
        fattyAcid: this.parseLocalizedNumber(data.U_BOYX_fedtsyre),
        carbohydrate: this.parseLocalizedNumber(data.U_BOYX_Kulhydrat),
        sugars: this.parseLocalizedNumber(data.U_BOYX_sukkerarter),
        protein: this.parseLocalizedNumber(data.U_BOYX_Protein),
        salt: this.parseLocalizedNumber(data.U_BOYX_salt),
      };

      item.allergens = {
        gluten: this.parseAllergenStatus(data.U_BOYX_gluten),
        shellfish: this.parseAllergenStatus(data.U_BOYX_Krebsdyr),
        egg: this.parseAllergenStatus(data.U_BOYX_aag),
        fish: this.parseAllergenStatus(data.U_BOYX_fisk),
        peanut: this.parseAllergenStatus(data.U_BOYX_JN),
        soy: this.parseAllergenStatus(data.U_BOYX_soja),
        milk: this.parseAllergenStatus(data.U_BOYX_ML),
        almond: this.parseAllergenStatus(data.U_BOYX_mandel),
        hazelnut: this.parseAllergenStatus(data.U_BOYX_hassel),
        walnut: this.parseAllergenStatus(data.U_BOYX_val),
        cashew: this.parseAllergenStatus(data.U_BOYX_Cashe),
        pecan: this.parseAllergenStatus(data.U_BOYX_Pekan),
        brazilNut: this.parseAllergenStatus(data.U_BOYX_peka),
        pistachio: this.parseAllergenStatus(data.U_BOYX_Pistacie),
        macadamiaNut: this.parseAllergenStatus(data.U_BOYX_Queensland),
        celery: this.parseAllergenStatus(data.U_BOYX_Selleri),
        mustard: this.parseAllergenStatus(data.U_BOYX_Sennep),
        sesameSeed: this.parseAllergenStatus(data.U_BOYX_Sesam),
        sulphurDioxide: this.parseAllergenStatus(data.U_BOYX_Svovldioxid),
        lupin: this.parseAllergenStatus(data.U_BOYX_Lupin),
        mollusc: this.parseAllergenStatus(data.U_BOYX_BL),
      };

      item.ingredientsDescriptionDa = data.U_CCF_Ingrediens_DA;
    }

    return item;
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
    const productTreeMap = new Map();

    // Retrieve initial product tree for the top-level item.
    const rootTree = await ProductTreeService.getProductTree(item.itemCode);
    const rootTreeLines = rootTree["ProductTreeLines"];

    // Use stack to process all product tree lines.
    const stack = [...rootTreeLines];

    while (stack.length > 0) {
      // Pop the next tree line.
      const currentTreeLine = stack.pop();
      const itemCode = currentTreeLine.ItemCode;

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

          for (const productTreeLine of productTree["ProductTreeLines"]) {
            stack.push({
              ...productTreeLine,
              Quantity: currentTreeLine.Quantity * productTreeLine.Quantity,
            });
          }
        }

        // If item is an ingredient, accumulate its quantity.
        if (isIngredient(item)) {
          if (ingredientMap.has(itemCode)) {
            ingredientMap.get(itemCode)!.quantity += currentTreeLine.Quantity;
          } else {
            ingredientMap.set(itemCode, {
              ingredient: item,
              quantity: currentTreeLine.Quantity,
            });
          }
        }
      } catch (error) {
        console.error(
          `Failed to fetch item (${currentTreeLine.ItemCode})`,
          error
        );
      }
    }

    return Array.from(ingredientMap.values());
  }
}
