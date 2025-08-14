import { loadSapAuthConfig } from "./sap-auth-config.ts";
import { getValidSession } from "./sap-auth.ts";

/**
 * Fetch from SAP Service Layer with session auth.
 * Parses JSON (fallback to text) and throws parsed error on failure.
 */
async function sapFetch(path: string, opts: RequestInit = {}) {
  const config = loadSapAuthConfig();
  const session = await getValidSession();

  const response = await fetch(`${config.serverUrl}${path}`, {
    ...opts,
    headers: {
      Cookie: `B1SESSION=${session.id}`,
      ...(opts.headers ?? {}),
    },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = await response.text();
  }

  if (!response.ok) throw data;
  return data;
}

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

/**
 * Retrieves a single item with selected fields.
 *
 * @param itemCode Identifier of the item.
 */
export function getItem(itemCode: string) {
  return sapFetch(
    `/Items('${itemCode}')?$select=ItemCode,ItemName,TreeType,U_CCF_Type`
  );
}

/**
 * Traverse a product tree and collect items matching allowed types.
 */
export async function getItemLines(itemCode: string, types: string[]) {
  const allowedTypes = new Set(types);
  const resultItems = [];

  // Initial product tree for the top-level item
  const rootTree = await getProductTree(itemCode);
  const rootTreeLines = rootTree["ProductTreeLines"];

  // Put the root tree lines into the stack for processing
  const stack = [...rootTreeLines];

  while (stack.length > 0) {
    // Pop a tree line from the stack
    const currentTreeLine = stack.pop();

    // Skip if item has no item code
    if (!currentTreeLine.ItemCode) continue;

    try {
      const item = await getItem(currentTreeLine.ItemCode);

      // Skip if item type is not allowed
      if (!allowedTypes.has(item.U_CCF_Type)) continue;

      // If the item contains a product tree, push the tree lines to the stack
      if (item.TreeType === "iProductionTree") {
        const itemTree = await getProductTree(currentTreeLine.ItemCode);
        const itemTreeLines = itemTree["ProductTreeLines"];

        stack.push(...itemTreeLines);
      }

      resultItems.push(item);
    } catch {
      console.error(`Failed to fetch item (${currentTreeLine.ItemCode})`);
    }
  }

  return resultItems;
}
