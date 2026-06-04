export const EXPERIENCE_AREAS = {
  retirement: {
    label: "Retirement / new chapter after work",
    subcategories: [
      "Just left my career",
      "Finding a new rhythm and routine",
      "Figuring out who I am without work",
      "Missing my work community",
      "Part-time work or consulting",
      "Bored or restless in retirement",
      "Loving this chapter",
    ],
  },
  relocation: {
    label: "Relocation / new community",
    subcategories: [
      "Just moved somewhere new",
      "Thinking about where to live next",
      "Moving to be closer to family",
      "Retiring somewhere warmer or abroad",
      "Starting over in a new city",
      "Downsizing and letting go",
    ],
  },
  grandparenting: {
    label: "Grandparenting journey",
    subcategories: [
      "New grandparent",
      "Long-distance grandparenting",
      "Helping raise grandchildren",
      "Navigating different parenting styles",
      "Building a relationship with grandchildren",
      "Step-grandparenting",
    ],
  },
  learning: {
    label: "Learning something new",
    subcategories: [
      "Going back to school",
      "Learning a language",
      "Getting comfortable with technology",
      "Picking up a new skill or hobby",
      "Online courses and communities",
      "Reading and intellectual pursuits",
    ],
  },
  travel: {
    label: "Travel / adventure",
    subcategories: [
      "Solo travel",
      "Traveling with a partner",
      "Group tours and travel clubs",
      "Long-term travel or slow travel",
      "Road trips and local adventures",
      "Traveling with grandchildren",
    ],
  },
  dating: {
    label: "Dating, Relationships & Starting Fresh",
    subcategories: [
      "Dating after loss or divorce",
      "Online dating for the first time",
      "Finding companionship",
      "New relationship in later life",
      "Being happily single",
      "Intimacy and connection at this stage",
    ],
  },
  creative: {
    label: "Creative pursuits",
    subcategories: [
      "Writing and storytelling",
      "Visual arts and crafts",
      "Music and performance",
      "Photography",
      "Gardening and nature",
      "Finally doing what I always wanted",
    ],
  },
  volunteering: {
    label: "Volunteering / giving back",
    subcategories: [
      "Finding the right cause",
      "Using my skills to help others",
      "Mentoring the next generation",
      "Community and civic work",
      "Nonprofit or board involvement",
      "Faith-based service",
    ],
  },
  encoreCareer: {
    label: "Encore career / new work",
    subcategories: [
      "Starting a small business",
      "Consulting or freelancing",
      "A completely different field",
      "Turning a passion into work",
      "Working for meaning, not money",
      "Portfolio of projects",
    ],
  },
  communityBuilding: {
    label: "Community building / making friends",
    subcategories: [
      "Making friends at this stage of life",
      "Feeling lonely or isolated",
      "Building a local community",
      "Online communities and groups",
      "Finding people who share my interests",
      "Moving past acquaintances to real friendships",
    ],
  },
} as const;

export const JOURNEY_STAGES = [
  {
    value: "Just beginning",
    label: "Just beginning",
    sub: "I'm new to this chapter",
  },
  {
    value: "Finding my footing",
    label: "Finding my footing",
    sub: "I've been at it a while, still figuring it out",
  },
  {
    value: "Settled but want more",
    label: "Settled but want more",
    sub: "I'm comfortable, looking to go deeper",
  },
  {
    value: "Here to share",
    label: "Here to share",
    sub: "I've been through it and want to help others",
  },
] as const;

// Flat list of all subcategories for backward-compatibility checks
export const ALL_SUBCATEGORIES: string[] = Object.values(EXPERIENCE_AREAS).flatMap(
  (area) => area.subcategories as readonly string[] as string[]
);
