import { config } from "https://deno.land/x/dotenv/mod.ts";

export type SapAuthConfig = {
  serverUrl: string;
  companyDb: string;
  username: string;
  password: string;
};

const env = config();
let cachedConfig: SapAuthConfig | null = null;

/**
 * Load and validate SAP auth configuration from environment variables.
 * Caches the result after the first call.
 *
 * @throws If any required environment variable is missing.
 */
export function loadSapAuthConfig(): SapAuthConfig {
  if (cachedConfig) return cachedConfig;

  const serverUrl = env.SAP_SERVER_BASE_URL;
  const companyDb = env.SAP_COMPANY_DB;
  const username = env.SAP_USERNAME;
  const password = env.SAP_PASSWORD;

  const missing = [];
  if (!serverUrl) missing.push("SAP_SERVER_BASE_URL");
  if (!companyDb) missing.push("SAP_COMPANY_DB");
  if (!username) missing.push("SAP_USERNAME");
  if (!password) missing.push("SAP_PASSWORD");

  if (missing.length > 0) {
    throw new Error(`Missing SAP environment variables: ${missing.join(", ")}`);
  }

  cachedConfig = {
    serverUrl: serverUrl!,
    companyDb: companyDb!,
    username: username!,
    password: password!,
  };

  return cachedConfig;
}
