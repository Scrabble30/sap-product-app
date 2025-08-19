import { loadSapAuthConfig } from "../config/auth-config.ts";
import { getValidSession } from "../auth/auth.ts";

/**
 * Fetch from SAP Service Layer with session auth.
 * Parses JSON (fallback to text) and throws parsed error on failure.
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
