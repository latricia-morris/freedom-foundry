import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, corporateTable, setupTable } = vi.hoisted(() => ({
  corporateTable: { name: "corporate", id: "corporate.id", user_id: "corporate.user_id" },
  setupTable: { name: "setups", id: "setups.id", user_id: "setups.user_id" },
  state: {
    profiles: [] as Array<Record<string, any>>,
    setups: [] as Array<Record<string, any>>,
    files: new Map<string, Record<string, any>>(),
    revoked: false,
  },
}));

function matches(row: Record<string, any>, condition: any) {
  if (condition?.type !== "eq") return true;
  return row[condition.column.split(".").at(-1)] === condition.value;
}

function queryRows(table: { name: string }, condition?: unknown) {
  const rows = table.name === "corporate" ? state.profiles : state.setups;
  return rows.filter((row) => matches(row, condition));
}

vi.mock("@workspace/db", () => ({
  corporateBrandProfilesTable: corporateTable,
  clientSetupsTable: setupTable,
  db: {
    select: () => ({
      from: (table: { name: string }) => {
        const allRows = queryRows(table);
        return Object.assign(Promise.resolve(allRows), {
          where: (condition: unknown) => ({
            limit: async () => queryRows(table, condition),
          }),
        });
      },
    }),
    update: (table: { name: string }) => ({
      set: (changes: Record<string, unknown>) => ({
        where: (condition: unknown) => {
          const execute = () => {
            const rows = queryRows(table, condition);
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
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: (column: string, value: unknown) => ({ type: "eq", column, value }),
}));

vi.mock("../lib/auth", () => ({
  authMiddleware: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.userId = String(req.headers["x-user"] || "owner-1");
    req.user = {
      id: req.userId,
      email: String(req.headers["x-email"] || "owner@example.com"),
      firstName: null,
      lastName: null,
      role: req.headers["x-admin"] === "true" ? "admin" : "user",
    };
    next();
  },
  requireAdmin: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.user?.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  },
  requireMemberId: (req: express.Request, _res: express.Response) => req.userId || null,
}));

vi.mock("@replit/connectors-sdk", () => ({
  ReplitConnectors: class {
    async proxy(_connector: string, path: string) {
      if (state.revoked) return new Response("Forbidden", { status: 403 });
      const idMatch = path.match(/\/drive\/v3\/files\/([^/?]+)/);
      if (idMatch) {
        const id = decodeURIComponent(idMatch[1]);
        const file = state.files.get(id);
        if (!file || file.deleted) return new Response("Missing", { status: 404 });
        if (path.includes("/export?")) return new Response(file.content || "pdf", { status: 200, headers: { "content-type": "application/pdf" } });
        if (path.includes("alt=media")) return new Response(file.content || "contents", { status: 200, headers: { "content-type": "text/plain" } });
        return Response.json(file);
      }
      const parentMatch = decodeURIComponent(path).match(/'([^']+)' in parents/);
      const files = [...state.files.values()].filter((file) => !file.deleted && file.parents?.includes(parentMatch?.[1]));
      return Response.json({ files });
    }
  },
}));

import driveFilesRouter, { driveFilesTestables } from "./drive-files";
import { stripCorporateDriveFields } from "../lib/corporate-drive-fields";

describe("corporate Google Drive files", () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.log = { warn: vi.fn() } as any;
    next();
  });
  app.use("/api", driveFilesRouter);

  beforeEach(() => {
    state.revoked = false;
    state.profiles.splice(0);
    state.setups.splice(0);
    state.files.clear();
    state.profiles.push({
      id: 1,
      user_id: "owner-1",
      account_members: [
        { email: "admin@client.com", role: "admin", permissions: ["view_corporate", "edit_corporate"] },
        { email: "user@client.com", role: "user", permissions: ["view_corporate"] },
      ],
      drive_folder_id: "root-folder-123",
      drive_folder_name: "Client files",
    });
    state.files.set("root-folder-123", { id: "root-folder-123", name: "Client files", mimeType: "application/vnd.google-apps.folder", parents: [] });
    state.files.set("nested-folder-123", { id: "nested-folder-123", name: "Logos", mimeType: "application/vnd.google-apps.folder", parents: ["root-folder-123"] });
    state.files.set("nested-file-123", { id: "nested-file-123", name: "Primary logo.svg", mimeType: "image/svg+xml", size: "8", parents: ["nested-folder-123"], content: "<svg />" });
    state.files.set("outside-file-123", { id: "outside-file-123", name: "Other client.pdf", mimeType: "application/pdf", size: "8", parents: ["other-root-123"] });
  });

  it.each([
    ["owner", { "x-user": "owner-1", "x-email": "owner@example.com" }],
    ["corporate admin", { "x-user": "admin-user", "x-email": "admin@client.com" }],
    ["corporate user", { "x-user": "member-user", "x-email": "user@client.com" }],
  ])("lets the %s browse nested assigned folders", async (_label, headers) => {
    const response = await request(app)
      .get("/api/drive/files?profile_id=1&folder_id=nested-folder-123")
      .set(headers);
    expect(response.status).toBe(200);
    expect(response.body.breadcrumbs.map((item: any) => item.id)).toEqual(["root-folder-123", "nested-folder-123"]);
    expect(response.body.files.map((item: any) => item.id)).toEqual(["nested-file-123"]);
  });

  it("removes access immediately when a member is removed", async () => {
    state.profiles[0].account_members = [];
    const response = await request(app)
      .get("/api/drive/files?profile_id=1")
      .set({ "x-user": "former-member", "x-email": "user@client.com" });
    expect(response.status).toBe(404);
  });

  it("does not expose another corporate account or an outside file", async () => {
    const wrongAccount = await request(app)
      .get("/api/drive/files?profile_id=1")
      .set({ "x-user": "other-owner", "x-email": "other@example.com" });
    expect(wrongAccount.status).toBe(404);

    const outsideDownload = await request(app)
      .get("/api/drive/files/outside-file-123/download?profile_id=1")
      .set({ "x-user": "owner-1" });
    expect(outsideDownload.status).toBe(404);
  });

  it("reports a deleted nested item without exposing stale metadata", async () => {
    state.files.get("nested-folder-123")!.deleted = true;
    const response = await request(app)
      .get("/api/drive/files?profile_id=1&folder_id=nested-folder-123")
      .set({ "x-user": "owner-1" });
    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/missing|accessible|deleted/i);
  });

  it("reports revoked Google Drive access as an upstream error", async () => {
    state.revoked = true;
    const response = await request(app)
      .get("/api/drive/files?profile_id=1")
      .set({ "x-user": "owner-1" });
    expect(response.status).toBe(502);
    expect(response.body.error).toMatch(/access is unavailable/i);
  });

  it("validates and replaces a setup folder before saving it", async () => {
    state.setups.push({ id: 7, status: "draft", claimed_user_id: null, payload: { corporate: {} } });
    const response = await request(app)
      .put("/api/admin/client-setups/7/drive-folder")
      .set({ "x-admin": "true" })
      .send({ folder: "https://drive.google.com/drive/folders/root-folder-123" });
    expect(response.status).toBe(200);
    expect(state.setups[0].payload.corporate).toMatchObject({
      drive_folder_id: "root-folder-123",
      drive_folder_name: "Client files",
    });
  });

  it("downloads a nested file and rejects metadata that exceeds the limit", async () => {
    const download = await request(app)
      .get("/api/drive/files/nested-file-123/download?profile_id=1")
      .set({ "x-user": "owner-1" });
    expect(download.status).toBe(200);
    expect(download.headers["content-disposition"]).toContain("Primary%20logo.svg");

    state.files.get("nested-file-123")!.size = String(51 * 1024 * 1024);
    const oversized = await request(app)
      .get("/api/drive/files/nested-file-123/download?profile_id=1")
      .set({ "x-user": "owner-1" });
    expect(oversized.status).toBe(413);
  });

  it("exports supported Google files as PDFs", async () => {
    state.files.set("google-doc-123", {
      id: "google-doc-123",
      name: "Brand notes",
      mimeType: "application/vnd.google-apps.document",
      parents: ["root-folder-123"],
      content: "pdf",
    });
    const response = await request(app)
      .get("/api/drive/files/google-doc-123/download?profile_id=1")
      .set({ "x-user": "owner-1" });
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.headers["content-disposition"]).toContain("Brand%20notes.pdf");
  });

  it("stops reading an undeclared oversized response body", async () => {
    const response = new Response("12345");
    await expect(driveFilesTestables.readLimitedBody(response, 4)).rejects.toMatchObject({ status: 413 });
  });

  it.each(["owner", "delegated editor", "normal user"])("strips Drive roots from generic corporate writes by a %s", (_actor) => {
    expect(stripCorporateDriveFields({
      company_name: "Client Co.",
      drive_folder_id: "other-client-root",
      drive_folder_name: "Other client",
    })).toEqual({ company_name: "Client Co." });
  });
});