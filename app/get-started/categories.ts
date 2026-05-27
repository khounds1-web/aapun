export const EXPERIENCE_AREAS = {
  parenting: {
    label: "Parenting",
    subcategories: [
      "Planning to conceive soon",
      "First-time parents",
      "Breastfeeding / Pumping / Formula feeding",
      "Postpartum depression / anxiety",
      "NICU parents",
      "IVF",
      "Immigrant parents",
      "Single parents",
      "Co-parenting after divorce",
      "Stay-at-home parents",
      "Balancing career and parenting",
      "Parents of neurodivergent children",
      "Parents of autistic children",
      "Pregnancy loss / miscarriage",
      "Parenting with a partner who doesn't share the load",
      "Hiring a nanny / caregiver",
      "Other (parenting)",
    ],
  },
  seriousIllness: {
    label: "Serious illness",
    subcategories: [
      "Cancer diagnosis (self)",
      "Cancer caregiver",
      "Chronic pain / chronic illness",
      "Heart disease",
      "Rare disease",
      "Disability (acquired)",
      "Long COVID",
      "Brain injury / stroke",
      "Caring for an aging parent",
      "Caring for a seriously ill partner or child",
      "Other (serious illness)",
    ],
  },
  lifeTransitions: {
    label: "Major life transitions",
    subcategories: [
      "Divorce / separation",
      "Job loss / career crisis",
      "Immigration / relocation",
      "Leaving a religion",
      "Coming out (LGBTQ+)",
      "Retirement and identity loss",
      "Estrangement from family",
      "Starting over after trauma",
      "Loss of home / financial crisis",
      "Other (life transitions)",
    ],
  },
} as const;

export const JOURNEY_STAGES = [
  { value: "Just starting out", label: "Just starting out", sub: "0–6 months in" },
  { value: "Finding my footing", label: "Finding my footing", sub: "6 months – 2 years" },
  { value: "Deep in it", label: "Deep in it", sub: "2–5 years" },
  { value: "Long-term", label: "Long-term", sub: "5+ years" },
] as const;

// Flat list of all subcategories for backward-compatibility checks
export const ALL_SUBCATEGORIES: string[] = Object.values(EXPERIENCE_AREAS).flatMap(
  (area) => area.subcategories as readonly string[] as string[]
);
