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
 * Log in to SAP Service Layer and create a new session object.
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
 * Get a valid SAP session:
 * - Returns cached session if valid
 * - Reads from file if available
 * - Logs in and saves session if expired or missing
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
