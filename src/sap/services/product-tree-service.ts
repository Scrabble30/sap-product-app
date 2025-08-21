import { sapFetch } from "./sap-service.ts";

/**
 * Retrieves all product trees from SAP.
 *
 * @returns A promise resolving to all product trees data.
 */
export function getAllProductTrees() {
  return sapFetch("/ProductTrees");
}

/**
 * Retrieves a single product tree with selected fields.
 *
 * @param treeCode Identifier of the product tree.
 * @returns A promise resolving to the product tree data for the given code.
 */
export function getProductTree(treeCode: string) {
  return sapFetch(
    `/ProductTrees('${treeCode}')?$select=TreeCode,TreeType,ProductDescription,ProductTreeLines`
  );
}
