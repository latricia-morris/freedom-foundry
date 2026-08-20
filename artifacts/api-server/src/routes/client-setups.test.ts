import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/express", () => ({ clerkClient: { users: {}, invitations: {} } }));
vi.mock("@workspace/db", () => ({
  bigPicturesTable: {},
  brandAssetsTable: {},
  brandGuidelinesTable: {},
  checklistTasksTable: {},
  clientSetupsTable: {},
  clientSetupTemplatesTable: {},
  corporateBrandProfilesTable: {},
  db: {},
  mediaKitsTable: {},
  personalBrandProfilesTable: {},
  serviceRequestSubmissionsTable: {},
  userProfilesTable: {},
}));
vi.mock("drizzle-orm", () => ({ and: vi.fn(), eq: vi.fn() }));
vi.mock("../lib/auth", () => ({
  authMiddleware: vi.fn(),
  requireAdmin: vi.fn(),
}));

import { clientSetupTestables } from "./client-setups";

describe("pending client setup payloads", () => {
  it("keeps supported import fields and rejects unstructured asset rows", () => {
    const payload = clientSetupTestables.normalizePayload({
      personal: { short_bio: "Trusted brand bio", unsupported: "do not persist" },
      corporate: { colors: [{ name: "Brand red", hex: "#B3232C" }] },
      assets: [
        { title: "Primary logo", file_url: "https://files.example/logo.png", file_type: "PNG" },
        { file_url: "https://files.example/missing-title.png" },
      ],
      checklist: [{ title: "Review the portal" }, { deadline_date: "2026-01-01" }],
    });

    expect(payload.personal).toEqual({ short_bio: "Trusted brand bio" });
    expect(payload.corporate).toEqual({ colors: [{ name: "Brand red", hex: "#B3232C" }] });
    expect(payload.assets).toEqual([{ title: "Primary logo", file_url: "https://files.example/logo.png", file_type: "PNG" }]);
    expect(payload.checklist).toEqual([{ title: "Review the portal" }]);
  });

  it("does not let reusable templates retain client identity or Big Picture data", () => {
    const template = clientSetupTestables.normalizeTemplatePayload({
      personal: { first_name: "Client", email: "client@example.com" },
      corporate: { company_name: "Client Co." },
      mediaKit: { long_bio: "A client-specific biography" },
      bigPicture: { annual_revenue: "500000" },
      guidelines: { tone_notes: "Warm and direct" },
      checklist: [{ title: "Open the brand portal" }],
    });

    expect(template).toEqual({
      guidelines: { tone_notes: "Warm and direct" },
      assets: [],
      checklist: [{ title: "Open the brand portal" }],
      serviceRequests: [],
    });
  });

  it("deduplicates applied starter content and requires both brand data and an asset before activation", () => {
    const merged = clientSetupTestables.mergePayload(
      { guidelines: {}, assets: [], checklist: [{ title: "Review brand kit" }], serviceRequests: [] },
      { guidelines: {}, assets: [], checklist: [{ title: "Review brand kit" }], serviceRequests: [] },
    );

    expect(merged.checklist).toEqual([{ title: "Review brand kit" }]);
    expect(clientSetupTestables.completeness({ personal: { short_bio: "Ready" }, assets: [], checklist: [], serviceRequests: [] }).is_ready).toBe(false);
    expect(clientSetupTestables.completeness({ personal: { short_bio: "Ready" }, assets: [{ title: "Logo" }], checklist: [], serviceRequests: [] }).is_ready).toBe(true);
  });
});