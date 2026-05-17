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
    category: "First-time parents",
    podcasts: [
      {
        title: "The Birth Hour",
        description: "Real birth stories to help you feel prepared and less alone going into parenthood.",
        link: "https://open.spotify.com/show/3tiGECoYVleYnOWcXlRMfV",
      },
      {
        title: "Pregnancy Podcast",
        description: "Evidence-based answers to the biggest questions about pregnancy, birth and new parenthood.",
        link: "https://open.spotify.com/show/6UfCVpBPWOETiBDQv0QKTF",
      },
      {
        title: "Survive and Thrive by PANDA",
        description: "Honest conversations about the feelings that come with new parenthood that don't get talked about enough.",
        link: "https://surviveandthrive.podbean.com",
      },
    ],
    books: [
      { title: "The Whole-Brain Child", author: "Daniel J. Siegel & Tina Payne Bryson" },
      { title: "Expecting Better", author: "Emily Oster" },
    ],
  },
  {
    category: "Postpartum depression & anxiety",
    podcasts: [
      {
        title: "Mom and Mind",
        description: "Dr. Kat, a perinatal psychologist, gets real about postpartum depression, anxiety and everything no one tells you.",
        link: "https://open.spotify.com/show/6aiewMcVvlROmhuAcYCBty",
      },
      {
        title: "Beyond Postpartum",
        description: "Stories of resilience and recovery — because you are not alone and you will get through this.",
        link: "https://postpartum.org/podcast/",
      },
      {
        title: "I Am One — Postpartum Support International",
        description: "One advocate with a microphone sharing stories that change trajectories.",
        link: "https://postpartum.net/news/i-am-one-podcast/",
      },
    ],
    books: [
      { title: "Good Moms Have Scary Thoughts", author: "Karen Kleiman" },
      { title: "This Isn't What I Expected", author: "Karen Kleiman & Valerie Davis Raskin" },
    ],
  },
  {
    category: "NICU parents",
    podcasts: [
      {
        title: "NICU Babies Parent Support — Hand to Hold",
        description: "Listen while in the NICU, commuting to visits, or in your post-NICU life. You're not alone in this.",
        link: "https://handtohold.org/resources/podcasts/nicu-babies-parent-support/",
      },
      {
        title: "Postpartum Better",
        description: "Chelsea, a postpartum health coach, shares her experience with a NICU baby and what she wishes she'd known.",
        link: "https://podcasts.apple.com/us/podcast/postpartum-better/id1711775028",
      },
    ],
    books: [
      { title: "Preemie Parents: An Action Plan for the NICU and Beyond", author: "Lori Arnold-Rothe" },
      { title: "The NICU Experience", author: "Kali Malone" },
    ],
  },
  {
    category: "Balancing careers and parenting",
    podcasts: [
      {
        title: "The Working Mom Hour",
        description: "Real talk for working moms who know they get more done in an hour than most — and still feel underappreciated.",
        link: "https://open.spotify.com/show/0J84VsR7o7XK58g6xCPEGe",
      },
      {
        title: "Blooming in Motherhood",
        description: "Covers returning to work, work-life balance, identity shifts and the big experiences of the first year.",
        link: "https://open.spotify.com/show/7x2T0Jbs5OlMKcqhORhFdP",
      },
    ],
    books: [
      { title: "Drop the Ball", author: "Tiffany Dufu" },
      { title: "Overwhelmed: Work, Love and Play When No One Has the Time", author: "Brigid Schulte" },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bg }}>
      <main className="mx-auto max-w-3xl px-6 py-10 sm:px-8 sm:py-14">
        <Link href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: c.inkMuted }}>
          ← Back to dashboard
        </Link>

        <div className="mb-10">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: c.ink }}>
            Resources
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: c.inkMuted }}>
            Curated podcasts and books while you wait for your match — or anytime you need them.
          </p>
        </div>

        <div className="space-y-10">
          {resources.map((section) => (
            <section key={section.category}>
              <h2 className="mb-5 text-base font-semibold" style={{ color: c.sage }}>
                {section.category}
              </h2>

              {/* Podcasts */}
              <div className="mb-4 space-y-3">
                {section.podcasts.map((podcast) => (
                  <a key={podcast.title} href={podcast.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-4 rounded-2xl border p-4 transition-opacity hover:opacity-80"
                    style={{ backgroundColor: c.card, borderColor: c.border }}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                      style={{ backgroundColor: c.sageLight }}>
                      🎧
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: c.ink }}>{podcast.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed" style={{ color: c.inkMuted }}>{podcast.description}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Books */}
              <div className="space-y-2">
                {section.books.map((book) => (
                  <div key={book.title}
                    className="flex items-start gap-4 rounded-2xl border p-4"
                    style={{ backgroundColor: c.card, borderColor: c.border }}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                      style={{ backgroundColor: c.apricotLight }}>
                      📖
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: c.ink }}>{book.title}</p>
                      <p className="mt-0.5 text-xs" style={{ color: c.inkMuted }}>{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl p-5 text-center border"
          style={{ backgroundColor: c.sageLight, borderColor: `${c.sage}33` }}>
          <p className="text-sm" style={{ color: c.inkSoft }}>
            Have a resource you'd love to see here?{" "}
            <a href="mailto:khoundsumana@gmail.com" className="font-medium underline" style={{ color: c.sage }}>
              Send it our way
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}