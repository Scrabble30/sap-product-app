export interface Session {
  id: string;
  createdAt: number; // Timestamp (ms) when session was created
  expiresIn: number; // Duration (ms) until session expires
}

export function createSession(id: string, timeoutMinutes: number): Session {
  return {
    id,
    createdAt: Date.now(), // In ms
    expiresIn: timeoutMinutes * 60 * 1000, // Convert minutes to ms
  };
}

export async function saveSession(
  session: Session,
  filename: string
): Promise<void> {
  await Deno.writeTextFile(filename, JSON.stringify(session, null, 2));
}

export async function readSession(filename: string): Promise<Session | null> {
  try {
    const text = await Deno.readTextFile(filename);
    return JSON.parse(text) as Session;
  } catch {
    return null;
  }
}

export function isSessionExpired(session: Session): boolean {
  return Date.now() > session.createdAt + session.expiresIn;
}
