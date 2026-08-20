import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { signedInUserId, profiles, nextProfileId, userProfilesTable } = vi.hoisted(() => ({
  signedInUserId: "clerk-signed-in-user",
  profiles: new Map<string, Record<string, any>>(),
  nextProfileId: { value: 1 },
  userProfilesTable: { id: "id", user_id: "user_id" },
}));

const profileFor = (userId: string) => profiles.get(userId);
const profileMatching = (condition: { column: string; value: string }) =>
  condition.column === "user_id"
    ? profileFor(condition.value)
    : [...profiles.values()].find(
      (profile) => String(profile[condition.column]) === String(condition.value),
    );

vi.mock("@workspace/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: (condition: { column: string; value: string }) => ({
          limit: async () => {
            const profile = profileMatching(condition);
            return profile ? [profile] : [];
          },
        }),
      }),
    }),
    update: () => ({
      set: (changes: Record<string, unknown>) => ({
        where: (condition: { column: string; value: string }) => ({
          returning: async () => {
            const profile = profileMatching(condition);
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
            id: nextProfileId.value++,
            account_type: "free",
            brand_power_moves_unlocked: false,
            marketing_consent: false,
            ...values,
          };
          profiles.set(String(profile.user_id), profile);
          return [profile];
        },
      }),
    }),
  },
  userProfilesTable,
}));

vi.mock("drizzle-orm", () => ({
  eq: (column: { name?: string }, value: string) => ({ column: column.name ?? String(column), value }),
}));

vi.mock("../lib/auth", () => ({
  authMiddleware: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.userId = signedInUserId;
    req.user = {
      id: signedInUserId,
      email: "member@example.com",
      firstName: "Signed",
      lastName: "In",
      role: "user",
    };
    next();
  },
}));

import authRouter from "./auth";

const app = express();
app.use(express.json());
app.use("/api", authRouter);

describe("authenticated member profile", () => {
  beforeEach(() => {
    profiles.clear();
    nextProfileId.value = 1;
  });

  it("updates the signed-in profile without trusting a browser owner ID, then returns saved values on read", async () => {
    const response = await request(app)
      .patch("/api/auth/me")
      .send({
        user_id: "attacker-controlled-user",
        first_name: "Ada",
        last_name: "Lovelace",
        phone: "+1 555 0100",
        headshot_image_url: "https://cdn.example.com/ada.png",
      });

    expect(response.status).toBe(200);
    expect(response.body.profile.user_id).toBe(signedInUserId);
    expect(profiles.has("attacker-controlled-user")).toBe(false);

    const readResponse = await request(app).get("/api/auth/me");

    expect(readResponse.status).toBe(200);
    expect(readResponse.body.profile).toMatchObject({
      user_id: signedInUserId,
      first_name: "Ada",
      last_name: "Lovelace",
      phone: "+1 555 0100",
      headshot_url: "https://cdn.example.com/ada.png",
    });
    expect(readResponse.body.user).toMatchObject({
      first_name: "Ada",
      last_name: "Lovelace",
      phone: "+1 555 0100",
      headshot_image_url: "https://cdn.example.com/ada.png",
    });
  });

  it("edits an existing profile and preserves another member's profile", async () => {
    profiles.set(signedInUserId, {
      id: 1,
      user_id: signedInUserId,
      first_name: "Original",
      last_name: "Member",
      phone: "+1 555 0001",
      headshot_url: "https://cdn.example.com/original.png",
    });
    profiles.set("another-member", {
      id: 2,
      user_id: "another-member",
      first_name: "Other",
      last_name: "Member",
      phone: "+1 555 0002",
      headshot_url: "https://cdn.example.com/other.png",
    });

    const response = await request(app)
      .patch("/api/auth/me")
      .send({
        first_name: "Updated",
        last_name: "Profile",
        phone: "+1 555 0101",
        headshot_image_url: "https://cdn.example.com/updated.png",
      });

    expect(response.status).toBe(200);
    expect(response.body.profile).toMatchObject({
      user_id: signedInUserId,
      first_name: "Updated",
      last_name: "Profile",
      phone: "+1 555 0101",
      headshot_url: "https://cdn.example.com/updated.png",
    });

    const readResponse = await request(app).get("/api/auth/me");

    expect(readResponse.status).toBe(200);
    expect(readResponse.body.profile).toMatchObject({
      user_id: signedInUserId,
      first_name: "Updated",
      last_name: "Profile",
      phone: "+1 555 0101",
      headshot_url: "https://cdn.example.com/updated.png",
    });
    expect(profiles.get("another-member")).toEqual({
      id: 2,
      user_id: "another-member",
      first_name: "Other",
      last_name: "Member",
      phone: "+1 555 0002",
      headshot_url: "https://cdn.example.com/other.png",
    });
  });

  it("returns a clear error when profile values are not text", async () => {
    const response = await request(app)
      .patch("/api/auth/me")
      .send({ first_name: 42 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Profile settings must be text values" });
  });
});