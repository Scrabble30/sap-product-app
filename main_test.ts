import { assertEquals, assertExists } from "@std/assert";
import { login } from "./sap-auth.ts";
import { getItem } from "./sap-service.ts";

Deno.test(async function loginTest() {
  const session = await login();

  assertExists(session);
  assertExists(session.id);
});

Deno.test(async function getItemTest() {
  const itemCode = "0021050008";
  const item = await getItem(itemCode);

  assertExists(item);
  assertEquals(item.ItemCode, itemCode);
});
