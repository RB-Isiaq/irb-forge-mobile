# IRB Forge Mobile

The mobile client for **IRB Forge** — built with [Expo](https://expo.dev) (SDK 56) and React Native. It is a sibling to the web app (`irb-forge-fe`) and the backend API (`irb-forge`), and shares their conventions. The app lets users work with **organizations** and their **members**, **programs**, **invitations**, and **messages**.

## Tech stack

| Concern            | Choice                                                                              |
| ------------------ | ----------------------------------------------------------------------------------- |
| Framework          | Expo SDK 56, React Native 0.85, React 19                                            |
| Routing            | [expo-router](https://docs.expo.dev/router/introduction) (file-based, typed routes) |
| Server state       | [TanStack Query](https://tanstack.com/query)                                        |
| Client state       | [Zustand](https://zustand-demo.pmnd.rs/)                                            |
| HTTP               | axios (token refresh interceptors)                                                  |
| Forms / validation | react-hook-form + zod                                                               |
| Auth               | JWT (access in memory, refresh in `expo-secure-store`) + native Google Sign-In      |
| Language           | TypeScript (strict)                                                                 |

## Prerequisites

- Node.js 20+
- The IRB Forge backend running locally (or a reachable API URL)
- For device/simulator builds: Xcode (iOS) and/or Android Studio

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in the values (see below)

# 3. Start the dev server
npm start
```

From the dev server you can open the app on an iOS simulator (`i`), Android emulator (`a`), or the web (`w`) — or scan the QR code with a development build.

> **Android emulator:** set `EXPO_PUBLIC_API_URL` to `http://10.0.2.2:3000/api` (the emulator's alias for your host machine) instead of `localhost`.

### Environment variables

All client-side env vars are prefixed `EXPO_PUBLIC_` and live in `.env.local` (gitignored). See [`.env.example`](.env.example) for the full annotated list.

| Variable                               | Purpose                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`                  | Base URL of the IRB Forge backend API                                                                                                       |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`     | Google OAuth Web client — required, also the id_token audience the backend verifies. Until set, the "Continue with Google" button is hidden |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`     | Google OAuth iOS client — required for iOS sign-in; the native `iosUrlScheme` is derived from it in [`app.config.ts`](app.config.ts)        |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android client — must exist in Google Cloud Console or Android sign-in fails                                                   |

## Scripts

| Command                           | Description                        |
| --------------------------------- | ---------------------------------- |
| `npm start`                       | Start the Expo dev server          |
| `npm run ios` / `android` / `web` | Open directly on a target platform |
| `npm run lint`                    | ESLint (`expo lint`)               |
| `npm run lint:fix`                | ESLint with autofix                |
| `npm run type-check`              | `tsc --noEmit`                     |
| `npm run format` / `format:check` | Prettier write / check             |
| `npm test`                        | Run the Jest suite                 |
| `npm run test:watch`              | Jest in watch mode                 |
| `npm run test:ci`                 | Jest with coverage (used by CI)    |

## Project structure

```
src/
  app/            # expo-router routes: (auth) for sign-in/up, (app) for the authed shell
  components/     # shared UI (ThemedText/ThemedView, tabs, …); *.web.tsx for web variants
  constants/      # theme palette, spacing, fonts
  hooks/          # useTheme, useColorScheme
  lib/
    api/          # axios client + per-domain modules (orgApi, memberApi, …)
    queries/      # TanStack Query hooks wrapping the api modules
    query-keys.ts # centralized cache-key factory
    store/        # Zustand stores (auth session, active org)
    auth/         # Google Sign-In
    notifications/# Expo push token registration
```

Data flows through a strict layering: components call **query hooks** (`lib/queries`), which wrap **api modules** (`lib/api`), which use the typed axios client. Cache keys always come from `lib/query-keys.ts`. See [`AGENTS.md`](AGENTS.md) / `CLAUDE.md` for the deeper architecture notes.

## Testing

Tests use the [`jest-expo`](https://docs.expo.dev/develop/unit-testing/) preset with `@testing-library/react-native`, colocated as `*.test.ts(x)`:

```bash
npm test
```

## CI & contributing

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs on every push/PR to `main` and `dev`:

- **quality** — `format:check` → `lint` → `type-check`
- **test** — `test:ci`
- **build** — `expo export` (a smoke build of the JS bundle; native release builds run on EAS Build)

Locally, a Husky `pre-commit` hook runs lint-staged + type-check, and `commit-msg` enforces [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `ci:`, lower-case subject, no trailing period). Keep the tree warning-free — staged code is linted with `--max-warnings=0`.
