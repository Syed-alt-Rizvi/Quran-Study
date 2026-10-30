# High-Precision Sensor & 3D Qibla Compass Engine

Architectural review, mathematical redesign, and sensor pipeline overhaul to transform the Qibla Finder into a robust, jitter-free, high-precision mobile compass with client-side Great-Circle geodesy, True North magnetic declination correction, 60 FPS 2D unit vector low-pass filtering, and an elegant 3D calligraphic dial.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural decisions below have been updated to incorporate the unit vector filtering technique:

- **Sensor Smoothing Strategy (Vector Low-Pass Filtering)**: Convert heading angles to Cartesian 2D unit vectors $(\cos\theta, \sin\theta)$ and apply the exponential low-pass filter directly to the $(x, y)$ coordinates:
  $$x_k = (1 - \alpha) \cdot x_{k-1} + \alpha \cdot \cos(\theta_k)$$
  $$y_k = (1 - \alpha) \cdot y_{k-1} + \alpha \cdot \sin(\theta_k)$$
  $$\theta_{\text{filtered}} = (\text{atan2}(y_k, x_k) \times \frac{180}{\pi} + 360) \pmod{360}$$
  This completely eliminates modular $0^\circ / 360^\circ$ wrap-around glitches, quadrant flip artifacts, and jitter.
- **True North & Declination Model**: Hybrid approach utilizing OS-level geographic true heading (`webkitCompassHeading` on iOS, W3C `deviceorientationabsolute` on modern Android) with a client-side World Magnetic Model (WMM) declination algorithm fallback for standard magnetic orientations.
- **Lifecycle & Resource Throttling**: 60 FPS `requestAnimationFrame` render loop coupled with Page Visibility API (`document.visibilityState`) and unmount listeners to suspend sensor polling in the background and conserve battery.
- **Zero API Polling for Real-Time Tracking**: Strict client-side Great-Circle spherical trigonometry calculations based on the exact Mecca coordinates (`21.4225° N, 39.8262° E`). Remote APIs will only be used for optional initial city geocoding, never during sensor tracking.

---

## 1. Overview & Core Concept

### What It Does
Provides an immediate, high-fidelity, and scientifically accurate Qibla compass. Users can search for any village, town, or city globally (or tap one-touch GPS), and immediately see the exact Qibla bearing rendered on a fluid, tactile 3D compass dial inscribed with *"Ashhadu Anna Aliyan Waliyullah"* in classical Arabic calligraphy.

### Target Audience / Persona
Shia Muslim believers, travelers, and daily reciters seeking an effortless, reverent, and technically accurate orientation toward the Holy Kaaba for daily prayers, supplications, and ziyaraat, free of clutter, latency, or promotional descriptions.

### Key Value
- **Zero-Latency Accuracy**: Instant spherical trigonometry computation directly in browser memory without recurring network round-trips.
- **Butter-Smooth Vector Motion**: 2D unit-vector low-pass filtering prevents the needle from jittering, glitching, or snapping across the north boundary.
- **Pristine Aesthetics**: Focused purely on the search input and the 3D calligraphic compass without distracting text blocks or marketing cards.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Instant Viewport Launch**:
   - The user opens the Qibla tab. The current location (e.g., Karbala or detected city) and coordinates are immediately visible in the top search bar.
   - If iOS motion permission is needed, an intuitive "Enable Motion Sensor" action appears seamlessly without blocking the UI.
2. **Global Location Search**:
   - The user taps the top bar to search any village, town, or city globally.
   - As they type, instant local matches appear immediately, followed by global OpenStreetMap/Photon geocoder results.
   - Selecting a location instantly recalculates the great-circle azimuth and updates the compass needle with zero latency.
3. **Physical Compass Alignment**:
   - The user holds their device flat. The 3D compass dial rotates fluidly at 60 FPS in response to device orientation.
   - When the phone aligns within $\pm 4^\circ$ of the Kaaba, the dial illuminates with an emerald backlight aura, delivers a tactile haptic pulse (`ImpactStyle.Medium`), and indicates *"Directly Facing the Holy Kaaba"*.

### Visual Identity & Theme
- **Color Palette & Atmospheric Lighting**:
  - Background Canvas: Deep Pine Obsidian (`#020c08` & `#042f22`).
  - Compass Housing: Conic-gradient metallic emerald bezel with 3D highlights and specular rim.
  - Inner Dial Face: Sunken obsidian glass plate with deep inset shadowing.
  - Sacred Inscription: Classical gold Arabic calligraphy (`#fde68a` with warm glow).
- **Typography & Hierarchy**:
  - Center Dial: Classical Naskh/Thuluth font (*Amiri Quran* / *Traditional Arabic*) rendering **أَشْهَدُ أَنَّ عَلِيّاً وَلِيُّ اللَّهِ**.
  - Telemetry & Bearings: High-legibility monospace tabular numerals (`font-mono tabular-nums`).
- **Interactive Feedback & Motion**:
  - 60 FPS render loop utilizing decoupled sensor sampling and `requestAnimationFrame`.
  - Cartesian unit vector smoothing prevents any angular jump or stuttering.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Pure Client-Side Spherical Trigonometry
- **Chosen Approach**: All Qibla bearing and distance calculations are performed entirely in client-side TypeScript using the forward azimuth formula:
  $$\Delta \lambda = \lambda_{\text{Mecca}} - \lambda_{\text{Device}}$$
  $$X = \cos(\phi_{\text{Mecca}}) \cdot \sin(\Delta \lambda)$$
  $$Y = \cos(\phi_{\text{Device}}) \cdot \sin(\phi_{\text{Mecca}}) - \sin(\phi_{\text{Device}}) \cdot \cos(\phi_{\text{Mecca}}) \cdot \cos(\Delta \lambda)$$
  $$\theta = (\text{atan2}(X, Y) \times \frac{180}{\pi} + 360) \pmod{360}$$
- **Why**: Eliminates network latency, avoids quota exhaustion, and works 100% offline.

### Decision 2: True North Correction & Declination
- **Chosen Approach**: Priority to true heading APIs (`webkitCompassHeading` or `deviceorientationabsolute`). For platforms emitting magnetic headings, apply a client-side WMM (World Magnetic Model) approximation based on the device's latitude/longitude and current epoch.
- **Why**: Ensures magnetic deviation does not skew prayer orientation.

### Decision 3: 2D Unit Vector Low-Pass Filtering
- **Chosen Approach**: Map every incoming heading to $V = (\cos\theta, \sin\theta)$ and apply a low-pass filter:
  $$V_{\text{smooth}} = (1 - \alpha) V_{\text{smooth}} + \alpha V_{\text{raw}}$$
  with $\alpha \approx 0.15$, then extract $\text{atan2}(V_y, V_x)$.
- **Why**: Superior to scalar degree smoothing; completely eliminates the singularity at the $359^\circ \leftrightarrow 0^\circ$ transition.

### Decision 4: Lifecycle Governance & Memory Protection
- **Chosen Approach**: Register orientation and geolocation listeners with explicit cleanup on component unmount and listen to `visibilitychange` to suspend rAF loops and listeners while the app is backgrounded.
- **Why**: Protects mobile device battery life and avoids browser thread saturation.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          User Device Hardware                          │
│     [Magnetometer / Gyroscope]              [GPS Receiver / Geo]       │
└───────────────────┬──────────────────────────────────┬─────────────────┘
                    │ Raw Heading (deg)                │ Lat / Lng
                    ▼                                  ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       Sensor Pipeline Manager        │  │     Geodesy Math Engine      │
│  • True North Declination Correction │  │  • Great-Circle Azimuth      │
│  • Unit Vector Projection [cos, sin] │  │  • Haversine Distance        │
│  • Low-Pass Filter on (x, y) Vectors │  │  • Mecca Fixed Coordinates   │
└───────────────────┬──────────────────┘  └──────────────┬───────────────┘
                    │ Filtered Vector Heading            │ Target Qibla Bearing
                    ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   60 FPS requestAnimationFrame Loop                    │
│               Continuous angle reconstruction via atan2(y, x)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Smooth Heading Angle
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Tactile 3D Compass View (UI)                        │
│   • Top Search Bar (Global Village/Town/City Resolution)               │
│   • 3D Beveled Metallic Bezel & Recessed Obsidian Dial                 │
│   • Calligraphy: "Ashhadu Anna Aliyan Waliyullah"                      │
│   • 3D Kaaba Needle & ±4° Alignment Haptic Trigger                     │
│   • Telemetry Pills (Bearing, Facing, Distance in Tabular Numerals)    │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

| Component / Utility | Core Responsibility | Key Logic & Optimizations |
| :--- | :--- | :--- |
| `src/utils/qiblaApi.ts` | Spherical math & geodesy | Forward azimuth formula, Haversine distance, client-side WMM magnetic declination calculation, and 2D vector smoothing helpers. |
| `src/components/QiblaFinder.tsx` | View & sensor lifecycle | Unit vector low-pass rAF loop, permission triggers, search bar integration, 3D dial rendering. |
| `src/data/shiaCities.ts` | Global city search & reverse geocoding | Instant shrine presets + OpenStreetMap Nominatim & Photon fallback for worldwide towns/villages. |
| `src/index.css` | 3D visual styling | Conic-gradient housing, inset dial drop shadow, specular glass reflection. |
