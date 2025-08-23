import { AllergenStatus } from "../../src/models/allergens.ts";
import { Item } from "../../src/models/item.ts";
import { NutrientsService } from "../../src/services/nutrients-service.ts";
import { AllergensService } from "../../src/services/allergens-service.ts";
import { ProductTree } from "../../src/models/ProductTree.ts";

export const testItems: Record<string, Item> = {
  test_0000001000_test: {
    itemCode: "test_0000001000_test",
    itemName: "Mørk chokolade",
    treeType: "iNotATree",
    uCCFType: "Råvare",
    nutrients: NutrientsService.createNutrients({
      energyKj: 2200,
      energyKcal: 530,
      fat: 35,
      fattyAcid: 20,
      carbohydrate: 50,
      sugars: 45,
      protein: 5,
      salt: 0.02,
    }),
    allergens: AllergensService.createAllergens({
      soy: AllergenStatus.InProduct,
    }),
    ingredientsDescriptionDa:
      "mørk chokolade (kakaomasse, sukker, kakaosmør, emulgator (SOJALECITIN))",
  },
  test_0000001100_test: {
    itemCode: "test_0000001100_test",
    itemName: "Marcipan",
    treeType: "iNotATree",
    uCCFType: "Råvare",
    nutrients: NutrientsService.createNutrients({
      energyKj: 1800,
      energyKcal: 430,
      fat: 25,
      fattyAcid: 2,
      carbohydrate: 40,
      sugars: 35,
      protein: 8,
      salt: 0.01,
    }),
    allergens: AllergensService.createAllergens({
      almond: AllergenStatus.InProduct,
    }),
    ingredientsDescriptionDa:
      "marcipan (Valencia-MANDLER, sukker, vand, glukosesirup, rønnebærekstrakt)",
  },
  test_0000001110_test: {
    itemCode: "test_0000001110_test",
    itemName: "HF Bar, Marcipan Chokoladebar",
    treeType: "iProductionTree",
    uCCFType: "HF",
  },
  test_0000001111_test: {
    itemCode: "test_0000001111_test",
    itemName: "Marcipan Chokoladebar",
    treeType: "iProductionTree",
    uCCFType: "Færdigvare",
    nutrients: NutrientsService.createNutrients({
      energyKj: 1960,
      energyKcal: 470,
      fat: 29,
      fattyAcid: 9.2,
      carbohydrate: 44,
      sugars: 39,
      protein: 6.8,
      salt: 0.014,
    }),
    allergens: AllergensService.createAllergens({
      soy: AllergenStatus.InProduct,
      almond: AllergenStatus.InProduct,
    }),
    ingredientsDescriptionDa:
      "marcipan (60%) (Valencia-MANDLER, sukker, vand, glukosesirup, rønnebærekstrakt), mørk chokolade (40%) (kakaomasse, sukker, kakaosmør, emulgator (SOJALECITIN)). Mørk chokolade: Mindst 60% kakaotørstof.",
  },
};

export const testProductTrees: Record<string, ProductTree> = {
  test_0000001110_test: {
    treeCode: "test_0000001110_test",
    treeType: "iProductionTree",
    productDescription: "HF Bar, Marcipan Chokoladebar",
    productTreeLines: [
      {
        itemCode: "test_0000001000_test",
        itemName: "Mørk chokolade",
        itemType: "pit_Item",
        quantity: 0.0208,
      },
      {
        itemCode: "test_0000001100_test",
        itemName: "Marcipan",
        itemType: "pit_Item",
        quantity: 0.0312,
      },
    ],
  },
  test_0000001111_test: {
    treeCode: "test_0000001111_test",
    treeType: "iProductionTree",
    productDescription: "Marcipan Chokoladebar",
    productTreeLines: [
      {
        itemCode: "test_0000001110_test",
        itemName: "HF Bar, Marcipan Chokoladebar",
        itemType: "pit_Item",
        quantity: 1,
      },
    ],
  },
};
