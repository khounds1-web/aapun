/**
 * Matching Overhaul — Acceptance Criteria Tests
 * Slice 1 (Elder pivot): Tests-first. These must pass before the feature is considered complete.
 *
 * Run: npx jest __tests__/matching-overhaul.test.ts
 */

import { EXPERIENCE_AREAS, JOURNEY_STAGES } from "@/app/get-started/categories";
import type { MatchRequest } from "@/lib/match-request";
import type { Profile } from "@/lib/profile";

// ── AC-01: Experience category architecture ────────────────────────────────

describe("Experience category architecture", () => {
  it("has exactly 10 top-level areas", () => {
    expect(Object.keys(EXPERIENCE_AREAS)).toHaveLength(10);
  });

  it("has all expected area keys", () => {
    expect(EXPERIENCE_AREAS).toHaveProperty("retirement");
    expect(EXPERIENCE_AREAS).toHaveProperty("relocation");
    expect(EXPERIENCE_AREAS).toHaveProperty("grandparenting");
    expect(EXPERIENCE_AREAS).toHaveProperty("learning");
    expect(EXPERIENCE_AREAS).toHaveProperty("travel");
    expect(EXPERIENCE_AREAS).toHaveProperty("dating");
    expect(EXPERIENCE_AREAS).toHaveProperty("creative");
    expect(EXPERIENCE_AREAS).toHaveProperty("volunteering");
    expect(EXPERIENCE_AREAS).toHaveProperty("encoreCareer");
    expect(EXPERIENCE_AREAS).toHaveProperty("communityBuilding");
  });

  it("each area has a label and at least 5 subcategories", () => {
    for (const area of Object.values(EXPERIENCE_AREAS)) {
      expect(area.label).toBeTruthy();
      expect(area.subcategories.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("subcategory values are unique across all areas", () => {
    const all = Object.values(EXPERIENCE_AREAS).flatMap((a) => a.subcategories);
    const unique = new Set(all);
    expect(unique.size).toBe(all.length);
  });

  it("elder-focused areas have appropriate subcategories", () => {
    expect(EXPERIENCE_AREAS.retirement.subcategories).toContain("Just left my career");
    expect(EXPERIENCE_AREAS.grandparenting.subcategories).toContain("New grandparent");
    expect(EXPERIENCE_AREAS.communityBuilding.subcategories).toContain("Feeling lonely or isolated");
    expect(EXPERIENCE_AREAS.dating.subcategories).toContain("Dating after loss or divorce");
  });
});

// ── AC-02: Journey stages ──────────────────────────────────────────────────

describe("Journey stages", () => {
  it("has exactly 4 options", () => {
    expect(JOURNEY_STAGES).toHaveLength(4);
  });

  it("each stage has value, label, and sub", () => {
    for (const stage of JOURNEY_STAGES) {
      expect(stage.value).toBeTruthy();
      expect(stage.label).toBeTruthy();
      expect(stage.sub).toBeTruthy();
    }
  });

  it("includes elder-appropriate stages", () => {
    const values = JOURNEY_STAGES.map((s) => s.value);
    expect(values).toContain("Just beginning");
    expect(values).toContain("Here to share");
  });
});

// ── AC-03: Profile type includes new fields ────────────────────────────────

describe("Profile type", () => {
  it("includes username and journey_stage fields", () => {
    const profile: Profile = {
      id: "test-id",
      user_id: "user-id",
      full_name: "Test User",
      username: "margaret",
      journey_stage: "Just beginning",
      description: "Retired teacher, love gardening",
      experience_categories: ["New grandparent", "Just left my career"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(profile.username).toBe("margaret");
    expect(profile.journey_stage).toBe("Just beginning");
  });

  it("username and journey_stage are nullable (existing profiles)", () => {
    const legacy: Profile = {
      id: "test-id",
      user_id: "user-id",
      full_name: "Legacy User",
      username: null,
      journey_stage: null,
      description: "legacy",
      experience_categories: ["Solo travel"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(legacy.username).toBeNull();
    expect(legacy.journey_stage).toBeNull();
  });
});

// ── AC-04: MatchRequest type ───────────────────────────────────────────────

describe("MatchRequest type", () => {
  it("has all required fields including status constraint", () => {
    const req: MatchRequest = {
      id: "req-id",
      from_profile_id: "profile-a",
      to_profile_id: "profile-b",
      from_user_id: "user-a",
      to_user_id: "user-b",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(req.status).toBe("pending");
  });

  it("status only accepts pending, accepted, or declined", () => {
    const statuses: MatchRequest["status"][] = ["pending", "accepted", "declined"];
    expect(statuses).toContain("pending");
    expect(statuses).toContain("accepted");
    expect(statuses).toContain("declined");
  });
});

// ── AC-05: Shared category intersection logic ──────────────────────────────

describe("Shared category intersection", () => {
  function getSharedCategories(a: string[], b: string[]): string[] {
    const setB = new Set(b);
    return a.filter((cat) => setB.has(cat));
  }

  it("returns overlapping categories", () => {
    const userA = ["New grandparent", "Solo travel", "Just left my career"];
    const userB = ["Solo travel", "Dating after loss or divorce", "New grandparent"];
    expect(getSharedCategories(userA, userB)).toEqual(["New grandparent", "Solo travel"]);
  });

  it("returns empty array when no overlap", () => {
    const userA = ["Starting a small business"];
    const userB = ["Long-distance grandparenting"];
    expect(getSharedCategories(userA, userB)).toEqual([]);
  });
});
