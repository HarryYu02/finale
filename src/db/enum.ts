export const accountTypes = [
  "asset",
  "liability",
  "equity",
  "income",
  "expense",
] as const;

export const sides = ["dr", "cr"] as const;

export const stockPriceProvider = ["google_finance"] as const;
