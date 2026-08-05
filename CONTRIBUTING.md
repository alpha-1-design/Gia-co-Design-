# Contributing to Gia-co-Design

Thank you for your interest in contributing. This guide covers the development workflow, coding conventions, and release process.

## Development Setup

### Prerequisites

- **Node.js** v22 or higher (LTS recommended)
- **npm** v10+
- **Git**

### Quick Start

```bash
git clone https://github.com/alpha-1-design/Gia-co-Design-.git
cd Gia-co-Design
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server on port 3000 |
| `npm run build` | TypeScript check + production bundle |
| `npm run lint` | Run `tsc --noEmit` type-checking |
| `npm run preview` | Preview the production build locally |
| `npm run clean` | Remove `dist/` and `server.js` |

## Android Build

### Prerequisites (for APK builds)

- Android SDK + Android Studio (or `setup-android` GitHub Action)
- Java 21 (Temurin)
- Gradle (wrapper included in `android/`)

### Local Android Build

```bash
npm run android:sync   # build web assets + sync Capacitor
cd android && ./gradlew assembleDebug
```

The debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

### Adding Capacitor Plugins

```bash
npm install @capacitor/<plugin>
npx cap sync android
```

## Coding Conventions

- **No comments** in source files (unless explicitly requested).
- **TypeScript strict**: no `any`, no implicit `any`, no unused variables.
- **Path alias** `@/` → `src/` — use it for all imports within the project.
- **Tailwind CSS v4** — no `tailwind.config.js`; styling via `@import "tailwindcss"`.
- **`motion`** package — import from `motion/react`, NOT `framer-motion`.
- **State**: Zustand 5 with `persist` middleware → IndexedDB (for the main gia-app).
- **Component style**: functional React, explicit props interface, `theme?: 'light' | 'dark'` on every component.
- **Colors**: terracotta accent `#d97757`, light surfaces `#faf8f5`/`#f4f0e8`, dark surfaces `#181715`/`#22201d`.

## Release Process

### Version Bumps

```bash
npm run bump:patch   # 1.0.0 → 1.0.1
npm run bump:minor   # 1.0.0 → 1.1.0
npm run bump:major   # 1.0.0 → 2.0.0
```

This updates `package.json` and `android/app/build.gradle` (versionName + versionCode).

### Creating a Release

```bash
git add -A
git commit -m "chore: release v1.0.1"
git tag v1.0.1
git push origin main --tags
```

The `build-apk.yml` workflow automatically:
1. Builds the web assets.
2. Syncs Capacitor Android.
3. Builds debug + release APKs.
4. Uploads artifacts.
5. Creates a draft GitHub Release with the APK attached.

### In-App Auto-Update

The app checks GitHub Releases on launch when running as a native Android app. If a newer release is found with an APK attached, an "Update Available" banner appears. Tapping it opens the APK in the system browser for download and install.

## Project Structure

```
src/
  components/     # React UI components (PreviewCanvas, PromptSidebar, etc.)
  lib/            # Core logic (ai.ts, providers.ts, share.ts, updater.ts, storage.ts)
  services/       # Tool implementations
  types.ts        # Shared TypeScript interfaces
  env.d.ts        # Global type declarations (__APP_VERSION__, __APP_REPO__)
  App.tsx         # Root component
  main.tsx        # Entry point
```

## Pull Request Guidelines

1. Ensure `npm run lint` passes.
2. Ensure `npm run build` passes.
3. Provide a clear description of the change.
4. Link any related issues.

## Questions?

Open a GitHub Discussion or reach out in the `#gia-co-design` channel.
