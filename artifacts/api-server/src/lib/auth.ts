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

export function resolveAppRole(email: string | null, publicMetadata: unknown): string {
  const metadataRole = publicMetadata
    && typeof publicMetadata === "object"
    && typeof (publicMetadata as Record<string, unknown>).role === "string"
    ? (publicMetadata as Record<string, unknown>).role as string
    : "user";

  return leadAdminEmail && email === leadAdminEmail ? "admin" : metadataRole;
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
    const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;
    req.userId = userId;
    req.user = {
      id: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      // The one lead-admin identity is configured outside source control.
      // Other roles can be assigned through Clerk public metadata.
      role: resolveAppRole(email, clerkUser.publicMetadata),
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
    const referralOnlyAllowed = path === "/auth/me" || path.startsWith("/referral-partner") || path.startsWith("/referrals");
    if (req.user.role !== "admin" && req.user.referralOnly && !referralOnlyAllowed) {
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
  if (req.user?.role !== "admin") {
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
