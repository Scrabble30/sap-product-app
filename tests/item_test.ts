import { assert, assertEquals, assertExists, assertFalse } from "@std/assert";
import {
  getIngredients,
  getItem,
  isValidItemCode,
} from "../src/sap/services/item-service.ts";

Deno.test(function isValidItemCode_Valid_ItemCode_Test() {
  const validItemCode = isValidItemCode("0021050008");

  assert(validItemCode);
});

Deno.test(function isValidItemCode_Invalid_ItemCode_Test() {
  const invalidItemCode = isValidItemCode("KS'ER");

  assertFalse(invalidItemCode);
});

Deno.test(async function getItemTest() {
  const itemCode = "0021050008";
  const item = await getItem(itemCode);

  assertExists(item);
  assertEquals(item.itemCode, itemCode);
});

Deno.test(async function getIngredientsTest() {
  const item = await getItem("0021050008");

  const expectedIngredients = [
    {
      ingredient: {
        itemCode: "0000005100",
        itemName: "Mørk chokolade Callebaut (CHD-P60ZV-105)",
      },
      quantity: 0.0147,
    },
    {
      ingredient: {
        itemCode: "0000005500",
        itemName: "Marcipan valencia 60% uden kons (560015)",
      },
      quantity: 0.02808,
    },
  ];

  const actualIngredients = await getIngredients(item);

  assertEquals(actualIngredients.length, expectedIngredients.length);

  for (let i = 0; i < actualIngredients.length; i++) {
    const expectedUsage = expectedIngredients[i];
    const expectedIngredient = expectedUsage.ingredient;

    const actualUsage = actualIngredients[i];
    const actualIngredient = actualUsage.ingredient;

    if (!expectedUsage) {
      throw new Error(
        `Missing expected: ${
          (actualIngredient.itemCode, actualIngredient.itemName)
        }`
      );
    }

    if (!actualUsage) {
      throw new Error(
        `Missing expected: ${
          (expectedIngredient.itemCode, expectedIngredient.itemName)
        }`
      );
    }

    assertEquals(actualIngredient.itemCode, expectedIngredient.itemCode);
    assertEquals(actualIngredient.itemName, expectedIngredient.itemName);
    assertEquals(actualUsage.quantity, expectedUsage.quantity);
  }
});

Deno.test(async function getIngredientsTest2() {
  const item = await getItem("0021031111");

  const expectedIngredients = [
    // Dark Marci
    {
      ingredient: {
        itemCode: "0000005100",
        itemName: "Mørk chokolade Callebaut (CHD-P60ZV-105)",
      },
      quantity: 9 * 1 * 0.004197,
    },
    {
      ingredient: {
        itemCode: "0000005500",
        itemName: "Marcipan valencia 60% uden kons (560015)",
      },
      quantity: 9 * 1 * 0.006303,
    },

    // Crispy Carrie
    {
      ingredient: {
        itemCode: "0000005107",
        itemName: "Mælkechokolade CHM-Q23-105",
      },
      quantity: 9 * 1 * 0.009005,
    },
    {
      ingredient: {
        itemCode: "0000006123",
        itemName: "Soyacrisps (Supro nuggets)",
      },
      quantity: 9 * 1 * 0.000401,
    },
    {
      ingredient: {
        itemCode: "0000006088",
        itemName: "Læsø Havsalt (13902)",
      },
      quantity: 9 * 1 * 0.00008,
    },
    {
      ingredient: {
        itemCode: "0000006141",
        itemName: "Karamel flakes 1-5 mm (590207)",
      },
      quantity: 9 * 1 * 0.000901,
    },
  ];

  const actualIngredients = await getIngredients(item);

  assertEquals(
    actualIngredients.length,
    expectedIngredients.length,
    "Ingredient count mismatch"
  );

  const expectedMap = new Map(
    expectedIngredients.map((usage) => [usage.ingredient.itemCode, usage])
  );

  for (const actualUsage of actualIngredients) {
    const expectedUsage = expectedMap.get(actualUsage.ingredient.itemCode);

    if (!expectedUsage) {
      throw new Error(
        `Unexpected ingredient: ${actualUsage.ingredient.itemName}`
      );
    }

    assertEquals(
      actualUsage.ingredient.itemName,
      expectedUsage.ingredient.itemName
    );
    assertEquals(actualUsage.quantity, expectedUsage.quantity);
  }
});

Deno.test(async function getIngredientsTest3() {
  const item = await getItem("0022030025-2");

  const expectedIngredients = [
    {
      ingredient: {
        itemCode: "0000005100",
        itemName: "Mørk chokolade Callebaut (CHD-P60ZV-105)",
      },
      quantity:
        3 * 1 * 0.004197 +
        3 * 1 * 0.009309 +
        3 * 1 * 0.0104 +
        3 * 1 * 0.007873 +
        3 * 1 * 0.00692,
    },
    {
      ingredient: {
        itemCode: "0000005500",
        itemName: "Marcipan valencia 60% uden kons (560015)",
      },
      quantity: 3 * 1 * 0.006303,
    },
    {
      ingredient: {
        itemCode: "0000005107",
        itemName: "Mælkechokolade CHM-Q23-105",
      },
      quantity:
        3 * 1 * 0.009005 +
        3 * 1 * 0.000521 +
        3 * 1 * 0.004185 +
        3 * 1.005 * 0.003936,
    },
    {
      ingredient: {
        itemCode: "0000006123",
        itemName: "Soyacrisps (Supro nuggets)",
      },
      quantity: 3 * 1 * 0.000401,
    },
    {
      ingredient: {
        itemCode: "0000006088",
        itemName: "Læsø Havsalt (13902)",
      },
      quantity: 3 * 1 * 0.00008 + 3 * 1 * 0.000028,
    },
    {
      ingredient: {
        itemCode: "0000006141",
        itemName: "Karamel flakes 1-5 mm (590207)",
      },
      quantity: 3 * 1 * 0.000901,
    },
    {
      ingredient: {
        itemCode: "0000006058",
        itemName: "Mandler hakkede (Ristede & Usaltede 1-3 mm) (37241-9)",
      },
      quantity: 3 * 1 * 0.001164,
    },
    {
      ingredient: {
        itemCode: "0000005106",
        itemName: "Hvid chokolade CHW-Q0-105 Callebaut",
      },
      quantity:
        3 * 1 * 0.010345 +
        3 * 1 * 0.010278 +
        3 * 1 * 0.001443 +
        3 * 1.005 * 0.000375 +
        3 * 1 * 0.00346,
    },
    {
      ingredient: {
        itemCode: "0000006080",
        itemName: "Lakridsgranulat (Scargro) 25 kg.",
      },
      quantity: 3 * 1 * 0.000155 + 3 * 1 * 0.000135,
    },
    {
      ingredient: {
        itemCode: "0000006060",
        itemName: "Malet Kaffe (økologisk, formalet kaffe) (Øens Kaffe 3052)",
      },
      quantity: 3 * 1 * 0.0001,
    },
    {
      ingredient: {
        itemCode: "0000006120",
        itemName: "Hindbærpulver (condi: 18443/18561)",
      },
      quantity: 3 * 1 * 0.000082,
    },
    {
      ingredient: {
        itemCode: "0000006050",
        itemName: "Citron olie (1,176 L/KG)",
      },
      quantity: 3 * 1 * 0.000005,
    },
    {
      ingredient: {
        itemCode: "0000006153",
        itemName: "Mørk flødekaramel (260)",
      },
      quantity: 3 * 1 * 0.002085,
    },
    {
      ingredient: {
        itemCode: "0000006085",
        itemName: "Citronsaft Øk 0,70 cl. (6 FL./cll. Engelhardt)",
      },
      quantity: 3 * 1 * 0.000019,
    },
    {
      ingredient: {
        itemCode: "0000006104",
        itemName: "Vaniljeblanding (Condi: 11975)",
      },
      quantity: 3 * 1 * 0.000002 + 3 * 1.005 * 0.000014,
    },
    {
      ingredient: {
        itemCode: "0000006018",
        itemName: "Kokos fin (34003)",
      },
      quantity: 3 * 1 * 0.001732,
    },
    {
      ingredient: {
        itemCode: "0000006004",
        itemName: "Glukose c*Sweet",
      },
      quantity: 3 * 1 * 0.001443 + 3 * 1.005 * 0.001312,
    },
    {
      ingredient: {
        itemCode: "0000006021",
        itemName: "Tranebær, Crbca201 P83072 (12,50 kg)",
      },
      quantity: 3 * 1 * 0.000952,
    },
    {
      ingredient: {
        itemCode: "0000006011",
        itemName: "Invertsukker (Palletank faktureres seperat)",
      },
      quantity: 3 * 1 * 0.000722 + 3 * 1.005 * 0.000562,
    },
    {
      ingredient: {
        itemCode: "0000006119",
        itemName: "Soyalecithin (Condi: 10017, 20 kg)",
      },
      quantity: 3 * 1 * 0.000023 + 3 * 1.005 * 0.000023,
    },
    {
      ingredient: {
        itemCode: "0000006173",
        itemName: "Varmebehandlet Hvedemel",
      },
      quantity: 3 * 1.005 * 0.001172,
    },
    {
      ingredient: {
        itemCode: "0000006133",
        itemName: "Mandelmel 12,5kg kart. (11242)",
      },
      quantity: 3 * 1.005 * 0.001172,
    },
    {
      ingredient: {
        itemCode: "0000006172",
        itemName: "Mini Drops (CBP ) (32005/32051) 10 kg",
      },
      quantity: 3 * 1.005 * 0.000703,
    },
    {
      ingredient: {
        itemCode: "0000006174",
        itemName: "Melasse code 720 CBP ( 26099 )",
      },
      quantity: 3 * 1.005 * 0.000562,
    },
    {
      ingredient: {
        itemCode: "0000006062",
        itemName: "Bres (NAN-CR-HA3714-T64)",
      },
      quantity: 3 * 1.005 * 0.000356,
    },
    {
      ingredient: {
        itemCode: "0000006175",
        itemName: "Brun Farin (34645) 12,5 kg",
      },
      quantity: 3 * 1.005 * 0.000281,
    },
    {
      ingredient: {
        itemCode: "0000006128",
        itemName: "Alm. Salt, Fint salt (1394 Condi) 25 kg.",
      },
      quantity: 3 * 1.005 * 0.000031,
    },
    {
      ingredient: {
        itemCode: "0000006003",
        itemName: "Pebermynte olie (0,8L)",
      },
      quantity: 3 * 1 * 0.000007,
    },
    {
      ingredient: {
        itemCode: "0000006142",
        itemName: "Matcha (18385)",
      },
      quantity: 3 * 1 * 0.000008,
    },
    {
      ingredient: {
        itemCode: "0000006171",
        itemName: "Økologiske Cornflakes Glutenfri (10930002)",
      },
      quantity: 3 * 1 * 0.000104,
    },
  ].sort((a, b) => a.ingredient.itemName.localeCompare(b.ingredient.itemName));

  const actualIngredients = (await getIngredients(item)).sort((a, b) =>
    a.ingredient.itemName.localeCompare(b.ingredient.itemName)
  );

  assertEquals(
    actualIngredients.length,
    expectedIngredients.length,
    "Ingredient count mismatch"
  );

  const expectedMap = new Map(
    expectedIngredients.map((usage) => [usage.ingredient.itemCode, usage])
  );

  for (const actualUsage of actualIngredients) {
    const expectedUsage = expectedMap.get(actualUsage.ingredient.itemCode);

    if (!expectedUsage) {
      throw new Error(
        `Unexpected ingredient: ${actualUsage.ingredient.itemName}`
      );
    }

    assertEquals(
      actualUsage.ingredient.itemName,
      expectedUsage.ingredient.itemName
    );
    assertEquals(
      actualUsage.quantity,
      expectedUsage.quantity,
      `Ingredient ${
        (actualUsage.ingredient.itemCode, actualUsage.ingredient.itemName)
      } actual (${actualUsage.quantity}) does not match expected (${
        expectedUsage.quantity
      })`
    );
  }
});
