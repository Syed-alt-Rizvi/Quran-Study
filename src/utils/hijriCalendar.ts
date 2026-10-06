import eventsData from '../data/shiaCalendarEvents.json';
import { ShiaCalendarEvent, HijriDate, CalendarDay, HijriMonthInfo } from '../types/calendar';

export const SHIA_CALENDAR_EVENTS: ShiaCalendarEvent[] = eventsData as ShiaCalendarEvent[];

export const HIJRI_MONTHS: HijriMonthInfo[] = [
  {
    number: 1,
    nameEn: 'Muharram',
    nameAr: 'مُحَرَّمُ الْحَرَام',
    nameUr: 'محرم الحرام',
    isSacred: true,
    description: 'The first month of the Islamic calendar, sacred and marked by the eternal mourning for Sayyid al-Shuhada Imam al-Hussain (a.s) and the martyrs of Karbala.',
    virtues: 'A month of reflection, tears, mourning, and devotion. Recommended to hold Majalis, recite Ziyarat Ashura, and refrain from festivities.'
  },
  {
    number: 2,
    nameEn: 'Safar',
    nameAr: 'صَفَرُ الْمُظَفَّر',
    nameUr: 'صفر المظفر',
    isSacred: false,
    description: 'The second month, encompassing the Arbaeen (40th) of Imam al-Hussain (a.s), the martyrdom of Imam Hasan al-Mujtaba (a.s), and the passing of Prophet Muhammad (s.a.w).',
    virtues: 'Marked by the grand million-man walk of Arbaeen to Karbala, giving charity, and solemn commemoration of the demise of the Holy Prophet (s.a.w).'
  },
  {
    number: 3,
    nameEn: 'Rabi al-Awwal',
    nameAr: 'رَبِيعُ الْأَوَّل',
    nameUr: 'ربیع الاول',
    isSacred: false,
    description: 'The month of celestial light and joy, featuring the Birth of Prophet Muhammad (s.a.w), Imam Ja\'far al-Sadiq (a.s), and Eid al-Zahra (a.s).',
    virtues: 'A blessed month celebrated across the Shia world with Islamic Unity Week, sending abundant Salawat, wearing joyful clothes, and spiritual gatherings.'
  },
  {
    number: 4,
    nameEn: 'Rabi al-Thani',
    nameAr: 'رَبِيعُ الثَّانِي',
    nameUr: 'ربیع الثانی',
    isSacred: false,
    description: 'The fourth month, marking the blessed Wiladat of the 11th Imam, Imam Hasan al-Askari (a.s), and the passing of Fatima al-Masuma of Qom (s.a).',
    virtues: 'Dedicated to commemorating the heritage of the Askari Imams and seeking knowledge.'
  },
  {
    number: 5,
    nameEn: 'Jumada al-Ula',
    nameAr: 'جُمَادَىٰ الْأُولَىٰ',
    nameUr: 'جمادی الاولیٰ',
    isSacred: false,
    description: 'The fifth month, beginning the solemn commemorations of Ayyam-e-Fatimiyya and honoring the Wiladat of the Heroine of Karbala, Lady Zainab (s.a).',
    virtues: 'Commemoration of the virtues of Lady Fatima al-Zahra (s.a) and Lady Zainab (s.a).'
  },
  {
    number: 6,
    nameEn: 'Jumada al-Thani',
    nameAr: 'جُمَادَىٰ الآخِرَة',
    nameUr: 'جمادی الثانی',
    isSacred: false,
    description: 'The sixth month, including the grand Wiladat of Lady Fatima al-Zahra (s.a), Mother\'s Day, and the passing of Lady Umm al-Banin (s.a).',
    virtues: 'Honoring women, mothers, daughters, and the Leader of the Women of Paradise, Fatima al-Zahra (s.a).'
  },
  {
    number: 7,
    nameEn: 'Rajab',
    nameAr: 'رَجَبُ الْمُرَجَّب',
    nameUr: 'رجب المرجب',
    isSacred: true,
    description: 'The Grand Month of Allah, a sacred sanctuary featuring the Wiladat of Amir al-Mu\'minin Imam Ali (a.s) inside the Kaaba and Eid al-Mab\'ath.',
    virtues: 'Fasting in Rajab carries extraordinary spiritual rewards. A time for Istighfar, Umrah, reciting Dua Rajab, and spiritual renewal.'
  },
  {
    number: 8,
    nameEn: 'Sha\'ban',
    nameAr: 'شَعْبَانُ الْمُعَظَّم',
    nameUr: 'شعبان المعظم',
    isSacred: false,
    description: 'The Month of the Holy Prophet (s.a.w), radiating with the divine birthdays of Imam al-Hussain, Hazrat Abbas, Imam Zayn al-Abidin, and the 12th Imam al-Mahdi (a.j.f.s).',
    virtues: 'Night of 15th Sha\'ban (Shab-e-Barat) is equivalent to Laylat al-Qadr in granting forgiveness and salvation. Constant Salawat and fasting are recommended.'
  },
  {
    number: 9,
    nameEn: 'Ramadan',
    nameAr: 'شَهْرُ رَمَضَانَ الْمُبَارَك',
    nameUr: 'رمضان المبارک',
    isSacred: false,
    description: 'The Holiest Month of Allah, the month of the Holy Quran, obligatory fasting, the Nights of Power (Laylat al-Qadr), and the martyrdom of Imam Ali (a.s).',
    virtues: 'Doors of Heaven are flung wide open. Reciting a single ayah in Ramadan equals completing the entire Quran in other months.'
  },
  {
    number: 10,
    nameEn: 'Shawwal',
    nameAr: 'شَوَّالُ الْمُكَرَّم',
    nameUr: 'شوال المکرم',
    isSacred: false,
    description: 'The tenth month, opening with Eid al-Fitr and the payment of Zakat al-Fitrah, and commemorating the martyrdom of the founder of the Ja\'fari school, Imam Ja\'far al-Sadiq (a.s).',
    virtues: 'Fasting on the 1st of Shawwal (Eid) is forbidden (Haram). Offering Eid prayer and preserving the piety acquired during Ramadan.'
  },
  {
    number: 11,
    nameEn: 'Dhul Qa\'dah',
    nameAr: 'ذُو الْقَعْدَةِ الْحَرَام',
    nameUr: 'ذوالقعدۃ الحرام',
    isSacred: true,
    description: 'The sacred month of peace and preparation for Hajj, featuring the Wiladat of Imam Ali al-Rida (a.s) in Mashhad and the sacred day of Dahwul Ardh (25th).',
    virtues: 'One of the four sacred months. Dahwul Ardh fast equals 70 years of worship. Sunday repentance prayers (Salat al-Tawbah) carry special merit.'
  },
  {
    number: 12,
    nameEn: 'Dhul Hijjah',
    nameAr: 'ذُو الْحِجَّةِ الْحَرَام',
    nameUr: 'ذوالحجۃ الحرام',
    isSacred: true,
    description: 'The crown of the Islamic year: Hajj pilgrimage, Day of Arafah, Eid al-Adha, Eid al-Ghadir (The Greatest Eid), and Eid al-Mubahala.',
    virtues: 'Contains the most glorious days of Wilayah, divine confirmation of Imam Ali (a.s), and acceptance of supplications.'
  }
];

export function getHijriMonthInfo(monthNumber: number): HijriMonthInfo {
  const normalized = ((monthNumber - 1) % 12 + 12) % 12 + 1;
  return HIJRI_MONTHS.find(m => m.number === normalized) || HIJRI_MONTHS[0];
}

// ---------------------------------------------------------------------------
// High-Speed Pre-Indexed Event Hash Map with Priority Sorting (O(1) lookups)
// ---------------------------------------------------------------------------
const eventsByHijriDate = new Map<string, ShiaCalendarEvent[]>();

const EVENT_TYPE_PRIORITY: Record<string, number> = {
  eid: 1,
  celebration: 2,
  urs: 3,
  commemoration: 3,
  fasting: 4,
  other: 5
};

for (const ev of SHIA_CALENDAR_EVENTS) {
  const key = `${ev.hijriMonth}-${ev.hijriDay}`;
  const list = eventsByHijriDate.get(key) || [];
  list.push(ev);
  list.sort((a, b) => {
    const pA = EVENT_TYPE_PRIORITY[a.type] || 99;
    const pB = EVENT_TYPE_PRIORITY[b.type] || 99;
    return pA - pB;
  });
  eventsByHijriDate.set(key, list);
}

// ---------------------------------------------------------------------------
// Reused Singleton Formatter & LRU-style Date Cache for 0ms Lag-Free Navigation
// ---------------------------------------------------------------------------
let cachedFormatter: Intl.DateTimeFormat | null = null;
function getCachedHijriFormatter(): Intl.DateTimeFormat {
  if (!cachedFormatter) {
    try {
      cachedFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
    } catch {
      cachedFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-nu-latn', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
    }
  }
  return cachedFormatter;
}

const hijriDateCache = new Map<string, HijriDate>();

/**
 * Converts a Gregorian Date into a HijriDate with customizable moon-sighting offset (-2 to +2).
 * Zero-lag implementation utilizing singleton Intl formatter and fast memory cache.
 */
export function getHijriDate(date: Date, offsetDays = 0): HijriDate {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const cacheKey = `${y}-${m}-${d}-${offsetDays}`;

  const cached = hijriDateCache.get(cacheKey);
  if (cached) return cached;

  try {
    const adjusted = new Date(date.getTime() + offsetDays * 86400000);
    const formatter = getCachedHijriFormatter();
    const parts = formatter.formatToParts(adjusted);
    let day = 1;
    let month = 1;
    let year = 1447;

    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value, 10);
      if (part.type === 'month') month = parseInt(part.value, 10);
      if (part.type === 'year') year = parseInt(part.value, 10);
    }

    const monthInfo = getHijriMonthInfo(month);
    const result: HijriDate = {
      year,
      month,
      day,
      monthNameEn: monthInfo.nameEn,
      monthNameAr: monthInfo.nameAr,
      monthNameUr: monthInfo.nameUr,
      formatted: `${day} ${monthInfo.nameEn} ${year} AH`
    };

    // Cache result (capped at 500 items to conserve memory)
    if (hijriDateCache.size > 500) {
      hijriDateCache.clear();
    }
    hijriDateCache.set(cacheKey, result);
    return result;
  } catch {
    const monthInfo = getHijriMonthInfo(1);
    const fallback: HijriDate = {
      year: 1447,
      month: 1,
      day: 1,
      monthNameEn: monthInfo.nameEn,
      monthNameAr: monthInfo.nameAr,
      monthNameUr: monthInfo.nameUr,
      formatted: `1 ${monthInfo.nameEn} 1447 AH`
    };
    return fallback;
  }
}

/**
 * Returns all events associated with a specific Hijri month and day.
 * Instant O(1) indexed lookup with priority sorting.
 */
export function getEventsForHijriDate(month: number, day: number): ShiaCalendarEvent[] {
  return eventsByHijriDate.get(`${month}-${day}`) || [];
}

/**
 * Returns all events for a given Gregorian date with the applied Hijri offset.
 */
export function getEventsForGregorianDate(date: Date, offsetDays = 0): {
  hijri: HijriDate;
  events: ShiaCalendarEvent[];
} {
  const hijri = getHijriDate(date, offsetDays);
  const events = getEventsForHijriDate(hijri.month, hijri.day);
  return { hijri, events };
}

/**
 * Generates the full day matrix for a Gregorian calendar month (6 weeks x 7 days)
 * with attached Hijri date and Shia events for each day.
 * High-performance optimized.
 */
export function getCalendarMonthDays(year: number, monthZeroIndexed: number, offsetDays = 0): CalendarDay[] {
  const firstDay = new Date(year, monthZeroIndexed, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday...
  const daysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();
  
  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const days: CalendarDay[] = [];

  // Previous month trailing days
  const prevMonthLastDate = new Date(year, monthZeroIndexed, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, monthZeroIndexed - 1, prevMonthLastDate - i);
    const hijri = getHijriDate(d, offsetDays);
    const events = getEventsForHijriDate(hijri.month, hijri.day);
    days.push({
      date: d,
      gregorianYear: d.getFullYear(),
      gregorianMonth: d.getMonth() + 1,
      gregorianDay: d.getDate(),
      hijri,
      isToday: d.getTime() === todayDateOnly,
      isCurrentMonth: false,
      events
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, monthZeroIndexed, dayNum);
    const hijri = getHijriDate(d, offsetDays);
    const events = getEventsForHijriDate(hijri.month, hijri.day);
    days.push({
      date: d,
      gregorianYear: year,
      gregorianMonth: monthZeroIndexed + 1,
      gregorianDay: dayNum,
      hijri,
      isToday: d.getTime() === todayDateOnly,
      isCurrentMonth: true,
      events
    });
  }

  // Next month leading days to complete the 35 or 42 grid slots
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, monthZeroIndexed + 1, i);
    const hijri = getHijriDate(d, offsetDays);
    const events = getEventsForHijriDate(hijri.month, hijri.day);
    days.push({
      date: d,
      gregorianYear: d.getFullYear(),
      gregorianMonth: d.getMonth() + 1,
      gregorianDay: d.getDate(),
      hijri,
      isToday: d.getTime() === todayDateOnly,
      isCurrentMonth: false,
      events
    });
  }

  return days;
}

/**
 * Returns upcoming events over the next N days from today.
 */
export function getUpcomingEvents(daysAhead = 60, offsetDays = 0): {
  date: Date;
  hijri: HijriDate;
  event: ShiaCalendarEvent;
  daysUntil: number;
}[] {
  const results: {
    date: Date;
    hijri: HijriDate;
    event: ShiaCalendarEvent;
    daysUntil: number;
  }[] = [];

  const today = new Date();
  const baseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(baseTime + i * 86400000);
    const hijri = getHijriDate(d, offsetDays);
    const dayEvents = getEventsForHijriDate(hijri.month, hijri.day);
    for (const ev of dayEvents) {
      results.push({
        date: d,
        hijri,
        event: ev,
        daysUntil: i
      });
    }
  }

  return results;
}

/**
 * Returns today's active events and Islamic date.
 */
export function getTodayEvents(offsetDays = 0): {
  hijri: HijriDate;
  events: ShiaCalendarEvent[];
} {
  return getEventsForGregorianDate(new Date(), offsetDays);
}

/**
 * Returns tomorrow's active events and Islamic date.
 */
export function getTomorrowEvents(offsetDays = 0): {
  hijri: HijriDate;
  events: ShiaCalendarEvent[];
} {
  const tomorrow = new Date(Date.now() + 86400000);
  return getEventsForGregorianDate(tomorrow, offsetDays);
}
