// Aapun design system — single source of truth for colours
// Spec v1.0 — Sky Blue palette

export const c = {
  // Page
  bg: "#F9FAFB",

  // Text
  ink: "#1F2937",
  inkSoft: "#374151",
  inkMuted: "#6B7280",

  // Primary — Sky Blue
  sky: "#0EA5E9",
  skyDark: "#0284C7",
  skyLight: "#E0F2FE",

  // Secondary — Cyan
  cyan: "#06B6D4",
  cyanLight: "#CFFAFE",

  // Accent — Orange
  orange: "#EA580C",
  orangeLight: "#FED7AA",

  // Surfaces
  card: "#ffffff",
  border: "#E5E7EB",
} as const;

// Legacy aliases — keeps existing pages working without a rename pass
export const legacyC = {
  ...c,
  sage: c.sky,
  sageDark: c.skyDark,
  sageLight: c.skyLight,
  apricot: c.orange,
  apricotLight: c.orangeLight,
} as const;
