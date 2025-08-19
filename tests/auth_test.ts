import { assertExists } from "@std/assert";
import { login } from "../src/sap/auth/auth.ts";

Deno.test(async function loginTest() {
  const session = await login();

  assertExists(session);
  assertExists(session.id);
});
