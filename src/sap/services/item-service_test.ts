import { assert, assertFalse } from "@std/assert";
import { ItemService } from "./item-service.ts";

Deno.test(function isValidItemCode_Valid_ItemCode_Test() {
  const validItemCode = ItemService.isValidItemCode("0021050008");

  assert(validItemCode);
});

Deno.test(function isValidItemCode_Invalid_ItemCode_Test() {
  const invalidItemCode = ItemService.isValidItemCode("KS'ER");

  assertFalse(invalidItemCode);
});
