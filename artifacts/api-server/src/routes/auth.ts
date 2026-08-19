import { Router, type IRouter } from "express";
import { authMiddleware } from "../lib/auth";

const router: IRouter = Router();

// With Clerk, registration/login/logout are handled client-side by the Clerk SDK.
// These stubs keep any legacy callers from 404-ing during the transition.

router.post("/auth/register", (_req, res): void => {
  res.status(410).json({ error: "Use Clerk authentication" });
});

router.post("/auth/login", (_req, res): void => {
  res.status(410).json({ error: "Use Clerk authentication" });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

router.post("/auth/forgot-password", (_req, res): void => {
  res.status(410).json({ error: "Use Clerk authentication" });
});

router.post("/auth/reset-password", (_req, res): void => {
  res.status(410).json({ error: "Use Clerk authentication" });
});

// /api/auth/me — returns the Clerk userId for the active session
router.get("/auth/me", authMiddleware, (req, res): void => {
  res.json({ userId: (req as any).userId });
});

export default router;
