import { SapItemData } from "../models/sap-item-data.ts";
import { Item } from "../../models/item.ts";
import { AllergensService } from "../../services/allergens-service.ts";
import { Allergens } from "../../models/allergens.ts";
import { Nutrients } from "../../models/nutrients.ts";

const nutrientMap: Record<keyof Nutrients, keyof SapItemData> = {
  energyKj: "U_BOYX_Energi",
  energyKcal: "U_BOYX_Energik",
  fat: "U_BOYX_fedt",
  fattyAcid: "U_BOYX_fedtsyre",
  carbohydrate: "U_BOYX_Kulhydrat",
  sugars: "U_BOYX_sukkerarter",
  protein: "U_BOYX_Protein",
  salt: "U_BOYX_salt",
};

const allergenMap: Record<keyof Allergens, keyof SapItemData> = {
  gluten: "U_BOYX_gluten",
  shellfish: "U_BOYX_Krebsdyr",
  egg: "U_BOYX_aag",
  fish: "U_BOYX_fisk",
  peanut: "U_BOYX_JN",
  soy: "U_BOYX_soja",
  milk: "U_BOYX_ML",
  almond: "U_BOYX_mandel",
  hazelnut: "U_BOYX_hassel",
  walnut: "U_BOYX_val",
  cashew: "U_BOYX_Cashe",
  pecan: "U_BOYX_Pekan",
  brazilNut: "U_BOYX_peka",
  pistachio: "U_BOYX_Pistacie",
  macadamiaNut: "U_BOYX_Queensland",
  celery: "U_BOYX_Selleri",
  mustard: "U_BOYX_Sennep",
  sesameSeed: "U_BOYX_Sesam",
  sulphurDioxide: "U_BOYX_Svovldioxid",
  lupin: "U_BOYX_Lupin",
  mollusc: "U_BOYX_BL",
};

export function mapSapItemDataToItem(data: SapItemData): Item {
  const item: Item = {
    itemCode: data.ItemCode,
    itemName: data.ItemName,
    treeType: data.TreeType,
    uCCFType: data.U_CCF_Type,
  };

  if (["Færdigvare", "Råvare"].includes(data.U_CCF_Type)) {
    item.nutrients = parseNutrients(data);
    item.allergens = parseAllergens(data);
    item.ingredientsDescriptionDa = parseIngredientsDescriptionDa(data);
  }

  return item;
}

function parseNutrients(data: SapItemData): Nutrients {
  const nutrients: Partial<Nutrients> = {};

  for (const nutrientKey in nutrientMap) {
    const sapKey = nutrientMap[nutrientKey as keyof Nutrients];
    const value = data[sapKey];

    if (!value) {
      throw new Error(
        `Item ${data.ItemCode} (${data.ItemName}) is missing nutrient ${nutrientKey} (${sapKey})`
      );
    }

    const nutrient = parseCommaDecimalNumber(value);

    if (nutrient === undefined) {
      throw new Error(
        `Item ${data.ItemCode} (${data.ItemName})
         has an invalid nutrient value '${value}' for ${nutrientKey} (${sapKey})`
      );
    }

    nutrients[nutrientKey as keyof Nutrients] = nutrient;
  }

  return nutrients as Nutrients;
}

function parseAllergens(data: SapItemData): Allergens | undefined {
  const allergens: Partial<Allergens> = {};

  for (const allergenKey in allergenMap) {
    const sapKey = allergenMap[allergenKey as keyof Allergens];
    const value = data[sapKey];

    if (!value) {
      throw new Error(
        `Item ${data.ItemCode} (${data.ItemName}) is missing allergen ${allergenKey} (${sapKey})`
      );
    }

    const allergenStatus = AllergensService.stringToAllergenStatus(value);

    if (allergenStatus === undefined) {
      throw new Error(
        `Item ${data.ItemCode} (${data.ItemName}) has an invalid allergen value '${value}' for ${allergenKey} (${sapKey})`
      );
    }

    allergens[allergenKey as keyof Allergens] = allergenStatus;
  }

  return allergens as Allergens;
}

function parseIngredientsDescriptionDa(data: SapItemData): string {
  if (!data.U_CCF_Ingrediens_DA) {
    throw new Error(
      `Item ${data.ItemCode} (${data.ItemName}) is missing ingredients description for language DA`
    );
  }

  return data.U_CCF_Ingrediens_DA;
}

/**
 * Maps domain Item to SapItemData, missing values set as null.
 */
export function mapItemToSapItemData(item: Item): SapItemData {
  // Base required fields
  const sapItemData: SapItemData = {
    ItemCode: item.itemCode,
    ItemName: item.itemName,
    TreeType: item.treeType,
    U_CCF_Type: item.uCCFType,
  };

  if (["Færdigvare", "Råvare"].includes(item.uCCFType)) {
    if (!item.nutrients) {
      throw new Error(
        `Item ${item.itemCode} (${item.itemName}) is missing nutrients`
      );
    }
    if (!item.allergens) {
      throw new Error(
        `Item ${item.itemCode} (${item.itemName}) is missing allergens`
      );
    }
    if (!item.ingredientsDescriptionDa) {
      throw new Error(
        `Item ${item.itemCode} (${item.itemName}) is missing Danish ingredients description`
      );
    }

    // Map nutrients
    for (const [nutrientKey, sapKey] of Object.entries(nutrientMap)) {
      const value = item.nutrients[nutrientKey as keyof Nutrients];
      sapItemData[sapKey] = formatDecimalNumberWithComma(value);
    }

    // Map allergens
    for (const [allergenKey, sapKey] of Object.entries(allergenMap)) {
      const value = item.allergens[allergenKey as keyof Allergens];
      const allergenStatus = AllergensService.allergenStatusToString(value);

      if (allergenStatus) {
        sapItemData[sapKey] = allergenStatus;
      }
    }

    // Assign ingredients description (required for these types)
    sapItemData.U_CCF_Ingrediens_DA = item.ingredientsDescriptionDa;
  }

  return sapItemData;
}

function parseCommaDecimalNumber(value: string): number | undefined {
  if (!value) return undefined;

  const parsed = parseFloat(value.replace(",", "."));

  if (isNaN(parsed)) return undefined;

  return parsed;
}

function formatDecimalNumberWithComma(value: number): string {
  // Convert number to string with comma as decimal separator, no thousands separator
  return value.toLocaleString("de-DE", { useGrouping: false });
}
