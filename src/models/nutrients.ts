/**
 * Represents nutritional values per 100g.
 */
export interface Nutrients {
  /** Energy in kilojoules (kJ) per 100g */
  energyKj: number;

  /** Energy in kilocalories (kcal) per 100g */
  energyKcal: number;

  /** Fat in grams (g) per 100g */
  fat: number;

  /** Fatty acid in grams (g) per 100g */
  fattyAcid: number;

  /** Carbohydrate in grams (g) per 100g */
  carbohydrate: number;

  /** Sugars in grams (g) per 100g */
  sugars: number;

  /** Protein in grams (g) per 100g */
  protein: number;

  /** Salt in grams (g) per 100g */
  salt: number;
}
