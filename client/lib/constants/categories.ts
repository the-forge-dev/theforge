export const PRODUCT_CATEGORIES = [
  "Aminoácidos",
  "Pre-entrenos",
  "Proteínas",
  "Creatinas",
  "Ganador de masa",
  "Snacks",
  "Drinks",
  "Vitaminas",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
