import { sapFetch } from "./sap-service.ts";

/**
 * Retrieves all product trees from SAP.
 */
export function getAllProductTrees() {
  return sapFetch("/ProductTrees");
}

/**
 * Retrieves a single product tree with selected fields.
 *
 * @param treeCode Identifier of the product tree.
 */
export function getProductTree(treeCode: string) {
  return sapFetch(
    `/ProductTrees('${treeCode}')?$select=TreeCode,TreeType,ProductDescription,ProductTreeLines`
  );
}
