// Shia Ithna Ashari (Ja'fari) Prayer Times & Solar Astronomy Calculation Engine
// Compliant with Leva Institute (Qum), Ayatollah Sistani, and AlAdhan Method 0

export interface ShiaPrayerTimings {
  fajr: string;       // Subh Sadiq (16.0° below horizon) - ADHAN #1
  sunrise: string;    // Tulu' al-Shams
  dhuhr: string;      // Midday / Solar Noon (Zenith) - ADHAN #2
  asr: string;        // Asr (shadow reaches length + noon shadow)
  sunset: string;     // Ghurub (sun dips below horizon)
  maghrib: string;    // Maghrib (4.0° below horizon, clearance of eastern redness) - ADHAN #3
  isha: string;       // Isha (14.0° below horizon)
  midnight: string;   // Nisf al-Layl (halfway from Maghrib to Fajr)
  imsak: string;      // 10 minutes before Fajr
  date: string;
  source: 'aladhan' | 'astronomical' | 'cached';
  qiblaBearing?: number; // Degrees from True North
}

export interface CityLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  description?: string;
  isHolySite?: boolean;
}

// Sacred Shia Holy Shrines & Global Metropolises
export const SHIA_PRESET_CITIES: CityLocation[] = [
  {
    name: 'Karbala',
    country: 'Iraq',
    latitude: 32.6160,
    longitude: 44.0249,
    timezone: 'Asia/Baghdad',
    description: 'Holy Shrine of Imam Hussain (a.s) & Hazrat Abbas (a.s)',
    isHolySite: true
  },
  {
    name: 'Najaf',
    country: 'Iraq',
    latitude: 32.0000,
    longitude: 44.3333,
    timezone: 'Asia/Baghdad',
    description: 'Holy Shrine of Amir al-Mu\'minin Imam Ali (a.s)',
    isHolySite: true
  },
  {
    name: 'Mashhad',
    country: 'Iran',
    latitude: 36.2972,
    longitude: 59.6067,
    timezone: 'Asia/Tehran',
    description: 'Holy Shrine of Imam Ali al-Ridha (a.s)',
    isHolySite: true
  },
  {
    name: 'Qum',
    country: 'Iran',
    latitude: 34.6416,
    longitude: 50.8746,
    timezone: 'Asia/Tehran',
    description: 'Holy Shrine of Lady Fatima Masuma (s.a) & Leva Research Institute',
    isHolySite: true
  },
  {
    name: 'Kufa',
    country: 'Iraq',
    latitude: 32.0294,
    longitude: 44.4022,
    timezone: 'Asia/Baghdad',
    description: 'Great Mosque of Kufa & Mihrab of Imam Ali (a.s)',
    isHolySite: true
  },
  {
    name: 'Samarra',
    country: 'Iraq',
    latitude: 34.1983,
    longitude: 43.8742,
    timezone: 'Asia/Baghdad',
    description: 'Holy Shrine of Imam Ali al-Hadi (a.s) & Imam Hasan al-Askari (a.s)',
    isHolySite: true
  },
  {
    name: 'Kadhimayn (Baghdad)',
    country: 'Iraq',
    latitude: 33.3797,
    longitude: 44.3411,
    timezone: 'Asia/Baghdad',
    description: 'Holy Shrine of Imam Musa al-Kadhim (a.s) & Imam Muhammad al-Jawad (a.s)',
    isHolySite: true
  },
  {
    name: 'Medina',
    country: 'Saudi Arabia',
    latitude: 24.5247,
    longitude: 39.5692,
    timezone: 'Asia/Riyadh',
    description: 'Masjid an-Nabawi & Jannat al-Baqi',
    isHolySite: true
  },
  {
    name: 'Mecca',
    country: 'Saudi Arabia',
    latitude: 21.4225,
    longitude: 39.8262,
    timezone: 'Asia/Riyadh',
    description: 'Masjid al-Haram & Holy Kaaba (Birthplace of Imam Ali a.s)',
    isHolySite: true
  },
  {
    name: 'Tehran',
    country: 'Iran',
    latitude: 35.6892,
    longitude: 51.3890,
    timezone: 'Asia/Tehran',
    description: 'Capital of Iran & Shah Abdol-Azim Shrine',
    isHolySite: false
  },
  {
    name: 'Beirut',
    country: 'Lebanon',
    latitude: 33.8938,
    longitude: 35.5018,
    timezone: 'Asia/Beirut',
    description: 'Capital of Lebanon',
    isHolySite: false
  },
  {
    name: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    description: 'Islamic Centre of England & Al-Khoei Foundation',
    isHolySite: false
  },
  {
    name: 'Dearborn / Detroit',
    country: 'United States',
    latitude: 42.3223,
    longitude: -83.1763,
    timezone: 'America/Detroit',
    description: 'Islamic Center of America',
    isHolySite: false
  },
  {
    name: 'Toronto',
    country: 'Canada',
    latitude: 43.6532,
    longitude: -79.3832,
    timezone: 'America/Toronto',
    description: 'Jaffari Community Centre',
    isHolySite: false
  },
  {
    name: 'Mumbai',
    country: 'India',
    latitude: 18.9220,
    longitude: 72.8347,
    timezone: 'Asia/Kolkata',
    description: 'Mughal Masjid & Shia Jamaat',
    isHolySite: false
  },
  {
    name: 'Lucknow',
    country: 'India',
    latitude: 26.8467,
    longitude: 80.9462,
    timezone: 'Asia/Kolkata',
    description: 'Bara Imambara & Asafi Mosque',
    isHolySite: false
  },
  {
    name: 'Karachi',
    country: 'Pakistan',
    latitude: 24.8607,
    longitude: 67.0011,
    timezone: 'Asia/Karachi',
    description: 'Mehfil-e-Murtaza & Khoja Shia Ithna Ashari Jamaat',
    isHolySite: false
  },
  {
    name: 'Sydney',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
    description: 'Al-Zahra Mosque',
    isHolySite: false
  }
];

// Calculation parameters for Shia Ithna-Ashari (Ja'fari / Leva Institute Qum)
const SHIA_FAJR_ANGLE = 16.0;   // Morning twilight angle below horizon
const SHIA_MAGHRIB_ANGLE = 4.0; // Eastern redness (al-Humrah al-Mashriqiyyah) angle below horizon
const SHIA_ISHA_ANGLE = 14.0;   // Isha angle below horizon

// Helper: Degree <-> Radian conversions
const degToRad = (d: number) => (d * Math.PI) / 180.0;
const radToDeg = (r: number) => (r * 180.0) / Math.PI;

// Calculate Qibla Bearing (Degrees clockwise from True North to the Holy Kaaba)
export function calculateQibla(latitude: number, longitude: number): number {
  const kaabaLat = 21.422487;
  const kaabaLng = 39.826206;

  const phi1 = degToRad(latitude);
  const phi2 = degToRad(kaabaLat);
  const deltaLambda = degToRad(kaabaLng - longitude);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = radToDeg(qiblaRad);
  return (qiblaDeg + 360) % 360;
}

// Mathematical Astronomical Solar Coordinates calculation for high accuracy fallback
function getSolarCoordinates(julianDay: number) {
  const d = julianDay - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const l = (q + 1.915 * Math.sin(degToRad(g)) + 0.020 * Math.sin(degToRad(2 * g))) % 360;
  const e = 23.439 - 0.00000036 * d;

  const ra = radToDeg(Math.atan2(Math.cos(degToRad(e)) * Math.sin(degToRad(l)), Math.cos(degToRad(l)))) / 15;
  const declination = radToDeg(Math.asin(Math.sin(degToRad(e)) * Math.sin(degToRad(l))));
  const eqTime = q / 15 - ((ra + 24) % 24);

  return { declination, eqTime };
}

function getJulianDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// Compute hour angle for sun at a given altitude
function sunAngleTime(angle: number, latitude: number, declination: number, direction: 'ccw' | 'cw') {
  const latR = degToRad(latitude);
  const decR = degToRad(declination);
  const angR = degToRad(angle);

  const cosH = (Math.sin(-angR) - Math.sin(latR) * Math.sin(decR)) / (Math.cos(latR) * Math.cos(decR));

  if (cosH > 1) return null; // Sun never rises to this angle
  if (cosH < -1) return null; // Sun never sets below this angle

  const h = radToDeg(Math.acos(cosH)) / 15.0;
  return direction === 'ccw' ? -h : h;
}

// Astronomical Shia Ithna Ashari offline calculator
export function calculateAstronomicalShiaTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  timezoneOffsetHours: number = -date.getTimezoneOffset() / 60
): ShiaPrayerTimings {
  const jd = getJulianDate(date);
  const { declination, eqTime } = getSolarCoordinates(jd);

  // Solar noon (Dhuhr) in local time hours
  const solarNoon = 12 + timezoneOffsetHours - longitude / 15.0 - eqTime;

  // Sunrise and Sunset (sun semi-diameter and atmospheric refraction ~ 0.833 deg)
  const sunRadiusAngle = 0.833;
  const sunriseOffset = sunAngleTime(sunRadiusAngle, latitude, declination, 'ccw') ?? -6;
  const sunsetOffset = sunAngleTime(sunRadiusAngle, latitude, declination, 'cw') ?? 6;

  // Fajr (16.0 deg below horizon)
  const fajrOffset = sunAngleTime(SHIA_FAJR_ANGLE, latitude, declination, 'ccw') ?? (sunriseOffset - 1.3);

  // Maghrib in Ja'fari fiqh: 4.0 deg below horizon
  const maghribOffset = sunAngleTime(SHIA_MAGHRIB_ANGLE, latitude, declination, 'cw') ?? (sunsetOffset + 0.25);

  // Isha (14.0 deg below horizon)
  const ishaOffset = sunAngleTime(SHIA_ISHA_ANGLE, latitude, declination, 'cw') ?? (maghribOffset + 0.8);

  // Asr: when shadow length = object height + noon shadow
  const asrAngle = radToDeg(Math.atan(1 + Math.tan(degToRad(Math.abs(latitude - declination)))));
  const asrOffset = sunAngleTime(90 - asrAngle, latitude, declination, 'cw') ?? (solarNoon + 3.2);

  const formatHours = (hours: number): string => {
    let normalized = (hours + 24) % 24;
    const h = Math.floor(normalized);
    const m = Math.floor((normalized - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const fajrHours = solarNoon + fajrOffset;
  const sunriseHours = solarNoon + sunriseOffset;
  const dhuhrHours = solarNoon;
  const asrHours = Math.max(solarNoon + 0.1, asrOffset);
  const sunsetHours = solarNoon + sunsetOffset;
  const maghribHours = solarNoon + maghribOffset;
  const ishaHours = solarNoon + ishaOffset;

  // Shia Ja'fari Midnight (Nisf al-Layl) is halfway between Maghrib and next morning's Fajr
  const midnightHours = maghribHours + ((fajrHours + 24 - maghribHours) % 24) / 2;

  // Imsak is 10 minutes before Fajr
  const imsakHours = fajrHours - 10 / 60;

  const dateStr = date.toISOString().split('T')[0];
  const qibla = calculateQibla(latitude, longitude);

  return {
    fajr: formatHours(fajrHours),
    sunrise: formatHours(sunriseHours),
    dhuhr: formatHours(dhuhrHours),
    asr: formatHours(asrHours),
    sunset: formatHours(sunsetHours),
    maghrib: formatHours(maghribHours),
    isha: formatHours(ishaHours),
    midnight: formatHours(midnightHours),
    imsak: formatHours(imsakHours),
    date: dateStr,
    source: 'astronomical',
    qiblaBearing: Math.round(qibla * 10) / 10
  };
}

// Main fetch function with server cache + AlAdhan method 0 + astronomical fallback
export async function getShiaPrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): Promise<ShiaPrayerTimings> {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  const dateFormatted = `${d}-${m}-${y}`;
  const roundedLat = Math.round(latitude * 1000) / 1000;
  const roundedLng = Math.round(longitude * 1000) / 1000;
  const cacheKey = `shia_prayers_${dateFormatted}_${roundedLat}_${roundedLng}`;

  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.fajr && parsed.dhuhr && parsed.maghrib) {
        return { ...parsed, source: 'cached' };
      }
    }
  } catch {}

  // 1. Try server proxy endpoint /api/prayer-times
  try {
    const res = await fetch(`/api/prayer-times?latitude=${latitude}&longitude=${longitude}&date=${dateFormatted}&method=0`);
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.timings) {
        const t = json.data.timings;
        // Clean timing strings to canonical HH:MM format
        const clean = (s: string) => {
          if (!s) return '12:00';
          const first = s.trim().split(' ')[0];
          const parts = first.split(':');
          if (parts.length >= 2) {
            const h = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            if (!isNaN(h) && !isNaN(m)) {
              return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            }
          }
          return first;
        };
        const result: ShiaPrayerTimings = {
          fajr: clean(t.Fajr),
          sunrise: clean(t.Sunrise),
          dhuhr: clean(t.Dhuhr),
          asr: clean(t.Asr),
          sunset: clean(t.Sunset),
          maghrib: clean(t.Maghrib),
          isha: clean(t.Isha),
          midnight: clean(t.Midnight),
          imsak: clean(t.Imsak || t.Fajr),
          date: `${y}-${m}-${d}`,
          source: 'aladhan',
          qiblaBearing: Math.round(calculateQibla(latitude, longitude) * 10) / 10
        };
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {}
        return result;
      }
    }
  } catch (err) {
    console.warn('Server prayer-times fetch failed, attempting direct AlAdhan:', err);
  }

  // 2. Direct client fetch to AlAdhan with method=0 (Shia Ithna-Ashari)
  try {
    const directRes = await fetch(
      `https://api.aladhan.com/v1/timings/${dateFormatted}?latitude=${latitude}&longitude=${longitude}&method=0`
    );
    if (directRes.ok) {
      const json = await directRes.json();
      if (json?.data?.timings) {
        const t = json.data.timings;
        const clean = (s: string) => {
          if (!s) return '12:00';
          const first = s.trim().split(' ')[0];
          const parts = first.split(':');
          if (parts.length >= 2) {
            const h = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            if (!isNaN(h) && !isNaN(m)) {
              return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            }
          }
          return first;
        };
        const result: ShiaPrayerTimings = {
          fajr: clean(t.Fajr),
          sunrise: clean(t.Sunrise),
          dhuhr: clean(t.Dhuhr),
          asr: clean(t.Asr),
          sunset: clean(t.Sunset),
          maghrib: clean(t.Maghrib),
          isha: clean(t.Isha),
          midnight: clean(t.Midnight),
          imsak: clean(t.Imsak || t.Fajr),
          date: `${y}-${m}-${d}`,
          source: 'aladhan',
          qiblaBearing: Math.round(calculateQibla(latitude, longitude) * 10) / 10
        };
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {}
        return result;
      }
    }
  } catch (err) {
    console.warn('Direct AlAdhan fetch failed, utilizing mathematical Ja\'fari astronomy:', err);
  }

  // 3. Mathematical astronomical fallback (Works 100% offline with zero quota)
  const fallback = calculateAstronomicalShiaTimes(latitude, longitude, date);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(fallback));
  } catch {}
  return fallback;
}

// Convert 24h "HH:MM" to 12h formatted "H:MM AM/PM"
export function format12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${period}`;
}

export type ShiaPrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'sunset' | 'maghrib' | 'isha' | 'midnight';

export interface NextPrayerInfo {
  key: ShiaPrayerKey;
  nameEn: string;
  nameAr: string;
  timeStr: string;
  time12: string;
  isAdhanTime: boolean; // True for Fajr, Dhuhr, Maghrib
  remainingSeconds: number;
  formattedCountdown: string;
}

export const SHIA_PRAYER_NAMES: Record<ShiaPrayerKey, { en: string; ar: string; isAdhan: boolean }> = {
  fajr: { en: 'Fajr (Subh)', ar: 'الفجر', isAdhan: true },
  sunrise: { en: 'Sunrise (Tulu)', ar: 'الشروق', isAdhan: false },
  dhuhr: { en: 'Dhuhr (Zuhr)', ar: 'الظهر', isAdhan: true },
  asr: { en: 'Asr', ar: 'العصر', isAdhan: false },
  sunset: { en: 'Sunset (Ghurub)', ar: 'الغروب', isAdhan: false },
  maghrib: { en: 'Maghrib', ar: 'المغرب', isAdhan: true },
  isha: { en: 'Isha', ar: 'العشاء', isAdhan: false },
  midnight: { en: 'Midnight (Nisf al-Layl)', ar: 'منتصف الليل', isAdhan: false }
};

// Calculate next upcoming Shia prayer and remaining countdown
export function getNextShiaPrayer(timings: ShiaPrayerTimings, now: Date = new Date()): NextPrayerInfo {
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const orderedPrayers: ShiaPrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha', 'midnight'];

  for (const key of orderedPrayers) {
    const timeStr = timings[key];
    if (!timeStr) continue;
    const [h, m] = timeStr.split(':').map((n) => parseInt(n, 10));
    const targetSeconds = h * 3600 + m * 60;

    if (targetSeconds > currentSeconds) {
      const remainingSeconds = targetSeconds - currentSeconds;
      const hours = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      const secs = Math.floor(remainingSeconds % 60);
      const formattedCountdown = `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;

      return {
        key,
        nameEn: SHIA_PRAYER_NAMES[key].en,
        nameAr: SHIA_PRAYER_NAMES[key].ar,
        timeStr,
        time12: format12Hour(timeStr),
        isAdhanTime: SHIA_PRAYER_NAMES[key].isAdhan,
        remainingSeconds,
        formattedCountdown
      };
    }
  }

  // If past midnight, next is tomorrow's Fajr
  const [fajrH, fajrM] = timings.fajr.split(':').map((n) => parseInt(n, 10));
  const tomorrowFajrSeconds = 24 * 3600 + fajrH * 3600 + fajrM * 60;
  const remainingSeconds = tomorrowFajrSeconds - currentSeconds;
  const hours = Math.floor(remainingSeconds / 3600);
  const mins = Math.floor((remainingSeconds % 3600) / 60);
  const secs = Math.floor(remainingSeconds % 60);

  return {
    key: 'fajr',
    nameEn: SHIA_PRAYER_NAMES.fajr.en,
    nameAr: SHIA_PRAYER_NAMES.fajr.ar,
    timeStr: timings.fajr,
    time12: format12Hour(timings.fajr),
    isAdhanTime: true,
    remainingSeconds,
    formattedCountdown: `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
  };
}

// Calculate the seasonal shift (in minutes) between two dates to compensate for yearly solar variation
export function calculatePrayerShift(time1: string, time2: string): number {
  if (!time1 || !time2) return 0;
  const [h1, m1] = time1.split(':').map((n) => parseInt(n, 10));
  const [h2, m2] = time2.split(':').map((n) => parseInt(n, 10));
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

// Get solar astronomical parameters for the day of the year (showing axial tilt compensation)
export function getSolarSeasonInfo(date: Date = new Date()) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const jd = getJulianDate(date);
  const { declination, eqTime } = getSolarCoordinates(jd);

  let seasonName = 'Spring / Equinox Period';
  if (declination > 15) seasonName = 'Summer Solstice Arc (Longer Days)';
  else if (declination > 0) seasonName = 'Northern Ascent';
  else if (declination < -15) seasonName = 'Winter Solstice Arc (Shorter Days)';
  else seasonName = 'Autumnal Equinox Arc';

  return {
    dayOfYear,
    declinationDeg: Math.round(declination * 10) / 10,
    equationOfTimeMinutes: Math.round(eqTime * 60 * 10) / 10,
    seasonName
  };
}

export interface YearlyMilestone {
  label: string;
  dateStr: string;
  description: string;
  fajr: string;
  dhuhr: string;
  maghrib: string;
}

// Computes key astronomical solar milestones for the given year and location
export function getYearlyAdhanMilestones(
  latitude: number,
  longitude: number,
  year: number = new Date().getFullYear()
): YearlyMilestone[] {
  const milestones = [
    { label: 'Vernal Equinox (Spring)', month: 2, day: 20, desc: 'Equal day and night; solar ascent northward' },
    { label: 'Summer Solstice (Longest Day)', month: 5, day: 21, desc: 'Maximum solar declination (+23.4°); earliest Fajr' },
    { label: 'Autumnal Equinox (Fall)', month: 8, day: 22, desc: 'Second crossing; day length rapidly changing' },
    { label: 'Winter Solstice (Shortest Day)', month: 11, day: 21, desc: 'Minimum solar declination (-23.4°); latest Fajr / earliest Maghrib' }
  ];

  return milestones.map((m) => {
    const d = new Date(year, m.month, m.day);
    const times = calculateAstronomicalShiaTimes(latitude, longitude, d);
    return {
      label: m.label,
      dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      description: m.desc,
      fajr: times.fajr,
      dhuhr: times.dhuhr,
      maghrib: times.maghrib
    };
  });
}

