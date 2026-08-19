import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const SESSION_SECRET = process.env.SESSION_SECRET || "change-me-in-production";

// Simple HMAC-SHA256 token: "userId.timestamp.signature"
export function createToken(userId: number): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [userId, ts, sig] = parts;
    const payload = `${userId}.${ts}`;
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    return parseInt(userId, 10);
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(password).digest("hex");
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = verifyToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  (req as any).user = user;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const userId = verifyToken(token);
    if (userId) {
      (req as any).userId = userId;
    }
  }
  next();
}
