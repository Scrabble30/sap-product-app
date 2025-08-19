import { IngredientUsage, isIngredient } from "../../domain/ingredient.ts";
import { AllergenStatus } from "../../domain/allergens.ts";
import { Item } from "../../domain/item.ts";
import { getProductTree } from "./product-tree-service.ts";
import { sapFetch } from "./sap-service.ts";

function parseLocalizedNumber(value?: string, fieldName?: string): number {
  if (!value) {
    throw new Error(
      `Numeric value${fieldName ? ` for ${fieldName}` : ""} is missing or empty`
    );
  }

  const parsed = parseFloat(value.replace(",", "."));

  if (isNaN(parsed)) {
    throw new Error(
      `Invalid numeric value${fieldName ? ` for ${fieldName}` : ""}: ${value}`
    );
  }

  return parsed;
}

function parseAllergenStatus(value?: string): AllergenStatus {
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

export function isValidItemCode(itemCode: string): boolean {
  return Boolean(itemCode) && /^\d+$/.test(itemCode);
}

/**
 * Retrieves a single item with selected fields.
 *
 * @param itemCode Identifier of the item.
 */
export async function getItem(itemCode: string): Promise<Item> {
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

  const data = await sapFetch(`/Items('${itemCode}')?$select=${selectQuery}`);

  const item: Item = {
    itemCode: data.ItemCode,
    itemName: data.ItemName,
    treeType: data.TreeType,
    uCCFType: data.U_CCF_Type,
    ingredientsDescriptionDa: data.U_CCF_Ingrediens_DA,
  };

  if (item.uCCFType === "Råvare") {
    item.nutrients = {
      energyKj: parseLocalizedNumber(data.U_BOYX_Energi),
      energyKcal: parseLocalizedNumber(data.U_BOYX_Energik),
      fat: parseLocalizedNumber(data.U_BOYX_fedt),
      fattyAcid: parseLocalizedNumber(data.U_BOYX_fedtsyre),
      carbohydrate: parseLocalizedNumber(data.U_BOYX_Kulhydrat),
      sugars: parseLocalizedNumber(data.U_BOYX_sukkerarter),
      protein: parseLocalizedNumber(data.U_BOYX_Protein),
      salt: parseLocalizedNumber(data.U_BOYX_salt),
    };

    item.allergens = {
      gluten: parseAllergenStatus(data.U_BOYX_gluten),
      shellfish: parseAllergenStatus(data.U_BOYX_Krebsdyr),
      egg: parseAllergenStatus(data.U_BOYX_aag),
      fish: parseAllergenStatus(data.U_BOYX_fisk),
      peanut: parseAllergenStatus(data.U_BOYX_JN),
      soy: parseAllergenStatus(data.U_BOYX_soja),
      milk: parseAllergenStatus(data.U_BOYX_ML),
      almond: parseAllergenStatus(data.U_BOYX_mandel),
      hazelnut: parseAllergenStatus(data.U_BOYX_hassel),
      walnut: parseAllergenStatus(data.U_BOYX_val),
      cashew: parseAllergenStatus(data.U_BOYX_Cashe),
      pecan: parseAllergenStatus(data.U_BOYX_Pekan),
      brazilNut: parseAllergenStatus(data.U_BOYX_peka),
      pistachio: parseAllergenStatus(data.U_BOYX_Pistacie),
      macadamiaNut: parseAllergenStatus(data.U_BOYX_Queensland),
      celery: parseAllergenStatus(data.U_BOYX_Selleri),
      mustard: parseAllergenStatus(data.U_BOYX_Sennep),
      sesameSeed: parseAllergenStatus(data.U_BOYX_Sesam),
      sulphurDioxide: parseAllergenStatus(data.U_BOYX_Svovldioxid),
      lupin: parseAllergenStatus(data.U_BOYX_Lupin),
      mollusc: parseAllergenStatus(data.U_BOYX_BL),
    };
  }

  return item;
}

/**
 * Traverse the product tree and collect leaf ingredients with usage quantities.
 */
export async function getIngredients(item: Item): Promise<IngredientUsage[]> {
  if (!["Færdigvare", "HF"].includes(item.uCCFType)) {
    throw new Error(
      `Item is not a finished product or a partial product. UFFCType: ${item.uCCFType}`
    );
  }

  const ingredientMap = new Map<string, IngredientUsage>();

  const itemMap = new Map<string, Item>();
  const productTreeMap = new Map();

  // Initial product tree for the top-level item
  const rootTree = await getProductTree(item.itemCode);
  const rootTreeLines = rootTree["ProductTreeLines"];

  // Put the root tree lines into the stack for processing
  const stack = [...rootTreeLines];

  while (stack.length > 0) {
    // Pop a tree line from the stack
    const currentTreeLine = stack.pop();
    const itemCode = currentTreeLine.ItemCode;

    // Skip if item has no item code
    if (!isValidItemCode(itemCode)) continue;

    try {
      let item: Item;

      if (itemMap.has(itemCode)) {
        item = itemMap.get(itemCode)!;
      } else {
        item = await getItem(itemCode);
        itemMap.set(itemCode, item);
      }

      // If this item is itself an assembly, traverse its product tree
      if (item.treeType === "iProductionTree") {
        let productTree;

        if (productTreeMap.has(itemCode)) {
          productTree = productTreeMap.get(itemCode)!;
        } else {
          productTree = await getProductTree(itemCode);
          productTreeMap.set(itemCode, productTree);
        }

        stack.push(...productTree["ProductTreeLines"]);
      }

      // If the item is an ingredient, accumulate its usage
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
