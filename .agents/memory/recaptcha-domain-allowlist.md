---
name: reCAPTCHA key configuration
description: Google reCAPTCHA uses a score-based key and depends on domain allowlisting.
---

The current public Google reCAPTCHA key is score-based v3, so browser code must use execute/ready rather than rendering a checkbox. Google must allowlist every host where the flow is tested, including the published Freedom Foundry domain; the Replit preview may appear as `127.0.0.1`.

**Why:** A checkbox render reports “Invalid key type” for a v3 key, while a correctly configured v3 widget can still show a site-owner error when the preview host is not allowlisted.

**How to apply:** Keep the public site key in browser-safe `VITE_` configuration, keep `GOOGLE_reCAPTCHA` server-only, and treat a preview-host failure as Google key configuration rather than silently bypassing verification.