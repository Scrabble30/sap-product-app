import { loadSapAuthConfig } from "../config/auth-config.ts";
import {
  createSession,
  saveSession,
  readSession,
  isSessionExpired,
  Session,
} from "./session.ts";

let cachedSession: Session | null = null;

/**
 * Logs in to the SAP Service Layer and creates a new session object.
 *
 * @returns A promise resolving to the new session.
 * @throws If the login request fails.
 */
export async function login(): Promise<Session> {
  const sapAuthConfig = loadSapAuthConfig();
  const url = `${sapAuthConfig.serverUrl}/Login`;
  const opts = {
    method: "POST",
    body: JSON.stringify({
      CompanyDB: sapAuthConfig.companyDb,
      UserName: sapAuthConfig.username,
      Password: sapAuthConfig.password,
    }),
  };

  const response = await fetch(url, opts);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  return createSession(data.SessionId, data.SessionTimeout);
}

/**
 * Retrieves a valid SAP session.
 * Returns cached session if valid, reads from file if available,
 * or logs in and saves session if expired or missing.
 *
 * @returns A promise resolving to a valid session.
 */
export async function getValidSession(): Promise<Session> {
  if (cachedSession && !isSessionExpired(cachedSession)) {
    return cachedSession;
  }

  let session = await readSession("data/session.json");

  if (!session || isSessionExpired(session)) {
    session = await login();

    await saveSession(session, "data/session.json");
  }

  cachedSession = session;

  return session;
}
