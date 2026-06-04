"use client";

import Link from "next/link";

const c = {
  bg: "#f4f0f8",
  ink: "#1e1a2e",
  inkSoft: "#4a4060",
  inkMuted: "#8a7fa0",
  sage: "#6b5b9e",
  sageDark: "#574a85",
  sageLight: "#ede8f8",
  apricot: "#c97a52",
  apricotLight: "#f3e4db",
  card: "#ffffff",
  border: "#ddd6f0",
} as const;

const resources = [
  {
    category: "Retirement & New Chapter After Work",
    podcasts: [
      {
        title: "The Retirement Answer Man",
        description:
          "Roger Whitney helps you plan not just the money side of retirement, but what it actually feels like to live it — purpose, identity, and all.",
        link: "https://rogerwhitney.com/retirement-answer-man-podcast/",
      },
      {
        title: "Second Act Stories",
        description:
          "Real people share how they reinvented themselves in the second half of life — new careers, new passions, new purpose.",
        link: "https://www.aarp.org/podcasts/second-act-stories/",
      },
    ],
    books: [
      {
        title: "How to Retire Happy, Wild, and Free",
        author: "Ernie J. Zelinski",
      },
      { title: "Designing Your Life", author: "Bill Burnett & Dave Evans" },
      { title: "Transitions", author: "William Bridges" },
    ],
  },
  {
    category: "Encore Career & New Work",
    podcasts: [
      {
        title: "Second Act Stories",
        description:
          "Stories of people who left one career and found something more meaningful — often something they never expected.",
        link: "https://www.aarp.org/podcasts/second-act-stories/",
      },
      {
        title: "WorkLife with Adam Grant",
        description:
          "Organisational psychologist Adam Grant explores the science of making work more meaningful — at any age.",
        link: "https://www.ted.com/podcasts/worklife",
      },
    ],
    books: [
      {
        title: "Encore: Finding Work That Matters in the Second Half of Life",
        author: "Marc Freedman",
      },
      { title: "Late Bloomers", author: "Rich Karlgaard" },
    ],
  },
  {
    category: "Travel & Adventure",
    podcasts: [
      {
        title: "Senior Nomads",
        description:
          "Michael and Debbie Campbell sold their home after retirement and have been travelling the world slowly ever since. Practical, honest, and joyful.",
        link: "https://seniornomads.com",
      },
      {
        title: "Amateur Traveler",
        description:
          "Destination-focused episodes covering every corner of the world — great for planning your next journey.",
        link: "https://amateurtraveler.com/podcast/",
      },
    ],
    books: [
      {
        title: "Senior Nomads: Our Life of Travel",
        author: "Debbie Campbell",
      },
      {
        title: "The Art of Travel",
        author: "Alain de Botton",
      },
    ],
  },
  {
    category: "Dating, Relationships & Starting Fresh",
    podcasts: [
      {
        title: "Better After 50",
        description:
          "Felice Shapiro covers love, dating, health and reinvention in the second half — honest conversations you won't find elsewhere.",
        link: "https://betterafter50.com/podcast",
      },
      {
        title: "Midlife Love Out Loud",
        description:
          "Real conversations about dating, relationships and starting over after 50 — with warmth and no judgement.",
        link: "https://podcasts.apple.com/us/podcast/midlife-love-out-loud/id1492773509",
      },
    ],
    books: [
      {
        title: "Dating After 50 For Dummies",
        author: "Pepper Schwartz",
      },
      {
        title: "The New Love Deal",
        author: "Arlene Dubin",
      },
    ],
  },
  {
    category: "Creative Pursuits",
    podcasts: [
      {
        title: "The Jealous Curator",
        description:
          "Danielle Krysa interviews working artists about their creative lives — and the fear, doubt and joy that comes with making things.",
        link: "https://thejealouscurator.com/podcast/",
      },
      {
        title: "Magic Lessons with Elizabeth Gilbert",
        description:
          "The author of Big Magic coaches real people through their creative fears. Warm, funny, and deeply encouraging.",
        link: "https://www.elizabethgilbert.com/magic-lessons/",
      },
    ],
    books: [
      { title: "The Artist's Way", author: "Julia Cameron" },
      { title: "Big Magic", author: "Elizabeth Gilbert" },
      { title: "Bird by Bird", author: "Anne Lamott" },
    ],
  },
  {
    category: "Grandparenting Journey",
    podcasts: [
      {
        title: "Inheritance",
        description:
          "Stories about what we pass down — values, memories, and the things we wish someone had told us.",
        link: "https://podcasts.apple.com/us/podcast/inheritance/id1570102928",
      },
    ],
    books: [
      { title: "The Grandparent Effect", author: "Josh Mulvihill" },
      {
        title: "Long-Distance Grandparenting",
        author: "Wayne Rice & David Staal",
      },
      {
        title: "How to Grandparent",
        author: "David Elkind",
      },
    ],
  },
  {
    category: "Community Building & Making Friends",
    podcasts: [
      {
        title: "Better After 50",
        description:
          "Covers loneliness, friendship, and building a life with people who actually get you — in the second half.",
        link: "https://betterafter50.com/podcast",
      },
      {
        title: "The Ezra Klein Show",
        description:
          "Thoughtful long-form conversations about meaning, community, and how we live together.",
        link: "https://www.nytimes.com/column/ezra-klein-podcast",
      },
    ],
    books: [
      {
        title: "The Art of Friendship",
        author: "Roger Horchow & Sally Horchow",
      },
      { title: "Friendfluence", author: "Carlin Flora" },
    ],
  },
  {
    category: "Volunteering & Giving Back",
    podcasts: [
      {
        title: "Second Act Stories",
        description:
          "Many of these stories involve people who found their purpose through service and giving back.",
        link: "https://www.aarp.org/podcasts/second-act-stories/",
      },
    ],
    books: [
      { title: "Giving 2.0", author: "Laura Arrillaga-Andreessen" },
      {
        title: "Encore: Finding Work That Matters in the Second Half of Life",
        author: "Marc Freedman",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bg }}>
      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-8 sm:py-14">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-base font-medium transition-opacity hover:opacity-70"
          style={{ color: c.inkMuted }}
        >
          ← Back to dashboard
        </Link>

        <div className="mb-10">
          <h1
            className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: c.ink }}
          >
            Resources
          </h1>
          <p className="text-base leading-relaxed" style={{ color: c.inkMuted }}>
            Podcasts and books curated for this chapter of life — to listen to while
            you wait for your match, or anytime you need them.
          </p>
        </div>

        <div className="space-y-10">
          {resources.map((section) => (
            <section key={section.category}>
              <h2
                className="mb-5 text-base font-semibold"
                style={{ color: c.sage }}
              >
                {section.category}
              </h2>

              {/* Podcasts */}
              <div className="mb-4 space-y-3">
                {section.podcasts.map((podcast) => (
                  <a
                    key={podcast.title}
                    href={podcast.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 rounded-2xl border p-4 transition-opacity hover:opacity-80"
                    style={{ backgroundColor: c.card, borderColor: c.border }}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
                      style={{ backgroundColor: c.sageLight }}
                    >
                      🎧
                    </div>
                    <div>
                      <p
                        className="font-medium text-base"
                        style={{ color: c.ink }}
                      >
                        {podcast.title}
                      </p>
                      <p
                        className="mt-1 text-sm leading-relaxed"
                        style={{ color: c.inkMuted }}
                      >
                        {podcast.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Books */}
              <div className="space-y-2">
                {section.books.map((book) => (
                  <div
                    key={book.title}
                    className="flex items-start gap-4 rounded-2xl border p-4"
                    style={{ backgroundColor: c.card, borderColor: c.border }}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
                      style={{ backgroundColor: c.apricotLight }}
                    >
                      📖
                    </div>
                    <div>
                      <p
                        className="font-medium text-base"
                        style={{ color: c.ink }}
                      >
                        {book.title}
                      </p>
                      <p
                        className="mt-0.5 text-sm"
                        style={{ color: c.inkMuted }}
                      >
                        {book.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div
          className="mt-12 rounded-2xl border p-5 text-center"
          style={{ backgroundColor: c.sageLight, borderColor: `${c.sage}33` }}
        >
          <p className="text-base" style={{ color: c.inkSoft }}>
            Have a podcast or book you'd love to see here?{" "}
            <a
              href="mailto:khoundsumana@gmail.com"
              className="font-medium underline"
              style={{ color: c.sage }}
            >
              Send it our way
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
