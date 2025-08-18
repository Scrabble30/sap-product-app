import { getProductTree } from "./sap-product-tree-service.ts";
import { sapFetch } from "./sap-service.ts";

export interface Nutrients {
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

export enum AllergenStatus {
  FreeFrom = 0,
  MayContainTraces = 1,
  InProduct = 2,
}

export interface Allergens {
  /** Gluten allergen info */
  glutenAllergen: AllergenStatus;

  /** Shellfish allergen info */
  shellfishAllergen: AllergenStatus;

  /** Egg allergen info */
  eggAllergen: AllergenStatus;

  /** Fish allergen info */
  fishAllergen: AllergenStatus;

  /** Peanut allergen info */
  peanutAllergen: AllergenStatus;

  /** Soy allergen info */
  soyAllergen: AllergenStatus;

  /** Milk allergen info */
  milkAllergen: AllergenStatus;

  /** Almond allergen info */
  almondAllergen: AllergenStatus;

  /** Hazelnut allergen info */
  hazelnutAllergen: AllergenStatus;

  /** Walnut allergen info */
  walnutAllergen: AllergenStatus;

  /** Cashew allergen info */
  cashewAllergen: AllergenStatus;

  /** Pecan allergen info */
  pecanAllergen: AllergenStatus;

  /** Brazil nut allergen info */
  brazilNutAllergen: AllergenStatus;

  /** Pistachio allergen info */
  pistachioAllergen: AllergenStatus;

  /** Macadamia nut allergen info (Queensland nut) */
  macadamiaNutAllergen: AllergenStatus;

  /** Celery allergen info */
  celeryAllergen: AllergenStatus;

  /** Mustard allergen info */
  mustardAllergen: AllergenStatus;

  /** Sesame seed allergen info */
  sesameSeedAllergen: AllergenStatus;

  /** Sulphur dioxide allergen info */
  sulphurDioxideAllergen: AllergenStatus;

  /** Lupin allergen info */
  lupinAllergen: AllergenStatus;

  /** Mollusc allergen info */
  molluscAllergen: AllergenStatus;
}

// Generic item interface
export interface Item {
  itemCode: string;
  itemName: string;
  treeType: string;
  uCCFType: string;

  nutrients?: Nutrients;

  allergens?: Allergens;
}

// Raw material with nutritional information
export interface RawMaterial extends Item {
  nutrients: Nutrients;

  allergens: Allergens;
}

export interface RawMaterialLine {
  rawMaterial: RawMaterial;

  /** Quantity in kilograms (kg) */
  quantity: number;
}

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

export function isRawMaterial(item: Item): item is RawMaterial {
  return (
    item.uCCFType === "Råvare" &&
    item.nutrients !== undefined &&
    item.allergens !== undefined
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
  ];

  const selectQuery = fields.join(",");

  const data = await sapFetch(`/Items('${itemCode}')?$select=${selectQuery}`);

  const item: Item = {
    itemCode: data.ItemCode,
    itemName: data.ItemName,
    treeType: data.TreeType,
    uCCFType: data.U_CCF_Type,
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
      glutenAllergen: parseAllergenStatus(data.U_BOYX_gluten),
      shellfishAllergen: parseAllergenStatus(data.U_BOYX_Krebsdyr),
      eggAllergen: parseAllergenStatus(data.U_BOYX_aag),
      fishAllergen: parseAllergenStatus(data.U_BOYX_fisk),
      peanutAllergen: parseAllergenStatus(data.U_BOYX_JN),
      soyAllergen: parseAllergenStatus(data.U_BOYX_soja),
      milkAllergen: parseAllergenStatus(data.U_BOYX_ML),
      almondAllergen: parseAllergenStatus(data.U_BOYX_mandel),
      hazelnutAllergen: parseAllergenStatus(data.U_BOYX_hassel),
      walnutAllergen: parseAllergenStatus(data.U_BOYX_val),
      cashewAllergen: parseAllergenStatus(data.U_BOYX_Cashe),
      pecanAllergen: parseAllergenStatus(data.U_BOYX_Pekan),
      brazilNutAllergen: parseAllergenStatus(data.U_BOYX_peka),
      pistachioAllergen: parseAllergenStatus(data.U_BOYX_Pistacie),
      macadamiaNutAllergen: parseAllergenStatus(data.U_BOYX_Queensland),
      celeryAllergen: parseAllergenStatus(data.U_BOYX_Selleri),
      mustardAllergen: parseAllergenStatus(data.U_BOYX_Sennep),
      sesameSeedAllergen: parseAllergenStatus(data.U_BOYX_Sesam),
      sulphurDioxideAllergen: parseAllergenStatus(data.U_BOYX_Svovldioxid),
      lupinAllergen: parseAllergenStatus(data.U_BOYX_Lupin),
      molluscAllergen: parseAllergenStatus(data.U_BOYX_BL),
    };
  }

  return item;
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
export function calculateNutritionalContent(
  rawMaterials: RawMaterialLine[]
): Nutrients {
  // Total quantity of all raw materials (in kg)
  const totalQuantity = rawMaterials.reduce(
    (sum, rawMaterialLine) => rawMaterialLine.quantity + sum,
    0
  );

  if (totalQuantity === 0) {
    throw new Error("Total quantity of raw materials is zero.");
  }

  const resultNutrition: Nutrients = {
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

    resultNutrition.energyKj += rawMaterial.nutrients.energyKj * ratio;
    resultNutrition.energyKcal += rawMaterial.nutrients.energyKcal * ratio;
    resultNutrition.fat += rawMaterial.nutrients.fat * ratio;
    resultNutrition.fattyAcid += rawMaterial.nutrients.fattyAcid * ratio;
    resultNutrition.carbohydrate += rawMaterial.nutrients.carbohydrate * ratio;
    resultNutrition.sugars += rawMaterial.nutrients.sugars * ratio;
    resultNutrition.protein += rawMaterial.nutrients.protein * ratio;
    resultNutrition.salt += rawMaterial.nutrients.salt * ratio;
  }

  return resultNutrition;
}

function overrideIfHigher(
  current: AllergenStatus,
  candidate: AllergenStatus
): AllergenStatus {
  return candidate > current ? candidate : current;
}

export function getProductAllergens(
  rawMaterials: RawMaterialLine[]
): Allergens {
  const resultAllergens: Allergens = {
    glutenAllergen: AllergenStatus.FreeFrom,
    shellfishAllergen: AllergenStatus.FreeFrom,
    eggAllergen: AllergenStatus.FreeFrom,
    fishAllergen: AllergenStatus.FreeFrom,
    peanutAllergen: AllergenStatus.FreeFrom,
    soyAllergen: AllergenStatus.FreeFrom,
    milkAllergen: AllergenStatus.FreeFrom,
    almondAllergen: AllergenStatus.FreeFrom,
    hazelnutAllergen: AllergenStatus.FreeFrom,
    walnutAllergen: AllergenStatus.FreeFrom,
    cashewAllergen: AllergenStatus.FreeFrom,
    pecanAllergen: AllergenStatus.FreeFrom,
    brazilNutAllergen: AllergenStatus.FreeFrom,
    pistachioAllergen: AllergenStatus.FreeFrom,
    macadamiaNutAllergen: AllergenStatus.FreeFrom,
    celeryAllergen: AllergenStatus.FreeFrom,
    mustardAllergen: AllergenStatus.FreeFrom,
    sesameSeedAllergen: AllergenStatus.FreeFrom,
    sulphurDioxideAllergen: AllergenStatus.FreeFrom,
    lupinAllergen: AllergenStatus.FreeFrom,
    molluscAllergen: AllergenStatus.FreeFrom,
  };

  for (const { rawMaterial } of rawMaterials) {
    for (const key in rawMaterial.allergens) {
      const allergenKey = key as keyof Allergens;
      const candidate = rawMaterial.allergens[allergenKey];
      const current = resultAllergens[allergenKey];
      resultAllergens[allergenKey] = overrideIfHigher(current, candidate);
    }
  }

  return resultAllergens;
}
