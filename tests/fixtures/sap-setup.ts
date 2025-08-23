import { sendEntityBatch } from "./sap-batch-utils.ts";
import { testItems, testProductTrees } from "./test_data.ts";
import { mapItemToSapItemData } from "../../src/sap/mapper/sap-item-mapper.ts";
import { mapProductTreeToSapProductTreeData } from "../../src/sap/mapper/sap-product-tree-mapper.ts";

/**
 * Sends test Items to SAP in a batch POST request.
 *
 * @returns A promise that resolves once the test data is created.
 */
export async function setupItemTestData(): Promise<void> {
  const sapItems = Object.values(testItems).map(mapItemToSapItemData);
  await sendEntityBatch({
    data: sapItems,
    method: "POST",
    path: "Items",
    getKey: (item) => item.ItemCode,
  });
}

/**
 * Deletes test Items from SAP in a batch DELETE request.
 *
 * @returns A promise that resolves once the test data is removed.
 */
export async function teardownItemTestData(): Promise<void> {
  const sapItems = Object.values(testItems).map(mapItemToSapItemData);
  await sendEntityBatch({
    data: sapItems,
    method: "DELETE",
    path: "Items",
    getKey: (item) => item.ItemCode,
  });
}

/**
 * Sends test ProductTrees to SAP in a batch POST request.
 *
 * @returns A promise that resolves once the test data is created.
 */
export async function setupProductTreeTestData(): Promise<void> {
  const sapTrees = Object.values(testProductTrees).map(
    mapProductTreeToSapProductTreeData
  );
  await sendEntityBatch({
    data: sapTrees,
    method: "POST",
    path: "ProductTrees",
    getKey: (tree) => tree.TreeCode,
  });
}

/**
 * Deletes test ProductTrees from SAP in a batch DELETE request.
 *
 * @returns A promise that resolves once the test data is removed.
 */
export async function teardownProductTreeTestData(): Promise<void> {
  const sapTrees = Object.values(testProductTrees).map(
    mapProductTreeToSapProductTreeData
  );
  await sendEntityBatch({
    data: sapTrees,
    method: "DELETE",
    path: "ProductTrees",
    getKey: (tree) => tree.TreeCode,
  });
}
