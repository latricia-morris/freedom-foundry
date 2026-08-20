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

vi.mock("@workspace/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: (condition: { userId: string }) => ({
          limit: async () => {
            const profile = profileFor(condition.userId);
            return profile ? [profile] : [];
          },
        }),
      }),
    }),
    update: () => ({
      set: (changes: Record<string, unknown>) => ({
        where: (condition: { userId: string }) => ({
          returning: async () => {
            const profile = profileFor(condition.userId);
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
  eq: (_column: unknown, value: string) => ({ userId: value }),
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

  it("returns a clear error when profile values are not text", async () => {
    const response = await request(app)
      .patch("/api/auth/me")
      .send({ first_name: 42 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Profile settings must be text values" });
  });
});