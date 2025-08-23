import { assertEquals, assertExists } from "@std/assert";
import { ItemService } from "../../src/sap/services/item-service.ts";
import { testItems } from "../fixtures/test_data.ts";
import {
  setupItemTestData,
  teardownItemTestData,
} from "../fixtures/sap-setup.ts";

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
