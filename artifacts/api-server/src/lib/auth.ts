import { Request, Response, NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { db, referralPartnersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        role: string;
        referralPartnerId?: number;
        referralPartnerStatus?: string;
        referralOnly?: boolean;
      };
    }
  }
}

const leadAdminEmail = process.env.LEAD_ADMIN_EMAIL?.trim().toLowerCase();
export const SUPER_ADMIN_ROLE = "super_admin";

export function resolveAppRole(email: string | null, publicMetadata: unknown): string {
  const metadataRole = publicMetadata
    && typeof publicMetadata === "object"
    && typeof (publicMetadata as Record<string, unknown>).role === "string"
    ? (publicMetadata as Record<string, unknown>).role as string
    : "user";

  return leadAdminEmail && email === leadAdminEmail ? "admin" : metadataRole;
}

type ClerkUserRoleSource = {
  primaryEmailAddress?: {
    emailAddress?: string | null;
    verification?: { status?: string | null } | null;
  } | null;
  publicMetadata?: unknown;
};

export function isSuperAdminRole(role: unknown): boolean {
  return role === SUPER_ADMIN_ROLE;
}

/**
 * Resolve the role of a user returned by Clerk. This deliberately uses only
 * Clerk-owned fields; corporate account member roles are database data and
 * must never grant agency administrator access.
 */
export function resolveClerkUserRole(user: ClerkUserRoleSource): string {
  const primaryEmail = user.primaryEmailAddress;
  const email = primaryEmail?.verification?.status === "verified"
    && typeof primaryEmail.emailAddress === "string"
    ? primaryEmail.emailAddress.trim().toLowerCase()
    : null;
  // A super-admin assignment is an explicit Clerk metadata assignment and
  // must not be shadowed by the legacy lead-admin email compatibility rule.
  if (
    user.publicMetadata
    && typeof user.publicMetadata === "object"
    && isSuperAdminRole((user.publicMetadata as Record<string, unknown>).role)
  ) {
    return SUPER_ADMIN_ROLE;
  }
  return resolveAppRole(email, user.publicMetadata);
}

/**
 * Protect mutating generic admin user routes from agency super-admin targets.
 * The target role must come from a fresh Clerk user response, not a request
 * body, query parameter, or corporate account membership record.
 */
export function requireManageableAdminTarget(
  req: Request,
  res: Response,
  target: ClerkUserRoleSource,
): boolean {
  if (isSuperAdminRole(resolveClerkUserRole(target)) && !isSuperAdminRole(req.user?.role)) {
    res.status(403).json({
      error: "Only a super administrator can change a super administrator account.",
    });
    return false;
  }
  return true;
}

/**
 * Middleware: require a valid Clerk session and expose the signed-in user's
 * minimal profile and role to the legacy API routes.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const primaryEmail = clerkUser.primaryEmailAddress;
    const email = primaryEmail?.verification?.status === "verified"
      ? primaryEmail.emailAddress.trim().toLowerCase()
      : null;
    req.userId = userId;
    req.user = {
      id: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      // The one lead-admin identity is configured outside source control.
      // Other roles can be assigned through Clerk public metadata.
      role: resolveClerkUserRole(clerkUser),
    };

    // Referral-only access is tied to the verified Clerk email, not client input.
    // Existing members are explicitly stored with referral_only=false when granted
    // partner access, so their normal portal access remains unchanged.
    if (email) {
      const [partner] = await db.select({
        id: referralPartnersTable.id,
        status: referralPartnersTable.status,
        referralOnly: referralPartnersTable.referral_only,
      }).from(referralPartnersTable)
        .where(eq(referralPartnersTable.email, email))
        .limit(1);
      if (partner) {
        req.user.referralPartnerId = partner.id;
        req.user.referralPartnerStatus = partner.status;
        req.user.referralOnly = partner.referralOnly;
      }
    }

    const path = new URL(req.originalUrl, "http://localhost").pathname.replace(/^\/api/, "");
    const referralOnlyAllowed = path === "/auth/me" || path.startsWith("/referral-partner") ||
      path.startsWith("/referrals") || path.startsWith("/persona-quiz");
    if (req.user.role !== "admin" && !isSuperAdminRole(req.user.role) &&
      req.user.referralOnly && !referralOnlyAllowed) {
      res.status(403).json({ error: "This account only has referral partner access." });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}

/** Middleware: requires authMiddleware to run first and permits administrators only. */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== "admin" && !isSuperAdminRole(req.user?.role)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

/**
 * Return the member identity established by authMiddleware. Route handlers use
 * this rather than browser-provided ownership fields or query parameters.
 */
export function requireMemberId(req: Request, res: Response): string | null {
  if (!req.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return req.userId;
}

/** Assign immutable ownership for a new member-owned database record. */
export function ownedCreatePayload<T extends object>(req: Request): (T & { user_id: string }) | null {
  if (!req.userId) return null;
  const {
    id: _id,
    user_id: _requestedUserId,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...data
  } = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  return { ...data, user_id: req.userId } as T & { user_id: string };
}

/** Remove immutable database fields before updating a member-owned record. */
export function ownedUpdatePayload<T extends object>(req: Request): Partial<T> {
  const {
    id: _id,
    user_id: _requestedUserId,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...data
  } = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  return data as Partial<T>;
}

/** Do not reveal whether an inaccessible member-owned record exists. */
export function ownedNotFound(res: Response): void {
  res.status(404).json({ error: "Not found" });
}

/** Middleware: attach Clerk userId if present, but do not reject unauthenticated requests. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (userId) {
    req.userId = userId;
  }
  next();
}
