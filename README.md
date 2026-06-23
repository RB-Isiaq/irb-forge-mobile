# IRB Forge Mobile

The mobile client for **IRB Forge** — built with [Expo](https://expo.dev) (SDK 56) and React Native. It is a sibling to the web app (`irb-forge-fe`) and the backend API (`irb-forge`), and shares their conventions. The app lets users work with **organizations** and their **members**, **programs**, **invitations**, and **messages**.

## Live demo

- **Web:** [irb-forge-mobile.expo.app](https://irb-forge-mobile.expo.app) — the app running in the browser against the production API.
- **Android (APK):** produced by EAS Build — see [Building & deploying](#building--deploying). EAS artifact links expire (~30 days on the free tier); for a permanent download, attach the `.apk` to a [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github).

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

> **This app needs a development build — not Expo Go.** It uses custom native modules (native Google Sign-In) on Expo SDK 56, which the prebuilt Expo Go client can't load (you'll see _"incompatible with this version of Expo Go"_). Build a dev client once, then `npm start` connects to it with fast refresh:
>
> ```bash
> npx expo run:android   # builds + installs a dev client on an emulator/device
> npx expo run:ios       # iOS simulator/device (needs Xcode + CocoaPods)
> ```
>
> After that, `npm start` → press `a`/`i` to open the installed dev build. The web target (`w`) runs in the browser and needs no dev build.

> **Android emulator:** set `EXPO_PUBLIC_API_URL` to `http://10.0.2.2:3000/api` (the emulator's alias for your host machine) instead of `localhost`.

### Environment variables

All client-side env vars are prefixed `EXPO_PUBLIC_` and live in `.env.local` (gitignored). See [`.env.example`](.env.example) for the full annotated list.

| Variable                               | Purpose                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`                  | Base URL of the IRB Forge backend API                                                                                                       |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`     | Google OAuth Web client — required, also the id_token audience the backend verifies. Until set, the "Continue with Google" button is hidden |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`     | Google OAuth iOS client — required for iOS sign-in; the native `iosUrlScheme` is derived from it in [`app.config.ts`](app.config.ts)        |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android client — must exist in Google Cloud Console or Android sign-in fails                                                   |

> `EXPO_PUBLIC_*` vars are **inlined at build time**, not read at runtime — so changing one requires re-bundling (and `--clear` to bust Metro's transform cache). For production/hosted builds, put overrides (e.g. the prod API URL) in `.env.production.local`, which beats `.env.local`. See [Building & deploying](#building--deploying).

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

## Building & deploying

Native builds run on **EAS Build** (profiles in [`eas.json`](eas.json)); the web target deploys to **EAS Hosting**.

```bash
# Android APK for testing / sideloading (free, shareable install link)
eas build --platform android --profile preview

# Store builds
eas build --platform android --profile production   # AAB → Play Store
eas build --platform ios --profile production       # needs an Apple Developer account

# Web → static export, then deploy
npx expo export --platform web
eas deploy --prod
```

**Build-time env vars:** EAS never sees `.env.local` (it's git-ignored), so set vars needed by cloud builds as **EAS environment variables** (`eas env:create … --environment preview|production`). The iOS Google-Sign-In pods build as static frameworks via `expo-build-properties` in `app.config.ts` — don't remove it or `pod install` breaks.

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
