---
name: Expo artifact subpaths
description: How to keep Expo static web exports working when hosted below an artifact path prefix.
---

Set Expo's `experiments.baseUrl` to the artifact deployment prefix before exporting the web bundle.

**Why:** Expo otherwise emits root-absolute URLs for bundles and assets; when an artifact is mounted below a prefix, those browser requests bypass the artifact and the published page cannot load its JavaScript.

**How to apply:** Keep the export base URL and the production static server's base path aligned, then verify the exported HTML and a deep link through the prefixed production server.