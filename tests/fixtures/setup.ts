import { getValidSession } from "../../src/sap/auth/auth.ts";
import { loadSapAuthConfig } from "../../src/sap/config/auth-config.ts";
import { testItems } from "./test_data.ts";
import { mapItemToSapItemData } from "../../src/sap/mapper/sap-item-mapper.ts";
import { SapItemData } from "../../src/sap/models/sap-item-data.ts";

/**
 * Generates a unique batch boundary string.
 */
function createBatchBoundary(): string {
  return `batch_${crypto.randomUUID()}`;
}

/**
 * Generates a unique change set boundary string.
 */
function createChangeSetBoundary(): string {
  return `changeset_${crypto.randomUUID()}`;
}

/**
 * Builds the batch request body for either POST or DELETE operations on Items.
 */
function createBatchRequestBodyForItems(
  sapItems: SapItemData[],
  batchId: string,
  changeSetId: string,
  method: "POST" | "DELETE"
): string {
  const bodyParts = sapItems
    .map((sapItem, index) => {
      if (method === "POST") {
        return `--${changeSetId}
Content-Type: application/http
Content-Transfer-Encoding: binary
Content-ID: ${index + 1}

POST Items HTTP/1.1

${JSON.stringify(sapItem)}`;
      } else {
        // DELETE method
        return `--${changeSetId}
Content-Type: application/http
Content-Transfer-Encoding: binary

DELETE Items('${sapItem.ItemCode}') HTTP/1.1`;
      }
    })
    .join("\n\n");

  return `--${batchId}
Content-Type: multipart/mixed; boundary=${changeSetId}

${bodyParts}

--${changeSetId}--
--${batchId}--`;
}

/**
 * Logs any errors found in a batch response.
 */
function handleBatchResponseErrors(data: string) {
  const error = extractSingleErrorFromBatchResponse(data);
  if (error) {
    console.error("Batch request errors:", error);
  }
}

/**
 * Sets up test data by sending a batch POST request to SAP.
 */
export async function setupTestData() {
  const config = loadSapAuthConfig();
  const session = await getValidSession();

  const batchId = createBatchBoundary();
  const changeSetId = createChangeSetBoundary();

  const batchRequestBody = createBatchRequestBodyForItems(
    Object.values(testItems).map(mapItemToSapItemData),
    batchId,
    changeSetId,
    "POST"
  );

  const url = `${config.serverUrl}/$batch`;
  const opts: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": `multipart/mixed;boundary=${batchId}`,
      Cookie: `B1SESSION=${session.id}`,
    },
    body: batchRequestBody,
  };

  const response = await fetch(url, opts);
  const data = await response.text();

  if (!response.ok) {
    throw new Error(data);
  }

  handleBatchResponseErrors(data);
}

/**
 * Tears down test data by sending a batch DELETE request to SAP.
 */
export async function teardownTestData() {
  const config = loadSapAuthConfig();
  const session = await getValidSession();

  const batchId = createBatchBoundary();
  const changeSetId = createChangeSetBoundary();

  const batchRequestBody = createBatchRequestBodyForItems(
    Object.values(testItems).map(mapItemToSapItemData),
    batchId,
    changeSetId,
    "DELETE"
  );

  const url = `${config.serverUrl}/$batch`;
  const opts: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": `multipart/mixed;boundary=${batchId}`,
      Cookie: `B1SESSION=${session.id}`,
    },
    body: batchRequestBody,
  };

  const response = await fetch(url, opts);
  const data = await response.text();

  if (!response.ok) {
    throw new Error(data);
  }

  handleBatchResponseErrors(data);
}

/**
 * Extracts the first error (if any) from a batch response.
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
