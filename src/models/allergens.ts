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
