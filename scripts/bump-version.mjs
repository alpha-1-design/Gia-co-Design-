#!/usr/bin/env node
/**
 * Version bump tool for Gia-co-Design.
 *
 * Usage:
 *   node scripts/bump-version.mjs patch   # 1.0.0 -> 1.0.1
 *   node scripts/bump-version.mjs minor   # 1.0.1 -> 1.1.0
 *   node scripts/bump-version.mjs major   # 1.1.0 -> 2.0.0
 *   node scripts/bump-version.mjs 1.2.3   # explicit version
 *
 * Updates package.json and android/app/build.gradle (versionName + versionCode),
 * then prints the git commands to tag & trigger the APK release build.
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv[2] || 'patch';
const explicit = /^\d+\.\d+\.\d+$/.test(arg) ? arg : null;

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
const current = pkg.version;
const [major, minor, patch] = current.split('.').map((n) => parseInt(n, 10) || 0);

let next;
if (explicit) {
  next = explicit;
} else if (arg === 'major') {
  next = `${major + 1}.0.0`;
} else if (arg === 'minor') {
  next = `${major}.${minor + 1}.0`;
} else {
  next = `${major}.${minor}.${patch + 1}`;
}

pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const gradlePath = path.join(root, 'android/app/build.gradle');
let gradle = readFileSync(gradlePath, 'utf-8');
const vcMatch = gradle.match(/versionCode (\d+)/);
const versionCode = vcMatch ? parseInt(vcMatch[1], 10) + 1 : 1;
if (!/versionCode \d+/.test(gradle)) {
  console.error('ERROR: could not find versionCode in android/app/build.gradle');
  process.exit(1);
}
gradle = gradle.replace(/versionCode \d+/, `versionCode ${versionCode}`);
gradle = gradle.replace(/versionName "[\d.]+"/, `versionName "${next}"`);
writeFileSync(gradlePath, gradle);

console.log(`\n  package.json     ${current} -> ${next}`);
console.log(`  android versionCode ${versionCode}  versionName "${next}"`);
console.log(`\n  To cut a release (builds APK + GitHub Release):\n`);
console.log(`    git add -A && git commit -m "chore: release v${next}"`);
console.log(`    git tag v${next}`);
console.log(`    git push origin main --tags\n`);
