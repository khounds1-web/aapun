"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const c = {
  bg: "#faf9fc",
  ink: "#1e1a2e",
  inkSoft: "#4a4060",
  inkMuted: "#a89fc0",
  sage: "#6b5b9e",
  sageLight: "#ede8f8",
  apricot: "#c97a52",
  card: "#ffffff",
  border: "#f0ebf8",
} as const;

type JournalEntry = {
  id: string;
  content: string;
  created_at: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDate(entries: JournalEntry[]) {
  const groups: Record<string, JournalEntry[]> = {};
  entries.forEach((entry) => {
    const date = new Date(entry.created_at).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
  });
  return groups;
}

export default function NotesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/"); return; }
    loadEntries();
  }, [isLoaded, user]);

  async function loadEntries() {
    if (!user) return;
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setEntries(data || []);
    setLoading(false);
  }

  async function saveNote() {
    if (!newNote.trim() || !user || saving) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("journal_entries")
      .insert({ user_id: user.id, content: newNote.trim() })
      .select()
      .single();

    if (!error && data) {
      setEntries((prev) => [data, ...prev]);
      setNewNote("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
    setSaving(false);
  }

  async function deleteEntry(id: string) {
    setDeletingId(id);
    await supabase.from("journal_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && e.metaKey) {
      saveNote();
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNewNote(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  const grouped = groupByDate(entries);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: c.bg }}>

      {/* Nav */}
      <header className="border-b px-8 sm:px-16" style={{ borderColor: c.border, backgroundColor: c.bg }}>
        <div className="mx-auto max-w-2xl flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm transition-opacity hover:opacity-60" style={{ color: c.inkMuted }}>
              ← Back
            </Link>
            <div className="flex items-center gap-2">
              <AapunMark size={22} />
              <span className="text-sm font-semibold" style={{ color: c.ink }}>Notes for the day</span>
            </div>
          </div>
          <p className="text-xs" style={{ color: c.inkMuted }}>
            Only you can see these
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-8 sm:px-16 py-10">

        {/* Write a note */}
        <div className="mb-10 rounded-2xl border p-6" style={{ backgroundColor: c.card, borderColor: c.border }}>
          <textarea
            ref={textareaRef}
            value={newNote}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind today?"
            rows={3}
            className="w-full resize-none text-base leading-relaxed outline-none bg-transparent"
            style={{ color: c.ink }}
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: c.border }}>
            <p className="text-xs" style={{ color: c.inkMuted }}>
              ⌘ + Enter to save
            </p>
            <button
              onClick={saveNote}
              disabled={!newNote.trim() || saving}
              className="inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium text-white disabled:opacity-40 transition-opacity hover:opacity-80"
              style={{ backgroundColor: c.sage }}>
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        </div>

        {/* Past notes */}
        {loading ? (
          <p className="text-sm text-center" style={{ color: c.inkMuted }}>Loading…</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm mb-1" style={{ color: c.ink }}>Nothing yet</p>
            <p className="text-xs" style={{ color: c.inkMuted }}>
              Write your first note above — it stays here, just for you.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, dayEntries]) => (
              <div key={date}>
                <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: c.inkMuted }}>
                  {date}
                </p>
                <div className="space-y-3">
                  {dayEntries.map((entry) => (
                    <div key={entry.id}
                      className="group rounded-2xl border p-5 relative"
                      style={{ backgroundColor: c.card, borderColor: c.border }}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: c.inkSoft }}>
                        {entry.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs" style={{ color: c.inkMuted }}>
                          {new Date(entry.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          disabled={deletingId === entry.id}
                          className="text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-70 disabled:opacity-40"
                          style={{ color: c.inkMuted }}>
                          {deletingId === entry.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs italic text-center pt-12" style={{ color: c.inkMuted }}>
          Your notes are private and only visible to you. ♡
        </p>
      </main>
    </div>
  );
}

function AapunMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="15" cy="20" r="11" fill="rgba(107,91,158,0.2)" stroke="rgba(107,91,158,0.5)" strokeWidth="1.5" />
      <circle cx="25" cy="20" r="11" fill="rgba(201,122,82,0.2)" stroke="rgba(201,122,82,0.5)" strokeWidth="1.5" />
    </svg>
  );
}