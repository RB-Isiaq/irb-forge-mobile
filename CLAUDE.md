# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Expo SDK 56.** This project pins Expo SDK 56 (React Native 0.85, React 19.2). APIs have changed across recent SDKs — consult https://docs.expo.dev/versions/v56.0.0/ for the exact versioned API before writing native/Expo code. Do not rely on older Expo patterns from memory.

## Commands

```bash
npm start          # expo start (dev server + QR)
npm run ios        # open iOS simulator
npm run android    # open Android emulator (use http://10.0.2.2:3000/api as API URL)
npm run web        # run as static web app
npm run lint       # expo lint (ESLint flat config, eslint-config-expo + eslint-config-prettier)
npm run type-check # tsc --noEmit
npm run format     # prettier --write . (format:check for CI verify)
npm test           # jest (jest-expo preset); test:watch, test:ci (--coverage)
```

`npm run reset-project` is the starter-template scaffolding script and is not used for normal development.

**Testing:** `jest-expo` preset (`jest.config.js`) with `@testing-library/react-native` **v13** — note v14 dropped `react-test-renderer`, which the SDK-56 preset still relies on, so stay on v13/`react-test-renderer@19.2.3`. Tests are colocated as `*.test.ts(x)`. CSS imports (`@/global.css`) are stubbed via `moduleNameMapper` → `__mocks__/style-mock.js`. Under jest `useColorScheme()` returns `null`, so theme code must tolerate a null scheme (see `useTheme`).

**Tooling parity with `irb-forge-fe`/`irb-forge`:** Husky runs `lint-staged` + `type-check` on pre-commit and `commitlint` (conventional commits, lower-case subject, no full stop) on commit-msg. CI (`.github/workflows/ci.yml`, on push/PR to `main`/`dev`) runs `quality` (`format:check` → `lint` → `type-check`) and `test` (`test:ci`) in parallel, then a `build` job (`expo export` with stub env vars — real native builds belong on EAS Build, not CI). Keep the tree warning-free: `lint-staged` lints staged TS with `--max-warnings=0`.

Copy `.env.example` to `.env`. `EXPO_PUBLIC_API_URL` points at the IRB Forge backend (defaults to `http://localhost:3000/api`). Until the three `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` vars are set, the "Continue with Google" button is hidden.

## Architecture

This is the **mobile client for IRB Forge**. It is a sibling to the web app at `irb-forge-fe` and intentionally mirrors its conventions (notably the query-key factory). It talks to a shared backend over REST. The domain: **organizations** that contain **members** (with roles), run **programs**, send **invitations**, and post **messages**.

Everything lives under `src/` (mapped to `@/*` via tsconfig paths; `@/assets/*` → `assets/`).

### Three-layer data flow

All server state flows through a strict layering — keep new features in this shape:

1. **`src/lib/api/*.ts`** — thin per-domain modules (`orgApi`, `memberApi`, etc.) that call the typed helpers `apiGet/apiPost/apiPatch/apiDelete` from `client.ts`. These helpers unwrap the API envelope and return `data` directly.
2. **`src/lib/queries/*.ts`** — React Query `useXxx` hooks wrapping the api modules. Mutations invalidate via the shared key factory.
3. **`src/lib/query-keys.ts`** — the single source of truth for cache keys (`queryKeys.orgs.all()`, `queryKeys.programs.detail(slug, id)`, …). Mirrors `irb-forge-fe/shared/lib/query-keys.ts`; every query/mutation imports from here rather than inlining key arrays.

Components never call axios directly — they use the query hooks.

### API envelope & error handling

Every backend response is wrapped in `ApiResponse<T>` (`{ success, statusCode, data, message, timestamp }`) — see `src/lib/api/types.ts`, which is the canonical set of domain types and payloads. The axios client (`src/lib/api/client.ts`) normalizes all errors into `NormalizedApiError` (`{ code, message, details }`).

### Auth & token lifecycle

- **`tokenStore`** (in `client.ts`) holds the access token in memory and persists the **refresh token in `expo-secure-store`**. Because SecureStore is async-only, the refresh token is hydrated once at boot so the axios interceptors can read it synchronously.
- The response interceptor performs **silent refresh on 401**, queuing concurrent requests during a single in-flight refresh.
- **`useAuthStore`** (Zustand, `src/lib/store/auth-store.ts`) owns session state. Its `bootstrap()` runs once from the root `_layout.tsx`: hydrate refresh token → `silentRefresh()` → fetch profile, then sets `isInitialized`. Splash dismissal and the auth gate key off `isInitialized`.
- **`useOrgStore`** (`src/lib/store/org-store.ts`) persists the `activeOrgSlug` to AsyncStorage (Zustand `persist`). Most org-scoped queries are keyed on this slug.
- Google sign-in uses `expo-auth-session` (`src/lib/auth/google.ts`): obtains an `id_token` client-side and posts it to the backend. Platform-specific client IDs are resolved at runtime.

### Routing (expo-router, typed routes enabled)

File-based routing under `src/app/`. Route groups: `(auth)` for unauthenticated screens, `(app)` for the authenticated shell.

- `app/index.tsx` is the **auth gate** — shows a spinner until `isInitialized`, then `Redirect`s to `/(app)` or `/(auth)/sign-in`.
- `app/(app)/_layout.tsx` renders the custom `AppTabs` and defensively redirects unauthenticated deep links.
- `typedRoutes` and `reactCompiler` are enabled in `app.config.ts` — `href`s are type-checked.

### Platform-specific files & theming

The codebase uses the React Native platform-extension convention: `foo.tsx` + `foo.web.tsx` (e.g. `app-tabs`, `animated-icon`, `use-color-scheme`) let web and native diverge. Theming goes through `useTheme()` → `Colors[scheme]` in `src/constants/theme.ts` (light/dark palettes, `Spacing`, `Fonts`). Prefer `ThemedView`/`ThemedText` and the `Colors` palette over hard-coded values.

### Push notifications

`src/lib/notifications/push.ts` captures an Expo push token after login. `app/(app)/_layout.tsx` persists it via `userApi.savePushToken` (`POST /users/me/push-token`) once a user is present. Uses `extra.eas.projectId` from `app.config.ts`.

### Native config (`app.config.ts`)

App config is a **dynamic TypeScript config** (`app.config.ts`, not `app.json`) so it can read `process.env` at prebuild time. The Google Sign-In native plugin's `iosUrlScheme` is derived from `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (reversed client ID), and the plugin is only registered when that env var is set — so an unconfigured environment (e.g. CI) won't fail prebuild. Run `npx expo config --json` to see the fully resolved config.
