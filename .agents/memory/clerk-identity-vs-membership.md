---
name: Clerk identity is not membership
description: Keep authenticated identity separate from Freedom Foundry member entitlement.
---

Do not treat the existence of a Clerk user as proof that the person is a full Freedom Foundry member. Referral-only invitees can already have a Clerk account and must still remain limited to the referral portal unless authoritative member data or an administrator grants broader access.

**Why:** Authentication answers who the person is; it does not prove which paid or invited product areas they are entitled to use. Conflating the two can expose private member APIs to referral-only accounts.

**How to apply:** When adding access grants or invitation flows, resolve member entitlement from project-owned membership/profile records or an explicit administrator decision. Keep referral status and member scope independent.