# Freedom Foundry universal client

This Expo Router package is the parallel iOS, Android, and web client for Freedom Foundry. It shares the API contract and Clerk tenant with the existing Vite browser application; it does **not** replace the live browser artifact or its `/share/:token` URLs.

## Local development

```sh
pnpm --filter @workspace/freedom-foundry-expo run dev
```

Use the Expo preview to open the same source tree on iOS, Android, or web. The development workflow injects `EXPO_PUBLIC_DOMAIN` and maps the existing `CLERK_PUBLISHABLE_KEY` into Expo's public build variable. For an external build, set these non-secret public values in the deployment environment:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk's publishable key
- `EXPO_PUBLIC_API_ORIGIN` — absolute API origin for native clients and native resource links; omit on web to retain relative same-origin requests

The Clerk token cache uses Expo Secure Store on iOS and Android; web continues with Clerk's browser storage/cookies. Configure Email, Google, and Apple in the shared Clerk tenant for both Development and Production.

## Verification and production web export

```sh
pnpm --filter @workspace/freedom-foundry-expo run typecheck
pnpm --filter @workspace/freedom-foundry-expo run export:web
BASE_PATH=/freedom-foundry-expo pnpm --filter @workspace/freedom-foundry-expo run serve
```

The artifact's production service publishes the static Expo web output at `/freedom-foundry-expo/`, allowing it to be deployed in parallel with the current browser app. Expo's web base URL is configured for that path, and the production server provides an SPA fallback for member, vault, legal, and public-share deep links. Do not redirect `/` or change existing public sharing URLs until browser route, visual, authentication, and sharing parity is explicitly approved.

## Native release configuration

The static `app.json` includes the permanent identifiers:

- iOS bundle identifier: `com.thebrandrevivalist.freedomfoundry`
- Android package: `com.thebrandrevivalist.freedomfoundry`
- EAS profiles: `preview` (internal testing) and `production` (TestFlight / Android App Bundle)

Use Replit's Expo Launch publishing flow for iOS release configuration and TestFlight submission. It handles credentials outside source control. Android production configuration is included for the same universal client; no signing credentials are committed here.