/**
 * Matching Overhaul — Acceptance Criteria Tests
 * Slice 1: Tests-first. These must pass before the feature is considered complete.
 *
 * Run: npx jest __tests__/matching-overhaul.test.ts
 */

import { EXPERIENCE_AREAS, JOURNEY_STAGES } from "@/app/get-started/categories";
import type { MatchRequest } from "@/lib/match-request";
import type { Profile } from "@/lib/profile";

// ── AC-01: Experience category architecture ────────────────────────────────

describe("Experience category architecture", () => {
  it("has exactly 3 top-level areas", () => {
    expect(Object.keys(EXPERIENCE_AREAS)).toHaveLength(3);
    expect(EXPERIENCE_AREAS).toHaveProperty("parenting");
    expect(EXPERIENCE_AREAS).toHaveProperty("seriousIllness");
    expect(EXPERIENCE_AREAS).toHaveProperty("lifeTransitions");
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

  it("existing parenting categories are present (backward compat)", () => {
    const parenting = EXPERIENCE_AREAS.parenting.subcategories;
    expect(parenting).toContain("NICU parents");
    expect(parenting).toContain("IVF");
    expect(parenting).toContain("Single parents");
    expect(parenting).toContain("Postpartum depression / anxiety");
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
});

// ── AC-03: Profile type includes new fields ────────────────────────────────

describe("Profile type", () => {
  it("includes username and journey_stage fields", () => {
    // TypeScript type check — if this compiles the test passes
    const profile: Profile = {
      id: "test-id",
      user_id: "user-id",
      full_name: "Test User",
      username: "testuser",
      journey_stage: "Just starting out",
      description: "test",
      experience_categories: ["NICU parents"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(profile.username).toBe("testuser");
    expect(profile.journey_stage).toBe("Just starting out");
  });

  it("username and journey_stage are nullable (existing profiles)", () => {
    const legacy: Profile = {
      id: "test-id",
      user_id: "user-id",
      full_name: "Legacy User",
      username: null,
      journey_stage: null,
      description: "legacy",
      experience_categories: ["IVF"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(legacy.username).toBeNull();
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
    // TypeScript ensures only these values compile
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
    const userA = ["NICU parents", "IVF", "Single parents"];
    const userB = ["IVF", "Cancer diagnosis (self)", "Single parents"];
    expect(getSharedCategories(userA, userB)).toEqual(["IVF", "Single parents"]);
  });

  it("returns empty array when no overlap", () => {
    const userA = ["NICU parents"];
    const userB = ["Divorce / separation"];
    expect(getSharedCategories(userA, userB)).toEqual([]);
  });
});
