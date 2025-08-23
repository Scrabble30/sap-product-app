import { SapProductTreeLineData } from "./SapProductTreeLineData.ts";

export interface SapProductTreeData {
  TreeCode: string;
  TreeType: string;
  ProductDescription: string;
  ProductTreeLines: SapProductTreeLineData[];
}
