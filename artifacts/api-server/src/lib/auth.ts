import { Request, Response, NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";

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

/** Middleware: attach Clerk userId if present, but do not reject unauthenticated requests. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (userId) {
    req.userId = userId;
  }
  next();
}
