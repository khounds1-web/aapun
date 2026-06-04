// app/lib/resources.ts
export type Resource = {
  type: "listen" | "read";
  title: string;
  subtitle: string;
  link: string;
  coverBg: string;
  coverText: string;
};

export const RESOURCE_MAP: Record<string, Resource[]> = {
  // ── Retirement & New Chapter After Work ────────────────────────────────────
  "Just left my career": [
    {
      type: "listen",
      title: "The Retirement Answer Man",
      subtitle: "Roger Whitney — practical planning for your next chapter",
      link: "https://rogerwhitney.com/retirement-answer-man-podcast/",
      coverBg: "#d4e4d8",
      coverText: "Retire-\nment\nAnswer\nMan",
    },
    {
      type: "read",
      title: "How to Retire Happy, Wild, and Free",
      subtitle: "Ernie J. Zelinski — retirement beyond the money",
      link: "https://www.goodreads.com/book/show/271545.How_to_Retire_Happy_Wild_and_Free",
      coverBg: "#e8e2d4",
      coverText: "Happy\nWild &\nFree",
    },
  ],
  "Figuring out who I am without work": [
    {
      type: "read",
      title: "Designing Your Life",
      subtitle: "Bill Burnett & Dave Evans — build a life that works for you",
      link: "https://www.goodreads.com/book/show/26046333-designing-your-life",
      coverBg: "#ddd4e8",
      coverText: "Design-\ning\nYour\nLife",
    },
    {
      type: "read",
      title: "Transitions",
      subtitle: "William Bridges — making sense of life's changes",
      link: "https://www.goodreads.com/book/show/8928780-transitions",
      coverBg: "#e8e2d4",
      coverText: "Transi-\ntions",
    },
  ],
  "Bored or restless in retirement": [
    {
      type: "listen",
      title: "The Retirement Answer Man",
      subtitle: "Roger Whitney — finding purpose and flow",
      link: "https://rogerwhitney.com/retirement-answer-man-podcast/",
      coverBg: "#d4e4d8",
      coverText: "Retire-\nment\nAnswer\nMan",
    },
    {
      type: "read",
      title: "Late Bloomers",
      subtitle: "Rich Karlgaard — the power of patience in a fast-moving world",
      link: "https://www.goodreads.com/book/show/40190737-late-bloomers",
      coverBg: "#ddd4e8",
      coverText: "Late\nBloom-\ners",
    },
  ],

  // ── Encore Career & New Work ───────────────────────────────────────────────
  "Starting a small business": [
    {
      type: "listen",
      title: "Second Act Stories",
      subtitle: "Real stories of people reinventing themselves in later life",
      link: "https://www.aarp.org/podcasts/second-act-stories/",
      coverBg: "#d4dce8",
      coverText: "Second\nAct\nStories",
    },
    {
      type: "read",
      title: "Encore",
      subtitle: "Marc Freedman — finding work that matters in the second half",
      link: "https://www.goodreads.com/book/show/2265397.Encore",
      coverBg: "#e8e2d4",
      coverText: "Encore",
    },
  ],
  "Turning a passion into work": [
    {
      type: "listen",
      title: "Second Act Stories",
      subtitle: "Real stories of people reinventing themselves",
      link: "https://www.aarp.org/podcasts/second-act-stories/",
      coverBg: "#d4dce8",
      coverText: "Second\nAct\nStories",
    },
    {
      type: "read",
      title: "Late Bloomers",
      subtitle: "Rich Karlgaard — it's never too late to find your calling",
      link: "https://www.goodreads.com/book/show/40190737-late-bloomers",
      coverBg: "#ddd4e8",
      coverText: "Late\nBloom-\ners",
    },
  ],
  "Working for meaning, not money": [
    {
      type: "read",
      title: "Encore",
      subtitle: "Marc Freedman — purpose-driven work in the second half of life",
      link: "https://www.goodreads.com/book/show/2265397.Encore",
      coverBg: "#e8e2d4",
      coverText: "Encore",
    },
  ],

  // ── Travel & Adventure ─────────────────────────────────────────────────────
  "Solo travel": [
    {
      type: "listen",
      title: "Senior Nomads",
      subtitle: "Michael & Debbie Campbell — a life of slow travel after 60",
      link: "https://seniornomads.com",
      coverBg: "#d4e8e4",
      coverText: "Senior\nNomads",
    },
    {
      type: "read",
      title: "Unbeaten Tracks in Japan",
      subtitle: "Isabella Bird — a classic of solo adventure travel",
      link: "https://www.goodreads.com/book/show/248478.Unbeaten_Tracks_in_Japan",
      coverBg: "#e8e2d4",
      coverText: "Un-\nbeaten\nTracks",
    },
  ],
  "Long-term travel or slow travel": [
    {
      type: "listen",
      title: "Senior Nomads",
      subtitle: "How to travel the world slowly and affordably after 60",
      link: "https://seniornomads.com",
      coverBg: "#d4e8e4",
      coverText: "Senior\nNomads",
    },
  ],

  // ── Dating, Relationships & Starting Fresh ─────────────────────────────────
  "Dating after loss or divorce": [
    {
      type: "listen",
      title: "Better After 50",
      subtitle: "Felice Shapiro — life, love and reinvention in the second half",
      link: "https://betterafter50.com/podcast",
      coverBg: "#e8d4e4",
      coverText: "Better\nAfter\n50",
    },
    {
      type: "read",
      title: "Dating After 50 For Dummies",
      subtitle: "Pepper Schwartz — a practical guide to love again",
      link: "https://www.goodreads.com/book/show/18775786-dating-after-50-for-dummies",
      coverBg: "#ddd4e8",
      coverText: "Dating\nAfter\n50",
    },
  ],
  "Finding companionship": [
    {
      type: "listen",
      title: "Better After 50",
      subtitle: "Felice Shapiro — on connection, friendship and companionship",
      link: "https://betterafter50.com/podcast",
      coverBg: "#e8d4e4",
      coverText: "Better\nAfter\n50",
    },
  ],
  "New relationship in later life": [
    {
      type: "read",
      title: "Dating After 50 For Dummies",
      subtitle: "Pepper Schwartz — navigating love in the second half",
      link: "https://www.goodreads.com/book/show/18775786-dating-after-50-for-dummies",
      coverBg: "#ddd4e8",
      coverText: "Dating\nAfter\n50",
    },
  ],

  // ── Creative Pursuits ─────────────────────────────────────────────────────
  "Writing and storytelling": [
    {
      type: "read",
      title: "The Artist's Way",
      subtitle: "Julia Cameron — a spiritual path to higher creativity",
      link: "https://www.goodreads.com/book/show/615570.The_Artist_s_Way",
      coverBg: "#ddd4e8",
      coverText: "The\nArtist's\nWay",
    },
    {
      type: "read",
      title: "Bird by Bird",
      subtitle: "Anne Lamott — instructions on writing and life",
      link: "https://www.goodreads.com/book/show/12543.Bird_by_Bird",
      coverBg: "#e8e2d4",
      coverText: "Bird\nby\nBird",
    },
  ],
  "Visual arts and crafts": [
    {
      type: "read",
      title: "The Artist's Way",
      subtitle: "Julia Cameron — unlock the creativity you've always had",
      link: "https://www.goodreads.com/book/show/615570.The_Artist_s_Way",
      coverBg: "#ddd4e8",
      coverText: "The\nArtist's\nWay",
    },
    {
      type: "read",
      title: "Big Magic",
      subtitle: "Elizabeth Gilbert — creative living beyond fear",
      link: "https://www.goodreads.com/book/show/24453082-big-magic",
      coverBg: "#e8e2d4",
      coverText: "Big\nMagic",
    },
  ],
  "Finally doing what I always wanted": [
    {
      type: "read",
      title: "Big Magic",
      subtitle: "Elizabeth Gilbert — creative living beyond fear",
      link: "https://www.goodreads.com/book/show/24453082-big-magic",
      coverBg: "#e8e2d4",
      coverText: "Big\nMagic",
    },
    {
      type: "read",
      title: "Late Bloomers",
      subtitle: "Rich Karlgaard — it's never too late",
      link: "https://www.goodreads.com/book/show/40190737-late-bloomers",
      coverBg: "#ddd4e8",
      coverText: "Late\nBloom-\ners",
    },
  ],

  // ── Community Building & Making Friends ────────────────────────────────────
  "Feeling lonely or isolated": [
    {
      type: "read",
      title: "The Art of Friendship",
      subtitle: "Roger Horchow & Sally Horchow — the small steps to deeper friendships",
      link: "https://www.goodreads.com/book/show/292731.The_Art_of_Friendship",
      coverBg: "#d4e4d8",
      coverText: "The Art\nof\nFriend-\nship",
    },
    {
      type: "read",
      title: "Friendfluence",
      subtitle: "Carlin Flora — the surprising ways friends make us who we are",
      link: "https://www.goodreads.com/book/show/13414613-friendfluence",
      coverBg: "#e8e2d4",
      coverText: "Friend-\nfluence",
    },
  ],
  "Making friends at this stage of life": [
    {
      type: "read",
      title: "The Art of Friendship",
      subtitle: "Roger Horchow & Sally Horchow",
      link: "https://www.goodreads.com/book/show/292731.The_Art_of_Friendship",
      coverBg: "#d4e4d8",
      coverText: "The Art\nof\nFriend-\nship",
    },
  ],

  // ── Grandparenting Journey ─────────────────────────────────────────────────
  "New grandparent": [
    {
      type: "read",
      title: "The Grandparent Effect",
      subtitle: "Josh Mulvihill — the profound influence grandparents have",
      link: "https://www.goodreads.com/book/show/33654455-the-grandparent-effect",
      coverBg: "#d4e4d8",
      coverText: "Grand-\nparent\nEffect",
    },
  ],
  "Long-distance grandparenting": [
    {
      type: "read",
      title: "Long-Distance Grandparenting",
      subtitle: "Wayne Rice & David Staal — staying close across the miles",
      link: "https://www.goodreads.com/book/show/36673830-long-distance-grandparenting",
      coverBg: "#e8e2d4",
      coverText: "Long\nDist-\nance",
    },
  ],

  // ── Volunteering & Giving Back ─────────────────────────────────────────────
  "Using my skills to help others": [
    {
      type: "read",
      title: "Encore",
      subtitle: "Marc Freedman — using your experience for the greater good",
      link: "https://www.goodreads.com/book/show/2265397.Encore",
      coverBg: "#e8e2d4",
      coverText: "Encore",
    },
    {
      type: "read",
      title: "Giving 2.0",
      subtitle: "Laura Arrillaga-Andreessen — transforming how you give",
      link: "https://www.goodreads.com/book/show/13568925-giving-2-0",
      coverBg: "#d4e4d8",
      coverText: "Giving\n2.0",
    },
  ],
  "Mentoring the next generation": [
    {
      type: "listen",
      title: "Second Act Stories",
      subtitle: "Stories of giving back and mentoring in later life",
      link: "https://www.aarp.org/podcasts/second-act-stories/",
      coverBg: "#d4dce8",
      coverText: "Second\nAct\nStories",
    },
  ],
};

export const DEFAULT_RESOURCES: Resource[] = [
  {
    type: "listen",
    title: "The Retirement Answer Man",
    subtitle: "Roger Whitney — living well in your next chapter",
    link: "https://rogerwhitney.com/retirement-answer-man-podcast/",
    coverBg: "#d4e4d8",
    coverText: "Retire-\nment\nAnswer\nMan",
  },
  {
    type: "listen",
    title: "Second Act Stories",
    subtitle: "Real stories of reinvention in the second half of life",
    link: "https://www.aarp.org/podcasts/second-act-stories/",
    coverBg: "#d4dce8",
    coverText: "Second\nAct\nStories",
  },
  {
    type: "read",
    title: "How to Retire Happy, Wild, and Free",
    subtitle: "Ernie J. Zelinski",
    link: "https://www.goodreads.com/book/show/271545.How_to_Retire_Happy_Wild_and_Free",
    coverBg: "#e8e2d4",
    coverText: "Happy\nWild &\nFree",
  },
];

export function getResourcesForCategories(categories: string[]): Resource[] {
  const seen = new Set<string>();
  const results: Resource[] = [];

  for (const category of categories) {
    const categoryResources = RESOURCE_MAP[category] || [];
    for (const resource of categoryResources) {
      if (!seen.has(resource.title)) {
        seen.add(resource.title);
        results.push(resource);
      }
      if (results.length >= 3) break;
    }
    if (results.length >= 3) break;
  }

  if (results.length < 3) {
    for (const resource of DEFAULT_RESOURCES) {
      if (!seen.has(resource.title)) {
        seen.add(resource.title);
        results.push(resource);
      }
      if (results.length >= 3) break;
    }
  }

  return results.slice(0, 3);
}
