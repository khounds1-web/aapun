"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const c = {
  bg: "#f7f5f2",
  ink: "#1a1a2e",
  inkMuted: "#7a7a9a",
  inkSoft: "#4a4a6a",
  sage: "#6b5b9e",
  sageLight: "#ede9f7",
  apricot: "#c97a52",
  apricotLight: "#faf0e8",
  card: "#ffffff",
  border: "rgba(107,91,158,0.1)",
} as const;

type Topic = {
  id: string;
  full_name: string;
  description: string;
  experience_categories: string[];
  created_at: string;
  matched_with?: string;
  match_id?: string;
};

type Resource = {
  id: string;
  type: "listen" | "read";
  title: string;
  subtitle: string;
  link: string;
  cover_bg: string;
  cover_text: string;
};

type GroupedCategory = {
  category: string;
  topics: Topic[];
  matches: Topic[];
  unmatched: Topic[];
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<Resource | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("home");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/"); return; }
    loadTopics();
  }, [isLoaded, user]);

  async function loadTopics() {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    const topicsData = data || [];
    setTopics(topicsData);
    setLoading(false);

    const allCategories = Array.from(
      new Set(topicsData.flatMap((t: Topic) => t.experience_categories))
    );
    if (allCategories.length > 0) {
      await loadDailyResource(user.id, allCategories);
    }

    if (topicsData.length > 0) {
      const matchIds = topicsData.filter((t: Topic) => t.match_id).map((t: Topic) => t.match_id);
      if (matchIds.length > 0) {
        const { data: unread } = await supabase
          .from("messages")
          .select("match_id")
          .in("match_id", matchIds)
          .neq("sender_id", user.id)
          .eq("read", false);
        const counts: Record<string, number> = {};
        (unread || []).forEach((m: { match_id: string }) => {
          counts[m.match_id] = (counts[m.match_id] || 0) + 1;
        });
        setUnreadCounts(counts);
      }
    }
  }

  async function loadDailyResource(userId: string, categories: string[]) {
    const { data: seenData } = await supabase
      .from("user_seen_resources")
      .select("resource_id")
      .eq("user_id", userId);
    const seenIds = (seenData || []).map((r: { resource_id: string }) => r.resource_id);
    let query = supabase.from("resources").select("*").in("category", categories).limit(20);
    if (seenIds.length > 0) query = query.not("id", "in", `(${seenIds.join(",")})`);
    const { data: available } = await query;
    if (!available || available.length === 0) return;
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const picked = available[seed % available.length];
    setResource(picked);
    await supabase.from("user_seen_resources").insert([{ user_id: userId, resource_id: picked.id }]);
  }

  const firstName = user?.firstName || topics[0]?.full_name?.split(" ")[0] || "there";

  const groupedCategories: GroupedCategory[] = [];
  const seen = new Map<string, GroupedCategory>();
  topics.forEach((topic) => {
    const key = topic.experience_categories.join(",");
    if (!seen.has(key)) {
      const group: GroupedCategory = { category: topic.experience_categories[0] || "General", topics: [], matches: [], unmatched: [] };
      seen.set(key, group);
      groupedCategories.push(group);
    }
    const group = seen.get(key)!;
    group.topics.push(topic);
    if (topic.matched_with) group.matches.push(topic);
    else group.unmatched.push(topic);
  });

  const matchedGroups = groupedCategories.filter(g => g.matches.length > 0);
  const aiHref = topics.length > 0 ? `/ai-chat/${topics[0].id}` : "/get-started";

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: c.bg, minHeight: "100vh", maxWidth: "430px", margin: "0 auto", display: "flex", flexDirection: "column", position: "relative" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #9b8ec4 0%, #c97a52 100%)", borderRadius: "50%", opacity: 0.85 }} />
          <span style={{ fontSize: "17px", fontWeight: "600", color: c.ink, letterSpacing: "-0.3px" }}>aapun</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <UserButton />
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 100px" }}>

        {/* Greeting */}
        <div style={{ marginBottom: "24px", marginTop: "8px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: "700", color: c.ink, letterSpacing: "-0.8px", lineHeight: "1.2", margin: "0 0 6px" }}>
            {getGreeting()},<br />{firstName} 👋
          </h1>
          <p style={{ fontSize: "15px", color: c.inkMuted, margin: 0, lineHeight: "1.5" }}>
            Meaningful conversations<br />beyond your everyday circle.
          </p>
        </div>

        {loading ? (
          <p style={{ fontSize: "14px", color: c.inkMuted }}>Loading...</p>
        ) : (
          <>
            {/* Current conversation card */}
            {matchedGroups.length > 0 && (
              <div style={{ background: c.card, borderRadius: "20px", padding: "20px", marginBottom: "28px", border: `0.5px solid ${c.border}`, boxShadow: "0 2px 12px rgba(107,91,158,0.07)" }}>
                <p style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", color: c.sage, margin: "0 0 10px", textTransform: "uppercase" }}>Your spaces</p>
                {matchedGroups.map((group, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: i < matchedGroups.length - 1 ? "16px" : 0, paddingBottom: i < matchedGroups.length - 1 ? "16px" : 0, borderBottom: i < matchedGroups.length - 1 ? `0.5px solid #f0edf8` : "none" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: c.sageLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "20px" }}>
                      💬
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: "16px", fontWeight: "600", color: c.ink, margin: "0 0 3px", letterSpacing: "-0.3px" }}>
                        {group.topics[0].experience_categories[0]}
                      </h2>
                      <p style={{ fontSize: "14px", color: c.inkMuted, margin: "0 0 12px" }}>
                        With {group.matches[0].matched_with}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div />
                        <Link href={`/chat/${group.matches[0].match_id}`} style={{
                          background: c.sage, color: "white", border: "none",
                          borderRadius: "22px", padding: "10px 18px",
                          fontSize: "14px", fontWeight: "500", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: "6px",
                          textDecoration: "none", whiteSpace: "nowrap",
                        }}>
                          {unreadCounts[group.matches[0].match_id!] > 0 && (
                            <span style={{ background: c.apricot, borderRadius: "50%", width: "18px", height: "18px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>
                              {unreadCounts[group.matches[0].match_id!]}
                            </span>
                          )}
                          Continue →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {groupedCategories.filter(g => g.unmatched.length > 0).map((group, i) => (
                  <div key={`unmatched-${i}`} style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: matchedGroups.length > 0 ? "16px" : 0, paddingTop: matchedGroups.length > 0 ? "16px" : 0, borderTop: matchedGroups.length > 0 ? `0.5px solid #f0edf8` : "none" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#faf0e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "20px" }}>
                      🌸
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: "16px", fontWeight: "600", color: c.ink, margin: "0 0 3px" }}>
                        {group.topics[0].experience_categories[0]}
                      </h2>
                      <p style={{ fontSize: "13px", color: c.inkMuted, margin: 0 }}>Finding your match...</p>
                    </div>
                    <Link href={`/ai-chat/${group.topics[0].id}`} style={{ fontSize: "13px", color: c.apricot, fontWeight: "500", textDecoration: "none" }}>
                      Reflect →
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* People you may connect with */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px" }}>
                <h2 style={{ fontSize: "17px", fontWeight: "600", color: c.ink, margin: 0, letterSpacing: "-0.3px" }}>
                  People you may connect with
                </h2>
                <Link href="/get-started" style={{ fontSize: "13px", color: c.sage, fontWeight: "500", textDecoration: "none" }}>
                  + Add →
                </Link>
              </div>
              <div style={{ background: c.card, borderRadius: "20px", border: `0.5px solid ${c.border}`, overflow: "hidden" }}>
                {groupedCategories.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: c.inkMuted, margin: "0 0 12px" }}>Add a space to find your people</p>
                    <Link href="/get-started" style={{ fontSize: "14px", color: c.sage, fontWeight: "500", textDecoration: "none" }}>Get started →</Link>
                  </div>
                ) : (
                  groupedCategories.map((group, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: idx < groupedCategories.length - 1 ? "0.5px solid #f0edf8" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: c.sageLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                          💬
                        </div>
                        <div>
                          <p style={{ fontSize: "15px", fontWeight: "500", color: c.ink, margin: "0 0 2px" }}>{group.category}</p>
                          <p style={{ fontSize: "13px", color: c.inkMuted, margin: 0 }}>
                            {group.matches.length > 0 ? `Matched with ${group.matches[0].matched_with}` : "Finding your match"}
                          </p>
                        </div>
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9ab8" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom row: resource + AI */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {resource && (
                <a href={resource.link} target="_blank" rel="noopener noreferrer" style={{ background: c.card, borderRadius: "20px", padding: "16px", border: `0.5px solid rgba(201,122,82,0.15)`, textDecoration: "none" }}>
                  <p style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", color: c.apricot, margin: "0 0 10px", textTransform: "uppercase" }}>For today</p>
                  <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: c.apricotLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginBottom: "10px" }}>🎧</div>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: c.ink, margin: "0 0 4px", lineHeight: "1.3" }}>{resource.title}</p>
                  <p style={{ fontSize: "12px", color: c.inkMuted, margin: "0 0 12px" }}>{resource.subtitle?.slice(0, 40)}</p>
                  <span style={{ fontSize: "13px", color: c.apricot, fontWeight: "500" }}>Listen →</span>
                </a>
              )}

              <Link href={aiHref} style={{ background: c.sageLight, borderRadius: "20px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", textDecoration: "none" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: c.sage, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                  <span style={{ color: "white", fontSize: "16px" }}>✦</span>
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: c.ink, margin: "0 0 4px", lineHeight: "1.3" }}>
                    Reflect quietly<br />with Aapun AI
                  </p>
                  <span style={{ fontSize: "13px", color: c.sage, fontWeight: "500", marginTop: "10px", display: "block" }}>Begin →</span>
                </div>
              </Link>
            </div>

            {/* Notes link */}
            <Link href="/notes" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: c.card, borderRadius: "20px", padding: "16px 18px", marginTop: "12px", border: `0.5px solid ${c.border}`, textDecoration: "none" }}>
              <div>
                <p style={{ fontSize: "15px", fontWeight: "600", color: c.ink, margin: "0 0 2px" }}>Notes for the day</p>
                <p style={{ fontSize: "13px", color: c.inkMuted, margin: 0 }}>A private space for your thoughts.</p>
              </div>
              <span style={{ fontSize: "20px" }}>✏️</span>
            </Link>

            <p style={{ fontSize: "12px", color: c.inkMuted, textAlign: "center", marginTop: "24px", fontStyle: "italic" }}>
              This is your quiet place. Come back anytime. ♡
            </p>
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "430px", background: "white", borderTop: "0.5px solid #eeeaf4", display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 10 }}>
        {[
          { id: "home", label: "Home", href: "/dashboard" },
          { id: "spaces", label: "Spaces", href: "/get-started" },
          { id: "notes", label: "Notes", href: "/notes" },
          { id: "profile", label: "Profile", href: "/" },
        ].map(tab => (
          <Link key={tab.id} href={tab.href} onClick={() => setActiveTab(tab.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "4px 16px", textDecoration: "none" }}>
            <span style={{ fontSize: "20px" }}>
              {tab.id === "home" ? "🏠" : tab.id === "spaces" ? "💬" : tab.id === "notes" ? "✏️" : "👤"}
            </span>
            <span style={{ fontSize: "11px", fontWeight: "500", color: activeTab === tab.id ? c.sage : "#9a9ab8" }}>{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}