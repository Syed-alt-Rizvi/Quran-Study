# Implementation Plan: Fix GitHub Actions `assembleDebug` Build Failure

The GitHub Actions workflow failed during `Build Direct Installation APK (assembleDebug)` because the Gradle build was configured with preview Android 16 (`compileSdkVersion = 36` and `targetSdkVersion = 36`), which lacks complete SDK platform package availability on standard GitHub Actions `ubuntu-latest` runners, leading to unresolved build targets during APK compilation.

## User Review Required

> [!IMPORTANT]
> - **SDK Version**: As confirmed, we are standardizing on **Android 15 (API 35)** across `variables.gradle`, `app/build.gradle`, and `ci.yml`. This is the Google Play Store requirement and is fully pre-cached and stable on GitHub Actions runners.
> - **Build Tools**: We will pin `build-tools;35.0.0` and `platforms;android-35`.

---

## Proposed Changes

### Android Configuration (`android/variables.gradle` & `android/app/build.gradle`)
- Update `compileSdkVersion = 35` and `targetSdkVersion = 35` in `android/variables.gradle`.
- Update fallback values in `android/capacitor-cordova-android-plugins/build.gradle` to `35`.
- Harden `android/app/build.gradle`:
  - Ensure `compileSdk = 35` and `targetSdk = 35`.
  - Ensure `signingConfigs.debug` is always valid even when built on headless CI runners without a pre-existing local keystore file.

### CI/CD Workflow (`.github/workflows/ci.yml`)
- In `Configure Android SDK & Licenses`:
  - Target `platforms;android-35` and `build-tools;35.0.0` directly without failing on experimental `android-36` targets.
  - Automatically accept licenses and ensure platform tools are installed.
- In `Ensure Android Debug Keystore`:
  - Ensure the standard debug keystore is generated and copied to both `~/.android/debug.keystore` and `android/app/debug.keystore`.
- Update GitHub Actions to latest compatible versions (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/setup-java@v5`).

### Widget Resources & Layout Hardening
- Audit `widget_shia_calendar.xml`, `widget_mafatih.xml`, and `widget_quran.xml` to replace deprecated `singleLine="true"` with `maxLines="1"` and `ellipsize="end"`.
- Verify all drawable colors and XML attributes pass standard AAPT2 compilation on API 35.

---

## Verification Plan

### Automated Build Verification
1. Run `compile_applet` to verify TypeScript and client asset compilation.
2. Verify Android Gradle configuration locally via `./gradlew tasks` using OpenJDK 21.
3. Validate all XML layouts and resource IDs in `res/values/strings.xml`, `res/values/colors.xml`, and `res/drawable/`.
4. Run `npm run build` and ensure distribution assets are in place.
