import express from "express";
import { execFileSync } from "node:child_process";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, tables } = vi.hoisted(() => {
  const tables = {
    corporate: { name: "corporate", id: "corporate.id", user_id: "corporate.user_id" },
    setups: { name: "setups", id: "setups.id", user_id: "setups.user_id" },
    visibility: { name: "visibility", id: "visibility.id", corporate_profile_id: "visibility.corporate_profile_id", drive_file_id: "visibility.drive_file_id", created_at: "visibility.created_at" },
    payment: { name: "payment", id: "payment.id", corporate_profile_id: "payment.corporate_profile_id" },
    comments: { name: "comments", id: "comments.id", corporate_profile_id: "comments.corporate_profile_id", drive_file_id: "comments.drive_file_id", drive_modified_time: "comments.drive_modified_time", created_at: "comments.created_at" },
    decisions: { name: "decisions", id: "decisions.id", corporate_profile_id: "decisions.corporate_profile_id", drive_file_id: "decisions.drive_file_id", drive_modified_time: "decisions.drive_modified_time", created_at: "decisions.created_at" },
    audit: { name: "audit", id: "audit.id", corporate_profile_id: "audit.corporate_profile_id", created_at: "audit.created_at" },
  };
  return {
    tables,
    state: {
      profiles: [] as Array<Record<string, any>>,
      setups: [] as Array<Record<string, any>>,
      visibility: [] as Array<Record<string, any>>,
      payment: [] as Array<Record<string, any>>,
      comments: [] as Array<Record<string, any>>,
      decisions: [] as Array<Record<string, any>>,
      audit: [] as Array<Record<string, any>>,
      files: new Map<string, Record<string, any>>(),
      revoked: false,
      failAudit: false,
      nextId: 1,
    },
  };
});

function rowsFor(table: { name: string }) {
  const key = table.name === "corporate" ? "profiles" : table.name === "setups" ? "setups" : table.name;
  return state[key as keyof typeof state] as Array<Record<string, any>>;
}

function matches(row: Record<string, any>, condition: any): boolean {
  if (!condition) return true;
  if (condition.type === "and") return condition.conditions.every((child: any) => matches(row, child));
  if (condition.type === "eq") return row[condition.column.split(".").at(-1)!] === condition.value;
  return true;
}

function chain(rows: Array<Record<string, any>>) {
  return {
    where: (condition: any) => chain(rows.filter((row) => matches(row, condition))),
    orderBy: () => chain(rows),
    for: () => chain(rows),
    limit: async (limit: number) => rows.slice(0, limit),
    then: (resolve: (value: Array<Record<string, any>>) => unknown) => Promise.resolve(rows).then(resolve),
  };
}

vi.mock("@workspace/db", () => {
  const db = {
    select: () => ({ from: (table: { name: string }) => chain(rowsFor(table)) }),
    update: (table: { name: string }) => ({
      set: (changes: Record<string, unknown>) => ({
        where: (condition: any) => {
          const execute = () => {
            const rows = rowsFor(table).filter((row) => matches(row, condition));
            rows.forEach((row) => Object.assign(row, changes));
            return rows;
          };
          return { returning: async () => execute(), then: (resolve: (value: unknown) => unknown) => Promise.resolve(execute()).then(resolve) };
        },
      }),
    }),
    insert: (table: { name: string }) => ({
      values: (values: Record<string, unknown>) => {
        if (table.name === "audit" && state.failAudit) throw new Error("Audit store unavailable");
        const row = { id: state.nextId++, created_at: new Date("2025-01-01T00:00:00.000Z"), ...values };
        rowsFor(table).push(row);
        return { returning: async () => [row], then: (resolve: (value: unknown) => unknown) => Promise.resolve().then(() => resolve([row])) };
      },
    }),
    transaction: async (callback: (transaction: any) => Promise<unknown>) => {
      const affected = [state.visibility, state.payment, state.comments, state.decisions, state.audit];
      const snapshot = affected.map((rows) => rows.map((row) => ({ ...row })));
      const nextId = state.nextId;
      try {
        return await callback(db);
      } catch (error) {
        affected.forEach((rows, index) => rows.splice(0, rows.length, ...snapshot[index]));
        state.nextId = nextId;
        throw error;
      }
    },
  };
  return {
    corporateBrandProfilesTable: tables.corporate,
    clientSetupsTable: tables.setups,
    driveFileVisibilityTable: tables.visibility,
    deliveryPaymentEligibilityTable: tables.payment,
    driveFileCommentsTable: tables.comments,
    driveFileDecisionsTable: tables.decisions,
    deliveryAuditLogTable: tables.audit,
    db,
  };
});

vi.mock("drizzle-orm", () => ({
  eq: (column: string, value: unknown) => ({ type: "eq", column, value }),
  and: (...conditions: unknown[]) => ({ type: "and", conditions }),
  desc: (column: string) => column,
}));

vi.mock("../lib/auth", () => ({
  authMiddleware: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.userId = String(req.headers["x-user"] || "owner-1");
    req.user = {
      id: req.userId,
      email: String(req.headers["x-email"] || "owner@example.com"),
      firstName: null,
      lastName: null,
      role: req.headers["x-super"] === "true" ? "super_admin" : req.headers["x-admin"] === "true" ? "admin" : "user",
    };
    next();
  },
  requireAdmin: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.user?.role !== "admin" && req.user?.role !== "super_admin") { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  },
  requireMemberId: (req: express.Request) => req.userId || null,
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
        if (path.includes("alt=media")) return new Response(file.content || "contents", { status: 200, headers: { "content-type": file.mimeType } });
        return Response.json(file);
      }
      const parentMatch = decodeURIComponent(path).match(/'([^']+)' in parents/);
      const files = [...state.files.values()].filter((file) => !file.deleted && file.parents?.includes(parentMatch?.[1]));
      return Response.json({ files });
    }
  },
}));

import driveFilesRouter, { driveFilesTestables } from "./drive-files";

describe("authorized corporate Drive delivery", () => {
  const pngFixture = execFileSync("magick", ["-size", "24x24", "xc:royalblue", "png:-"]);
  const pdfFixture = execFileSync("magick", ["-size", "24x24", "xc:gold", "pdf:-"]);
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.log = { warn: vi.fn() } as any; next(); });
  app.use("/api", driveFilesRouter);

  beforeEach(() => {
    state.revoked = false;
    state.failAudit = false;
    state.nextId = 1;
    state.profiles.splice(0); state.setups.splice(0); state.visibility.splice(0); state.payment.splice(0);
    state.comments.splice(0); state.decisions.splice(0); state.audit.splice(0); state.files.clear();
    state.profiles.push({
      id: 1, user_id: "owner-1",
      account_members: [
        { email: "admin@client.com", role: "admin", permissions: ["view_corporate"] },
        { email: "user@client.com", role: "user", permissions: ["view_corporate"] },
      ],
      drive_folder_id: "root-folder-123", drive_folder_name: "Client files",
    });
    state.files.set("root-folder-123", { id: "root-folder-123", name: "Client files", mimeType: "application/vnd.google-apps.folder", modifiedTime: "2025-01-01T00:00:00.000Z", parents: [] });
    state.files.set("nested-folder-123", { id: "nested-folder-123", name: "Logos", mimeType: "application/vnd.google-apps.folder", modifiedTime: "2025-01-01T00:00:00.000Z", parents: ["root-folder-123"] });
    state.files.set("nested-file-123", { id: "nested-file-123", name: "Primary logo.png", mimeType: "image/png", size: String(pngFixture.byteLength), modifiedTime: "2025-01-02T00:00:00.000Z", parents: ["nested-folder-123"], content: pngFixture });
    state.files.set("outside-file-123", { id: "outside-file-123", name: "Other client.pdf", mimeType: "application/pdf", size: "8", modifiedTime: "2025-01-01T00:00:00.000Z", parents: ["other-root-123"] });
  });

  async function setVisibility(visibility: string, headers: Record<string, string> = { "x-admin": "true" }, reason?: string) {
    return request(app).put("/api/admin/delivery-accounts/1/drive-files/nested-file-123/visibility")
      .set(headers).send({
        visibility, modified_time: "2025-01-02T00:00:00.000Z",
        expected_version: state.visibility.find((item) => item.drive_file_id === "nested-file-123")?.generation || 0,
        ...(reason ? { reason } : {}),
      });
  }

  it("defaults existing descendants to hidden and does not expose their folders", async () => {
    const root = await request(app).get("/api/drive/files?profile_id=1").set({ "x-user": "owner-1" });
    const direct = await request(app).get("/api/drive/files?profile_id=1&folder_id=nested-folder-123").set({ "x-user": "owner-1" });
    expect(root.status).toBe(200);
    expect(root.body.files).toEqual([]);
    expect(direct.status).toBe(404);
  });

  it.each([
    ["owner", { "x-user": "owner-1", "x-email": "owner@example.com" }],
    ["corporate admin", { "x-user": "admin-user", "x-email": "admin@client.com" }],
    ["corporate member", { "x-user": "member-user", "x-email": "user@client.com" }],
  ])("lets the %s browse the exact nested hierarchy after review sharing", async (_label, headers) => {
    expect((await setVisibility("review")).status).toBe(200);
    const response = await request(app).get("/api/drive/files?profile_id=1&folder_id=nested-folder-123").set(headers);
    expect(response.status).toBe(200);
    expect(response.body.breadcrumbs.map((item: any) => item.id)).toEqual(["root-folder-123", "nested-folder-123"]);
    expect(response.body.files).toMatchObject([{ id: "nested-file-123", visibility: "review" }]);
  });

  it("enforces membership and root containment on every client route", async () => {
    expect((await setVisibility("review")).status).toBe(200);
    const wrongAccount = await request(app).get("/api/drive/files?profile_id=1").set({ "x-user": "other-owner", "x-email": "other@example.com" });
    const outside = await request(app).get("/api/drive/files/outside-file-123/preview?profile_id=1").set({ "x-user": "owner-1" });
    expect(wrongAccount.status).toBe(404);
    expect(outside.status).toBe(404);
  });

  it("rejects deleted Drive items and surfaces revoked Drive access without metadata", async () => {
    expect((await setVisibility("review")).status).toBe(200);
    state.files.get("nested-file-123")!.deleted = true;
    const deleted = await request(app).get("/api/drive/files/nested-file-123/preview?profile_id=1").set({ "x-user": "owner-1" });
    state.files.get("nested-file-123")!.deleted = false;
    state.revoked = true;
    const revoked = await request(app).get("/api/drive/files?profile_id=1").set({ "x-user": "owner-1" });
    expect(deleted.status).toBe(404);
    expect(revoked.status).toBe(502);
    expect(revoked.body.error).toMatch(/access is unavailable/i);
  });

  it("only allows authenticated inline image/PDF review bytes, never review downloads", async () => {
    expect((await setVisibility("review")).status).toBe(200);
    const preview = await request(app).get("/api/drive/files/nested-file-123/preview?profile_id=1").set({ "x-user": "owner-1" });
    const download = await request(app).get("/api/drive/files/nested-file-123/download?profile_id=1").set({ "x-user": "owner-1" });
    expect(preview.status).toBe(200);
    expect(preview.headers["content-type"]).toContain("image/png");
    expect(preview.headers["content-disposition"]).toMatch(/^inline/);
    expect(preview.body.subarray(0, 8).equals(pngFixture.subarray(0, 8))).toBe(true);
    expect(preview.body.equals(pngFixture)).toBe(false);
    expect(download.status).toBe(403);
  });

  it("rasterizes a requested PDF page and returns only PNG preview bytes", async () => {
    state.files.set("review-pdf-123", {
      id: "review-pdf-123", name: "Concept.pdf", mimeType: "application/pdf", size: String(pdfFixture.byteLength),
      modifiedTime: "2025-01-02T00:00:00.000Z", parents: ["root-folder-123"], content: pdfFixture,
    });
    state.visibility.push({
      id: 99, corporate_profile_id: 1, drive_file_id: "review-pdf-123", visibility: "review",
      drive_modified_time: "2025-01-02T00:00:00.000Z", released_with_override: false,
    });
    const preview = await request(app).get("/api/drive/files/review-pdf-123/preview?profile_id=1&page=1").set({ "x-user": "owner-1" });
    expect(preview.status).toBe(200);
    expect(preview.headers["content-type"]).toContain("image/png");
    expect(preview.headers["x-preview-page-count"]).toBe("1");
    expect([...preview.body.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(preview.body.equals(pdfFixture)).toBe(false);
  });

  it("requires both explicit release and manual paid-in-full eligibility for download", async () => {
    expect((await setVisibility("released")).status).toBe(403);
    const paid = await request(app).put("/api/admin/delivery-accounts/1/payment-eligibility").set({ "x-admin": "true" })
      .send({ confirmed_paid_in_full: true, evidence: "Invoice 100 settled", reason: "Bank transfer reconciled manually", expected_version: 0 });
    expect(paid.status).toBe(200);
    expect((await setVisibility("released")).status).toBe(200);
    const download = await request(app).get("/api/drive/files/nested-file-123/download?profile_id=1").set({ "x-user": "owner-1" });
    expect(download.status).toBe(200);
    expect(download.headers["content-disposition"]).toContain("Primary%20logo.png");
    expect(state.audit.map((row) => row.action)).toContain("payment_confirmed_paid_in_full");
  });

  it("permits a Super Admin's reasoned release override and audits it", async () => {
    const release = await setVisibility("released", { "x-super": "true" }, "Agency exception approved by director");
    expect(release.status).toBe(200);
    expect(release.body.released_with_override).toBe(true);
    const download = await request(app).get("/api/drive/files/nested-file-123/download?profile_id=1").set({ "x-user": "owner-1" });
    expect(download.status).toBe(200);
    expect(state.audit.find((row) => row.action === "release_override")).toMatchObject({ actor_role: "super_admin" });
  });

  it("removes a former member from every client delivery action immediately", async () => {
    expect((await setVisibility("review")).status).toBe(200);
    state.profiles[0].account_members = [];
    const headers = { "x-user": "former-member", "x-email": "user@client.com" };
    const responses = await Promise.all([
      request(app).get("/api/drive/files?profile_id=1").set(headers),
      request(app).get("/api/drive/files/nested-file-123/preview?profile_id=1").set(headers),
      request(app).get("/api/drive/files/nested-file-123/download?profile_id=1").set(headers),
      request(app).get("/api/drive/files/nested-file-123/comments?profile_id=1").set(headers),
      request(app).post("/api/drive/files/nested-file-123/comments?profile_id=1").set(headers)
        .send({ body: "still here?", modified_time: "2025-01-02T00:00:00.000Z" }),
      request(app).post("/api/drive/files/nested-file-123/decision?profile_id=1").set(headers)
        .send({ decision: "approved", modified_time: "2025-01-02T00:00:00.000Z" }),
    ]);
    expect(responses.map((response) => response.status)).toEqual([404, 404, 404, 404, 404, 404]);
  });

  it("denies final downloads again when manual payment confirmation is revoked", async () => {
    expect((await request(app).put("/api/admin/delivery-accounts/1/payment-eligibility").set({ "x-admin": "true" })
      .send({ confirmed_paid_in_full: true, evidence: "Receipt", reason: "Reconciled", expected_version: 0 })).status).toBe(200);
    expect((await setVisibility("released")).status).toBe(200);
    const revoked = await request(app).put("/api/admin/delivery-accounts/1/payment-eligibility").set({ "x-admin": "true" })
      .send({ confirmed_paid_in_full: false, evidence: "Refund record", reason: "Payment reversed", expected_version: 1 });
    const download = await request(app).get("/api/drive/files/nested-file-123/download?profile_id=1").set({ "x-user": "owner-1" });
    expect(revoked.status).toBe(200);
    expect(download.status).toBe(403);
  });

  it("enforces final-download metadata and stream-size limits", async () => {
    expect((await request(app).put("/api/admin/delivery-accounts/1/payment-eligibility").set({ "x-admin": "true" })
      .send({ confirmed_paid_in_full: true, evidence: "Receipt", reason: "Reconciled", expected_version: 0 })).status).toBe(200);
    expect((await setVisibility("released")).status).toBe(200);
    state.files.get("nested-file-123")!.size = String(51 * 1024 * 1024);
    const metadataLimit = await request(app).get("/api/drive/files/nested-file-123/download?profile_id=1").set({ "x-user": "owner-1" });
    expect(metadataLimit.status).toBe(413);
    await expect(driveFilesTestables.readLimitedBody(new Response("12345"), 4)).rejects.toMatchObject({ status: 413 });
  });

  it("rejects stale visibility generations and rolls back if its audit write fails", async () => {
    expect((await setVisibility("review")).status).toBe(200);
    const stale = await request(app).put("/api/admin/delivery-accounts/1/drive-files/nested-file-123/visibility").set({ "x-admin": "true" })
      .send({ visibility: "hidden", modified_time: "2025-01-02T00:00:00.000Z", expected_version: 0 });
    expect(stale.status).toBe(409);

    state.failAudit = true;
    const auditFailure = await request(app).put("/api/admin/delivery-accounts/1/drive-files/nested-file-123/visibility").set({ "x-admin": "true" })
      .send({ visibility: "hidden", modified_time: "2025-01-02T00:00:00.000Z", expected_version: 1 });
    expect(auditFailure.status).toBe(502);
    expect(state.visibility.find((item) => item.drive_file_id === "nested-file-123")?.visibility).toBe("review");
  });

  it("rolls back version-bound comments and decisions when their audit writes fail", async () => {
    expect((await setVisibility("review")).status).toBe(200);
    state.failAudit = true;
    const comment = await request(app).post("/api/drive/files/nested-file-123/comments?profile_id=1")
      .set({ "x-user": "member-user", "x-email": "user@client.com" })
      .send({ body: "Please change this.", modified_time: "2025-01-02T00:00:00.000Z" });
    const decision = await request(app).post("/api/drive/files/nested-file-123/decision?profile_id=1")
      .set({ "x-user": "admin-user", "x-email": "admin@client.com" })
      .send({ decision: "approved", modified_time: "2025-01-02T00:00:00.000Z" });
    expect(comment.status).toBe(502);
    expect(decision.status).toBe(502);
    expect(state.comments).toEqual([]);
    expect(state.decisions).toEqual([]);
  });

  it("binds comments and client decisions to the reviewed Drive version", async () => {
    expect((await setVisibility("review")).status).toBe(200);
    const comment = await request(app).post("/api/drive/files/nested-file-123/comments?profile_id=1")
      .set({ "x-user": "member-user", "x-email": "user@client.com" }).send({ body: "Please adjust the mark.", modified_time: "2025-01-02T00:00:00.000Z" });
    const memberDecision = await request(app).post("/api/drive/files/nested-file-123/decision?profile_id=1")
      .set({ "x-user": "member-user", "x-email": "user@client.com" }).send({ decision: "approved", modified_time: "2025-01-02T00:00:00.000Z" });
    const missingNote = await request(app).post("/api/drive/files/nested-file-123/decision?profile_id=1")
      .set({ "x-user": "admin-user", "x-email": "admin@client.com" }).send({ decision: "revision_requested", modified_time: "2025-01-02T00:00:00.000Z" });
    state.files.get("nested-file-123")!.modifiedTime = "2025-01-03T00:00:00.000Z";
    const stale = await request(app).post("/api/drive/files/nested-file-123/decision?profile_id=1")
      .set({ "x-user": "admin-user", "x-email": "admin@client.com" }).send({ decision: "approved", modified_time: "2025-01-02T00:00:00.000Z" });
    expect(comment.status).toBe(201);
    expect(memberDecision.status).toBe(403);
    expect(missingNote.status).toBe(400);
    expect(stale.status).toBe(409);
  });

  it("shows agency admins the live folder tree and records revocation", async () => {
    const adminList = await request(app).get("/api/admin/delivery-accounts/1/drive-files?folder_id=nested-folder-123").set({ "x-admin": "true" });
    expect(adminList.status).toBe(200);
    expect(adminList.body.files).toMatchObject([{ id: "nested-file-123", visibility: "hidden" }]);
    expect((await setVisibility("review")).status).toBe(200);
    expect((await setVisibility("hidden")).status).toBe(200);
    expect(state.audit.map((row) => row.action)).toContain("visibility_hidden");
  });

  it("does not emit raw Drive URLs and validates assigned folders before saving", async () => {
    state.setups.push({ id: 7, status: "draft", claimed_user_id: null, payload: { corporate: {} } });
    const response = await request(app).put("/api/admin/client-setups/7/drive-folder").set({ "x-admin": "true" })
      .send({ folder: "https://drive.google.com/drive/folders/root-folder-123" });
    expect(response.status).toBe(200);
    expect(response.body.folder.web_view_link).toBeUndefined();
    expect(state.setups[0].payload.corporate).toMatchObject({ drive_folder_id: "root-folder-123", drive_folder_name: "Client files" });
  });

  it("keeps small pure helpers defensive", async () => {
    expect(driveFilesTestables.parseFolderId("https://drive.google.com/drive/folders/root-folder-123")).toBe("root-folder-123");
    expect(driveFilesTestables.safeFilename("bad/name?.pdf")).toBe("bad_name_.pdf");
    await expect(driveFilesTestables.readLimitedBody(new Response("12345"), 4)).rejects.toMatchObject({ status: 413 });
  });
});