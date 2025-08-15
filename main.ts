import {
  calculateNutritionalContent,
  getItem,
  getRawMaterials,
} from "./sap-item-service.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const item = await getItem("0021050008");

  console.log(item);

  const rawMaterials = await getRawMaterials(item.ItemCode);

  console.log("RawMaterials:", rawMaterials.length);
  console.log(rawMaterials);

  const nutritionalContent = calculateNutritionalContent(rawMaterials);

  console.log("NutritionalContent:", nutritionalContent);
}
