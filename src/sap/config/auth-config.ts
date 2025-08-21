import { config } from "https://deno.land/x/dotenv/mod.ts";

/**
 * Configuration required to authenticate with SAP Service Layer.
 */
export type SapAuthConfig = {
  /** SAP server base URL */
  serverUrl: string;

  /** SAP company database name */
  companyDb: string;

  /** SAP username */
  username: string;

  /** SAP password */
  password: string;
};

const env = config();
let cachedConfig: SapAuthConfig | null = null;

/**
 * Loads and validates SAP authentication configuration from environment variables.
 * Caches the result after the first successful load.
 *
 * @returns The loaded SAP authentication configuration.
 * @throws If any required SAP environment variables are missing.
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
