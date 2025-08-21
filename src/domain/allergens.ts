import { IngredientUsage } from "./ingredient.ts";

/**
 * Status levels representing the presence of an allergen in a product.
 */
export enum AllergenStatus {
  /** Allergen is absent. */
  FreeFrom = 0,

  /** Allergen may be present as traces. */
  MayContainTraces = 1,

  /** Allergen is present in the product. */
  InProduct = 2,
}

/**
 * Represents allergen statuses for common allergens in a product.
 */
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

/**
 * Returns the higher allergen status between current and candidate.
 *
 * @param current Current allergen status.
 * @param candidate Candidate allergen status to compare.
 * @returns The higher of the two statuses, or current if they are equal.
 */
export function overrideIfHigher(
  current: AllergenStatus,
  candidate: AllergenStatus
): AllergenStatus {
  return candidate > current ? candidate : current;
}

/**
 * Aggregates allergens from a list of ingredient usages by inspecting the allergens of each ingredient.
 *
 * @param ingredients List of ingredient usages whose ingredients contain allergen info.
 * @returns Aggregated allergens representing the combined allergen status of all ingredients.
 */
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

/**
 * Builds a Danish allergens description string based on allergen statuses.
 *
 * @param allergens The aggregated allergens object.
 * @returns Localized description of potential allergen traces.
 */
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
