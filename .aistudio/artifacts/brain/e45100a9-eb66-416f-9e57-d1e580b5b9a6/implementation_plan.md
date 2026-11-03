# Shia Markaz - Top Section & App Badge Design Refinement

## Summary of Changes

### 1. Re-engineered App Badge (`PWAInstallButton`)
- **Aesthetic Overhaul**: Replaced the previous generic solid-green button and distracting bouncing download icon with an exquisite, frosted liquid-glass jewel capsule.
- **Accents & Polish**:
  - Delicate 1px champagne-gold border (`border-amber-400/40 dark:border-amber-400/25`).
  - Subtle golden ambient glimmer pip (`bg-amber-400 dark:bg-amber-300 ring-2 ring-amber-400/25`).
  - Modern fine-line `Smartphone` icon (`strokeWidth={1.6}`).
  - Multilingual support: seamlessly renders **ایپ انسٹال کریں** in Urdu and **Install App** in English.
  - Gentle micro-interaction on hover with an ambient golden sheen (`hover:shadow-[0_2px_12px_-2px_rgba(251,191,36,0.25)]`).

### 2. Top Header Design Elements
- **Sacred Geometric Rosette**: Inscribed an authentic Islamic geometric emblem (**۞** Rub el Hizb) beside the calligraphy title with a soft golden glow.
- **Ethereal Ambient Highlight**: Positioned an ultra-fine ambient light seam (`bg-gradient-to-r from-transparent via-amber-400/35 to-transparent`) along the bottom border of the sticky header.
- **Maktab Ahlulbayt Descriptor**: Added a subtle editorial descriptor with a vertical gold divider that neatly grounds the calligraphic branding.
- **Balanced Twin Capsules**: Redesigned the Exit control into a matching liquid-glass capsule, creating symmetrical, intentional harmony on the right side of the navigation bar.

### 3. Welcome Masthead Polish
- **Background Geometric Watermark**: Rendered an understated Islamic rosette watermark in the lower-right background of the card.
- **Golden Sheen**: Added a fine gold accent beam along the top edge of the masthead.
- **Diamond Glyph**: Replaced plain divider dots in the sacred greeting with a delicate gold diamond glyph (**✦**).
- **Recitation Jewel Pill**: Replaced the recitation counter with an illuminated jewel capsule featuring a pulsing emerald aura.

### 4. Verification
- `tsc --noEmit`: 0 errors.
- `vite build`: Build succeeded cleanly.
- Dev server reloaded and healthy at `/api/health`.
