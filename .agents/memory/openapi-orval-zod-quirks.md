---
name: OpenAPI/Orval zod codegen quirks
description: Spec patterns that break the workspace's orval zod codegen and how to write schemas that pass
---

# OpenAPI → Orval zod codegen quirks

The workspace API codegen (orval, zod client) fails typecheck when the OpenAPI spec uses certain patterns.

**Rule:** In lib/api-spec/openapi.yaml:
- Use `type: number`, never `type: integer` — `integer` generates `zod.int()`, which does not exist in the pinned zod version.
- Never use JSON-Schema-style union types like `type: ["string", "null"]` and never use a bare `type: object` without properties — the bare object form generates `zod.looseObject()`, also nonexistent. For free-form JSON (jsonb columns), `$ref` a shared schema like `FreeObject` (`type: object` + `additionalProperties: true`).
- Avoid multipart/file-upload endpoints in the spec — generated code references `File`/`Blob`, which fail Node-side typecheck. Implement uploads outside the generated contract.

**Why:** Orval emits zod v4 API calls for these patterns while the workspace pins zod v3-compatible typings; codegen then fails `typecheck:libs` with 150+ errors.

**How to apply:** When adding endpoints to openapi.yaml, follow the existing schema style (plain `type: string|number|boolean`, optional fields simply not in `required`, FreeObject/LinkObject refs for loose JSON) and run `pnpm --filter @workspace/api-spec run codegen` to confirm.
