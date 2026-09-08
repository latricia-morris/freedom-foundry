import { describe, expect, it, vi } from "vitest";

vi.mock("@workspace/db", () => ({
  db: {},
  referralPartnersTable: {},
  referralSubmissionsTable: {},
}));
vi.mock("@clerk/express", () => ({ clerkClient: {} }));
vi.mock("../lib/auth", () => ({
  authMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
  requireAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

import { validateSubmission } from "./referral-partner";

describe("referral submission validation", () => {
  it("requires a contact name and email for referrals", () => {
    expect(validateSubmission({ kind: "referral", contact_name: "Ada" })).toMatchObject({ valid: false });
    expect(validateSubmission({ kind: "referral", contact_email: "ada@example.com" })).toMatchObject({ valid: false });
    expect(validateSubmission({ kind: "referral", contact_name: " Ada ", contact_email: " ADA@EXAMPLE.COM " }))
      .toEqual({ valid: true, data: { kind: "referral", contactName: "Ada", contactEmail: "ada@example.com" } });
  });

  it("allows a question without a contact while requiring question text", () => {
    expect(validateSubmission({ kind: "question" })).toMatchObject({ valid: false });
    expect(validateSubmission({ kind: "question", question: " Can I refer a nonprofit? " }))
      .toEqual({ valid: true, data: { kind: "question", question: "Can I refer a nonprofit?" } });
  });
});