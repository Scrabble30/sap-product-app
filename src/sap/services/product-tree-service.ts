import { ProductTree } from "../../models/ProductTree.ts";
import { mapSapProductTreeDataToProductTree } from "../mapper/sap-product-tree-mapper.ts";
import { SapProductTreeData } from "../models/SapProductTreeData.ts";
import { SapService } from "./sap-service.ts";

export class ProductTreeService {
  /**
   * Retrieves all product trees from SAP.
   *
   * @returns A promise resolving to all product trees data.
   */
  static async getAllProductTrees(): Promise<ProductTree[]> {
    const data = await SapService.sapFetch("/ProductTrees");
    const productTrees: ProductTree[] = [];

    for (const productTreeData of data["value"]) {
      productTrees.push(mapSapProductTreeDataToProductTree(productTreeData));
    }

    return productTrees;
  }

  /**
   * Retrieves a single product tree with selected fields.
   *
   * @param treeCode Identifier of the product tree.
   * @returns A promise resolving to the product tree data for the given code.
   */
  static async getProductTree(treeCode: string): Promise<ProductTree> {
    const data: SapProductTreeData = await SapService.sapFetch(
      `/ProductTrees('${treeCode}')?$select=TreeCode,TreeType,ProductDescription,ProductTreeLines`
    );

    return mapSapProductTreeDataToProductTree(data);
  }
}
