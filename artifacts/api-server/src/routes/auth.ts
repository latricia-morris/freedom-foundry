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

// /api/auth/me — returns the session's safe profile and app role.
router.get("/auth/me", authMiddleware, (req, res): void => {
  res.json({
    user: req.user
      ? {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
        }
      : { id: req.userId },
  });
});

export default router;
