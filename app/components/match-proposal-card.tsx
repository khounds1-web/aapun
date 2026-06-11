"use client";

import { useState } from "react";
import type { MatchRequest } from "@/lib/match-request";

const c = {
  ink: "#1a1625",
  inkSoft: "#3d3654",
  inkMuted: "#9b91b8",
  sage: "#0EA5E9",
  sageLight: "#E0F2FE",
  apricot: "#EA580C",
  apricotLight: "#f5ece6",
  card: "#ffffff",
  border: "#edeaf4",
  green: "#4a7c5f",
} as const;

type MatchRequestWithProfile = MatchRequest & {
  from_profile: {
    username: string | null;
    full_name: string;
    description: string;
    experience_categories: string[];
  };
};

interface MatchProposalCardProps {
  request: MatchRequestWithProfile;
  currentUserCategories: string[];
  onAccept: (id: string, matchId: string) => void;
  onDecline: (id: string) => void;
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = ["#0EA5E9", "#EA580C", "#4a7c5f", "#9b6b5b", "#5b6b9e"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-full text-white font-semibold"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
    >
      {initial}
    </div>
  );
}

export function MatchProposalCard({
  request,
  currentUserCategories,
  onAccept,
  onDecline,
}: MatchProposalCardProps) {
  const [actioning, setActioning] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profile = request.from_profile;
  const displayName = profile.username ?? profile.full_name.split(" ")[0];

  // Shared experience categories (intersection)
  const mySet = new Set(currentUserCategories);
  const shared = profile.experience_categories.filter((cat) => mySet.has(cat));

  // Story snippet — first 120 chars
  const snippet = profile.description
    ? profile.description.slice(0, 120) + (profile.description.length > 120 ? "…" : "")
    : null;

  async function handleAccept() {
    if (actioning) return;
    setActioning("accept");
    setError(null);
    try {
      const res = await fetch(`/api/match-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setActioning(null);
        return;
      }
      onAccept(request.id, data.matchId);
    } catch {
      setError("Connection error. Please try again.");
      setActioning(null);
    }
  }

  async function handleDecline() {
    if (actioning) return;
    setActioning("decline");
    setError(null);
    try {
      const res = await fetch(`/api/match-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setActioning(null);
        return;
      }
      onDecline(request.id);
    } catch {
      setError("Connection error. Please try again.");
      setActioning(null);
    }
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: c.card, borderColor: c.sage + "44" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={displayName} size={44} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base" style={{ color: c.ink }}>
            {displayName}
          </p>
          <p className="text-xs mt-0.5" style={{ color: c.inkMuted }}>
            wants to connect
          </p>
        </div>
        <span
          className="text-xs rounded-full px-2.5 py-1 font-medium"
          style={{ backgroundColor: c.sageLight, color: c.sage }}
        >
          New
        </span>
      </div>

      {/* Shared categories */}
      {shared.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {shared.map((cat) => (
            <span
              key={cat}
              className="rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ backgroundColor: c.sageLight, color: c.sage }}
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Story snippet */}
      {snippet && (
        <p className="text-sm mb-4 leading-relaxed" style={{ color: c.inkSoft }}>
          &ldquo;{snippet}&rdquo;
        </p>
      )}

      {error && (
        <p className="text-xs mb-3 rounded-xl px-3 py-2"
          style={{ backgroundColor: c.apricotLight, color: c.apricot }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAccept}
          disabled={actioning !== null}
          className="flex-1 inline-flex items-center justify-center rounded-full py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: c.sage }}
        >
          {actioning === "accept" ? "Connecting…" : "Connect"}
        </button>
        <button
          type="button"
          onClick={handleDecline}
          disabled={actioning !== null}
          className="flex-1 inline-flex items-center justify-center rounded-full py-2.5 text-sm font-medium transition-colors disabled:opacity-40 hover:bg-black/5"
          style={{ color: c.inkSoft, borderWidth: 1, borderStyle: "solid", borderColor: c.border }}
        >
          {actioning === "decline" ? "…" : "Not now"}
        </button>
      </div>
    </div>
  );
}
