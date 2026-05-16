"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const ADMIN_PASSWORD = "Ontosomething";

const c = {
  bg: "#f6f4ef",
  ink: "#1c2824",
  inkSoft: "#4a5c56",
  inkMuted: "#6d8078",
  sage: "#3a6b5c",
  sageDark: "#2f584b",
  sageLight: "#e4ede9",
  apricot: "#c97a52",
  apricotLight: "#f3e4db",
  card: "rgba(255, 255, 255, 0.85)",
  border: "#d8e4de",
} as const;

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  description: string;
  experience_categories: string[];
  match_status: string | null;
  matched_with: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedA, setSelectedA] = useState<Profile | null>(null);
  const [selectedB, setSelectedB] = useState<Profile | null>(null);
  const [matching, setMatching] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      loadProfiles();
    } else {
      setPasswordError(true);
    }
  }

  async function loadProfiles() {
    setLoading(true);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setProfiles(data || []);
    setLoading(false);
  }

  async function handleMatch() {
    if (!selectedA || !selectedB) return;
    setMatching(true);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const message = "We found you a match!";

    await supabase
      .from("profiles")
      .update({
        match_status: message,
        matched_with: selectedB.full_name,
      })
      .eq("id", selectedA.id);

    await supabase
      .from("profiles")
      .update({
        match_status: message,
        matched_with: selectedA.full_name,
      })
      .eq("id", selectedB.id);

    setSuccessMessage(`✓ Matched ${selectedA.full_name} with ${selectedB.full_name}`);
    setSelectedA(null);
    setSelectedB(null);
    setMatching(false);
    loadProfiles();
  }

  if (!authenticated) {
    return (
      <div
        className="flex min-h-full items-center justify-center font-sans"
        style={{ backgroundColor: c.bg }}
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8 shadow-sm"
          style={{ backgroundColor: c.card, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}
        >
          <h1 className="mb-6 text-xl font-semibold" style={{ color: c.ink }}>
            Admin access
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="mb-3 w-full rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#3a6b5c]/30"
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: passwordError ? c.apricot : c.border,
              color: c.ink,
            }}
          />
          {passwordError && (
            <p className="mb-3 text-sm" style={{ color: c.apricot }}>Incorrect password</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full rounded-full py-3 text-sm font-medium text-white transition-colors hover:bg-[#2f584b]"
            style={{ backgroundColor: c.sage }}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full font-sans"
      style={{ backgroundColor: c.bg, color: c.inkSoft }}
    >
      <main className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold" style={{ color: c.ink }}>
            Aapun Admin
          </h1>
          <button
            onClick={loadProfiles}
            className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-black/5"
            style={{ color: c.inkSoft }}
          >
            Refresh
          </button>
        </div>

        {successMessage && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: c.sageLight, color: c.sage }}
          >
            {successMessage}
          </div>
        )}

        {selectedA && selectedB && (
          <div
            className="mb-6 rounded-2xl p-6 shadow-sm"
            style={{ backgroundColor: c.card, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}
          >
            <p className="mb-4 font-medium" style={{ color: c.ink }}>
              Match: <strong>{selectedA.full_name}</strong> ↔ <strong>{selectedB.full_name}</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleMatch}
                disabled={matching}
                className="rounded-full px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2f584b] disabled:opacity-50"
                style={{ backgroundColor: c.sage }}
              >
                {matching ? "Matching…" : "Confirm match"}
              </button>
              <button
                onClick={() => { setSelectedA(null); setSelectedB(null); }}
                className="rounded-full px-6 py-2 text-sm font-medium transition-colors hover:bg-black/5"
                style={{ color: c.inkSoft }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm" style={{ color: c.inkMuted }}>Loading…</p>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-2xl p-6 shadow-sm"
                style={{
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: selectedA?.id === profile.id || selectedB?.id === profile.id
                    ? c.sage
                    : c.border,
                }}
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold" style={{ color: c.ink }}>{profile.full_name}</p>
                    <p className="text-xs" style={{ color: c.inkMuted }}>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSuccessMessage(null);
                      if (selectedA?.id === profile.id) {
                        setSelectedA(null);
                      } else if (selectedB?.id === profile.id) {
                        setSelectedB(null);
                      } else if (!selectedA) {
                        setSelectedA(profile);
                      } else if (!selectedB) {
                        setSelectedB(profile);
                      }
                    }}
                    className="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
                    style={
                      selectedA?.id === profile.id || selectedB?.id === profile.id
                        ? { backgroundColor: c.sage, color: "#fff" }
                        : { backgroundColor: c.sageLight, color: c.sage }
                    }
                  >
                    {selectedA?.id === profile.id || selectedB?.id === profile.id
                      ? "Selected"
                      : "Select"}
                  </button>
                </div>

                <div className="mb-2 flex flex-wrap gap-1.5">
                  {profile.experience_categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full px-2.5 py-0.5 text-xs"
                      style={{ backgroundColor: c.sageLight, color: c.sage }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <p className="mb-3 text-sm leading-relaxed line-clamp-2" style={{ color: c.inkSoft }}>
                  {profile.description}
                </p>

                {profile.matched_with ? (
                  <p className="text-xs font-medium" style={{ color: c.sage }}>
                    ✓ Matched with {profile.matched_with}
                  </p>
                ) : (
                  <p className="text-xs" style={{ color: c.inkMuted }}>
                    Not yet matched
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}