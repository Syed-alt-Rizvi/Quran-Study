export interface CityPreset {
  id: string;
  name: string;
  nameArabic: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours
}

export const SHIA_HOLY_CITIES: CityPreset[] = [
  { id: "kadhimiya", name: "Al-Kadhimiya (Baghdad)", nameArabic: "الكاظمية المقدسة", country: "Iraq", latitude: 33.3804, longitude: 44.3414, timezone: 3 },
  { id: "najaf", name: "Najaf Al-Ashraf", nameArabic: "النجف الأشرف", country: "Iraq", latitude: 31.9957, longitude: 44.3148, timezone: 3 },
  { id: "karbala", name: "Karbala Al-Muqaddasa", nameArabic: "كربلاء المقدسة", country: "Iraq", latitude: 32.6160, longitude: 44.0249, timezone: 3 },
  { id: "qum", name: "Qum Al-Muqaddasa", nameArabic: "قم المقدسة", country: "Iran", latitude: 34.6399, longitude: 50.8759, timezone: 3.5 },
  { id: "mashhad", name: "Mashhad Al-Rida", nameArabic: "مشهد المقدسة", country: "Iran", latitude: 36.2972, longitude: 59.6067, timezone: 3.5 },
  { id: "samarra", name: "Samarra", nameArabic: "سامراء", country: "Iraq", latitude: 34.1983, longitude: 43.8742, timezone: 3 },
  { id: "beirut", name: "Beirut", nameArabic: "بيروت", country: "Lebanon", latitude: 33.8938, longitude: 35.5018, timezone: 3 },
  { id: "damascus", name: "Damascus (Sayyida Zaynab)", nameArabic: "دمشق / السيدة زينب", country: "Syria", latitude: 33.4475, longitude: 36.3400, timezone: 3 },
  { id: "medina", name: "Al-Madinah Al-Munawwarah", nameArabic: "المدينة المنورة", country: "Saudi Arabia", latitude: 24.4686, longitude: 39.6142, timezone: 3 },
  { id: "london", name: "London", nameArabic: "لندن", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, timezone: 1 },
  { id: "dearborn", name: "Dearborn", nameArabic: "ديربورن", country: "United States", latitude: 42.3223, longitude: -83.1763, timezone: -4 },
  { id: "newyork", name: "New York", nameArabic: "نيويورك", country: "United States", latitude: 40.7128, longitude: -74.0060, timezone: -4 },
  { id: "karachi", name: "Karachi", nameArabic: "كراتشي", country: "Pakistan", latitude: 24.8607, longitude: 67.0011, timezone: 5 },
  { id: "mumbai", name: "Mumbai", nameArabic: "مومباي", country: "India", latitude: 19.0760, longitude: 72.8777, timezone: 5.5 },
  { id: "sydney", name: "Sydney", nameArabic: "سيدني", country: "Australia", latitude: -33.8688, longitude: 151.2093, timezone: 10 }
];

export interface ShiaPrayerSchedule {
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
  midnight: string;
}

// Astronomical calculation using Shia Ithna-Ashari Parameters (Leva Institute / Qum)
export function calculateShiaPrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  utcOffsetHours: number
): ShiaPrayerSchedule {
  // Day of year
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Solar declination (approximate Spencer formula)
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const declination = 23.45 * Math.sin(b);
  const declRad = (declination * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  // Equation of time in minutes
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  // Solar noon in local time
  const solarNoonMinutes = 720 - 4 * longitude - eot + utcOffsetHours * 60;

  // Hour angle helper
  const hourAngle = (angle: number): number => {
    const angleRad = (angle * Math.PI) / 180;
    const cosH = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
    if (cosH > 1) return 0;
    if (cosH < -1) return Math.PI;
    return Math.acos(cosH);
  };

  // Shia angles:
  // Fajr: 16 degrees below horizon (i.e. angle = -16)
  const hFajr = hourAngle(-16) * (180 / Math.PI) * 4;
  // Sunrise: 0.833 degrees below horizon
  const hSunrise = hourAngle(-0.833) * (180 / Math.PI) * 4;
  // Sunset: 0.833 degrees below horizon
  const hSunset = hourAngle(-0.833) * (180 / Math.PI) * 4;
  // Maghrib: 4.0 degrees below horizon (humrah mashriqiyyah disappearance)
  const hMaghrib = hourAngle(-4.0) * (180 / Math.PI) * 4;
  // Isha: 14.0 degrees below horizon
  const hIsha = hourAngle(-14.0) * (180 / Math.PI) * 4;

  const dhuhrMin = solarNoonMinutes;
  const fajrMin = dhuhrMin - hFajr;
  const imsakMin = fajrMin - 10;
  const sunriseMin = dhuhrMin - hSunrise;
  const sunsetMin = dhuhrMin + hSunset;
  const maghribMin = dhuhrMin + hMaghrib;
  const asrMin = dhuhrMin + 180; // Standard Asr window
  const ishaMin = dhuhrMin + hIsha;
  // Shia Midnight (Nisf al-Layl) is midpoint between Sunset and Fajr of next morning
  const midnightMin = sunsetMin + (fajrMin + 1440 - sunsetMin) / 2;

  const formatMin = (m: number): string => {
    let normalized = Math.round(m) % 1440;
    if (normalized < 0) normalized += 1440;
    const hrs = Math.floor(normalized / 60);
    const mins = normalized % 60;
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    return `${displayHrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  return {
    imsak: formatMin(imsakMin),
    fajr: formatMin(fajrMin),
    sunrise: formatMin(sunriseMin),
    dhuhr: formatMin(dhuhrMin),
    asr: formatMin(asrMin),
    sunset: formatMin(sunsetMin),
    maghrib: formatMin(maghribMin),
    isha: formatMin(ishaMin),
    midnight: formatMin(midnightMin)
  };
}
