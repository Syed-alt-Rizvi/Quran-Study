# Dual Adhan Voice Options: Adhan (Full) & Adhan (Short)

Implement a user-selectable Adhan audio preference offering two distinct modes: **Adhan (Full)** with the complete authentic Shia recitation, and **Adhan (Short)** containing the initial four Takbirs (*Allāhu Akbar*) with a natural fade-out for quick prayer notifications.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification:
> - **Configuration Scope**: Single global setting applied consistently across all three prayer calls (Fajr, Dhuhr, and Maghrib).
> - **Audio Clip Composition**: Cut the first four Takbirs directly from Sayyid Hani Al-Musawi's recitation and apply an acoustic fade-out transition.
> - **UI Placement**: User can toggle between Full and Short Adhan directly from both the **Adhan Player tab** (`AdhanMapScreen`) and the **Settings modal** (`Sidebar`).

---

## 1. Overview & Core Concept

Many users who are at work, school, or in public settings want to be alerted immediately of Shia prayer times with the sacred Takbirat without having the full 5-minute Adhan recitation play out in its entirety. 

This feature introduces a two-option segmented selector:
1. **Adhan (Full) — مکمل اذان**: Complete authentic Ja'fari Adhan recited by Sayyid Hani Al-Musawi from the Holy Kadhimiya Shrine (~5 min).
2. **Adhan (Short) — مختصر اذان (۴ تکبیرات)**: The opening four *Allāhu Akbar* proclamations (~72 seconds) ending in a smooth 2-second acoustic decay.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Adhan Screen Switcher**:
   - Above the prayer schedule on the Adhan screen, an elegant segmented control labeled **"Adhan Voice / اذان کی آواز"** allows instantaneous switching between **"Full (5 min)"** and **"Short (4 Takbirs)"**.
   - Includes an inline mini play/preview button so users can audition the short clip immediately before saving.
2. **Settings Drawer Integration**:
   - Inside the **Adhan & Notifications** settings group in the sidebar drawer, a matching selector with clear descriptive subtitle: *"Choose between full recitation or quick 4-Takbir announcement"*.
3. **Automatic Scheduled Playback**:
   - Both in-app Web Audio playback and native background Android services automatically play the selected clip when Fajr, Dhuhr, or Maghrib arrives.

### Visual Identity & Styling
- Segmented pill/tab control adhering to the app's emerald and slate aesthetic (`bg-slate-100 dark:bg-slate-800` track, `bg-emerald-600 text-white shadow-sm` for the active selection).
- Touch target heights $\ge 44\text{px}$ on mobile devices with haptic feedback integration (`@capacitor/haptics`).

---

## 3. Technical Architecture & Implementation Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                 Settings Store (Zustand)                    │
│      adhanSettings.adhanVoice: 'full' | 'short'             │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      AdhanMapScreen.tsx      │ │        Sidebar.tsx         │
│  Segmented Audio Mode Switch │ │   Settings Panel Selector  │
└──────────────┬───────────────┘ └────────────┬───────────────┘
               │                              │
               └──────────────┬───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            ShiaAdhanPlayerService (TypeScript)              │
│  - Selects /audio/shia_adhan.mp3 vs shia_adhan_short.mp3   │
│  - Passes 'voice' param to AdhanNativePlugin.scheduleAlarms │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Web Audio Pipeline      │ │    Android Native Engine   │
│  HTMLAudioElement Playback   │ │  - AdhanPlaybackService    │
│  (Desktop, PWA & Webview)    │ │  - R.raw.shia_adhan_short  │
└──────────────────────────────┘ └────────────────────────────┘
```

### Component & System Changes

1. **Audio Asset Generation**:
   - Use `ffmpeg` to extract $0.00\text{s}$ to $72.00\text{s}$ of `public/audio/shia_adhan.mp3` with a smooth 2.0-second exponential audio fade-out (`af="afade=t=out:st=70.0:d=2.0"`).
   - Export to `public/audio/shia_adhan_short.mp3` (64 kbps mono, ~560 KB).
   - Bundle copy into `android/app/src/main/res/raw/shia_adhan_short.mp3`.

2. **Zustand Store (`src/store.ts`)**:
   - Extend `AdhanSettings` interface:
     ```ts
     export interface AdhanSettings {
       autoPlayFajr: boolean;
       autoPlayDhuhr: boolean;
       autoPlayMaghrib: boolean;
       repeatCount: number;
       volume: number;
       notificationsEnabled: boolean;
       adhanVoice: 'full' | 'short'; // NEW
     }
     ```
   - Persist to `localStorage` with migration default `'full'`.

3. **In-App Player Engine (`src/utils/shiaAdhanPlayer.ts`)**:
   - Dynamically load the audio source based on `useSettingsStore.getState().adhanSettings.adhanVoice`:
     - `'full'` $\rightarrow$ `/audio/shia_adhan.mp3`
     - `'short'` $\rightarrow$ `/audio/shia_adhan_short.mp3`
   - Pass `adhanVoice` to `AdhanNative.scheduleAlarms(...)` and `LocalNotifications`.

4. **Android Native Subsystem (`android/app/src/main/java/...`)**:
   - `AdhanStorage.java`: Add `KEY_ADHAN_VOICE = "adhan_voice"` getters/setters.
   - `AdhanPlaybackService.java`: If `voice` is `"short"`, play `R.raw.shia_adhan_short`; otherwise `R.raw.shia_adhan`.
   - `LocalNotifications`: Use sound resource `shia_adhan_short.mp3` when short option is active.

5. **UI Controls**:
   - **`AdhanMapScreen.tsx`**: Add an Adhan Voice card with option buttons: "Full Adhan (5 min)" and "Short Adhan (4 Takbirs)", complete with a preview audition button.
   - **`Sidebar.tsx`**: Add the matching selector in the prayer notification settings.

---

## 4. Verification Plan

1. **Audio Quality Verification**:
   - Inspect `public/audio/shia_adhan_short.mp3` with `ffprobe` to verify clean 72s length, 64 kbps compression, and silence at termination.
2. **UI & State Verification**:
   - Toggle between Full and Short in `AdhanMapScreen` and verify that the setting synchronizes with `Sidebar` and persists after page reload.
   - Test preview audition button for both options.
3. **Execution & Build**:
   - Run `npm run build` to verify bundle size remains well under 250 MB (~128 MB total).
   - Run `tsc --noEmit` to confirm zero TypeScript compilation errors.
