import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/express", () => ({
  clerkClient: {},
  getAuth: () => ({ userId: null }),
}));

vi.mock("@workspace/db", () => ({
  db: {},
  referralPartnersTable: {},
}));

import {
  isSuperAdminRole,
  requireManageableAdminTarget,
  resolveClerkUserRole,
} from "./auth";

describe("agency role governance", () => {
  it("recognizes only the exact server-defined super_admin role", () => {
    expect(isSuperAdminRole("super_admin")).toBe(true);
    expect(isSuperAdminRole("admin")).toBe(false);
    expect(isSuperAdminRole("corporate_admin")).toBe(false);
    expect(isSuperAdminRole(undefined)).toBe(false);
  });

  it("resolves an agency role from Clerk metadata, not corporate account membership", () => {
    expect(resolveClerkUserRole({
      primaryEmailAddress: {
        emailAddress: "admin@client.example",
        verification: { status: "verified" },
      },
      publicMetadata: { role: "admin" },
    })).toBe("admin");

    expect(resolveClerkUserRole({
      primaryEmailAddress: {
        emailAddress: "admin@client.example",
        verification: { status: "verified" },
      },
      publicMetadata: {},
    })).toBe("user");

    expect(resolveClerkUserRole({
      primaryEmailAddress: {
        emailAddress: "agency@example.com",
        verification: { status: "verified" },
      },
      publicMetadata: { role: "super_admin" },
    })).toBe("super_admin");
  });

  it("requires a super administrator actor for a super administrator target", () => {
    const target = {
      publicMetadata: { role: "super_admin" },
      primaryEmailAddress: {
        emailAddress: "super@example.com",
        verification: { status: "verified" },
      },
    };
    const ordinaryRequest = { user: { role: "admin" } } as any;
    const ordinaryResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    expect(requireManageableAdminTarget(ordinaryRequest, ordinaryResponse, target)).toBe(false);
    expect(ordinaryResponse.status).toHaveBeenCalledWith(403);

    const superRequest = { user: { role: "super_admin" } } as any;
    const superResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    expect(requireManageableAdminTarget(superRequest, superResponse, target)).toBe(true);
    expect(superResponse.status).not.toHaveBeenCalled();
  });
});