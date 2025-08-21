/**
 * Represents an authentication session for SAP Service Layer.
 */
export interface Session {
  /** Session ID string from SAP. */
  id: string;

  /** Timestamp (ms) when session was created. */
  createdAt: number;

  /** Duration (ms) until session expires. */
  expiresIn: number;
}

/**
 * Creates a new session object with the current timestamp and given expiry (in minutes).
 *
 * @param id Session ID from SAP.
 * @param timeoutMinutes Time in minutes until session expires.
 * @returns New session object.
 */
export function createSession(id: string, timeoutMinutes: number): Session {
  return {
    id,
    createdAt: Date.now(), // In ms
    expiresIn: timeoutMinutes * 60 * 1000, // Convert minutes to ms
  };
}

/**
 * Saves a session object to a JSON file.
 *
 * @param session The session to save.
 * @param filename Path to file.
 */
export async function saveSession(
  session: Session,
  filename: string
): Promise<void> {
  await Deno.writeTextFile(filename, JSON.stringify(session, null, 2));
}

/**
 * Reads a session from a JSON file.
 * Returns null if file is missing or invalid.
 *
 * @param filename Path to file.
 * @returns Session object or null.
 */
export async function readSession(filename: string): Promise<Session | null> {
  try {
    const text = await Deno.readTextFile(filename);
    return JSON.parse(text) as Session;
  } catch {
    return null;
  }
}

/**
 * Determines if the session has expired.
 *
 * @param session Session to check.
 * @returns True if session is expired.
 */
export function isSessionExpired(session: Session): boolean {
  return Date.now() > session.createdAt + session.expiresIn;
}
