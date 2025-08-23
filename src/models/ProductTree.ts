import { ProductTreeLine } from "./ProductTreeLine.ts";

export interface ProductTree {
  treeCode: string;
  treeType: string;
  productDescription: string;
  productTreeLines: ProductTreeLine[];
}
