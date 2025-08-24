import { Allergens, AllergenStatus } from "../models/allergens.ts";
import { IngredientUsage } from "../models/ingredient.ts";

export class AllergensService {
  /** Converts enum to SAP string */
  static allergenStatusToString(status: AllergenStatus): string | undefined {
    switch (status) {
      case AllergenStatus.FreeFrom:
        return "Free from";
      case AllergenStatus.MayContainTraces:
        return "May contain traces of";
      case AllergenStatus.InProduct:
        return "In product";
      default:
        return undefined;
    }
  }

  /** Converts valid SAP string to enum. Returns undefined if no match. */
  static stringToAllergenStatus(str: string): AllergenStatus | undefined {
    switch (str?.trim()) {
      case "Free from":
        return AllergenStatus.FreeFrom;
      case "May contain traces of":
        return AllergenStatus.MayContainTraces;
      case "In product":
        return AllergenStatus.InProduct;
      default:
        return undefined;
    }
  }

  /**
   * Create a new Allergens object.
   * Any unspecified allergens default to AllergenStatus.FreeFrom.
   *
   * @param overrides Partial allergen statuses to set
   * @returns Fully populated Allergens object
   */
  static createAllergens(
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
  static overrideIfHigher(
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
  static aggregateAllergens(ingredients: IngredientUsage[]): Allergens {
    const resultAllergens: Allergens = this.createAllergens();

    for (const usage of ingredients) {
      const allergens = usage.ingredient.allergens;

      for (const key in allergens) {
        const allergenKey = key as keyof Allergens;
        const candidate = allergens[allergenKey];
        const current = resultAllergens[allergenKey];
        resultAllergens[allergenKey] = this.overrideIfHigher(
          current,
          candidate
        );
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
  static buildAllergensDescriptionDa(allergens: Allergens): string {
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
}
