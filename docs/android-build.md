# Building the Android APK

Gia-co-Design uses **Capacitor** to wrap the web app as a native Android application. This guide covers building the APK locally and via CI.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | v22+ | `nvm use 22` |
| npm | v10+ | comes with Node |
| Java JDK | 21 (Temurin) | `sdk install java 21-tem` or Android Studio |
| Android SDK | API 34 (Android 14) target | Android Studio → SDK Manager |
| Gradle | bundled via wrapper | included in `android/` |

## Local Build

### 1. Sync Capacitor

```bash
npm run android:sync
```

This builds the web assets and copies them into `android/app/src/main/assets/public`.

### 2. Build the APK

```bash
cd android && ./gradlew assembleDebug
```

The debug APK is at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Build a Signed Release APK

Generate a keystore (one-time):

```bash
keytool -genkey -v -keystore android/app/release.keystore \
  -alias gia -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass android -keypass android \
  -dname "CN=GIA App, OU=GIA, O=alpha1studio, L=Kumasi, ST=Ashanti, C=GH"
```

Then build:

```bash
cd android && ./gradlew assembleRelease
```

The release APK is at:

```
android/app/build/outputs/apk/release/app-release.apk
```

## CI/CD (GitHub Actions)

Pushes to `main` and tags matching `v*.*.*.*` trigger the `build-apk.yml` workflow automatically:

1. Checks out the repo.
2. Installs Node.js 22 + npm dependencies.
3. Runs `npm run lint` and `npm run build`.
4. Sets up Java 21 and the Android SDK.
5. Runs `npx cap sync android`.
6. Regenerates the Gradle wrapper (defensive).
7. Builds debug APK and uploads it as an artifact.
8. On tag push, creates a draft GitHub Release with the APK attached.

## Auto-Update in the App

When installed on Android, the app queries the GitHub Releases API on launch. If a newer release exists with an APK asset, an **"Update Available"** banner appears. Tapping it opens the APK in the system browser for download and installation.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Could not find or load main class` | Run `npm run android:sync` first |
| `Gradle wrapper not found` | Ensure `android/gradlew` is executable: `chmod +x android/gradlew` |
| `SDK location not found` | Set `ANDROID_HOME` env var to your Android SDK path |
| `capacitor.config.json` missing in assets | Run `npx cap sync android` |
| Build fails on CI | Ensure `android/gradle/wrapper/gradle-wrapper.jar` is committed |
