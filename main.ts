import { getItem, getItemLines } from "./sap-service.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const item = await getItem("0021050008");

  console.log(item);

  const types = ["Færdigvare", "Råvare", "HF"];
  const itemLines = await getItemLines(item.ItemCode, types);

  console.log("ItemLines:", itemLines.length);
  console.log(itemLines);

  /*const types = ["Færdigvare", "Råvare", "HF"];
  const itemLines = await getItemLinesBatched("0021050008", types);

  console.log("ItemLines:", itemLines.length);
  console.log(itemLines);*/
}
