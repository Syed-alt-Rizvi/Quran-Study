# Google Play Store Listing Specification
**App ID:** `com.tafseerenamoona.app`  
**Target SDK:** 36 (Android 15+ / 16 ready)  
**Developer:** Syed Murtaza Razavee (`Syedmurtazarazavee@gmail.com`)

---

## 1. Store Listing Metadata

### App Title (28 / 30 characters max)
```
Shia Quran & Tafseer Namoona
```

### Short Description (75 / 80 characters max)
```
Shia Quran with Tafseer Namoona, Urdu audio, offline reading & reflections.
```

### Category
- **Primary Category:** Books & Reference
- **Secondary / Tags:** Education, Quran, Tafseer, Islamic Studies, Audio Recitation

### Content Rating
- **Rating:** Everyone (ESRB) / PEGI 3 / USK 0
- **User-Generated Content (UGC):** Enabled (Includes in-app comment reporting, author mute/blocking, and 24h review SLA).

---

## 2. Full Description (Google Play Formatted)

```
Welcome to Shia Quran & Tafseer Namoona — an authentic, ad-free Islamic study platform designed for dedicated Quran reflection, research, and daily recitation.

Explore the complete Holy Quran with authentic Shia exegetical works, including the renowned Tafseer-e-Namoona (by Grand Ayatollah Naser Makarem Shirazi) and Tafseer Al-Kauthar (by Allama Mohsin Ali Najafi).

KEY FEATURES:

📖 COMPLETE QURANIC TEXT & JUZ INDEX
• Crisp Uthmani and Indopak Quranic scripts with full tashkeel.
• Read by Surah or Juz (Parah) with smooth, distraction-free scrolling.
• Multiple high-readability Arabic typefaces: Amiri, Scheherazade New, and Lateef.

📚 AUTHENTIC SHIA TAFSEER & TRANSLATIONS
• Tafseer-e-Namoona (Urdu & English) verse-by-verse commentary.
• Tafseer Al-Kauthar (Urdu) contextual and historical explanations.
• English and Urdu translations by renowned scholars.
• Side-by-side reading view with resizable text and tafseer zoom controls.

🎧 HIGH-QUALITY AUDIO RECITATIONS
• Verse-by-verse audio playback synchronized with live text highlighting.
• World-renowned reciters including Abdul Basit, Mishary Alafasy, and Urdu verse translations.
• Background audio playback with Android Media Notification integration.
• Customizable playback speed (0.75x to 1.5x) and auto-scroll synchronization.

💬 COMMUNITY REFLECTIONS & STUDY NOTES
• Connect with fellow students of knowledge through Ayah reflections.
• Safe, moderated community environment with real-time reporting and mute controls.
• Personal, private local notes for your Quranic journaling.

⭐ READING PROGRESS & DAILY REMINDERS
• Habit tracker with daily reading streaks and time counters.
• Customizable daily recitation reminders.
• Instant bookmarking to continue your recitation seamlessly.

🔒 100% PRIVATE & AD-FREE
• Zero commercial advertisements.
• Zero cross-app tracking pixels or advertising SDKs.
• Offline-first design — core Quran texts and saved bookmarks are stored securely on your device.

DEDICATION & SAWAB:
This application is maintained as an ongoing charity (Sadaqah Jariyah). We request your recitation of Surah Al-Fatiha for the Isal-e-Sawab and Maghfirat of Marhoomin:
• Sakina Banoo D/O Akhoon Mohd Kazim
• Syed Abbas Rizvi S/O Syed Hassan Rizvi

SUPPORT & FEEDBACK:
Developed by Syed Murtaza Razavee. For questions, suggestions, or tafseer corrections, please reach out to:
Email: Syedmurtazarazavee@gmail.com
Privacy Policy: https://shia-quran.web.app/privacy
Data Deletion: https://shia-quran.web.app/data-deletion
```

---

## 3. Google Play Data Safety Declarations

For the Google Play Console **Data Safety Form**, declare the following:

1. **Data Collection:**
   - **Personal Info:** Optional display name / nickname if the user chooses to post public reflections. Not linked to external identity.
   - **User Content:** In-app reflection comments posted publicly.
   - **App Activity:** Local reading progress and bookmarks (stored locally on-device, never shared with third parties).
2. **Data Sharing:**
   - **No data shared with third parties** for advertising or cross-context tracking.
3. **Security Practices:**
   - All data in transit is encrypted over HTTPS (TLS 1.3).
   - In-app Account & Data Deletion mechanism (`Settings` -> `Privacy & Data Safety` -> `Delete Profile & Local Data`).
   - Dedicated Web Deletion Portal (`/data-deletion`).

---

## 4. Graphic Assets Checklist

| Asset | Dimensions | Format | Status | Notes |
|---|---|---|---|---|
| **App Icon** | 512 x 512 px | PNG (32-bit, no alpha) | Ready | Located in `assets/icon.png` |
| **Feature Graphic** | 1024 x 500 px | JPG or 24-bit PNG | Ready | Clean emerald Islamic geometric banner |
| **Phone Screenshots** | 1080 x 1920 px or 1080 x 2400 px | PNG / JPG | Minimum 4 required | Surah List, Verse View, Tafseer Namoona, Audio Player |
| **7-inch Tablet Screenshots** | 1200 x 1920 px | PNG / JPG | Minimum 1 required | Dual-pane reading layout |
| **10-inch Tablet Screenshots** | 1600 x 2560 px | PNG / JPG | Minimum 1 required | Expanded landscape study dashboard |
