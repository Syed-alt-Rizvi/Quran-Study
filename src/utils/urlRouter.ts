import staticSurahs from '../surahList.json';

export type AppRoute =
  | { type: 'surah'; surahId: number; targetAyah?: number }
  | { type: 'juz'; juzId: number }
  | { type: 'mafatih-item'; itemId: string }
  | { type: 'home'; tab: 'quran' | 'mafatih' | 'adhan' | 'calendar' | 'qibla' | 'discuss' }
  | { type: 'settings' };

const surahMap = new Map<number, (typeof staticSurahs)[0]>();
if (Array.isArray(staticSurahs)) {
  for (const s of staticSurahs) {
    surahMap.set(s.number, s);
  }
}

/**
 * Parse current browser URL into a structured AppRoute.
 * Supports clean path routes (/surah/1, /juz/30, /mafatih/ziyarat-ashura, /adhan)
 * and falls back gracefully to legacy #hash bookmarks.
 */
export function parseCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') {
    return { type: 'home', tab: 'quran' };
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, '').trim();

  // 1. Check clean pathname
  if (pathname.startsWith('/surah/')) {
    const rawId = pathname.replace('/surah/', '');
    const surahId = parseInt(rawId, 10);
    const ayahParam = searchParams.get('ayah');
    const targetAyah = ayahParam ? parseInt(ayahParam, 10) : undefined;
    if (!isNaN(surahId) && surahId >= 1 && surahId <= 114) {
      return { type: 'surah', surahId, targetAyah: targetAyah && !isNaN(targetAyah) ? targetAyah : undefined };
    }
  }

  if (pathname.startsWith('/juz/')) {
    const rawId = pathname.replace('/juz/', '');
    const juzId = parseInt(rawId, 10);
    if (!isNaN(juzId) && juzId >= 1 && juzId <= 30) {
      return { type: 'juz', juzId };
    }
  }

  if (pathname.startsWith('/mafatih/')) {
    const itemId = pathname.replace('/mafatih/', '').trim();
    if (itemId) {
      return { type: 'mafatih-item', itemId };
    }
  }

  if (pathname === '/mafatih') return { type: 'home', tab: 'mafatih' };
  if (pathname === '/adhan' || pathname === '/prayer-times') return { type: 'home', tab: 'adhan' };
  if (pathname === '/calendar' || pathname === '/events') return { type: 'home', tab: 'calendar' };
  if (pathname === '/qibla') return { type: 'home', tab: 'qibla' };
  if (pathname === '/discussions' || pathname === '/discuss') return { type: 'home', tab: 'discuss' };
  if (pathname === '/settings') return { type: 'settings' };

  // 2. Check legacy hash fallback (#surah-1, #juz-1, #mafatih-ziyarat-ashura)
  if (hash) {
    if (hash.startsWith('surah-')) {
      const parts = hash.split('-');
      const sId = parseInt(parts[1], 10);
      const aIdx = hash.indexOf('-ayah-');
      const aId = aIdx !== -1 ? parseInt(hash.substring(aIdx + 6), 10) : undefined;
      if (!isNaN(sId) && sId >= 1 && sId <= 114) {
        return { type: 'surah', surahId: sId, targetAyah: aId && !isNaN(aId) ? aId : undefined };
      }
    } else if (hash.startsWith('juz-')) {
      const jId = parseInt(hash.replace('juz-', ''), 10);
      if (!isNaN(jId) && jId >= 1 && jId <= 30) {
        return { type: 'juz', juzId: jId };
      }
    } else if (hash.startsWith('mafatih-')) {
      const mId = hash.replace('mafatih-', '');
      if (mId) {
        return { type: 'mafatih-item', itemId: mId };
      }
    } else if (hash === 'settings') {
      return { type: 'settings' };
    }
  }

  return { type: 'home', tab: 'quran' };
}

/**
 * Generate metadata and page title based on the route.
 */
export function getRouteMeta(route: AppRoute): { title: string; description: string; path: string } {
  switch (route.type) {
    case 'surah': {
      const s = surahMap.get(route.surahId);
      const name = s ? `${s.englishName} (${s.englishNameTranslation})` : `Surah ${route.surahId}`;
      const ayahText = route.targetAyah ? ` - Ayah ${route.targetAyah}` : '';
      return {
        title: `Surah ${name}${ayahText} - Holy Quran & Shia Tafseer - Shia Markaz`,
        description: `Read and listen to Surah ${name} with authentic Shia Tafseer (Tafseer-e-Namoona & Al-Kauthar), word-by-word translations, and high-speed audio recitations.`,
        path: route.targetAyah ? `/surah/${route.surahId}?ayah=${route.targetAyah}` : `/surah/${route.surahId}`
      };
    }
    case 'juz': {
      return {
        title: `Juz ${route.juzId} - Holy Quran Recitation - Shia Markaz`,
        description: `Read and listen to Juz ${route.juzId} of the Holy Quran with verse-by-verse recitation and authentic Shia commentary.`,
        path: `/juz/${route.juzId}`
      };
    }
    case 'mafatih-item': {
      const formattedTitle = route.itemId
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return {
        title: `${formattedTitle} - Mafatih al-Jinan - Shia Markaz`,
        description: `Recite ${formattedTitle} with authentic Arabic text, Urdu and English translations, step-by-step reading methods, and audio recitations from Mafatih al-Jinan.`,
        path: `/mafatih/${route.itemId}`
      };
    }
    case 'home': {
      switch (route.tab) {
        case 'mafatih':
          return {
            title: `Mafatih al-Jinan - Shia Duas, Ziyarats & A'mal - Shia Markaz`,
            description: `Comprehensive digital edition of Mafatih al-Jinan by Sheikh Abbas Qummi featuring Daily Duas, Munajat, Ziyarat of Ahlulbayt (a.s), and A'mal for holy months.`,
            path: `/mafatih`
          };
        case 'adhan':
          return {
            title: `Shia Adhan & Prayer Times (Leap Year Accurate) - Shia Markaz`,
            description: `Precise Shia prayer times calculated according to the Leva Institute, Qum with GPS location tracking, monthly timetables, and automated Adhan reminders.`,
            path: `/adhan`
          };
        case 'calendar':
          return {
            title: `Shia Islamic Hijri Calendar & Ahlulbayt Events - Shia Markaz`,
            description: `Complete Shia Hijri Calendar tracking Wiladat, Shahadat, and sacred Islamic historical events with dynamic moon-sighting offset adjustments.`,
            path: `/calendar`
          };
        case 'qibla':
          return {
            title: `Qibla Finder & Kaaba Compass - Shia Markaz`,
            description: `Accurate real-time Kaaba direction and compass using device GPS and magnetic sensors.`,
            path: `/qibla`
          };
        case 'discuss':
          return {
            title: `Global Shia Community Discussions - Shia Markaz`,
            description: `Connect, ask spiritual questions, and engage in meaningful theological reflections with the global Shia community.`,
            path: `/discussions`
          };
        case 'quran':
        default:
          return {
            title: `The Holy Quran & Shia Tafseer - Shia Markaz`,
            description: `The complete Holy Quran with authentic Shia Tafseer (Tafseer-e-Namoona & Al-Kauthar), Mafatih al-Jinan, precise Shia Adhan prayer times, and Islamic calendar.`,
            path: `/`
          };
      }
    }
    case 'settings':
      return {
        title: `Settings - Shia Markaz`,
        description: `Personalize your Shia Markaz experience: font sizes, reciters, Shia prayer calculation methods, language preferences, and audio speed.`,
        path: `/settings`
      };
  }
}

/**
 * Synchronize browser URL, document.title, and meta description seamlessly.
 */
export function updateBrowserRoute(route: AppRoute, replace: boolean = false) {
  if (typeof window === 'undefined') return;

  const meta = getRouteMeta(route);

  // Update URL without reloading page
  const currentPathWithSearch = window.location.pathname + window.location.search;
  if (currentPathWithSearch !== meta.path) {
    if (replace) {
      window.history.replaceState({ route }, meta.title, meta.path);
    } else {
      window.history.pushState({ route }, meta.title, meta.path);
    }
  }

  // Update document title
  document.title = meta.title;

  // Update meta tags
  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) {
    descEl.setAttribute('content', meta.description);
  }

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', meta.title);
  }

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', meta.description);
  }

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', `${window.location.origin}${meta.path}`);
  }
}
