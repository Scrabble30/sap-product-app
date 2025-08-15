import { assert, assertEquals, assertExists, assertFalse } from "@std/assert";
import { login } from "./sap-auth.ts";
import { getItem, isValidItemCode } from "./sap-item-service.ts";

Deno.test(async function loginTest() {
  const session = await login();

  assertExists(session);
  assertExists(session.id);
});

Deno.test(function isValidItemCodeTest() {
  const validItemCode = isValidItemCode("0021050008");

  assert(validItemCode);

  const invalidItemCode = isValidItemCode("KS'ER");

  assertFalse(invalidItemCode);
});

Deno.test(async function getItemTest() {
  const itemCode = "0021050008";
  const item = await getItem(itemCode);

  assertExists(item);
  assertEquals(item.ItemCode, itemCode);
});
