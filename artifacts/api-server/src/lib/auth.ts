import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

/** Middleware: require a valid Clerk session. Sets req.userId (Clerk user id string). */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).userId = userId;
  next();
}

/** Middleware: attach Clerk userId if present, but do not reject unauthenticated requests. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (userId) {
    (req as any).userId = userId;
  }
  next();
}
