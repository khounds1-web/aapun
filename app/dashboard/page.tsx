"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { MatchProposalCard } from "@/app/components/match-proposal-card";
import type { MatchRequest } from "@/lib/match-request";

const c = {
  ink: "#0c1a2e",
  inkSoft: "#1e3a5f",
  inkMuted: "#4a6280",
  sage: "#0EA5E9",
  sageLight: "#dbeafe",
  apricot: "#EA580C",
  apricotLight: "#fff0e6",
  card: "rgba(255,255,255,0.88)",
  border: "#bfdbfe",
  green: "#0d7c4e",
} as const;

type Topic = {
  id: string;
  full_name: string;
  username: string | null;
  description: string;
  experience_categories: string[];
  created_at: string;
  matched_with?: string;
  match_id?: string;
  user_id: string;
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

type MatchedPerson = {
  name: string;
  match_id: string;
  topics: string[];
  unread: number;
};

type Suggestion = {
  id: string;
  full_name: string;
  username: string | null;
  experience_categories: string[];
  user_id: string;
};

type MatchRequestWithProfile = MatchRequest & {
  from_profile: {
    username: string | null;
    full_name: string;
    description: string;
    experience_categories: string[];
  };
};

type OutgoingProposal = {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  to_user_id: string;
  status: string;
  created_at: string;
  to_profile: {
    username: string | null;
    full_name: string;
    description: string;
    experience_categories: string[];
  };
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Hope you slept okay,";
  if (hour < 17) return "Hope your day is treating you well,";
  return "Hope today was a good one,";
}

function getGreetingEmoji() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  return "🌙";
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = ["#0EA5E9", "#EA580C", "#4a7c5f", "#9b6b5b", "#5b6b9e"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="shrink-0 flex items-center justify-center rounded-full text-white font-semibold"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}>
      {initial}
    </div>
  );
}

function PodcastArtwork({ bg, text }: { bg: string; text: string }) {
  return (
    <div className="shrink-0 rounded-xl flex items-center justify-center p-2 text-center"
      style={{ width: 64, height: 64, backgroundColor: bg }}>
      <span className="font-semibold leading-tight whitespace-pre-line" style={{ color: c.ink, fontSize: 9 }}>
        {text}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<Resource | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [matchedPeople, setMatchedPeople] = useState<MatchedPerson[]>([]);
  const [pendingRequests, setPendingRequests] = useState<MatchRequestWithProfile[]>([]);
  const [outgoingProposals, setOutgoingProposals] = useState<OutgoingProposal[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/"); return; }
    loadData();
  }, [isLoaded, user]);

  async function loadData() {
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

    // Group existing direct matches by person
    const matchMap = new Map<string, MatchedPerson>();
    const matchIds: string[] = [];

    topicsData.forEach((t: Topic) => {
      if (t.matched_with && t.match_id) {
        matchIds.push(t.match_id);
        if (matchMap.has(t.matched_with)) {
          matchMap.get(t.matched_with)!.topics.push(...t.experience_categories);
        } else {
          matchMap.set(t.matched_with, {
            name: t.matched_with,
            match_id: t.match_id,
            topics: [...t.experience_categories],
            unread: 0,
          });
        }
      }
    });

    // Fetch unread counts
    if (matchIds.length > 0) {
      const { data: unread } = await supabase
        .from("messages")
        .select("match_id")
        .in("match_id", matchIds)
        .neq("sender_id", user.id)
        .eq("read", false);

      (unread || []).forEach((m: { match_id: string }) => {
        for (const [, person] of matchMap) {
          if (person.match_id === m.match_id) {
            person.unread++;
          }
        }
      });
    }

    setMatchedPeople(Array.from(matchMap.values()));

    // Load pending match requests for this user
    const { data: pendingData } = await supabase
      .from("match_requests")
      .select(`*, from_profile:profiles!from_profile_id(username, full_name, description, experience_categories)`)
      .eq("to_user_id", user.id)
      .eq("status", "pending");

    const validPending = (pendingData || []).filter(
      (r: MatchRequestWithProfile) => r.from_profile != null
    );
    setPendingRequests(validPending);

    // Load outgoing requests this user sent (waiting for the other person to respond)
    const { data: outgoingData } = await supabase
      .from("match_requests")
      .select(`*, to_profile:profiles!to_profile_id(username, full_name, description, experience_categories)`)
      .eq("from_user_id", user.id)
      .eq("status", "pending");

    setOutgoingProposals(
      (outgoingData || []).filter((r: OutgoingProposal) => r.to_profile != null)
    );

    // Load suggestions and resources
    const allCategories = Array.from(
      new Set(topicsData.flatMap((t: Topic) => t.experience_categories))
    );

    if (allCategories.length > 0) {
      await loadSuggestions(user.id, allCategories, topicsData);
      await loadDailyResource(user.id, allCategories);
    }
  }

  async function loadSuggestions(userId: string, categories: string[], myTopics: Topic[]) {
    const matchedUserIds = new Set(myTopics.filter((t: Topic) => t.matched_with).map((t: Topic) => t.user_id));
    matchedUserIds.add(userId);

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, username, experience_categories, user_id")
      .filter("experience_categories", "ov", `{${categories.map(c => `"${c}"`).join(",")}}`)
      .neq("user_id", userId)
      .limit(10);

    if (!data) return;

    const seenUsers = new Set<string>();
    const unique = data.filter((p: Suggestion) => {
      if (seenUsers.has(p.user_id) || matchedUserIds.has(p.user_id)) return false;
      seenUsers.add(p.user_id);
      return true;
    });

    setSuggestions(unique.slice(0, 3));
  }

  async function sayHello(suggestion: Suggestion) {
    if (!user || connecting) return;
    setConnecting(suggestion.user_id);

    try {
      // Get an unmatched profile for current user (include username for display)
      const { data: myProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("user_id", user.id)
        .is("match_id", null)
        .limit(1);

      const myProfile = myProfiles?.[0];
      if (!myProfile) return;

      const matchId = `${myProfile.id}-${suggestion.id}`;

      // Display names use username where available
      const myDisplayName = (myProfile.username as string | null) ?? myProfile.full_name.split(" ")[0];
      const theirDisplayName = suggestion.username ?? suggestion.full_name.split(" ")[0];

      await supabase.from("profiles").update({
        match_status: "We found you a match!",
        matched_with: theirDisplayName,
        matched_user_id: suggestion.user_id,
        match_id: matchId,
      }).eq("id", myProfile.id);

      await supabase.from("profiles").update({
        match_status: "We found you a match!",
        matched_with: myDisplayName,
        matched_user_id: user.id,
        match_id: matchId,
      }).eq("id", suggestion.id);

      router.push(`/chat/${matchId}`);
    } catch (err) {
      console.error("Error connecting:", err);
    } finally {
      setConnecting(null);
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

    if (!available || available.length === 0) {
      // Fall back to category matches (ignoring seen), then to "default" curated picks
      const { data: fallback } = await supabase.from("resources").select("*").in("category", [...categories, "default"]).limit(10);
      if (!fallback || fallback.length === 0) return;
      const today = new Date();
      const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
      setResource(fallback[seed % fallback.length]);
      return;
    }

    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    setResource(available[seed % available.length]);
  }

  async function markResourceSeen(resourceId: string) {
    if (!user) return;
    await supabase.from("user_seen_resources").insert([{ user_id: user.id, resource_id: resourceId }]);
  }

  // Accept a match proposal → navigate to chat
  function handleProposalAccept(_id: string, matchId: string) {
    router.push(`/chat/${matchId}`);
  }

  // Decline a match proposal → remove card from list
  function handleProposalDecline(id: string) {
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
  }

  // Cancel an outgoing request
  async function handleCancelOutgoing(id: string) {
    try {
      await fetch(`/api/match-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
    } catch {
      // best effort
    }
    setOutgoingProposals((prev) => prev.filter((r) => r.id !== id));
  }

  const firstName = user?.firstName || topics[0]?.full_name?.split(" ")[0] || "there";
  const unmatchedTopics = topics.filter(t => !t.matched_with);
  const aiHref = topics.length > 0 ? `/ai-chat/${topics[0].id}` : "/get-started";

  // All experience categories this user has selected (for shared category display)
  const myAllCategories = Array.from(
    new Set(topics.flatMap((t: Topic) => t.experience_categories))
  );

  const navItems = [
    { label: "Home", href: "/dashboard", icon: "🏠" },
    { label: "Chats", href: "/conversations", icon: "💬" },
    { label: "Spaces", href: "/get-started", icon: "✦" },
    { label: "Notes", href: "/notes", icon: "✏️" },
    { label: "Profile", href: "/", icon: "👤" },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ background: "linear-gradient(145deg, #93c5fd 0%, #bfdbfe 35%, #dbeafe 65%, #eff8ff 100%)" }}>

      {/* Nav */}
      <header className="border-b px-6 sm:px-10" style={{ borderColor: c.border, backgroundColor: "rgba(219,234,254,0.90)" }}>
        <div className="mx-auto max-w-2xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <AapunMark size={26} />
            <span className="text-sm font-semibold" style={{ color: c.ink }}>Aapun</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {navItems.map(item => (
              <Link key={item.label} href={item.href} className="text-sm transition-opacity hover:opacity-60" style={{ color: c.inkMuted }}>
                {item.label}
              </Link>
            ))}
          </div>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 sm:px-10 pb-24 sm:pb-10">

        {/* Greeting */}
        <div className="pt-10 pb-10">
          <p className="text-xl mb-1" style={{ color: c.inkMuted }}>{getGreetingEmoji()}</p>
          <h1 className="text-2xl sm:text-3xl font-semibold leading-snug mb-2" style={{ color: c.ink }}>
            {getGreeting()} {firstName}
          </h1>
          <p className="text-sm" style={{ color: c.inkMuted }}>

          </p>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: c.inkMuted }}>Loading...</p>
        ) : (
          <div className="space-y-10">

            {/* ── Match Proposals — incoming requests (show up to 3) ── */}
            {pendingRequests.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold" style={{ color: c.ink }}>
                    Someone wants to connect
                  </h2>
                  {pendingRequests.length > 3 && (
                    <span className="text-xs rounded-full px-2.5 py-1 font-medium"
                      style={{ backgroundColor: c.apricotLight, color: c.apricot }}>
                      +{pendingRequests.length - 3} more
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((req) => (
                    <MatchProposalCard
                      key={req.id}
                      request={req}
                      currentUserCategories={myAllCategories}
                      onAccept={handleProposalAccept}
                      onDecline={handleProposalDecline}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Outgoing proposals — waiting for the other person ── */}
            {outgoingProposals.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold mb-3" style={{ color: c.ink }}>
                  Waiting for a response
                </h2>
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  {outgoingProposals.map((req, i) => {
                    const profile = req.to_profile;
                    const displayName = profile.username ?? profile.full_name.split(" ")[0];
                    const mySet = new Set(myAllCategories);
                    const shared = profile.experience_categories.filter((cat) => mySet.has(cat));
                    return (
                      <div key={req.id}
                        className={`flex items-center gap-4 px-5 py-4 ${i < outgoingProposals.length - 1 ? "border-b" : ""}`}
                        style={{ borderColor: c.border }}>
                        <Avatar name={displayName} size={40} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: c.ink }}>{displayName}</p>
                          {shared.length > 0 && (
                            <p className="text-xs mt-0.5 truncate" style={{ color: c.inkMuted }}>
                              {shared.slice(0, 2).join(" · ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs rounded-full px-2.5 py-1"
                            style={{ backgroundColor: c.sageLight, color: c.sage }}>
                            Sent ✓
                          </span>
                          <button
                            onClick={() => handleCancelOutgoing(req.id)}
                            className="text-xs transition-opacity hover:opacity-60"
                            style={{ color: c.inkMuted }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Your matches — direct/accepted connections ── */}
            {matchedPeople.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold" style={{ color: c.ink }}>Your matches</h2>
                  <Link href="/get-started" className="text-xs" style={{ color: c.sage }}>+ Add space</Link>
                </div>
                <div className="space-y-3">
                  {matchedPeople.map((person, i) => (
                    <div key={i} className="rounded-2xl border p-5"
                      style={{ backgroundColor: c.card, borderColor: c.border }}>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar name={person.name} size={44} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base" style={{ color: c.ink }}>{person.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>
                            <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5 align-middle" style={{ backgroundColor: c.green }} />
                            Connected
                          </p>
                        </div>
                        {person.unread > 0 && (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold"
                            style={{ backgroundColor: c.apricot }}>
                            {person.unread}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {Array.from(new Set(person.topics)).map((topic, j) => (
                          <span key={j} className="rounded-full px-2.5 py-1 text-xs"
                            style={{ backgroundColor: c.sageLight, color: c.sage }}>
                            {topic}
                          </span>
                        ))}
                      </div>
                      <Link href={`/chat/${person.match_id}`}
                        className="w-full inline-flex items-center justify-center rounded-full py-2.5 text-sm font-medium text-white"
                        style={{ backgroundColor: c.sage }}>
                        Say hello →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Unmatched spaces */}
            {unmatchedTopics.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold" style={{ color: c.ink }}>
                    {matchedPeople.length > 0 ? "Still finding matches" : "Your spaces"}
                  </h2>
                  <Link href="/get-started" className="text-xs" style={{ color: c.sage }}>+ New</Link>
                </div>
                <div className="space-y-2">
                  {unmatchedTopics.map((topic, i) => (
                    <div key={i} className="rounded-2xl border px-4 py-3 flex items-center gap-3"
                      style={{ backgroundColor: c.card, borderColor: c.border }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: c.ink }}>
                          {topic.experience_categories[0]}
                        </p>
                        <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: c.inkMuted }}>
                          <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: c.apricot }} />
                          Finding your match
                        </p>
                      </div>
                      <Link href={`/ai-chat/${topic.id}`}
                        className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
                        style={{ backgroundColor: c.apricotLight, color: c.apricot }}>
                        Reflect →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {matchedPeople.length === 0 && unmatchedTopics.length === 0 && pendingRequests.length === 0 && outgoingProposals.length === 0 && (
              <div className="rounded-2xl border p-10 text-center" style={{ backgroundColor: c.card, borderColor: c.border }}>
                <p className="text-sm mb-4" style={{ color: c.inkMuted }}>Add your first space to begin.</p>
                <Link href="/get-started"
                  className="inline-flex h-9 items-center justify-center rounded-full px-6 text-sm font-medium text-white"
                  style={{ backgroundColor: c.sage }}>
                  Begin
                </Link>
              </div>
            )}

            {/* People you may connect with */}
            {suggestions.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold mb-4" style={{ color: c.ink }}>People you may connect with</h2>
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: c.card, borderColor: c.border }}>
                  {suggestions.map((suggestion, i) => (
                    <div key={suggestion.id}
                      className={`flex items-center gap-4 px-5 py-4 ${i < suggestions.length - 1 ? "border-b" : ""}`}
                      style={{ borderColor: c.border }}>
                      <Avatar name={suggestion.username ?? suggestion.full_name} size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: c.ink }}>
                          {suggestion.username ?? suggestion.full_name.split(" ")[0]}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>
                          {suggestion.experience_categories.slice(0, 2).join(" · ")}
                        </p>
                      </div>
                      <button
                        onClick={() => sayHello(suggestion)}
                        disabled={connecting === suggestion.user_id}
                        className="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium disabled:opacity-40"
                        style={{ backgroundColor: c.sageLight, color: c.sage }}>
                        {connecting === suggestion.user_id ? "..." : "Say hello"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Thoughtfully chosen */}
            {resource && (
              <section>
                <h2 className="text-sm font-semibold mb-4" style={{ color: c.ink }}>Thoughtfully chosen for you</h2>
                <a href={resource.link} target="_blank" rel="noopener noreferrer"
                  onClick={() => markResourceSeen(resource.id)}
                  className="flex items-center gap-4 rounded-2xl border p-4 transition-opacity hover:opacity-80"
                  style={{ backgroundColor: c.card, borderColor: c.border }}>
                  <PodcastArtwork bg={resource.cover_bg} text={resource.cover_text || resource.title} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: c.inkMuted }}>Podcast</p>
                    <p className="font-semibold text-sm mb-1" style={{ color: c.ink }}>{resource.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: c.inkMuted }}>{resource.subtitle}</p>
                  </div>
                  <span className="text-xs rounded-full px-3 py-1 shrink-0" style={{ backgroundColor: c.sageLight, color: c.sage }}>
                    Listen →
                  </span>
                </a>
              </section>
            )}

            {/* Notes */}
            <section>
              <Link href="/notes"
                className="flex items-center justify-between rounded-2xl border px-5 py-4 transition-opacity hover:opacity-80"
                style={{ backgroundColor: c.card, borderColor: c.border }}>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: c.ink }}>Notes for the day</p>
                  <p className="text-xs" style={{ color: c.inkMuted }}>A private space for your thoughts.</p>
                </div>
                <span className="text-xl">✏️</span>
              </Link>
            </section>

            {/* AI */}
            <section>
              <Link href={aiHref} className="flex items-center gap-3 transition-opacity hover:opacity-70">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: c.sageLight }}>
                  <span className="text-sm" style={{ color: c.sage }}>✦</span>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: c.ink }}>Need a quiet moment?</p>
                  <p className="text-xs" style={{ color: c.sage }}>Reflect with Aapun AI →</p>
                </div>
              </Link>
            </section>

            <p className="text-xs italic text-center" style={{ color: c.inkMuted }}>
              This is your quiet place. Come back anytime. ♡
            </p>

          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around border-t py-2 px-4"
        style={{ backgroundColor: "rgba(219,234,254,0.90)", borderColor: c.border }}>
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}
            className="flex flex-col items-center gap-0.5 px-2 py-1"
            style={{ color: c.inkMuted, textDecoration: "none" }}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function AapunMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="15" cy="20" r="11" fill="rgba(14,165,233,0.25)" stroke="#0EA5E9" strokeWidth="1.5" />
      <circle cx="25" cy="20" r="11" fill="rgba(234,88,12,0.25)" stroke="#EA580C" strokeWidth="1.5" />
    </svg>
  );
}
