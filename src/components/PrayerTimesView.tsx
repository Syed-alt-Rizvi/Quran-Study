import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Compass, Bell, Calendar, Sparkles } from 'lucide-react';
import { SHIA_HOLY_CITIES, CityPreset, calculateShiaPrayerTimes, ShiaPrayerSchedule } from '../data/prayerTimes';
import { AdhanPlayer } from './AdhanPlayer';

export const PrayerTimesView: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<CityPreset>(SHIA_HOLY_CITIES[0]); // Al-Kadhimiya default
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedule, setSchedule] = useState<ShiaPrayerSchedule>(
    calculateShiaPrayerTimes(new Date(), selectedCity.latitude, selectedCity.longitude, selectedCity.timezone)
  );
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSchedule(
      calculateShiaPrayerTimes(currentTime, selectedCity.latitude, selectedCity.longitude, selectedCity.timezone)
    );
  }, [selectedCity, currentTime]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const offset = -pos.coords.latitude / 15; // approximation or timezone offset
        const custom: CityPreset = {
          id: "custom-location",
          name: "My Current Location",
          nameArabic: "موقعي الحالي",
          country: "GPS Coordinates",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timezone: -(new Date().getTimezoneOffset() / 60)
        };
        setSelectedCity(custom);
        setGeoLoading(false);
      },
      (err) => {
        console.error(err);
        setGeoLoading(false);
      }
    );
  };

  const prayers = [
    { key: 'imsak', label: 'Imsak (سحور)', time: schedule.imsak, desc: 'Safety margin before Fajr' },
    { key: 'fajr', label: 'Fajr (الفجر)', time: schedule.fajr, desc: '16.0° Shia Ithna-Ashari angle' },
    { key: 'sunrise', label: 'Sunrise (الشروق)', time: schedule.sunrise, desc: 'Upper edge of solar disc' },
    { key: 'dhuhr', label: 'Dhuhr (الظهر)', time: schedule.dhuhr, desc: 'Solar noon zenith' },
    { key: 'asr', label: 'Asr (العصر)', time: schedule.asr, desc: 'Shadow proportion' },
    { key: 'sunset', label: 'Sunset (الغروب)', time: schedule.sunset, desc: 'Disappearance of solar disc' },
    { key: 'maghrib', label: 'Maghrib (المغرب)', time: schedule.maghrib, desc: 'Disappearance of eastern redness (Humrah)' },
    { key: 'isha', label: 'Isha (العشاء)', time: schedule.isha, desc: '14.0° Leva Institute angle' },
    { key: 'midnight', label: 'Shia Midnight (نصف الليل)', time: schedule.midnight, desc: 'Midpoint between Sunset & Fajr' }
  ];

  return (
    <div className="space-y-6">
      {/* Featured Adhan Player */}
      <AdhanPlayer />

      {/* Main Prayer Schedule Card */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        {/* City Selector & Location */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                Shia Ithna-Ashari Calculation (Leva Institute / Qum)
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
              <Clock className="w-6 h-6 text-emerald-400" />
              Prayer Times & Adhan Schedule
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live calculations honoring the disappearance of eastern redness (Humrah Mashriqiyyah)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleUseMyLocation}
              disabled={geoLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
            >
              <Compass className={`w-4 h-4 text-emerald-400 ${geoLoading ? 'animate-spin' : ''}`} />
              <span>{geoLoading ? 'Detecting...' : 'Detect GPS'}</span>
            </button>

            <select
              value={selectedCity.id}
              onChange={(e) => {
                const found = SHIA_HOLY_CITIES.find(c => c.id === e.target.value);
                if (found) setSelectedCity(found);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {SHIA_HOLY_CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nameArabic} ({city.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected City Info Badge */}
        <div className="mt-4 flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">{selectedCity.name}</span>
            <span>({selectedCity.country})</span>
          </div>
          <div className="font-mono text-emerald-400">
            {currentTime.toLocaleTimeString()} • {selectedCity.timezone >= 0 ? `UTC+${selectedCity.timezone}` : `UTC${selectedCity.timezone}`}
          </div>
        </div>

        {/* Prayer Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {prayers.map((p) => {
            const isHighlight = p.key === 'maghrib' || p.key === 'fajr' || p.key === 'dhuhr';
            return (
              <div
                key={p.key}
                className={`p-4 rounded-xl border transition-all ${
                  isHighlight
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isHighlight ? 'text-emerald-300' : 'text-slate-300'}`}>
                    {p.label}
                  </span>
                  <span className="font-mono text-base font-bold text-slate-100">
                    {p.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Scholarly Fiqh Note */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Shia Ithna-Ashari Jurisprudence (Fiqh Ja'fari) Notice:
          </span>
          <p>
            According to the rulings of prominent Maraji' (Grand Ayatollah Sistani, Grand Ayatollah Khamenei, Grand Ayatollah Makarim Shirazi), Maghrib time begins when the redness in the eastern sky (Al-Humrah Al-Mashriqiyyah) that follows the disappearance of the sun passes overhead. Midnight (Nisf al-Layl) is calculated as the halfway mark between Sunset and Fajr.
          </p>
        </div>
      </div>
    </div>
  );
};
