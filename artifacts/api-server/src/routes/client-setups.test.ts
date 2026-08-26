import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { clerkState, tables, dbState } = vi.hoisted(() => {
  const makeTable = (name: string) => ({
    name,
    id: `${name}.id`,
    user_id: `${name}.user_id`,
    title: `${name}.title`,
    service_type: `${name}.service_type`,
    updated_at: `${name}.updated_at`,
  });
  const tableNames = [
    "bigPictures", "brandAssets", "brandGuidelines", "checklistTasks",
    "clientSetups", "clientSetupTemplates", "corporateBrandProfiles",
    "mediaKits", "personalBrandProfiles", "serviceRequestSubmissions", "userProfiles",
  ];
  const tables = Object.fromEntries(tableNames.map((name) => [name, makeTable(name)]));
  return {
    clerkState: { users: [] as Array<{ id: string; primaryEmailAddress?: { emailAddress: string } }> },
    tables,
    dbState: {
      rows: Object.fromEntries(tableNames.map((name) => [name, [] as Array<Record<string, any>>])),
      nextId: 1,
      transactionTail: Promise.resolve() as Promise<unknown>,
    },
  };
});

vi.mock("@clerk/express", () => ({
  clerkClient: {
    users: { getUserList: vi.fn(async () => ({ data: clerkState.users })) },
    invitations: {},
  },
}));
vi.mock("@workspace/db", () => ({
  bigPicturesTable: tables.bigPictures,
  brandAssetsTable: tables.brandAssets,
  brandGuidelinesTable: tables.brandGuidelines,
  checklistTasksTable: tables.checklistTasks,
  clientSetupsTable: tables.clientSetups,
  clientSetupTemplatesTable: tables.clientSetupTemplates,
  corporateBrandProfilesTable: tables.corporateBrandProfiles,
  mediaKitsTable: tables.mediaKits,
  personalBrandProfilesTable: tables.personalBrandProfiles,
  serviceRequestSubmissionsTable: tables.serviceRequestSubmissions,
  userProfilesTable: tables.userProfiles,
  db: {
    select: () => ({
      from: (table: { name: string }) => ({
        where: (condition: unknown) => ({
          limit: async () => selectRows(table, condition),
        }),
      }),
    }),
    transaction: (callback: (tx: any) => Promise<unknown>) => {
      const result = dbState.transactionTail.then(() => callback(makeDb()));
      dbState.transactionTail = result.catch(() => undefined);
      return result;
    },
  },
}));
vi.mock("drizzle-orm", () => ({
  and: (...conditions: unknown[]) => ({ type: "and", conditions }),
  eq: (column: string, value: unknown) => ({ type: "eq", column, value }),
}));
vi.mock("../lib/auth", () => ({
  authMiddleware: vi.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) => next()),
  requireAdmin: vi.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) => next()),
}));

import { clientSetupTestables } from "./client-setups";
import clientSetupsRouter from "./client-setups";

function matches(row: Record<string, any>, condition: any): boolean {
  if (condition?.type === "and") return condition.conditions.every((item: any) => matches(row, item));
  if (condition?.type === "eq") return row[condition.column.split(".").at(-1)!] === condition.value;
  return true;
}

function selectRows(table: { name: string }, condition?: unknown) {
  return dbState.rows[table.name].filter((row) => !condition || matches(row, condition));
}

function makeDb() {
  return {
    select: () => ({
      from: (table: { name: string }) => ({
        where: (condition: unknown) => {
          const query = {
            for: () => query,
            limit: async () => selectRows(table, condition),
          };
          return query;
        },
      }),
    }),
    update: (table: { name: string }) => ({
      set: (changes: Record<string, unknown>) => ({
        where: (condition: unknown) => {
          const execute = () => {
            const rows = selectRows(table, condition);
            rows.forEach((row) => Object.assign(row, changes));
            return rows;
          };
          return {
            returning: async () => execute(),
            then: (resolve: (value: unknown) => unknown) => Promise.resolve(execute()).then(resolve),
          };
        },
      }),
    }),
    insert: (table: { name: string }) => ({
      values: (values: Record<string, unknown>) => {
        const execute = () => {
          const row = { id: dbState.nextId++, ...values, created_at: new Date(), updated_at: new Date() };
          dbState.rows[table.name].push(row);
          return [row];
        };
        return {
          returning: async () => execute(),
          then: (resolve: (value: unknown) => unknown) => Promise.resolve(execute()).then(resolve),
        };
      },
    }),
  };
}

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

describe("prepared client portal activation", () => {
  const app = express();
  app.use(express.json());
  app.use("/api", clientSetupsRouter);

  beforeEach(() => {
    for (const rows of Object.values(dbState.rows)) rows.splice(0);
    dbState.nextId = 1;
    dbState.transactionTail = Promise.resolve();
    clerkState.users.splice(0);
  });

  async function createReadySetup() {
    const setup = {
      id: 1,
      email: "client@example.com",
      first_name: "Prepared",
      last_name: "Client",
      business_name: "Prepared Co",
      notes: null,
      status: "ready_to_invite",
      payload: {
        personal: { short_bio: "Prepared bio" },
        corporate: {}, guidelines: {}, mediaKit: {}, bigPicture: {},
        assets: [{ title: "Primary logo", file_url: "https://files.example/logo.png" }],
        checklist: [{ title: "Review the portal" }],
        serviceRequests: [{ service_type: "brand_review", details: "Please review" }],
      },
      claimed_user_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    dbState.rows.clientSetups.push(setup);
    return setup;
  }

  it("does not activate without the matching Clerk account, and rejects a different email", async () => {
    await createReadySetup();
    clerkState.users.push({ id: "wrong-user", primaryEmailAddress: { emailAddress: "other@example.com" } });

    const response = await request(app).post("/api/admin/client-setups/1/claim");

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/matching client account/i);
    expect(dbState.rows.clientSetups[0].status).toBe("ready_to_invite");
    expect(dbState.rows.brandAssets).toHaveLength(0);
  });

  it("promotes a matching account once and keeps retries idempotent", async () => {
    await createReadySetup();
    clerkState.users.push({ id: "client-user", primaryEmailAddress: { emailAddress: " CLIENT@EXAMPLE.COM " } });

    const first = await request(app).post("/api/admin/client-setups/1/claim");
    const second = await request(app).post("/api/admin/client-setups/1/claim");

    expect(first.status).toBe(200);
    expect(first.body.claimed_user_id).toBe("client-user");
    expect(second.status).toBe(200);
    expect(second.body.claimed_user_id).toBe("client-user");
    expect(dbState.rows.clientSetups[0].status).toBe("claimed");
    expect(dbState.rows.brandAssets).toHaveLength(1);
    expect(dbState.rows.checklistTasks).toHaveLength(1);
    expect(dbState.rows.serviceRequestSubmissions).toHaveLength(1);
  });

  it("serializes simultaneous activations and promotes the staged data only once", async () => {
    await createReadySetup();
    clerkState.users.push({ id: "client-user", primaryEmailAddress: { emailAddress: "client@example.com" } });

    const responses = await Promise.all([
      request(app).post("/api/admin/client-setups/1/claim"),
      request(app).post("/api/admin/client-setups/1/claim"),
    ]);

    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(responses.map((response) => response.body.claimed_user_id)).toEqual(["client-user", "client-user"]);
    expect(dbState.rows.clientSetups[0].status).toBe("claimed");
    expect(dbState.rows.brandAssets).toHaveLength(1);
    expect(dbState.rows.checklistTasks).toHaveLength(1);
    expect(dbState.rows.serviceRequestSubmissions).toHaveLength(1);
  });
});
