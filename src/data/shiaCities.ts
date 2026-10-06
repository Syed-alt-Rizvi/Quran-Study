export interface CityData {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isHolySite?: boolean;
}

export const POPULAR_CITIES: CityData[] = [
  // Holy Sites & Shrines
  { name: 'Karbala', country: 'Iraq', latitude: 32.6160, longitude: 44.0249, timezone: 'Asia/Baghdad', isHolySite: true },
  { name: 'Najaf', country: 'Iraq', latitude: 32.0000, longitude: 44.3333, timezone: 'Asia/Baghdad', isHolySite: true },
  { name: 'Mashhad', country: 'Iran', latitude: 36.2972, longitude: 59.6067, timezone: 'Asia/Tehran', isHolySite: true },
  { name: 'Qum', country: 'Iran', latitude: 34.6416, longitude: 50.8746, timezone: 'Asia/Tehran', isHolySite: true },
  { name: 'Kufa', country: 'Iraq', latitude: 32.0294, longitude: 44.4022, timezone: 'Asia/Baghdad', isHolySite: true },
  { name: 'Samarra', country: 'Iraq', latitude: 34.1983, longitude: 43.8742, timezone: 'Asia/Baghdad', isHolySite: true },
  { name: 'Kadhimayn (Baghdad)', country: 'Iraq', latitude: 33.3797, longitude: 44.3411, timezone: 'Asia/Baghdad', isHolySite: true },
  { name: 'Medina', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh', isHolySite: true },
  { name: 'Mecca', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 'Asia/Riyadh', isHolySite: true },
  { name: 'Damascus', country: 'Syria', latitude: 33.5138, longitude: 36.2765, timezone: 'Asia/Damascus', isHolySite: true },

  // Middle East & Levant
  { name: 'Baghdad', country: 'Iraq', latitude: 33.3152, longitude: 44.3661, timezone: 'Asia/Baghdad' },
  { name: 'Basra', country: 'Iraq', latitude: 30.5081, longitude: 47.7835, timezone: 'Asia/Baghdad' },
  { name: 'Hillah', country: 'Iraq', latitude: 32.4637, longitude: 44.4312, timezone: 'Asia/Baghdad' },
  { name: 'Nasiriyah', country: 'Iraq', latitude: 31.0579, longitude: 46.2573, timezone: 'Asia/Baghdad' },
  { name: 'Erbil', country: 'Iraq', latitude: 36.1911, longitude: 44.0092, timezone: 'Asia/Baghdad' },
  { name: 'Sulaymaniyah', country: 'Iraq', latitude: 35.5649, longitude: 45.4338, timezone: 'Asia/Baghdad' },
  { name: 'Tehran', country: 'Iran', latitude: 35.6892, longitude: 51.3890, timezone: 'Asia/Tehran' },
  { name: 'Isfahan', country: 'Iran', latitude: 32.6546, longitude: 51.6680, timezone: 'Asia/Tehran' },
  { name: 'Shiraz', country: 'Iran', latitude: 29.5918, longitude: 52.5837, timezone: 'Asia/Tehran' },
  { name: 'Tabriz', country: 'Iran', latitude: 38.0800, longitude: 46.2919, timezone: 'Asia/Tehran' },
  { name: 'Ahvaz', country: 'Iran', latitude: 31.3183, longitude: 48.6706, timezone: 'Asia/Tehran' },
  { name: 'Kermanshah', country: 'Iran', latitude: 34.3277, longitude: 47.0778, timezone: 'Asia/Tehran' },
  { name: 'Beirut', country: 'Lebanon', latitude: 33.8938, longitude: 35.5018, timezone: 'Asia/Beirut' },
  { name: 'Sidon (Saida)', country: 'Lebanon', latitude: 33.5599, longitude: 35.3756, timezone: 'Asia/Beirut' },
  { name: 'Tyre (Sour)', country: 'Lebanon', latitude: 33.2721, longitude: 35.2038, timezone: 'Asia/Beirut' },
  { name: 'Baalbek', country: 'Lebanon', latitude: 34.0058, longitude: 36.2181, timezone: 'Asia/Beirut' },
  { name: 'Nabatieh', country: 'Lebanon', latitude: 33.3789, longitude: 35.4839, timezone: 'Asia/Beirut' },
  { name: 'Qatif', country: 'Saudi Arabia', latitude: 26.5654, longitude: 50.0089, timezone: 'Asia/Riyadh' },
  { name: 'Dammam', country: 'Saudi Arabia', latitude: 26.4207, longitude: 50.0888, timezone: 'Asia/Riyadh' },
  { name: 'Al-Ahsa (Hofuf)', country: 'Saudi Arabia', latitude: 25.3644, longitude: 49.5855, timezone: 'Asia/Riyadh' },
  { name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
  { name: 'Jeddah', country: 'Saudi Arabia', latitude: 21.5433, longitude: 39.1728, timezone: 'Asia/Riyadh' },
  { name: 'Manama', country: 'Bahrain', latitude: 26.2285, longitude: 50.5860, timezone: 'Asia/Bahrain' },
  { name: 'Kuwait City', country: 'Kuwait', latitude: 29.3759, longitude: 47.9774, timezone: 'Asia/Kuwait' },
  { name: 'Muscat', country: 'Oman', latitude: 23.5880, longitude: 58.3829, timezone: 'Asia/Muscat' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4539, longitude: 54.3773, timezone: 'Asia/Dubai' },
  { name: 'Sharjah', country: 'United Arab Emirates', latitude: 25.3463, longitude: 55.4209, timezone: 'Asia/Dubai' },
  { name: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.5310, timezone: 'Asia/Qatar' },

  // South Asia - India
  { name: 'Lucknow', country: 'India', latitude: 26.8467, longitude: 80.9462, timezone: 'Asia/Kolkata' },
  { name: 'Mumbai', country: 'India', latitude: 18.9220, longitude: 72.8347, timezone: 'Asia/Kolkata' },
  { name: 'Hyderabad', country: 'India', latitude: 17.3850, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata' },
  { name: 'Srinagar (Kashmir)', country: 'India', latitude: 34.0837, longitude: 74.7973, timezone: 'Asia/Kolkata' },
  { name: 'Kargil', country: 'India', latitude: 34.5539, longitude: 76.1349, timezone: 'Asia/Kolkata' },
  { name: 'Leh', country: 'India', latitude: 34.1526, longitude: 77.5771, timezone: 'Asia/Kolkata' },
  { name: 'Amroha', country: 'India', latitude: 28.9044, longitude: 78.4684, timezone: 'Asia/Kolkata' },
  { name: 'Aligarh', country: 'India', latitude: 27.8974, longitude: 78.0880, timezone: 'Asia/Kolkata' },
  { name: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' },
  { name: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata' },
  { name: 'Chennai', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' },
  { name: 'Pune', country: 'India', latitude: 18.5204, longitude: 73.8567, timezone: 'Asia/Kolkata' },
  { name: 'Ahmedabad', country: 'India', latitude: 23.0225, longitude: 72.5714, timezone: 'Asia/Kolkata' },
  { name: 'Patna', country: 'India', latitude: 25.5941, longitude: 85.1376, timezone: 'Asia/Kolkata' },

  // South Asia - Pakistan
  { name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, timezone: 'Asia/Karachi' },
  { name: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587, timezone: 'Asia/Karachi' },
  { name: 'Islamabad', country: 'Pakistan', latitude: 33.6844, longitude: 73.0479, timezone: 'Asia/Karachi' },
  { name: 'Rawalpindi', country: 'Pakistan', latitude: 33.5651, longitude: 73.0169, timezone: 'Asia/Karachi' },
  { name: 'Quetta', country: 'Pakistan', latitude: 30.1798, longitude: 66.9750, timezone: 'Asia/Karachi' },
  { name: 'Peshawar', country: 'Pakistan', latitude: 34.0151, longitude: 71.5249, timezone: 'Asia/Karachi' },
  { name: 'Multan', country: 'Pakistan', latitude: 30.1575, longitude: 71.5249, timezone: 'Asia/Karachi' },
  { name: 'Skardu', country: 'Pakistan', latitude: 35.2971, longitude: 75.6337, timezone: 'Asia/Karachi' },
  { name: 'Gilgit', country: 'Pakistan', latitude: 35.9208, longitude: 74.3144, timezone: 'Asia/Karachi' },
  { name: 'Parachinar', country: 'Pakistan', latitude: 33.8992, longitude: 70.1008, timezone: 'Asia/Karachi' },
  { name: 'Faisalabad', country: 'Pakistan', latitude: 31.4504, longitude: 73.1350, timezone: 'Asia/Karachi' },

  // Central Asia & Caucasus
  { name: 'Baku', country: 'Azerbaijan', latitude: 40.4093, longitude: 49.8671, timezone: 'Asia/Baku' },
  { name: 'Ganja', country: 'Azerbaijan', latitude: 40.6828, longitude: 46.3606, timezone: 'Asia/Baku' },
  { name: 'Kabul', country: 'Afghanistan', latitude: 34.5553, longitude: 69.2075, timezone: 'Asia/Kabul' },
  { name: 'Herat', country: 'Afghanistan', latitude: 34.3529, longitude: 62.2040, timezone: 'Asia/Kabul' },
  { name: 'Mazar-i-Sharif', country: 'Afghanistan', latitude: 36.7090, longitude: 67.1109, timezone: 'Asia/Kabul' },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Ankara', country: 'Turkey', latitude: 39.9334, longitude: 32.8597, timezone: 'Europe/Istanbul' },

  // Europe
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Birmingham', country: 'United Kingdom', latitude: 52.4862, longitude: -1.8904, timezone: 'Europe/London' },
  { name: 'Manchester', country: 'United Kingdom', latitude: 53.4808, longitude: -2.2426, timezone: 'Europe/London' },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
  { name: 'Frankfurt', country: 'Germany', latitude: 50.1109, longitude: 8.6821, timezone: 'Europe/Berlin' },
  { name: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041, timezone: 'Europe/Amsterdam' },
  { name: 'Brussels', country: 'Belgium', latitude: 50.8503, longitude: 4.3517, timezone: 'Europe/Brussels' },
  { name: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738, timezone: 'Europe/Vienna' },
  { name: 'Stockholm', country: 'Sweden', latitude: 59.3293, longitude: 18.0686, timezone: 'Europe/Stockholm' },
  { name: 'Oslo', country: 'Norway', latitude: 59.9139, longitude: 10.7522, timezone: 'Europe/Oslo' },
  { name: 'Copenhagen', country: 'Denmark', latitude: 55.6761, longitude: 12.5683, timezone: 'Europe/Copenhagen' },

  // North America
  { name: 'Dearborn / Detroit', country: 'United States', latitude: 42.3223, longitude: -83.1763, timezone: 'America/Detroit' },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { name: 'Houston', country: 'United States', latitude: 29.7604, longitude: -95.3698, timezone: 'America/Chicago' },
  { name: 'Dallas', country: 'United States', latitude: 32.7767, longitude: -96.7970, timezone: 'America/Chicago' },
  { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
  { name: 'San Jose', country: 'United States', latitude: 37.3382, longitude: -121.8863, timezone: 'America/Los_Angeles' },
  { name: 'Washington D.C.', country: 'United States', latitude: 38.9072, longitude: -77.0369, timezone: 'America/New_York' },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { name: 'Montreal', country: 'Canada', latitude: 45.5017, longitude: -73.5673, timezone: 'America/Toronto' },
  { name: 'Vancouver', country: 'Canada', latitude: 49.2827, longitude: -123.1207, timezone: 'America/Vancouver' },
  { name: 'Calgary', country: 'Canada', latitude: 51.0447, longitude: -114.0719, timezone: 'America/Edmonton' },
  { name: 'Ottawa', country: 'Canada', latitude: 45.4215, longitude: -75.6972, timezone: 'America/Toronto' },

  // Australia & New Zealand
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631, timezone: 'Australia/Melbourne' },
  { name: 'Brisbane', country: 'Australia', latitude: -27.4698, longitude: 153.0251, timezone: 'Australia/Brisbane' },
  { name: 'Perth', country: 'Australia', latitude: -31.9505, longitude: 115.8605, timezone: 'Australia/Perth' },
  { name: 'Auckland', country: 'New Zealand', latitude: -36.8485, longitude: 174.7633, timezone: 'Pacific/Auckland' },

  // Africa
  { name: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219, timezone: 'Africa/Nairobi' },
  { name: 'Mombasa', country: 'Kenya', latitude: -4.0435, longitude: 39.6682, timezone: 'Africa/Nairobi' },
  { name: 'Dar es Salaam', country: 'Tanzania', latitude: -6.7924, longitude: 39.2083, timezone: 'Africa/Dar_es_Salaam' },
  { name: 'Zanzibar', country: 'Tanzania', latitude: -6.1659, longitude: 39.2026, timezone: 'Africa/Dar_es_Salaam' },
  { name: 'Johannesburg', country: 'South Africa', latitude: -26.2041, longitude: 28.0473, timezone: 'Africa/Johannesburg' },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' }
];

export async function searchCitiesOnline(query: string): Promise<CityData[]> {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) return [];

  // Filter local database first
  const localMatches = POPULAR_CITIES.filter(c => 
    c.name.toLowerCase().includes(clean) || 
    c.country.toLowerCase().includes(clean)
  );

  // If we already have multiple good local matches, return them immediately
  if (localMatches.length >= 3) {
    return localMatches.slice(0, 8);
  }

  // Fallback to free OpenStreetMap Nominatim for lesser-known towns/villages
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (res.ok) {
      const data = await res.json();
      const onlineResults: CityData[] = data.map((item: any) => {
        const addr = item.address || {};
        const cityName = addr.city || addr.town || addr.village || addr.municipality || item.name || query;
        const country = addr.country || '';
        return {
          name: cityName,
          country: country,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon)
        };
      });

      // Combine with local matches and remove duplicates
      const seen = new Set<string>();
      const combined: CityData[] = [];
      for (const item of [...localMatches, ...onlineResults]) {
        const key = `${item.name.toLowerCase()}-${item.country.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }
      return combined.slice(0, 8);
    }
  } catch (err) {
    console.warn('Online city search error:', err);
  }

  return localMatches;
}
