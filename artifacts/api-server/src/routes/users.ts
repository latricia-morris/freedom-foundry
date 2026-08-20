import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import {
  bigPicturesTable,
  brandAssetsTable,
  brandGuidelinesTable,
  brandUpEntriesTable,
  corporateBrandProfilesTable,
  db,
  igniteOSTable,
  lessonProgressTable,
  mediaKitsTable,
  personalBrandProfilesTable,
  serviceRequestSubmissionsTable,
  userProfilesTable,
  workbookDefinitionsTable,
  workbookResponsesTable,
  checklistTasksTable,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  GetAdminUserAccountParams,
  GetAdminUserAccountResponse,
  UpdateAdminUserAccountBody,
  UpdateAdminUserAccountParams,
  UpdateAdminUserAccountResponse,
} from "@workspace/api-zod";
import {
  authMiddleware,
  ownedCreatePayload,
  ownedNotFound,
  ownedUpdatePayload,
  requireAdmin,
  requireMemberId,
  resolveAppRole,
} from "../lib/auth";

const router: IRouter = Router();
const accountTypes = new Set(["free", "premium", "client", "premium_client"]);
const roles = new Set(["user", "admin"]);
const adminContentKinds = new Set(["checklist_task", "brand_up_entry", "service_request", "brand_asset"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function optionalText(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function serializeUser(user: Awaited<ReturnType<typeof clerkClient.users.getUser>>) {
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  return {
    id: user.id,
    email,
    ...(user.firstName ? { first_name: user.firstName } : {}),
    ...(user.lastName ? { last_name: user.lastName } : {}),
    role: resolveAppRole(email || null, user.publicMetadata),
    created_at: new Date(user.createdAt).toISOString(),
  };
}

function serializeProfile(profile: typeof userProfilesTable.$inferSelect) {
  return {
    id: profile.id,
    user_id: profile.user_id,
    ...(profile.first_name ? { first_name: profile.first_name } : {}),
    ...(profile.last_name ? { last_name: profile.last_name } : {}),
    ...(profile.business_name ? { business_name: profile.business_name } : {}),
    ...(profile.website ? { website: profile.website } : {}),
    ...(profile.phone ? { phone: profile.phone } : {}),
    ...(profile.headshot_url ? { headshot_url: profile.headshot_url } : {}),
    account_type: profile.account_type,
    brand_power_moves_unlocked: profile.brand_power_moves_unlocked,
    ...(profile.brand_power_moves_unlocked_at
      ? { brand_power_moves_unlocked_at: profile.brand_power_moves_unlocked_at.toISOString() }
      : {}),
    ...(profile.unlock_method ? { unlock_method: profile.unlock_method } : {}),
    ...(profile.active_program_id ? { active_program_id: profile.active_program_id } : {}),
    ...(profile.notes ? { notes: profile.notes } : {}),
    ...(profile.setup_status ? { setup_status: profile.setup_status } : {}),
    marketing_consent: profile.marketing_consent,
    ...(profile.consent_date ? { consent_date: profile.consent_date.toISOString() } : {}),
    created_at: profile.created_at.toISOString(),
  };
}

function serializeAccount(
  user: Awaited<ReturnType<typeof clerkClient.users.getUser>>,
  profile: typeof userProfilesTable.$inferSelect | undefined,
) {
  return {
    user: serializeUser(user),
    ...(profile ? { profile: serializeProfile(profile) } : {}),
  };
}

async function listAllClerkUsers() {
  const users = [];
  let offset = 0;

  do {
    const page = await clerkClient.users.getUserList({
      limit: 100,
      offset,
      orderBy: "-created_at",
    });
    users.push(...page.data);
    offset += page.data.length;
    if (page.data.length === 0 || offset >= page.totalCount) break;
  } while (true);

  return users;
}

// Admin: list all users
router.get("/users", authMiddleware, requireAdmin, async (_req, res): Promise<void> => {
  const users = await listAllClerkUsers();
  res.json(users.map(serializeUser));
});

// Admin: send a Clerk-managed invitation. The recipient chooses their own credentials.
router.post("/admin/invitations", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }

  try {
    const invitation = await clerkClient.invitations.createInvitation({ emailAddress: email });
    res.status(201).json({
      id: invitation.id,
      email: invitation.emailAddress,
      status: invitation.status,
    });
  } catch {
    res.status(409).json({ error: "An invitation or account already exists for that email address." });
  }
});

router.get("/admin/users/:userId", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminUserAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(params.data.userId);
    const [profile] = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.user_id, user.id))
      .limit(1);

    res.json(GetAdminUserAccountResponse.parse(serializeAccount(user, profile)));
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error
      ? Number((error as { status?: number }).status)
      : 500;
    if (status === 404) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    throw error;
  }
});

// Admin-only aggregate for viewing a selected member's private portal records.
// Member-scoped routes intentionally never accept a target user ID.
router.get("/admin/users/:userId/portal-data", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminUserAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    await clerkClient.users.getUser(params.data.userId);
    const userId = params.data.userId;
    const [
      bigPictures,
      personalBrandProfiles,
      corporateBrandProfiles,
      brandGuidelines,
      brandAssets,
      mediaKits,
      igniteOs,
      lessonProgress,
      workbookDefinitions,
      workbookResponses,
      checklistTasks,
      brandUpEntries,
      serviceRequests,
    ] = await Promise.all([
      db.select().from(bigPicturesTable).where(eq(bigPicturesTable.user_id, userId)),
      db.select().from(personalBrandProfilesTable).where(eq(personalBrandProfilesTable.user_id, userId)),
      db.select().from(corporateBrandProfilesTable).where(eq(corporateBrandProfilesTable.user_id, userId)),
      db.select().from(brandGuidelinesTable).where(eq(brandGuidelinesTable.user_id, userId)),
      db.select().from(brandAssetsTable).where(eq(brandAssetsTable.user_id, userId)),
      db.select().from(mediaKitsTable).where(eq(mediaKitsTable.user_id, userId)),
      db.select().from(igniteOSTable).where(eq(igniteOSTable.user_id, userId)),
      db.select().from(lessonProgressTable).where(eq(lessonProgressTable.user_id, userId)),
      db.select().from(workbookDefinitionsTable).orderBy(workbookDefinitionsTable.order),
      db.select().from(workbookResponsesTable).where(eq(workbookResponsesTable.user_id, userId)),
      db.select().from(checklistTasksTable).where(eq(checklistTasksTable.user_id, userId)),
      db.select().from(brandUpEntriesTable).where(eq(brandUpEntriesTable.user_id, userId)),
      db.select().from(serviceRequestSubmissionsTable).where(eq(serviceRequestSubmissionsTable.user_id, userId)),
    ]);

    res.json({
      bigPictures,
      personalBrandProfiles,
      corporateBrandProfiles,
      brandGuidelines,
      brandAssets,
      mediaKits,
      igniteOs,
      lessonProgress,
      workbookDefinitions,
      workbookResponses,
      checklistTasks,
      brandUpEntries,
      serviceRequests,
    });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error
      ? Number((error as { status?: number }).status)
      : 500;
    if (status === 404) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    throw error;
  }
});

// Admin: add narrowly scoped private content to a selected member's account.
// This is intentionally separate from member routes, which always bind to req.userId.
router.post("/admin/users/:userId/portal-content", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminUserAccountParams.safeParse(req.params);
  const body = asRecord(req.body);
  const kind = typeof body?.kind === "string" ? body.kind : "";
  const data = asRecord(body?.data);
  if (!params.success || !adminContentKinds.has(kind) || !data) {
    res.status(400).json({ error: "Choose a valid account item and complete its required fields." });
    return;
  }

  try {
    const userId = params.data.userId;
    await clerkClient.users.getUser(userId);

    if (kind === "checklist_task") {
      const title = optionalText(data, "title");
      if (!title) { res.status(400).json({ error: "A checklist task needs a title." }); return; }
      const [item] = await db.insert(checklistTasksTable).values({
        user_id: userId,
        title,
        ...(optionalText(data, "deadline_date") ? { deadline_date: optionalText(data, "deadline_date") } : {}),
        ...(optionalText(data, "assignee") ? { assignee: optionalText(data, "assignee") } : {}),
      }).returning();
      res.status(201).json({ kind, item });
      return;
    }

    if (kind === "brand_up_entry") {
      const response = optionalText(data, "response");
      if (!response) { res.status(400).json({ error: "A Brand Up entry needs a response." }); return; }
      const promptId = Number(data.prompt_id);
      const [item] = await db.insert(brandUpEntriesTable).values({
        user_id: userId,
        response,
        ...(Number.isInteger(promptId) && promptId > 0 ? { prompt_id: promptId } : {}),
      }).returning();
      res.status(201).json({ kind, item });
      return;
    }

    if (kind === "service_request") {
      const serviceType = optionalText(data, "service_type");
      if (!serviceType) { res.status(400).json({ error: "A service request needs a service type." }); return; }
      const details = optionalText(data, "details");
      const [item] = await db.insert(serviceRequestSubmissionsTable).values({
        user_id: userId,
        service_type: serviceType,
        ...(details ? { details: { admin_note: details } } : {}),
      }).returning();
      res.status(201).json({ kind, item });
      return;
    }

    const title = optionalText(data, "title");
    if (!title) { res.status(400).json({ error: "A brand asset needs a title." }); return; }
    const [item] = await db.insert(brandAssetsTable).values({
      user_id: userId,
      title,
      ...(optionalText(data, "description") ? { description: optionalText(data, "description") } : {}),
      ...(optionalText(data, "file_url") ? { file_url: optionalText(data, "file_url") } : {}),
      ...(optionalText(data, "file_type") ? { file_type: optionalText(data, "file_type") } : {}),
    }).returning();
    res.status(201).json({ kind, item });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error
      ? Number((error as { status?: number }).status)
      : 500;
    if (status === 404) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    throw error;
  }
});

router.patch("/admin/users/:userId", authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminUserAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateAdminUserAccountBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  if (Object.keys(body.data).length === 0) {
    res.status(400).json({ error: "Choose at least one account setting to update" });
    return;
  }
  if (body.data.role !== undefined && !roles.has(body.data.role)) {
    res.status(400).json({ error: "Role must be either user or admin" });
    return;
  }
  if (body.data.account_type !== undefined && !accountTypes.has(body.data.account_type)) {
    res.status(400).json({ error: "Choose a valid membership type" });
    return;
  }
  if (params.data.userId === req.user?.id && body.data.role === "user") {
    res.status(409).json({
      error: "You cannot remove your own administrator access. Ask another administrator to change your role.",
    });
    return;
  }

  try {
    let user = await clerkClient.users.getUser(params.data.userId);
    if (body.data.role !== undefined) {
      user = await clerkClient.users.updateUserMetadata(user.id, {
        publicMetadata: {
          ...user.publicMetadata,
          role: body.data.role,
        },
      });
    }

    const profileChanges = {
      ...(body.data.account_type !== undefined ? { account_type: body.data.account_type } : {}),
      ...(body.data.brand_power_moves_unlocked !== undefined
        ? { brand_power_moves_unlocked: body.data.brand_power_moves_unlocked }
        : {}),
      ...(body.data.notes !== undefined ? { notes: body.data.notes } : {}),
    };

    const [existingProfile] = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.user_id, user.id))
      .limit(1);
    const profile = existingProfile
      ? (await db
        .update(userProfilesTable)
        .set(profileChanges)
        .where(eq(userProfilesTable.id, existingProfile.id))
        .returning())[0]
      : (await db
        .insert(userProfilesTable)
        .values({ user_id: user.id, ...profileChanges })
        .returning())[0];

    res.json(UpdateAdminUserAccountResponse.parse(serializeAccount(user, profile)));
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error
      ? Number((error as { status?: number }).status)
      : 500;
    if (status === 404) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    throw error;
  }
});

// User profiles
router.get("/user-profiles", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const rows = await db.select().from(userProfilesTable)
    .where(eq(userProfilesTable.user_id, userId));
  res.json(rows);
});

router.post("/user-profiles", authMiddleware, async (req, res): Promise<void> => {
  const data = ownedCreatePayload<typeof userProfilesTable.$inferInsert>(req);
  if (!data) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [created] = await db.insert(userProfilesTable).values(data).returning();
  res.status(201).json(created);
});

router.patch("/user-profiles/:id", authMiddleware, async (req, res): Promise<void> => {
  const userId = requireMemberId(req, res);
  if (!userId) return;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const data = ownedUpdatePayload<typeof userProfilesTable.$inferInsert>(req);
  const [updated] = await db.update(userProfilesTable).set(data)
    .where(and(eq(userProfilesTable.id, id), eq(userProfilesTable.user_id, userId))).returning();
  if (!updated) {
    ownedNotFound(res);
    return;
  }
  res.json(updated);
});

export default router;
