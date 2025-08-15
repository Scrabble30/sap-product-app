import { getProductTree } from "./sap-product-tree-service.ts";
import { sapFetch } from "./sap-service.ts";

// Generic item interface
export interface Item {
  itemCode: string;
  itemName: string;
  treeType: string;
  uCCFType: string;

  /** Energy in kilojoules (kJ) per 100g, if applicable */
  energyKj?: number;

  /** Energy in kilocalories (kcal) per 100g, if applicable */
  energyKcal?: number;

  /** Fat in grams (g) per 100g, if applicable */
  fat?: number;

  /** Fatty acid in grams (g) per 100g, if applicable */
  fattyAcid?: number;

  /** Carbohydrate in grams (g) per 100g, if applicable */
  carbohydrate?: number;

  /** Sugars in grams (g) per 100g, if applicable */
  sugars?: number;

  /** Protein in grams (g) per 100g, if applicable */
  protein?: number;

  /** Salt in grams (g) per 100g, if applicable */
  salt?: number;
}

// Raw material with nutritional information
export interface RawMaterial extends Item {
  /** Energy in kilojoules (kJ) per 100g */
  energyKj: number;

  /** Energy in kilocalories (kcal) per 100g */
  energyKcal: number;

  /** Fat in grams (g) per 100g */
  fat: number;

  /** Fatty acid in grams (g) per 100g */
  fattyAcid: number;

  /** Carbohydrate in grams (g) per 100g */
  carbohydrate: number;

  /** Sugars in grams (g) per 100g */
  sugars: number;

  /** Protein in grams (g) per 100g */
  protein: number;

  /** Salt in grams (g) per 100g */
  salt: number;
}

export interface RawMaterialLine {
  rawMaterial: RawMaterial;

  /** Quantity in kilograms (kg) */
  quantity: number;
}

function parseLocalizedNumber(value: string): number {
  const normalized = value.replace(",", ".");
  return parseFloat(normalized);
}

function parseOptionalLocalizedNumber(value?: string): number | undefined {
  return value ? parseLocalizedNumber(value) : undefined;
}

export function isValidItemCode(itemCode: string): boolean {
  return Boolean(itemCode) && /^\d+$/.test(itemCode);
}

export function isRawMaterial(item: Item): item is RawMaterial {
  return (
    item.uCCFType === "Råvare" &&
    item.energyKj !== undefined &&
    item.energyKcal !== undefined &&
    item.fat !== undefined &&
    item.fattyAcid !== undefined &&
    item.carbohydrate !== undefined &&
    item.sugars !== undefined &&
    item.protein !== undefined &&
    item.salt !== undefined
  );
}

/**
 * Retrieves a single item with selected fields.
 *
 * @param itemCode Identifier of the item.
 */
export function getItem(itemCode: string) {
  return sapFetch(
    `/Items('${itemCode}')?$select=ItemCode,ItemName,TreeType,U_CCF_Type`
  );
}

/**
 * Retrieves a raw material.
 *
 * @param itemCode Identifier of the raw material (item).
 */
export async function getItemWithNutrients(itemCode: string): Promise<Item> {
  const data = await sapFetch(
    `/Items('${itemCode}')?$select=ItemCode,ItemName,TreeType,U_CCF_Type,U_BOYX_Energi,U_BOYX_Energik,U_BOYX_fedt,U_BOYX_fedtsyre,U_BOYX_Kulhydrat,U_BOYX_sukkerarter,U_BOYX_Protein,U_BOYX_salt`
  );

  return {
    itemCode: data.ItemCode,
    itemName: data.ItemName,
    treeType: data.TreeType,
    uCCFType: data.U_CCF_Type,
    energyKj: parseOptionalLocalizedNumber(data.U_BOYX_Energi),
    energyKcal: parseOptionalLocalizedNumber(data.U_BOYX_Energik),
    fat: parseOptionalLocalizedNumber(data.U_BOYX_fedt),
    fattyAcid: parseOptionalLocalizedNumber(data.U_BOYX_fedtsyre),
    carbohydrate: parseOptionalLocalizedNumber(data.U_BOYX_Kulhydrat),
    sugars: parseOptionalLocalizedNumber(data.U_BOYX_sukkerarter),
    protein: parseOptionalLocalizedNumber(data.U_BOYX_Protein),
    salt: parseOptionalLocalizedNumber(data.U_BOYX_salt),
  };
}

/**
 * Traverse a product tree and collect raw materials.
 */
export async function getRawMaterials(itemCode: string) {
  const resultRawMaterials: RawMaterialLine[] = [];

  // Initial product tree for the top-level item
  const rootTree = await getProductTree(itemCode);
  const rootTreeLines = rootTree["ProductTreeLines"];

  // Put the root tree lines into the stack for processing
  const stack = [...rootTreeLines];

  while (stack.length > 0) {
    // Pop a tree line from the stack
    const currentTreeLine = stack.pop();

    // Skip if item has no item code
    if (!isValidItemCode(currentTreeLine.ItemCode)) continue;

    try {
      const item = await getItemWithNutrients(currentTreeLine.ItemCode);

      // If the item contains a product tree, push the tree lines to the stack
      if (item.treeType === "iProductionTree") {
        const itemTree = await getProductTree(item.itemCode);
        const itemTreeLines = itemTree["ProductTreeLines"];

        stack.push(...itemTreeLines);
      }

      if (isRawMaterial(item)) {
        resultRawMaterials.push({
          rawMaterial: item,
          quantity: currentTreeLine.Quantity,
        });
      }
    } catch (error) {
      console.error(
        `Failed to fetch item (${currentTreeLine.ItemCode})`,
        error
      );
    }
  }

  return resultRawMaterials;
}

/**
 * Computes nutritional values per 100g of the finished product,
 * based on each raw material's composition and proportion of total weight.
 *
 * @param rawMaterials - List of raw materials with quantities in kg.
 * @returns Nutritional content per 100g of final product.
 * @throws If the total quantity is zero.
 */
export function calculateNutritionalContent(rawMaterials: RawMaterialLine[]) {
  // Total quantity of all raw materials (in kg)
  const totalQuantity = rawMaterials.reduce(
    (sum, rawMaterialLine) => rawMaterialLine.quantity + sum,
    0
  );

  if (totalQuantity === 0) {
    throw new Error("Total quantity of raw materials is zero.");
  }

  const resultNutrition = {
    energyKj: 0,
    energyKcal: 0,
    fat: 0,
    fattyAcid: 0,
    carbohydrate: 0,
    sugars: 0,
    protein: 0,
    salt: 0,
  };

  for (const rawMaterialLine of rawMaterials) {
    const rawMaterial = rawMaterialLine.rawMaterial;
    const ratio = rawMaterialLine.quantity / totalQuantity;

    resultNutrition.energyKj += rawMaterial.energyKj * ratio;
    resultNutrition.energyKcal += rawMaterial.energyKcal * ratio;
    resultNutrition.fat += rawMaterial.fat * ratio;
    resultNutrition.fattyAcid += rawMaterial.fattyAcid * ratio;
    resultNutrition.carbohydrate += rawMaterial.carbohydrate * ratio;
    resultNutrition.sugars += rawMaterial.sugars * ratio;
    resultNutrition.protein += rawMaterial.protein * ratio;
    resultNutrition.salt += rawMaterial.salt * ratio;
  }

  return resultNutrition;
}
