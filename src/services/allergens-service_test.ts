import { assertEquals } from "@std/assert";
import { Stub, stub } from "jsr:@std/testing/mock";
import { testItems, testProductTrees } from "../../tests/fixtures/test_data.ts";
import { Allergens } from "../models/allergens.ts";
import { AllergensService } from "./allergens-service.ts";
import { ItemService } from "../sap/services/item-service.ts";
import { ProductTreeService } from "../sap/services/product-tree-service.ts";

Deno.test(async function aggregateAllergensTest() {
  const getItemStub: Stub<typeof ItemService> = stub(
    ItemService,
    "getItem",
    (itemCode) => Promise.resolve(testItems[itemCode])
  );

  const getProductTreeStub: Stub<typeof ProductTreeService> = stub(
    ProductTreeService,
    "getProductTree",
    (treeCode) => Promise.resolve(testProductTrees[treeCode])
  );

  try {
    const item = await ItemService.getItem("test_0000001111_test");
    const ingredients = await ItemService.getIngredients(item);

    const expected: Allergens = item.allergens!;
    const actual = AllergensService.aggregateAllergens(ingredients);

    assertEquals(actual, expected);
  } finally {
    getItemStub.restore();
    getProductTreeStub.restore();
  }
});
