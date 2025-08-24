import { assertEquals, assertExists } from "@std/assert";
import { ItemService } from "../../src/sap/services/item-service.ts";
import { testItems, testProductTrees } from "../fixtures/test_data.ts";
import {
  setupItemTestData,
  setupProductTreeTestData,
  teardownItemTestData,
  teardownProductTreeTestData,
} from "../fixtures/sap-setup.ts";
import { ProductTreeService } from "../../src/sap/services/product-tree-service.ts";

Deno.test(async function getItemTest() {
  await setupItemTestData();

  try {
    const expected = testItems["test_0000001111_test"];
    const actual = await ItemService.getItem(expected.itemCode);

    assertExists(actual);
    assertEquals(actual, expected);
  } finally {
    await teardownItemTestData();
  }
});

Deno.test(async function getProductTreeTest() {
  await setupItemTestData();
  await setupProductTreeTestData();

  try {
    const expected = testProductTrees["test_0000001111_test"];
    const actual = await ProductTreeService.getProductTree(expected.treeCode);

    assertExists(actual);
    assertEquals(actual, expected);
  } finally {
    await teardownProductTreeTestData();
    await teardownItemTestData();
  }
});
