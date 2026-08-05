# Release Process

This guide covers how to cut a release for Gia-co-Design.

## Pre-Release Checklist

- [ ] All tests pass (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No open PRs blocking the release
- [ ] CHANGELOG / release notes drafted

## Versioning

We follow **Semantic Versioning** (`MAJOR.MINOR.PATCH`):

- **PATCH** (`1.0.0 → 1.0.1`): Bug fixes, small improvements.
- **MINOR** (`1.0.0 → 1.1.0`): New features, backwards-compatible.
- **MAJOR** (`1.0.0 → 2.0.0`): Breaking changes.

## Steps

### 1. Bump the Version

```bash
npm run bump:patch   # or bump:minor / bump:major
```

This updates:
- `package.json` → `version`
- `android/app/build.gradle` → `versionName` + increments `versionCode`

### 2. Commit and Tag

```bash
git add -A
git commit -m "chore: release v1.0.1"
git tag v1.0.1
git push origin main --tags
```

### 3. CI Builds the APK

The `build-apk.yml` workflow triggers on tag push and:
1. Builds the web assets.
2. Syncs Capacitor Android.
3. Builds debug + release APKs.
4. Uploads artifacts.
5. Creates a **draft** GitHub Release with the debug APK attached.

### 4. Finalize the Release

1. Go to the draft Release on GitHub.
2. Edit the release notes (auto-generated + manual notes).
3. Attach the release APK (`app-release.apk`) if needed.
4. Publish the release.

### 5. In-App Update Propagation

Once published, the next time the Android app launches it will:
1. Query `https://api.github.com/repos/alpha-1-design/Gia-co-Design-/releases/latest`.
2. Compare the release version against the bundled `__APP_VERSION__`.
3. If newer, show an **"Update Available"** banner with a **Download** button.
4. Tapping Download opens the APK in the system browser for install.

## Rollback

If a release is problematic:
1. Delete the tag: `git tag -d v1.0.1 && git push origin :refs/tags/v1.0.1`
2. Revert the version bump commit.
3. Bump to a new patch version.
4. Re-tag and push.

## Hotfixes

For urgent fixes, use `bump:patch` and tag immediately. The CI workflow handles the rest.
