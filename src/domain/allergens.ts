import { IngredientUsage } from "./ingredient.ts";

export enum AllergenStatus {
  FreeFrom = 0,
  MayContainTraces = 1,
  InProduct = 2,
}

export interface Allergens {
  /** Gluten allergen info */
  gluten: AllergenStatus;

  /** Shellfish allergen info */
  shellfish: AllergenStatus;

  /** Egg allergen info */
  egg: AllergenStatus;

  /** Fish allergen info */
  fish: AllergenStatus;

  /** Peanut allergen info */
  peanut: AllergenStatus;

  /** Soy allergen info */
  soy: AllergenStatus;

  /** Milk allergen info */
  milk: AllergenStatus;

  /** Almond allergen info */
  almond: AllergenStatus;

  /** Hazelnut allergen info */
  hazelnut: AllergenStatus;

  /** Walnut allergen info */
  walnut: AllergenStatus;

  /** Cashew allergen info */
  cashew: AllergenStatus;

  /** Pecan allergen info */
  pecan: AllergenStatus;

  /** Brazil nut allergen info */
  brazilNut: AllergenStatus;

  /** Pistachio allergen info */
  pistachio: AllergenStatus;

  /** Macadamia nut allergen info (Queensland nut) */
  macadamiaNut: AllergenStatus;

  /** Celery allergen info */
  celery: AllergenStatus;

  /** Mustard allergen info */
  mustard: AllergenStatus;

  /** Sesame seed allergen info */
  sesameSeed: AllergenStatus;

  /** Sulphur dioxide allergen info */
  sulphurDioxide: AllergenStatus;

  /** Lupin allergen info */
  lupin: AllergenStatus;

  /** Mollusc allergen info */
  mollusc: AllergenStatus;
}

/**
 * Create a new Allergens object.
 * Any unspecified allergens default to AllergenStatus.FreeFrom.
 *
 * @param overrides Partial allergen statuses to set
 * @returns Fully populated Allergens object
 */
export function createAllergens(
  overrides: Partial<Record<keyof Allergens, AllergenStatus>> = {}
): Allergens {
  // Initialize all allergens to FreeFrom
  const base: Allergens = {
    gluten: AllergenStatus.FreeFrom,
    shellfish: AllergenStatus.FreeFrom,
    egg: AllergenStatus.FreeFrom,
    fish: AllergenStatus.FreeFrom,
    peanut: AllergenStatus.FreeFrom,
    soy: AllergenStatus.FreeFrom,
    milk: AllergenStatus.FreeFrom,
    almond: AllergenStatus.FreeFrom,
    hazelnut: AllergenStatus.FreeFrom,
    walnut: AllergenStatus.FreeFrom,
    cashew: AllergenStatus.FreeFrom,
    pecan: AllergenStatus.FreeFrom,
    brazilNut: AllergenStatus.FreeFrom,
    pistachio: AllergenStatus.FreeFrom,
    macadamiaNut: AllergenStatus.FreeFrom,
    celery: AllergenStatus.FreeFrom,
    mustard: AllergenStatus.FreeFrom,
    sesameSeed: AllergenStatus.FreeFrom,
    sulphurDioxide: AllergenStatus.FreeFrom,
    lupin: AllergenStatus.FreeFrom,
    mollusc: AllergenStatus.FreeFrom,
  };

  return { ...base, ...overrides };
}

export function overrideIfHigher(
  current: AllergenStatus,
  candidate: AllergenStatus
): AllergenStatus {
  return candidate > current ? candidate : current;
}

export function aggregateAllergens(ingredients: IngredientUsage[]): Allergens {
  const resultAllergens: Allergens = createAllergens();

  for (const usage of ingredients) {
    const allergens = usage.ingredient.allergens;

    for (const key in allergens) {
      const allergenKey = key as keyof Allergens;
      const candidate = allergens[allergenKey];
      const current = resultAllergens[allergenKey];
      resultAllergens[allergenKey] = overrideIfHigher(current, candidate);
    }
  }

  return resultAllergens;
}

export function buildAllergensDescriptionDa(allergens: Allergens): string {
  // Helper to check for MayContainTraces only
  const isMayContainTraces = (status: AllergenStatus) =>
    status === AllergenStatus.MayContainTraces;

  const treeNutAllergens = [
    allergens.almond,
    allergens.hazelnut,
    allergens.walnut,
    allergens.cashew,
    allergens.pecan,
    allergens.brazilNut,
    allergens.pistachio,
    allergens.macadamiaNut,
  ];

  const hasTreeNuts = treeNutAllergens.some(isMayContainTraces);

  const otherAllergens = [
    { name: "gluten", status: allergens.gluten },
    { name: "krebsdyr", status: allergens.shellfish },
    { name: "æg", status: allergens.egg },
    { name: "fisk", status: allergens.fish },
    { name: "peanut", status: allergens.peanut },
    { name: "soja", status: allergens.soy },
    { name: "mælk", status: allergens.milk },
    { name: "selleri", status: allergens.celery },
    { name: "sennep", status: allergens.mustard },
    { name: "sesam", status: allergens.sesameSeed },
    { name: "svovldioxid", status: allergens.sulphurDioxide },
    { name: "lupin", status: allergens.lupin },
    { name: "bløddyr", status: allergens.mollusc },
  ];

  const hasOtherAllergens = otherAllergens
    .filter((otherAllergen) => isMayContainTraces(otherAllergen.status))
    .map((otherAllergen) => otherAllergen.name);

  const includedAllergens: string[] = [];

  if (hasTreeNuts) includedAllergens.push("nødder");
  includedAllergens.push(...hasOtherAllergens);

  if (includedAllergens.length === 0) return "";

  const lastIndex = includedAllergens.length - 1;
  const allergenText = includedAllergens
    .map((item, index) =>
      index === 0 ? item : index === lastIndex ? "og " + item : item
    )
    .join(", ");

  return `Kan indeholde spor af ${allergenText}`;
}
