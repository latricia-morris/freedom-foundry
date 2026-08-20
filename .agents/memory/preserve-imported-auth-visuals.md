---
name: Preserve imported auth visuals
description: Freedom Foundry's auth screens should retain the imported product design while authentication changes happen underneath.
---

Authentication migrations must preserve Freedom Foundry's original visual system: ember backdrop, liquid-glass card, branded header treatment, typography, copy, and layout character. Replace assets only when the user supplies an approved brand asset.

**Why:** The user explicitly expects the imported app's visual identity to survive platform and authentication work; a technically correct managed-auth screen that looks like a redesign is not acceptable.

**How to apply:** Treat changes to the auth engine as implementation details. Match the preserved source and use user-supplied branding for visible marks, including browser icons, before considering an auth UI change complete.