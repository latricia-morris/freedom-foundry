---
name: Clerk provider settings
description: Replit-managed Clerk social provider configuration and environment separation
---

Replit-managed Clerk provider toggles are controlled in the Replit Auth pane, not application code or a raw external Clerk dashboard. Email/password, Google, and Apple must be enabled there; Clerk's SignIn and SignUp components automatically render enabled providers.

**Why:** Provider availability is tenant configuration, and Apple OAuth additionally requires Apple-side credentials when Clerk requests them. The application cannot safely or reliably enable these providers in source code.

**How to apply:** Configure providers separately for Development and Production in the Auth pane. Keep the app's Clerk routes as `/sign-in/*?` and `/sign-up/*?` so OAuth callback subpaths render correctly.