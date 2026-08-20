import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import { db, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetAdminUserAccountParams,
  GetAdminUserAccountResponse,
  UpdateAdminUserAccountBody,
  UpdateAdminUserAccountParams,
  UpdateAdminUserAccountResponse,
} from "@workspace/api-zod";
import { authMiddleware, requireAdmin, resolveAppRole } from "../lib/auth";

const router: IRouter = Router();
const accountTypes = new Set(["free", "premium", "client", "premium_client"]);
const roles = new Set(["user", "admin"]);

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
  const { user_id } = req.query;
  let rows;
  if (user_id) {
    rows = await db.select().from(userProfilesTable).where(eq(userProfilesTable.user_id, String(user_id)));
  } else {
    rows = await db.select().from(userProfilesTable);
  }
  res.json(rows);
});

router.post("/user-profiles", authMiddleware, async (req, res): Promise<void> => {
  const data = req.body;
  const [created] = await db.insert(userProfilesTable).values(data).returning();
  res.status(201).json(created);
});

router.patch("/user-profiles/:id", authMiddleware, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const data = req.body;
  // Remove undefined/null id to avoid overwrite
  delete data.id;
  const [updated] = await db.update(userProfilesTable).set(data).where(eq(userProfilesTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(updated);
});

export default router;
