import { ProductTree } from "../../models/ProductTree.ts";
import { ProductTreeLine } from "../../models/ProductTreeLine.ts";
import { SapProductTreeData } from "../models/SapProductTreeData.ts";
import { SapProductTreeLineData } from "../models/SapProductTreeLineData.ts";

export function mapSapProductTreeDataToProductTree(
  data: SapProductTreeData
): ProductTree {
  return {
    treeCode: data.TreeCode,
    treeType: data.TreeType,
    productDescription: data.ProductDescription,
    productTreeLines: data.ProductTreeLines.map(
      mapSapProductTreeLineDataToProductTreeLine
    ),
  };
}

export function mapSapProductTreeLineDataToProductTreeLine(
  data: SapProductTreeLineData
): ProductTreeLine {
  return {
    itemCode: data.ItemCode,
    itemName: data.ItemName,
    itemType: data.ItemType,
    quantity: data.Quantity,
  };
}

export function mapProductTreeToSapProductTreeData(
  productTree: ProductTree
): SapProductTreeData {
  return {
    TreeCode: productTree.treeCode,
    TreeType: productTree.treeType,
    ProductDescription: productTree.productDescription,
    ProductTreeLines: productTree.productTreeLines.map(
      mapProductTreeLineToSapProductTreeLineData
    ),
  };
}

export function mapProductTreeLineToSapProductTreeLineData(
  productTreeLine: ProductTreeLine
): SapProductTreeLineData {
  return {
    ItemCode: productTreeLine.itemCode,
    ItemName: productTreeLine.itemName,
    ItemType: productTreeLine.itemType,
    Quantity: productTreeLine.quantity,
  };
}
