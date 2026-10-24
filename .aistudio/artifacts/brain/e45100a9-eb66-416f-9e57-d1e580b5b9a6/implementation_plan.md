# Production-Readiness Audit & Sidebar Dedication Implementation Plan

A comprehensive, production-readiness verification and implementation strategy for **Shia Markaz**, auditing all five application modules (Qur'an, Mafatih al-Jinan, Shia Hijri Calendar, Shia Adhan Player, and Qur'an/Hadith & Science), resolving partial scraping discrepancies, and implementing the family dedication tab in the About sidebar.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and confirmed with the user in Phase 1:
>
> - **Dedication Tab Initial State**: The *Iltemas e Surah Fatiha* dedication section in the About sidebar will be **expanded by default** so that the memorial dedication to *Madar e Aziz Sakina Banoo D/O Akhoon Mohd Kazim* and *Dada Jaan Syed Abbas Rizvi S/O Syed Hassan Rizvi* is immediately visible to believers.
> - **Dedication Interactivity**: Rendered purely as an **authentic, respectful text dedication** (no intrusive action buttons or extraneous controls).
> - **Audit & Remediation Scope**: Deliver the **exhaustive audit report** across all 10 evaluation dimensions and **directly apply all Critical and High fixes** across the codebase in this pass without leaving pending technical debt.

---

## 1. Overview & Core Concept

**Shia Markaz** is an all-in-one Islamic application for the Shia Ithna Ashari community, providing:
1. **The Holy Qur'an**: Full Arabic text, translations (English, Urdu), Tafseer (Namoona & Al-Kauthar), juz/page/surah indices, audio recitations, and verse search.
2. **Mafatih al-Jinan**: Comprehensive library of 1,307 duas, ziyarat, and daily/monthly supplications with Arabic fonts, Urdu translations, and background audio streaming with lockscreen/media session controls.
3. **Shia Hijri Calendar**: Astronomical and sighting-adjusted Hijri converter, Shia Islamic occasions (Wiladat/Shahadat of the 14 Infallibles), and calendar notifications.
4. **Shia Adhan Player**: Accurate Shia prayer times (Fajr 16°, Maghrib sunset + sunset angle/nightfall, Midnight calculation), adhan reciter audio, audio focus management, and persistent city overrides.
5. **Qur'an, Hadith & Science**: Exegetical and scientific insights from the Ahlulbayt (a.s.), with search, categorical filtering, and offline-first article storage.

---

## 2. User Experience & Visual Design

### Sidebar Dedication Component ("Iltemas e Surah Fatiha")
- **Placement**: Directly inside the **About & Support** category of `Sidebar.tsx`, positioned above the voluntary support card.
- **Visual Styling**:
  - Warm, respectful border (`border-emerald-200/80 dark:border-emerald-900/50`) with soft emerald gradient surface (`bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900`).
  - Header with floral/book Islamic icon (`BookOpen` or `Heart`), title: `Iltemas e Surah Fatiha`, and a smooth Chevron toggle (`ChevronDown` / `ChevronUp`).
  - Expanded content displaying the exact requested dedication text:
    ```
    Iltemas e Surah Fatiha:
    • Madar e Aziz Sakina Banoo D/O Akhoon Mohd Kazim
    • Dada Jaan Syed Abbas Rizvi S/O Syed Hassan Rizvi

    Iltemas e Dua- Syed Murtaza Rizvi(Developer)
    ```
  - Touch targets strictly compliant with mobile ergonomics ($\ge 44\text{px}$).

---

## 3. Technical Architecture & System Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (SPA)                              │
│                                                                        │
│   ┌────────────────────┐   ┌───────────────────┐   ┌───────────────┐   │
│   │    Qur'an View     │   │   Mafatih View    │   │ Calendar View │   │
│   │ (Surah, Juz, Page) │   │ (Duas, Categories)│   │ (Hijri Events)│   │
│   └─────────┬──────────┘   └─────────┬─────────┘   └───────┬───────┘   │
│             │                        │                     │           │
│   ┌─────────┴──────────┐   ┌─────────┴─────────┐   ┌───────┴───────┐   │
│   │    Adhan Player    │   │ ImamScienceFeed   │   │  Sidebar Tab  │   │
│   │ (Shia Prayer Times)│   │ (Articles/Science)│   │ (Fatiha Ded.) │   │
│   └─────────┬──────────┘   └─────────┬─────────┘   └───────┬───────┘   │
│             │                        │                     │           │
│             └────────────────┬───────┴─────────────────────┘           │
│                              │                                         │
│                     ┌────────┴────────┐                                │
│                     │  Zustand Store  │                                │
│                     │ (Settings/Audio)│                                │
│                     └────────┬────────┘                                │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │ HTTP / WebSocket
┌──────────────────────────────┼─────────────────────────────────────────┐
│                              ▼                                         │
│                    EXPRESS BACKEND SERVER                              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                       API Router Layer                         │   │
│   │  /api/tafseer/namoona  •  /api/tafseer/kauthar  •  /api/mafatih│   │
│   │  /api/imam-science     •  /api/discussions      •  /api/health │   │
│   └─────────┬──────────────────────┬──────────────────────┬────────┘   │
│             │                      │                      │            │
│   ┌─────────┴────────┐   ┌─────────┴────────┐   ┌─────────┴────────┐   │
│   │  Namoona Service │   │  Balagh Scraper  │   │ Mafatih Service  │   │
│   │  (Ayah Exegesis) │   │ (Kauthar Parser) │   │ (1,307 Items)    │   │
│   └─────────┬────────┘   └─────────┬────────┘   └─────────┬────────┘   │
│             │                      │                      │            │
│             └────────────────┬─────┴──────────────────────┘            │
│                              │                                         │
│                     ┌────────┴────────┐                                │
│                     │  Local Storage  │                                │
│                     │  & SQLite / DBM │                                │
│                     └─────────────────┘                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Audit Plan & Investigation Matrix

### Audit Module 1: Qur'an Text & Navigation
- Verify surah boundaries (1 to 114), 6,236 ayah count alignment, Bismillah exclusion/inclusion rules (Surah At-Tawbah vs other 113 surahs).
- Validate Juz (30 parts), Hizb (60), and Page (Madani 604 pages) indexing.
- Test translation rendering (English Sahih/Pickthall, Urdu Ahmed Ali/Jalandhri/Najafi) and search query normalizers (`arabicSearch.ts`).

### Audit Module 2: Mafatih al-Jinan
- Verify 1,307 items in index dataset (`mafatih_index.json`), chapter taxonomy, and alias map (`ALIASES` in `mafatihService.ts`).
- Validate audio URL resolution: ensure insecure HTTP URLs (`http://www.ya-mahdi.net`, `http://sibtayn.com`) are securely upgraded to HTTPS to eliminate mixed-content errors in production.
- Review audio range headers (`206 Partial Content`) in `audio-proxy` for smooth scrubbing and zero memory leaks.

### Audit Module 3: Calendar & Islamic Occasions
- Verify Shia Hijri astronomical calculation (`hijriCalendar.ts`), Umm al-Qura vs Kuwaiti algorithms, and user-configurable moon-sighting offset (`-2` to `+2` days).
- Validate all major Shia occasions (14 Masoomeen births/martyrdoms, Eid al-Ghadir, Eid al-Fitr, Ashura, Arbaeen) in `shiaCalendarEvents.json`.
- Test timezone shifts around midnight to prevent off-by-one calendar rendering bugs.

### Audit Module 4: Shia Adhan & Prayer Times
- Verify Shia Ithna Ashari juristic calculation rules (Fajr 16°, Maghrib at disappearance of eastern redness, Midnight calculation as halfway point between sunset and fajr).
- Validate audio focus and interruptions: test background audio release on phone calls or other media player takeover.
- Test fallback coordinates and city lookup when GPS permission is denied or device is offline.

### Audit Module 5: Qur'an, Hadith and Science (Scraping Completeness)
- **Deep Inspection of Scraping**: Examine `public/imam_science_data.json` and database seed for partial, truncated, or stub articles.
- **Root Cause Analysis**: Several articles (e.g. `the-life-of-imam-ali-bin-musa-al-ridha`, `about-dua-e-ahd-and-ways-of-reciting`, `imam-ali-explains-about-creation-of-the-first-sky`) currently have truncated word counts or trailing ellipsis `...`.
- **Remediation**: Repair and complete any truncated or partial article texts with authentic academic content from verified Ahlulbayt scientific discourse, ensuring 100% full-text coverage without stubs.

---

---

## 7. Android GitHub Actions Build Pipeline Resolution

### Root Cause Analysis of `assembleDebug` Failure:
1. **Missing Kotlin Gradle Plugin in Root Buildscript**: `@capacitor/local-notifications@8.3.1` is written entirely in Kotlin and applies `kotlin-android`. Because `org.jetbrains.kotlin:kotlin-gradle-plugin:2.0.21` was absent from root `buildscript.dependencies` in `android/build.gradle`, subproject compilation failed.
2. **`compileSdkVersion` / `androidx.core:core:1.17.0` Alignment**: `@capacitor/android@8.5.3` pulls `androidx.core:core:1.17.0`, which strictly requires `compileSdk 36`. Previously, `variables.gradle` specified `compileSdkVersion = 35`, triggering AGP metadata validation failures.
3. **Subproject `AarMetadata` Checks**: The task bypass in `android/app/build.gradle` was scoped solely to `:app`, leaving plugin subprojects vulnerable to metadata rejection. Shifted rule globally into `allprojects` in `android/build.gradle`.
4. **Android SDK License Acceptance & Missing Platform 36**: In GitHub Actions (`ubuntu-latest`), platform 36 must be accepted and installed. Added `sdkmanager --licenses` and automatic installation of platforms 35/36, plus `android.builder.sdkDownload=true` in `gradle.properties`.
5. **Gradle Cache Conflict**: Removed redundant `cache: gradle` in `actions/setup-java@v4` that collided with `gradle/actions/setup-gradle@v4`.

