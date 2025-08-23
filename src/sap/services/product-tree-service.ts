import { SapService } from "./sap-service.ts";

export class ProductTreeService {
  /**
   * Retrieves all product trees from SAP.
   *
   * @returns A promise resolving to all product trees data.
   */
  static getAllProductTrees() {
    return SapService.sapFetch("/ProductTrees");
  }

  /**
   * Retrieves a single product tree with selected fields.
   *
   * @param treeCode Identifier of the product tree.
   * @returns A promise resolving to the product tree data for the given code.
   */
  static getProductTree(treeCode: string) {
    return SapService.sapFetch(
      `/ProductTrees('${treeCode}')?$select=TreeCode,TreeType,ProductDescription,ProductTreeLines`
    );
  }
}
