import { Router, type IRouter, type Request } from "express";
import { clerkClient } from "@clerk/express";
import { and, desc, eq } from "drizzle-orm";
import { db, referralPartnersTable, referralSubmissionsTable, userProfilesTable } from "@workspace/db";
import { authMiddleware, requireAdmin } from "../lib/auth";

const router: IRouter = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const partnerStatuses = new Set(["invited", "active", "revoked"]);
const referralStatuses = new Set(["submitted", "contacted", "qualified", "converted", "closed"]);
const payoutStatuses = new Set(["pending", "approved", "paid", "ineligible"]);
const submissionKinds = new Set(["referral", "question"]);

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function text(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}
function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function idParam(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function programUrl(req: Request): string {
  const configured = process.env.APP_URL?.trim();
  const base = configured || `${req.protocol}://${req.get("host")}`;
  return new URL("/referral-partner-program", base).toString();
}

async function clerkUserForEmail(email: string) {
  const result = await clerkClient.users.getUserList({ emailAddress: [email], limit: 1 });
  const user = result.data[0];
  return user && normalizeEmail(user.primaryEmailAddress?.emailAddress) === email ? user : undefined;
}

async function hasMemberProfile(userId: string): Promise<boolean> {
  const [profile] = await db.select({ id: userProfilesTable.id }).from(userProfilesTable)
    .where(eq(userProfilesTable.user_id, userId)).limit(1);
  return Boolean(profile);
}

async function sendInvitation(email: string, redirectUrl: string) {
  return clerkClient.invitations.createInvitation({ emailAddress: email, redirectUrl });
}

async function currentPartner(req: Request, activateInvited = true) {
  const email = req.user?.email;
  if (!email) return undefined;
  const [partner] = await db.select().from(referralPartnersTable)
    .where(eq(referralPartnersTable.email, email)).limit(1);
  if (req.user?.role === "admin") {
    if (partner) {
      const [adminPartner] = await db.update(referralPartnersTable).set({
        status: "active",
        referral_only: false,
        clerk_user_id: req.userId,
        activated_at: partner.activated_at ?? new Date(),
        revoked_at: null,
        invitation_status: partner.invitation_status === "pending" ? "not_needed" : partner.invitation_status,
      }).where(eq(referralPartnersTable.id, partner.id)).returning();
      return adminPartner;
    }
    const [adminPartner] = await db.insert(referralPartnersTable).values({
      email,
      name: [req.user.firstName, req.user.lastName].filter(Boolean).join(" ") || "Administrator",
      clerk_user_id: req.userId,
      status: "active",
      referral_only: false,
      invitation_status: "not_needed",
      activated_at: new Date(),
    }).returning();
    return adminPartner;
  }
  if (!partner || partner.status === "revoked") return undefined;
  if (partner.status === "invited" && activateInvited) {
    const [active] = await db.update(referralPartnersTable).set({
      status: "active",
      clerk_user_id: req.userId,
      activated_at: new Date(),
      revoked_at: null,
    }).where(eq(referralPartnersTable.id, partner.id)).returning();
    return active;
  }
  return partner.status === "active" ? partner : undefined;
}

export function validateSubmission(body: Record<string, unknown> | null):
  | { valid: true; data: { kind: "referral" | "question"; contactName?: string; contactEmail?: string; contactPhone?: string; businessName?: string; relationship?: string; notes?: string; question?: string } }
  | { valid: false; error: string } {
  const kind = text(body?.kind) ?? "referral";
  if (!submissionKinds.has(kind)) return { valid: false, error: "Submission kind must be referral or question." };
  const contactName = text(body?.contact_name ?? body?.referred_name ?? body?.name);
  const contactEmail = body?.contact_email ?? body?.referred_email ?? body?.email;
  const normalizedEmail = contactEmail === undefined ? undefined : normalizeEmail(contactEmail);
  const question = text(body?.question);
  if (kind === "referral" && !contactName) return { valid: false, error: "A referral contact name is required." };
  if (kind === "referral" && (!normalizedEmail || !emailPattern.test(normalizedEmail))) {
    return { valid: false, error: "A valid referral contact email is required." };
  }
  if (kind === "question" && !question) return { valid: false, error: "A question is required." };
  if (normalizedEmail && !emailPattern.test(normalizedEmail)) return { valid: false, error: "Enter a valid contact email address." };
  return {
    valid: true,
    data: {
      kind: kind as "referral" | "question",
      ...(contactName ? { contactName } : {}),
      ...(normalizedEmail ? { contactEmail: normalizedEmail } : {}),
      ...(text(body?.contact_phone ?? body?.referred_phone ?? body?.phone) ? { contactPhone: text(body?.contact_phone ?? body?.referred_phone ?? body?.phone) } : {}),
      ...(text(body?.business_name) ? { businessName: text(body?.business_name) } : {}),
      ...(text(body?.relationship) ? { relationship: text(body?.relationship) } : {}),
      ...(text(body?.notes) ? { notes: text(body?.notes) } : {}),
      ...(question ? { question } : {}),
    },
  };
}

async function notifySubmission(
  submission: typeof referralSubmissionsTable.$inferSelect,
  partner: typeof referralPartnersTable.$inferSelect,
  log: { error?: Function },
): Promise<void> {
  const endpoint = process.env.REFERRAL_NOTIFICATION_WEBHOOK_URL?.trim();
  if (!endpoint) {
    const error = "REFERRAL_NOTIFICATION_WEBHOOK_URL is not configured";
    log.error?.({ submissionId: submission.id }, error);
    await db.update(referralSubmissionsTable).set({ notification_status: "failed", confirmation_status: "failed", email_error: error })
      .where(eq(referralSubmissionsTable.id, submission.id));
    return;
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referral_submission_id: submission.id,
        partner: { id: partner.id, name: partner.name, email: partner.email },
        submission: {
          kind: submission.kind, contact_name: submission.contact_name, contact_email: submission.contact_email,
          contact_phone: submission.contact_phone, business_name: submission.business_name,
          relationship: submission.relationship, notes: submission.notes, question: submission.question,
        },
      }),
    });
    if (!response.ok) throw new Error(`Referral notification webhook returned ${response.status}`);
    await db.update(referralSubmissionsTable).set({ notification_status: "sent", confirmation_status: "sent", email_error: null })
      .where(eq(referralSubmissionsTable.id, submission.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Referral notification webhook request failed";
    log.error?.({ err: error, submissionId: submission.id }, message);
    await db.update(referralSubmissionsTable).set({ notification_status: "failed", confirmation_status: "failed", email_error: message })
      .where(eq(referralSubmissionsTable.id, submission.id));
  }
}

router.get(["/referral-partner/access", "/referrals/access"], authMiddleware, async (req, res): Promise<void> => {
  const partner = await currentPartner(req);
  if (partner) {
    res.json({ allowed: true, status: partner.status, referral_only: partner.referral_only, partner }); return;
  }
  const email = req.user?.email;
  const [inactive] = email ? await db.select().from(referralPartnersTable).where(eq(referralPartnersTable.email, email)).limit(1) : [];
  res.json({
    allowed: false,
    status: inactive?.status ?? "denied",
    referral_only: inactive?.referral_only ?? false,
    partner: inactive ?? null,
  });
});

router.get(["/referral-partner/submissions", "/referrals/submissions"], authMiddleware, async (req, res): Promise<void> => {
  const partner = await currentPartner(req);
  if (!partner) { res.status(403).json({ error: "Referral partner access is not active." }); return; }
  const submissions = await db.select().from(referralSubmissionsTable)
    .where(eq(referralSubmissionsTable.partner_id, partner.id)).orderBy(desc(referralSubmissionsTable.created_at));
  res.json(submissions);
});

router.post(["/referral-partner/submissions", "/referrals/submissions"], authMiddleware, async (req, res): Promise<void> => {
  const partner = await currentPartner(req);
  const validated = validateSubmission(record(req.body));
  if (!partner) { res.status(403).json({ error: "Referral partner access is not active." }); return; }
  if (!validated.valid) { res.status(400).json({ error: validated.error }); return; }
  const [submission] = await db.insert(referralSubmissionsTable).values({
    partner_id: partner.id,
    kind: validated.data.kind,
    ...(validated.data.contactName ? { contact_name: validated.data.contactName } : {}),
    ...(validated.data.contactEmail ? { contact_email: validated.data.contactEmail } : {}),
    ...(validated.data.contactPhone ? { contact_phone: validated.data.contactPhone } : {}),
    ...(validated.data.businessName ? { business_name: validated.data.businessName } : {}),
    ...(validated.data.relationship ? { relationship: validated.data.relationship } : {}),
    ...(validated.data.notes ? { notes: validated.data.notes } : {}),
    ...(validated.data.question ? { question: validated.data.question } : {}),
  }).returning();
  // The durable submission precedes notification; webhook errors are recorded, never discarded.
  await notifySubmission(submission, partner, req.log ?? {});
  const [updated] = await db.select().from(referralSubmissionsTable).where(eq(referralSubmissionsTable.id, submission.id));
  res.status(201).json(updated ?? submission);
});

router.get(["/admin/referral-partners", "/admin/referrals/partners"], authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const partners = await db.select().from(referralPartnersTable).orderBy(desc(referralPartnersTable.created_at));
  res.json(partners.map((partner) => ({ ...partner, program_url: programUrl(req) })));
});

router.post(["/admin/referral-partners", "/admin/referrals/partners/invite"], authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const body = record(req.body);
  const email = normalizeEmail(body?.email);
  if (!emailPattern.test(email)) { res.status(400).json({ error: "Enter a valid email address." }); return; }
  const existingAccount = await clerkUserForEmail(email);
  const existingMember = existingAccount ? await hasMemberProfile(existingAccount.id) : false;
  const [existing] = await db.select().from(referralPartnersTable).where(eq(referralPartnersTable.email, email)).limit(1);
  const changes = {
    ...(text(body?.name) !== undefined ? { name: text(body?.name) } : {}),
    ...(text(body?.internal_notes) !== undefined ? { internal_notes: text(body?.internal_notes) } : {}),
    ...(existingAccount
      ? { clerk_user_id: existingAccount.id, status: "active", referral_only: !existingMember, invitation_status: "not_needed", invitation_error: null, activated_at: new Date(), revoked_at: null }
      : { status: "invited", invited_at: new Date(), revoked_at: null }),
  };
  let partner = existing
    ? (await db.update(referralPartnersTable).set(changes).where(eq(referralPartnersTable.id, existing.id)).returning())[0]
    : (await db.insert(referralPartnersTable).values({ email, ...changes }).returning())[0];
  if (!existingAccount) {
    try {
      const invitation = await sendInvitation(email, programUrl(req));
      [partner] = await db.update(referralPartnersTable).set({
        invitation_id: invitation.id, invitation_status: invitation.status ?? "sent", invitation_error: null,
      }).where(eq(referralPartnersTable.id, partner.id)).returning();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send Clerk invitation";
      req.log?.warn({ err: error, email }, "Referral partner invitation was not sent");
      [partner] = await db.update(referralPartnersTable).set({ invitation_status: "failed", invitation_error: message })
        .where(eq(referralPartnersTable.id, partner.id)).returning();
    }
  }
  res.status(existing ? 200 : 201).json({ partner, program_url: programUrl(req) });
});

router.patch(["/admin/referral-partners/:id", "/admin/referrals/partners/:id"], authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = idParam(req.params.id); const body = record(req.body);
  if (!id || !body) { res.status(400).json({ error: "Invalid partner update." }); return; }
  const status = text(body.status);
  if (status && !partnerStatuses.has(status)) { res.status(400).json({ error: "Invalid partner status." }); return; }
  const changes = {
    ...(text(body.name) !== undefined ? { name: text(body.name) } : {}),
    ...(text(body.internal_notes) !== undefined ? { internal_notes: text(body.internal_notes) } : {}),
    ...(status
      ? {
          status,
          ...(status === "revoked" ? { revoked_at: new Date() } : {}),
          ...(status === "active" ? { activated_at: new Date(), revoked_at: null } : {}),
          ...(status === "invited" ? { invited_at: new Date(), revoked_at: null } : {}),
        }
      : {}),
    ...(typeof body.referral_only === "boolean" ? { referral_only: body.referral_only } : {}),
  };
  if (!Object.keys(changes).length) { res.status(400).json({ error: "Choose at least one partner field to update." }); return; }
  const [partner] = await db.update(referralPartnersTable).set(changes).where(eq(referralPartnersTable.id, id)).returning();
  if (!partner) { res.status(404).json({ error: "Referral partner not found." }); return; }
  res.json(partner);
});

router.post(["/admin/referral-partners/:id/resend-invitation", "/admin/referrals/partners/:id/resend-invitation"], authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = idParam(req.params.id);
  const [partner] = id ? await db.select().from(referralPartnersTable).where(eq(referralPartnersTable.id, id)).limit(1) : [];
  if (!partner) { res.status(404).json({ error: "Referral partner not found." }); return; }
  const existingAccount = await clerkUserForEmail(partner.email);
  if (existingAccount) {
    const existingMember = await hasMemberProfile(existingAccount.id);
    const [updated] = await db.update(referralPartnersTable).set({
      clerk_user_id: existingAccount.id, status: "active", referral_only: !existingMember, invitation_status: "not_needed", invitation_error: null, activated_at: new Date(), revoked_at: null,
    }).where(eq(referralPartnersTable.id, partner.id)).returning();
    res.json({ partner: updated, program_url: programUrl(req) }); return;
  }
  try {
    const invitation = await sendInvitation(partner.email, programUrl(req));
    const [updated] = await db.update(referralPartnersTable).set({
      status: "invited", invited_at: new Date(), revoked_at: null,
      invitation_id: invitation.id, invitation_status: invitation.status ?? "sent", invitation_error: null,
    }).where(eq(referralPartnersTable.id, partner.id)).returning();
    res.json({ partner: updated, program_url: programUrl(req) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to resend Clerk invitation";
    req.log?.warn({ err: error, partnerId: partner.id }, "Referral partner invitation resend failed");
    const [updated] = await db.update(referralPartnersTable).set({ invitation_status: "failed", invitation_error: message })
      .where(eq(referralPartnersTable.id, partner.id)).returning();
    res.status(502).json({ error: "Unable to resend invitation.", partner: updated, program_url: programUrl(req) });
  }
});

router.get(["/admin/referral-submissions", "/admin/referrals/submissions"], authMiddleware, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.select({
    submission: referralSubmissionsTable,
    partner: {
      id: referralPartnersTable.id,
      email: referralPartnersTable.email,
      name: referralPartnersTable.name,
    },
  }).from(referralSubmissionsTable)
    .innerJoin(referralPartnersTable, eq(referralSubmissionsTable.partner_id, referralPartnersTable.id))
    .orderBy(desc(referralSubmissionsTable.created_at));
  res.json(rows.map(({ submission, partner }) => ({ ...submission, partner })));
});

router.patch(["/admin/referral-submissions/:id", "/admin/referrals/submissions/:id"], authMiddleware, requireAdmin, async (req, res): Promise<void> => {
  const id = idParam(req.params.id); const body = record(req.body);
  if (!id || !body) { res.status(400).json({ error: "Invalid referral update." }); return; }
  const status = text(body.status); const payoutStatus = text(body.payout_status);
  if (status && !referralStatuses.has(status)) { res.status(400).json({ error: "Invalid referral status." }); return; }
  if (payoutStatus && !payoutStatuses.has(payoutStatus)) { res.status(400).json({ error: "Invalid payout status." }); return; }
  const changes = {
    ...(status ? { status } : {}),
    ...(payoutStatus ? { payout_status: payoutStatus } : {}),
    ...(text(body.internal_notes) !== undefined ? { internal_notes: text(body.internal_notes) } : {}),
  };
  if (!Object.keys(changes).length) { res.status(400).json({ error: "Choose at least one referral field to update." }); return; }
  const [submission] = await db.update(referralSubmissionsTable).set(changes).where(eq(referralSubmissionsTable.id, id)).returning();
  if (!submission) { res.status(404).json({ error: "Referral submission not found." }); return; }
  res.json(submission);
});

export default router;