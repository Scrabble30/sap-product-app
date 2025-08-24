import { assertEquals, assertExists } from "@std/assert";
import { Stub, stub } from "jsr:@std/testing/mock";
import {
  testIngredientUsages,
  testItems,
  testProductTrees,
} from "../../../tests/fixtures/test_data.ts";
import { sortIngredientUsagesByItemCode } from "../../../tests/utils/test_helper.ts";
import { IngredientUsage } from "../../models/ingredient.ts";
import { ItemService } from "./item-service.ts";
import { ProductTreeService } from "./product-tree-service.ts";

Deno.test(async function getIngredientsTest() {
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
    const expected: IngredientUsage[] = testIngredientUsages[item.itemCode];

    const actual = await ItemService.getIngredients(item);

    assertExists(actual);
    assertEquals(
      sortIngredientUsagesByItemCode(actual),
      sortIngredientUsagesByItemCode(expected)
    );
  } finally {
    getItemStub.restore();
    getProductTreeStub.restore();
  }
});
