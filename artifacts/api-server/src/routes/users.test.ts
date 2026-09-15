import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, clerkUsers, invitations, tables } = vi.hoisted(() => {
  const tables = {
    bigPicturesTable: {},
    brandAssetsTable: {},
    brandGuidelinesTable: {},
    brandUpEntriesTable: {},
    corporateBrandProfilesTable: {},
    igniteOSTable: {},
    lessonProgressTable: {},
    mediaKitsTable: {},
    personalBrandProfilesTable: {},
    serviceRequestSubmissionsTable: {},
    userProfilesTable: { id: "id", user_id: "user_id" },
    workbookDefinitionsTable: { order: "order" },
    workbookResponsesTable: {},
    checklistTasksTable: {},
  };
  return {
    tables,
    state: {
      users: new Map<string, Record<string, any>>(),
      profiles: new Map<string, Record<string, any>>(),
    },
    clerkUsers: {
      getUser: vi.fn(),
      updateUserMetadata: vi.fn(),
      getUserList: vi.fn(),
    },
    invitations: {
      createInvitation: vi.fn(),
    },
  };
});

function matchesUserProfile(condition: { column?: string; value?: unknown }) {
  if (condition.column !== "user_id") return undefined;
  return state.profiles.get(String(condition.value));
}

vi.mock("@clerk/express", () => ({
  clerkClient: {
    users: clerkUsers,
    invitations,
  },
}));

vi.mock("@workspace/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: (condition: { column?: string; value?: unknown }) => ({
          limit: async () => {
            const profile = matchesUserProfile(condition);
            return profile ? [profile] : [];
          },
        }),
      }),
    }),
    update: () => ({
      set: (changes: Record<string, unknown>) => ({
        where: () => ({
          returning: async () => {
            const profile = [...state.profiles.values()][0];
            if (!profile) return [];
            Object.assign(profile, changes);
            return [profile];
          },
        }),
      }),
    }),
    insert: () => ({
      values: (values: Record<string, unknown>) => ({
        returning: async () => {
          const profile: Record<string, any> = {
            id: 1,
            account_type: "free",
            brand_power_moves_unlocked: false,
            marketing_consent: false,
            created_at: new Date(),
            ...values,
          };
          state.profiles.set(String(profile.user_id), profile);
          return [profile];
        },
      }),
    }),
  },
  ...tables,
}));

vi.mock("drizzle-orm", () => ({
  eq: (column: unknown, value: unknown) => ({ column: String(column), value }),
  and: (...conditions: unknown[]) => ({ type: "and", conditions }),
}));

vi.mock("../lib/auth", () => ({
  SUPER_ADMIN_ROLE: "super_admin",
  authMiddleware: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    const requestedRole = req.headers["x-role"];
    const role = typeof requestedRole === "string" ? requestedRole : "user";
    req.userId = "signed-in-user";
    req.user = {
      id: "signed-in-user",
      email: "actor@example.com",
      firstName: "Actor",
      lastName: "Test",
      role,
    };
    next();
  },
  requireAdmin: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  },
  requireManageableAdminTarget: (
    req: express.Request,
    res: express.Response,
    target: { publicMetadata?: unknown },
  ) => {
    const role = target.publicMetadata
      && typeof target.publicMetadata === "object"
      && typeof (target.publicMetadata as Record<string, unknown>).role === "string"
      ? (target.publicMetadata as Record<string, unknown>).role
      : "user";
    if (role === "super_admin" && req.user?.role !== "super_admin") {
      res.status(403).json({
        error: "Only a super administrator can change a super administrator account.",
      });
      return false;
    }
    return true;
  },
  requireMemberId: () => "signed-in-user",
  resolveAppRole: (_email: string | null, metadata: unknown) => {
    const role = metadata
      && typeof metadata === "object"
      && typeof (metadata as Record<string, unknown>).role === "string"
      ? (metadata as Record<string, unknown>).role
      : "user";
    return role;
  },
  resolveClerkUserRole: (user: { publicMetadata?: unknown }) => {
    const role = user.publicMetadata
      && typeof user.publicMetadata === "object"
      && typeof (user.publicMetadata as Record<string, unknown>).role === "string"
      ? (user.publicMetadata as Record<string, unknown>).role
      : "user";
    return role;
  },
  ownedCreatePayload: () => null,
  ownedNotFound: (res: express.Response) => res.status(404).json({ error: "Not found" }),
  ownedUpdatePayload: () => ({}),
}));

import usersRouter from "./users";

const app = express();
app.use(express.json());
app.use("/api", usersRouter);

function clerkUser(id: string, role = "user") {
  return {
    id,
    emailAddresses: [],
    primaryEmailAddress: {
      emailAddress: `${id}@example.com`,
      verification: { status: "verified" },
    },
    firstName: "Test",
    lastName: "User",
    publicMetadata: { role },
    createdAt: Date.now(),
  };
}

function profileFor(userId: string) {
  return {
    id: 1,
    user_id: userId,
    account_type: "free",
    brand_power_moves_unlocked: false,
    marketing_consent: false,
    created_at: new Date(),
  };
}

describe("bounded agency administrator governance", () => {
  beforeEach(() => {
    state.users.clear();
    state.profiles.clear();
    clerkUsers.getUser.mockReset();
    clerkUsers.updateUserMetadata.mockReset();
    clerkUsers.getUserList.mockReset();
    invitations.createInvitation.mockReset();
    clerkUsers.getUser.mockImplementation(async (id: string) => {
      const user = state.users.get(id);
      if (!user) {
        const error = Object.assign(new Error("Not found"), { status: 404 });
        throw error;
      }
      return user;
    });
    clerkUsers.updateUserMetadata.mockImplementation(async (
      id: string,
      changes: { publicMetadata: Record<string, unknown> },
    ) => {
      const user = state.users.get(id)!;
      user.publicMetadata = changes.publicMetadata;
      return user;
    });
    invitations.createInvitation.mockResolvedValue({
      id: "invitation-1",
      emailAddress: "member@example.com",
      status: "pending",
    });
  });

  it("blocks an ordinary agency admin from editing a super administrator account", async () => {
    state.users.set("super-admin-user", clerkUser("super-admin-user", "super_admin"));
    state.profiles.set("super-admin-user", profileFor("super-admin-user"));

    const response = await request(app)
      .patch("/api/admin/users/super-admin-user")
      .set("x-role", "admin")
      .send({ notes: "attempted edit" });

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/only a super administrator/i);
    expect(clerkUsers.updateUserMetadata).not.toHaveBeenCalled();
    expect(state.profiles.get("super-admin-user")?.notes).toBeUndefined();
  });

  it("blocks an ordinary agency admin from demoting a super administrator", async () => {
    state.users.set("super-admin-user", clerkUser("super-admin-user", "super_admin"));
    state.profiles.set("super-admin-user", profileFor("super-admin-user"));

    const response = await request(app)
      .patch("/api/admin/users/super-admin-user")
      .set("x-role", "admin")
      .send({ role: "user" });

    expect(response.status).toBe(403);
    expect(clerkUsers.updateUserMetadata).not.toHaveBeenCalled();
  });

  it("does not permit a generic user route to promote an account to super_admin", async () => {
    state.users.set("member-user", clerkUser("member-user"));
    state.profiles.set("member-user", profileFor("member-user"));

    const response = await request(app)
      .patch("/api/admin/users/member-user")
      .set("x-role", "admin")
      .send({ role: "super_admin" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/user or admin/i);
    expect(clerkUsers.getUser).not.toHaveBeenCalled();
    expect(clerkUsers.updateUserMetadata).not.toHaveBeenCalled();
  });

  it("does not permit a generic invitation to create a super administrator", async () => {
    const response = await request(app)
      .post("/api/admin/invitations")
      .set("x-role", "admin")
      .send({ email: "new-admin@example.com", role: "super_admin" });

    expect(response.status).toBe(403);
    expect(invitations.createInvitation).not.toHaveBeenCalled();
  });

  it("keeps ordinary member administration working for agency admins", async () => {
    state.users.set("member-user", clerkUser("member-user"));
    state.profiles.set("member-user", profileFor("member-user"));

    const response = await request(app)
      .patch("/api/admin/users/member-user")
      .set("x-role", "admin")
      .send({ role: "admin", notes: "approved" });

    expect(response.status).toBe(200);
    expect(clerkUsers.updateUserMetadata).toHaveBeenCalledWith("member-user", {
      publicMetadata: { role: "admin" },
    });
    expect(response.body.user.role).toBe("admin");
    expect(response.body.profile.notes).toBe("approved");
  });

  it("allows a super administrator to manage a protected account", async () => {
    state.users.set("super-admin-user", clerkUser("super-admin-user", "super_admin"));
    state.profiles.set("super-admin-user", profileFor("super-admin-user"));

    const response = await request(app)
      .patch("/api/admin/users/super-admin-user")
      .set("x-role", "super_admin")
      .send({ notes: "approved by super admin" });

    expect(response.status).toBe(200);
    expect(response.body.profile.notes).toBe("approved by super admin");
  });

  it("does not treat a corporate account admin as an agency administrator", async () => {
    state.users.set("member-user", clerkUser("member-user"));

    const response = await request(app)
      .patch("/api/admin/users/member-user")
      .set("x-role", "user")
      .set("x-corporate-account-role", "admin")
      .send({ notes: "attempted edit" });

    expect(response.status).toBe(403);
    expect(clerkUsers.getUser).not.toHaveBeenCalled();
  });

  it("also protects super administrator portal content from ordinary agency admins", async () => {
    state.users.set("super-admin-user", clerkUser("super-admin-user", "super_admin"));

    const response = await request(app)
      .post("/api/admin/users/super-admin-user/portal-content")
      .set("x-role", "admin")
      .send({ kind: "checklist_task", data: { title: "attempted edit" } });

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/only a super administrator/i);
  });
});