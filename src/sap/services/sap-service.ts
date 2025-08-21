import { loadSapAuthConfig } from "../config/auth-config.ts";
import { getValidSession } from "../auth/auth.ts";

/**
 * Sends an authenticated HTTP request to the SAP Service Layer.
 * Parses JSON response or falls back to text.
 * Throws parsed error if the response is not successful.
 *
 * @param path SAP API endpoint path.
 * @param opts Optional fetch options (method, headers, body, etc.).
 * @returns A promise resolving to the parsed response data.
 * @throws Parsed error data on failed response.
 */
export async function sapFetch(path: string, opts: RequestInit = {}) {
  const config = loadSapAuthConfig();
  const session = await getValidSession();

  const response = await fetch(`${config.serverUrl}${path}`, {
    ...opts,
    headers: {
      Cookie: `B1SESSION=${session.id}`,
      ...(opts.headers ?? {}),
    },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = await response.text();
  }

  if (!response.ok) throw data;
  return data;
}
