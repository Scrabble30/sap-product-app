import { getValidSession } from "../../src/sap/auth/auth.ts";
import { loadSapAuthConfig } from "../../src/sap/config/auth-config.ts";

/**
 * Options used to send a batch of SAP entities using the sendEntityBatch function.
 *
 * @template T - The type of the SAP model data being sent (e.g., SapItemData, SapProductTreeData).
 */
export interface SapBatchOptions<T> {
  /** Array of SAP entities to include in the batch request. */
  data: T[];

  /** HTTP method to use ("POST" or "DELETE"). */
  method: "POST" | "DELETE";

  /** SAP OData collection name (e.g., "Items", "ProductTrees"). */
  path: string;

  /**
   * Function to extract the unique key from an entity.
   *
   * @param item - The entity to extract the key from.
   * @returns The key string used for identifying the entity.
   */
  getKey: (item: T) => string;
}

/**
 * Sends a batch request to SAP for the given data.
 *
 * @template T - The type of the input entities.
 * @param data - An array of SAP model data to send.
 * @param method - HTTP method to use ("POST" or "DELETE").
 * @param path - SAP OData path (e.g. "Items", "ProductTrees").
 * @param getKey - A function that returns a unique key for each entity (used for DELETE).
 * @returns A promise that resolves when the request completes.
 */
export async function sendEntityBatch<T>({
  data,
  method,
  path,
  getKey,
}: SapBatchOptions<T>): Promise<void> {
  const config = loadSapAuthConfig();
  const session = await getValidSession();

  const batchId = createBatchBoundary();
  const changeSetId = createChangeSetBoundary();

  const bodyParts = data
    .map((entity, index) => {
      if (method === "POST") {
        return `--${changeSetId}
Content-Type: application/http
Content-Transfer-Encoding: binary
Content-ID: ${index + 1}

POST ${path} HTTP/1.1

${JSON.stringify(entity)}`;
      } else {
        return `--${changeSetId}
Content-Type: application/http
Content-Transfer-Encoding: binary

DELETE ${path}('${getKey(entity)}') HTTP/1.1`;
      }
    })
    .join("\n\n");

  const fullBody = `--${batchId}
Content-Type: multipart/mixed; boundary=${changeSetId}

${bodyParts}

--${changeSetId}--
--${batchId}--`;

  const res = await fetch(`${config.serverUrl}/$batch`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/mixed;boundary=${batchId}`,
      Cookie: `B1SESSION=${session.id}`,
    },
    body: fullBody,
  });

  const responseText = await res.text();

  if (!res.ok) {
    throw new Error(responseText);
  }

  const error = extractSingleErrorFromBatchResponse(responseText);
  if (error) {
    console.error("Batch request errors:", error);
  }
}

/**
 * Generates a unique SAP batch boundary string.
 *
 * @returns A unique batch boundary string.
 */
function createBatchBoundary(): string {
  return `batch_${crypto.randomUUID()}`;
}

/**
 * Generates a unique SAP change set boundary string.
 *
 * @returns A unique change set boundary string.
 */
function createChangeSetBoundary(): string {
  return `changeset_${crypto.randomUUID()}`;
}

/**
 * Extracts a single error (if any) from a SAP batch response.
 *
 * @param responseText - The raw text of the batch response.
 * @returns The parsed error object, or null if no error was found.
 */
function extractSingleErrorFromBatchResponse(
  responseText: string
): unknown | null {
  const batchBoundaryMatch = responseText.match(/--batchresponse_[^\r\n]+/);
  if (!batchBoundaryMatch) {
    throw new Error("Batch response boundary not found");
  }
  const batchBoundary = batchBoundaryMatch[0];

  const batchParts = responseText
    .split(batchBoundary)
    .filter((p) => p.trim() && p.trim() !== "--");

  for (const part of batchParts) {
    const statusMatch = part.match(/HTTP\/1\.1 (\d{3})/);
    if (!statusMatch) continue;

    const statusCode = parseInt(statusMatch[1], 10);

    if (statusCode >= 400) {
      const jsonStart = part.indexOf("{");
      const jsonEnd = part.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) return null;

      const jsonString = part.substring(jsonStart, jsonEnd + 1);
      try {
        return JSON.parse(jsonString);
      } catch {
        return null;
      }
    }
  }

  return null; // No error found
}
