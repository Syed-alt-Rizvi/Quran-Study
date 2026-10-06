import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, BellRing, BellOff, 
  Sparkles, Star, Moon, Info, BookOpen, KeyRound, Search, Check, X, 
  Sliders, ExternalLink, CalendarDays, ListFilter, Bookmark, Share2, HelpCircle
} from 'lucide-react';
import { useSettingsStore } from '../store';
import { hapticImpact } from '../utils/haptics';
import { ImpactStyle } from '@capacitor/haptics';
import { 
  getCalendarMonthDays, getHijriDate, getHijriMonthInfo, 
  HIJRI_MONTHS, SHIA_CALENDAR_EVENTS, getTodayEvents, getUpcomingEvents 
} from '../utils/hijriCalendar';
import { 
  requestNotificationPermission, sendTestNotification, 
  checkAndDispatchCalendarNotifications, getNotificationPermission 
} from '../utils/calendarNotifications';
import { ShiaCalendarEvent, CalendarDay } from '../types/calendar';

interface CalendarViewProps {
  onSelectMafatihItem?: (itemId: string) => void;
  onOpenSettings?: () => void;
}

type EventFilter = 'all' | 'eid' | 'celebration' | 'urs' | 'fasting';
type EventSortMode = 'upcoming' | 'calendar' | 'alphabetical';

interface CalendarDayCellProps {
  day: CalendarDay;
  isToday: boolean;
  isCurrentMonth: boolean;
  onSelect: (day: CalendarDay) => void;
}

const CalendarDayCell = React.memo(function CalendarDayCell({
  day,
  isToday,
  isCurrentMonth,
  onSelect
}: CalendarDayCellProps) {
  const hasEvents = day.events.length > 0;
  const hasEid = day.events.some(e => e.type === 'eid');
  const hasWiladat = day.events.some(e => e.type === 'celebration');
  const hasUrs = day.events.some(e => e.type === 'urs' || e.type === 'commemoration');
  const hasFasting = day.events.some(e => e.isFastingRecommended);

  return (
    <button
      onClick={() => onSelect(day)}
      className={`min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 flex flex-col justify-between text-left transition-colors relative group gpu-layer ${
        isCurrentMonth
          ? 'bg-white dark:bg-slate-900 hover:bg-emerald-50/50 dark:hover:bg-slate-800/60'
          : 'bg-slate-50/70 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
      } ${isToday ? 'ring-2 ring-inset ring-emerald-500 dark:ring-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20' : ''}`}
    >
      {/* Top Bar: Gregorian Day & Today Dot */}
      <div className="flex items-center justify-between w-full">
        <span className={`text-xs sm:text-sm font-semibold ${
          isToday
            ? 'w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs'
            : isCurrentMonth
            ? 'text-slate-900 dark:text-slate-100'
            : 'text-slate-400 dark:text-slate-600'
        }`}>
          {day.gregorianDay}
        </span>

        {/* Hijri Day Indicator in Arabic numerals / styled */}
        <span className="text-[10px] sm:text-[11px] font-arabic font-medium text-emerald-700/80 dark:text-emerald-400/80">
          {day.hijri.day}
        </span>
      </div>

      {/* Middle: Event Indicators or Event Name Pill */}
      <div className="my-1 space-y-0.5">
        {hasEvents && (
          <div className="w-full">
            {/* Compact view on mobile: Color dots */}
            <div className="flex items-center gap-1 sm:hidden">
              {hasEid && <span className="w-2 h-2 rounded-full bg-amber-500 shadow-2xs" />}
              {hasWiladat && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-2xs" />}
              {hasUrs && <span className="w-2 h-2 rounded-full bg-purple-600 shadow-2xs" />}
              {hasFasting && !hasEid && <span className="w-2 h-2 rounded-full bg-sky-500 shadow-2xs" />}
            </div>

            {/* Expanded view on tablet / desktop: Mini pills */}
            <div className="hidden sm:block space-y-0.5">
              {day.events.slice(0, 2).map((ev, evIdx) => (
                <div
                  key={`ev-pill-${ev.id}-${evIdx}`}
                  className={`text-[9px] font-bold px-1 py-0.5 rounded truncate leading-tight ${
                    ev.type === 'eid'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300/40'
                      : ev.type === 'celebration'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300/40'
                      : ev.type === 'urs' || ev.type === 'commemoration'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-300/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                  }`}
                >
                  {ev.name}
                </div>
              ))}
              {day.events.length > 2 && (
                <span className="text-[9px] text-slate-400 font-medium">
                  +{day.events.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Subtitle / Hijri month name on 1st of month */}
      <div className="text-[9px] text-slate-400 truncate w-full">
        {day.hijri.day === 1 ? (
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            1 {day.hijri.monthNameEn.split(' ')[0]}
          </span>
        ) : null}
      </div>
    </button>
  );
});

export default function CalendarView({ onSelectMafatihItem }: CalendarViewProps) {
  const { 
    hijriOffset, setHijriOffset, 
    calendarNotificationSettings, updateCalendarNotificationSettings,
    isDarkMode 
  } = useSettingsStore();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<ShiaCalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EventFilter>('all');
  const [eventSortMode, setEventSortMode] = useState<EventSortMode>('upcoming');
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isOffsetModalOpen, setIsOffsetModalOpen] = useState(false);
  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<string>('default');

  const handleSelectDay = React.useCallback((day: CalendarDay) => {
    hapticImpact(ImpactStyle.Light);
    setSelectedDay(day);
    if (day.events.length === 1) {
      setSelectedEvent(day.events[0]);
    }
  }, []);

  // Sync notification permissions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermissionState(getNotificationPermission());
    }
  }, [isNotificationDrawerOpen]);

  // Run initial background notification check
  useEffect(() => {
    if (calendarNotificationSettings.enabled) {
      checkAndDispatchCalendarNotifications(
        calendarNotificationSettings, 
        hijriOffset,
        (notifiedDate) => {
          updateCalendarNotificationSettings({ lastNotifiedDate: notifiedDate });
        }
      ).catch(() => {});
    }
  }, [calendarNotificationSettings.enabled, hijriOffset]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInGrid = useMemo(() => {
    return getCalendarMonthDays(year, month, hijriOffset);
  }, [year, month, hijriOffset]);

  const todayHijri = useMemo(() => {
    return getHijriDate(new Date(), hijriOffset);
  }, [hijriOffset]);

  const todayData = useMemo(() => {
    return getTodayEvents(hijriOffset);
  }, [hijriOffset]);

  const upcomingList = useMemo(() => {
    return getUpcomingEvents(60, hijriOffset);
  }, [hijriOffset]);

  // Compute Hijri months spanned by the current Gregorian month
  const hijriMonthSpan = useMemo(() => {
    const firstDay = daysInGrid.find(d => d.isCurrentMonth) || daysInGrid[0];
    const lastDay = [...daysInGrid].reverse().find(d => d.isCurrentMonth) || daysInGrid[daysInGrid.length - 1];
    if (!firstDay || !lastDay) return '';
    if (firstDay.hijri.month === lastDay.hijri.month) {
      return `${firstDay.hijri.monthNameEn} ${firstDay.hijri.year} AH`;
    }
    return `${firstDay.hijri.monthNameEn} / ${lastDay.hijri.monthNameEn} ${lastDay.hijri.year} AH`;
  }, [daysInGrid]);

  const gregorianMonthName = useMemo(() => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const handlePrevMonth = () => {
    hapticImpact(ImpactStyle.Light);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    hapticImpact(ImpactStyle.Light);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    hapticImpact(ImpactStyle.Medium);
    const now = new Date();
    setCurrentDate(now);
    const todayCard = daysInGrid.find(d => d.isToday);
    if (todayCard && todayCard.events.length > 0) {
      setSelectedDay(todayCard);
    }
  };

  const handleTestNotification = async () => {
    hapticImpact(ImpactStyle.Medium);
    setTestNotificationStatus('Requesting permission...');
    const ok = await sendTestNotification();
    if (ok) {
      setTestNotificationStatus('✅ Notification sent successfully!');
      setPermissionState(getNotificationPermission());
    } else {
      setTestNotificationStatus('❌ Permission denied or notifications disabled in browser.');
      setPermissionState(getNotificationPermission());
    }
    setTimeout(() => setTestNotificationStatus(null), 4000);
  };

  // Filtered and sorted events for list view
  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = SHIA_CALENDAR_EVENTS.filter(ev => {
      // Type filtering
      if (filterType === 'eid' && ev.type !== 'eid') return false;
      if (filterType === 'celebration' && ev.type !== 'celebration') return false;
      if (filterType === 'urs' && ev.type !== 'urs' && ev.type !== 'commemoration') return false;
      if (filterType === 'fasting' && !ev.isFastingRecommended) return false;

      // Search query
      if (q) {
        const matchesName = ev.name.toLowerCase().includes(q);
        const matchesArabic = ev.arabicName && ev.arabicName.includes(q);
        const matchesDesc = ev.shortDescription && ev.shortDescription.toLowerCase().includes(q);
        const monthInfo = getHijriMonthInfo(ev.hijriMonth);
        const matchesMonth = monthInfo.nameEn.toLowerCase().includes(q) || monthInfo.nameAr.includes(q);
        return matchesName || matchesArabic || matchesDesc || matchesMonth;
      }

      return true;
    });

    if (eventSortMode === 'alphabetical') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (eventSortMode === 'calendar') {
      return [...list].sort((a, b) => {
        if (a.hijriMonth !== b.hijriMonth) return a.hijriMonth - b.hijriMonth;
        return a.hijriDay - b.hijriDay;
      });
    }

    // Default 'upcoming' relative to today's Hijri date
    const curMonth = todayHijri.month;
    const curDay = todayHijri.day;
    return [...list].sort((a, b) => {
      const diffA = (a.hijriMonth - curMonth + 12) % 12 * 30 + (a.hijriDay - curDay);
      const normA = diffA < 0 ? diffA + 355 : diffA;
      const diffB = (b.hijriMonth - curMonth + 12) % 12 * 30 + (b.hijriDay - curDay);
      const normB = diffB < 0 ? diffB + 355 : diffB;
      return normA - normB;
    });
  }, [filterType, searchQuery, eventSortMode, todayHijri]);

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Top Banner & Hijri Masthead */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white p-5 sm:p-6 shadow-xl border border-emerald-700/40">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold tracking-wider uppercase">
              <Moon size={14} className="text-amber-300" />
              <span>Shia Islamic Calendar</span>
              <span className="text-emerald-500">•</span>
              <span>{todayHijri.year} AH</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-arabic text-amber-100">
              {todayHijri.formatted}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              {new Date().toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Moon sighting adjustment badge */}
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setIsOffsetModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md text-xs font-medium text-white transition-all border border-white/15"
              title="Adjust Hijri Date based on local moon sighting"
            >
              <Sliders size={13} className="text-amber-300" />
              <span>Moon Offset: {hijriOffset > 0 ? `+${hijriOffset}` : hijriOffset}d</span>
            </button>

            {/* Notification Manager Button */}
            <button
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setIsNotificationDrawerOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-medium transition-all border active:scale-95 ${
                calendarNotificationSettings.enabled 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-semibold shadow-xs' 
                  : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20'
              }`}
              title="Shia Calendar Notifications"
            >
              {calendarNotificationSettings.enabled ? (
                <>
                  <BellRing size={13} className="animate-pulse" />
                  <span>Alerts Active</span>
                </>
              ) : (
                <>
                  <BellOff size={13} />
                  <span>Alerts Off</span>
                </>
              )}
            </button>

            {/* Jump to Today Button */}
            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
            >
              Today
            </button>
          </div>
        </div>

        {/* Proactive "Today's Sacred Day" Highlight Banner */}
        {todayData.events.length > 0 && (
          <div className="mt-4 pt-4 border-t border-emerald-700/50">
            <div className="flex items-start gap-3 bg-emerald-950/60 rounded-2xl p-3.5 border border-emerald-600/40">
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950 shrink-0 mt-0.5">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Observed Today
                  </span>
                  {todayData.events[0].type === 'eid' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Eid Mubarak!
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  {todayData.events[0].name}
                </h3>
                {todayData.events[0].arabicName && (
                  <p className="font-arabic text-amber-200 text-sm mt-0.5">
                    {todayData.events[0].arabicName}
                  </p>
                )}
                <p className="text-xs text-emerald-100/80 mt-1 line-clamp-2">
                  {todayData.events[0].shortDescription}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEvent(todayData.events[0])}
                    className="text-xs font-semibold text-amber-300 hover:text-amber-200 underline flex items-center gap-1"
                  >
                    <span>View Amaal &amp; Full History</span>
                    <ChevronRight size={14} />
                  </button>
                  {todayData.events[0].recommendedDuas && todayData.events[0].recommendedDuas[0]?.mafatihId && onSelectMafatihItem && (
                    <button
                      onClick={() => onSelectMafatihItem(todayData.events[0].recommendedDuas![0].mafatihId!)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-[11px] font-bold text-white flex items-center gap-1"
                    >
                      <KeyRound size={12} />
                      <span>{todayData.events[0].recommendedDuas[0].title}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* View Switcher, Filter & Search Controls */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              setViewMode('month');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'month'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <CalendarDays size={14} />
            <span>Month Grid</span>
          </button>

          <button
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              setViewMode('list');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <ListFilter size={14} />
            <span>Chronicle / Events</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Shia events, Eids, Imams..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-800">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {gregorianMonthName}
              </h3>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {hijriMonthSpan}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Legend */}
          <div className="grid grid-cols-7 text-center py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Fri (Jum)</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200/70 dark:bg-slate-800 gpu-layer">
            {daysInGrid.map((day, idx) => (
              <CalendarDayCell
                key={`cal-grid-${day.gregorianYear}-${day.gregorianMonth}-${day.gregorianDay}-${idx}`}
                day={day}
                isToday={day.isToday}
                isCurrentMonth={day.isCurrentMonth}
                onSelect={handleSelectDay}
              />
            ))}
          </div>

          {/* Grid Footer Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Eid &amp; Greater Day</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Wiladat (Birth)</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span>Urs &amp; Shahadat</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Fasting &amp; Amaal</span>
              </span>
            </div>
            <span className="text-slate-400">
              Tap any date to inspect historical background &amp; deeds
            </span>
          </div>
        </section>
      )}

      {/* LIST / CHRONICLE VIEW */}
      {viewMode === 'list' && (
        <section className="space-y-3">
          {/* Quick Filter Pills & Sort Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Days' },
                { id: 'eid', label: 'Eids' },
                { id: 'celebration', label: 'Wiladats' },
                { id: 'urs', label: 'Urs & Shahadats' },
                { id: 'fasting', label: 'Fasting Days' }
              ].map(f => (
                <button
                  key={`filter-tab-${f.id}`}
                  onClick={() => {
                    hapticImpact(ImpactStyle.Light);
                    setFilterType(f.id as EventFilter);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    filterType === f.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Sort:</span>
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  setEventSortMode('upcoming');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  eventSortMode === 'upcoming'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Sort chronologically starting from today"
              >
                Upcoming
              </button>
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  setEventSortMode('calendar');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  eventSortMode === 'calendar'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Sort by Islamic month 1 to 12"
              >
                Hijri 1-12
              </button>
              <button
                onClick={() => {
                  hapticImpact(ImpactStyle.Light);
                  setEventSortMode('alphabetical');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  eventSortMode === 'alphabetical'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Sort alphabetically by event name"
              >
                A-Z
              </button>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <CalendarIcon size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No Shia events found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEvents.map((ev, evIdx) => {
                const monthInfo = getHijriMonthInfo(ev.hijriMonth);
                return (
                  <div
                    key={`event-list-card-${ev.id}-${evIdx}`}
                    onClick={() => {
                      hapticImpact(ImpactStyle.Light);
                      setSelectedEvent(ev);
                    }}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ev.type === 'eid'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                            : ev.type === 'celebration'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40'
                            : ev.type === 'urs' || ev.type === 'commemoration'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {ev.type === 'urs' ? 'Urs / Shahadat' : ev.type}
                        </span>

                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-arabic">
                          {ev.hijriDay} {monthInfo.nameEn}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {ev.name}
                      </h4>

                      {ev.arabicName && (
                        <p className="font-arabic text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                          {ev.arabicName}
                        </p>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {ev.shortDescription}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      {ev.isFastingRecommended ? (
                        <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                          <Star size={12} />
                          <span>Recommended Fast</span>
                        </span>
                      ) : ev.isFastingForbidden ? (
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                          Fasting Forbidden (Haram)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {monthInfo.isSacred ? 'Sacred Month' : ''}
                        </span>
                      )}

                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        <span>Details</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* UPCOMING EVENTS QUICK SECTION */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              Upcoming Holy Days (Next 60 Days)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {upcomingList.length} events
          </span>
        </div>

        <div className="space-y-2">
          {upcomingList.slice(0, 5).map((item, idx) => (
            <div
              key={`upcoming-${item.event.id}-${idx}`}
              onClick={() => {
                hapticImpact(ImpactStyle.Light);
                setSelectedEvent(item.event);
              }}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">
                    {item.hijri.monthNameEn.substring(0, 3)}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-none mt-0.5">
                    {item.hijri.day}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                    {item.event.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {item.daysUntil === 0 ? 'Today' : item.daysUntil === 1 ? 'Tomorrow' : `In ${item.daysUntil} days`} • {item.date.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.event.type === 'eid'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : item.event.type === 'celebration'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                }`}>
                  {item.event.type === 'urs' ? 'Urs' : item.event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DAY INSPECTION SHEET / MODAL */}
      {selectedDay && !selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {selectedDay.date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-arabic">
                  {selectedDay.hijri.formatted}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {selectedDay.events.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Moon size={28} className="mx-auto text-emerald-500/50" />
                  <p className="text-sm font-medium">No major historical events recorded on this date.</p>
                  <p className="text-xs">Enjoy peaceful reflection and recite the daily Tasbeeh of Fatima Zahra (s.a).</p>
                </div>
              ) : (
                selectedDay.events.map((ev, evIdx) => (
                  <div
                    key={`day-ev-${ev.id}-${evIdx}`}
                    onClick={() => setSelectedEvent(ev)}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/60 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        {ev.type}
                      </span>
                      {ev.isFastingRecommended && (
                        <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                          Recommended Fast
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {ev.name}
                    </h4>
                    {ev.arabicName && (
                      <p className="font-arabic text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {ev.arabicName}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {ev.shortDescription}
                    </p>
                    <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>View Full Background &amp; Amaal</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL EVENT DETAIL MODAL / SHEET */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative p-5 sm:p-6 bg-gradient-to-r from-emerald-900 to-teal-950 text-white">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>

              <div className="space-y-1 pr-8">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    {selectedEvent.type === 'urs' ? 'Urs / Commemoration' : selectedEvent.type}
                  </span>
                  <span className="text-xs font-bold text-amber-200 font-arabic">
                    {selectedEvent.hijriDay} {getHijriMonthInfo(selectedEvent.hijriMonth).nameEn}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {selectedEvent.name}
                </h3>

                {selectedEvent.arabicName && (
                  <p className="font-arabic text-lg text-amber-200 font-medium">
                    {selectedEvent.arabicName}
                  </p>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200 text-sm">
              {/* Fasting Notice Banner */}
              {selectedEvent.isFastingRecommended && (
                <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-start gap-3">
                  <Star size={18} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sky-900 dark:text-sky-300 text-xs">
                      Highly Recommended Fasting (Mustahab)
                    </h5>
                    <p className="text-xs text-sky-800/80 dark:text-sky-300/80 mt-0.5">
                      Fasting on this day carries abundant spiritual rewards and forgiveness according to the traditions of the Ahlul Bayt (a.s).
                    </p>
                  </div>
                </div>
              )}

              {selectedEvent.isFastingForbidden && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
                  <Info size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-rose-900 dark:text-rose-300 text-xs">
                      Fasting is Strictly Forbidden (Haram)
                    </h5>
                    <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
                      It is religiously prohibited to fast on this Eid day. Celebrate with joy, family gatherings, and charity.
                    </p>
                  </div>
                </div>
              )}

              {/* Comprehensive Description & History */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Historical Significance &amp; Background
                </h4>
                <div className="prose dark:prose-invert text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {selectedEvent.description || selectedEvent.shortDescription}
                </div>
              </div>

              {/* Recommended Amaal (Deeds) */}
              {selectedEvent.recommendedAmaal && selectedEvent.recommendedAmaal.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>Recommended Amaal &amp; Observances</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedEvent.recommendedAmaal.map((amaal, aIdx) => (
                      <li key={`amaal-${aIdx}`} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{amaal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Direct Links to Mafatih Duas */}
              {selectedEvent.recommendedDuas && selectedEvent.recommendedDuas.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <KeyRound size={14} />
                    <span>Recommended Supplications &amp; Ziyarats in Mafatih</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.recommendedDuas.map((dua, dIdx) => (
                      <button
                        key={`dua-btn-${dIdx}`}
                        onClick={() => {
                          if (dua.mafatihId && onSelectMafatihItem) {
                            setSelectedEvent(null);
                            onSelectMafatihItem(dua.mafatihId);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <BookOpen size={14} />
                        <span>Open &ldquo;{dua.title}&rdquo;</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations & Source */}
              {selectedEvent.source && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Source: {selectedEvent.source}</span>
                  {selectedEvent.sourceLink && (
                    <a
                      href={selectedEvent.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Authentic Citation</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION PREFERENCES DRAWER */}
      {isNotificationDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <BellRing size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  Calendar Notifications &amp; Alerts
                </h3>
              </div>
              <button
                onClick={() => setIsNotificationDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Permission Banner */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                permissionState === 'granted'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-300'
              }`}>
                <div>
                  <p className="font-bold text-xs">
                    {permissionState === 'granted' ? 'Notification Permission Granted' : 'Permission Required'}
                  </p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {permissionState === 'granted'
                      ? 'The app will send notifications on holy Shia days.'
                      : 'Grant browser permission to receive prayer and event alerts.'}
                  </p>
                </div>
                {permissionState !== 'granted' && (
                  <button
                    onClick={async () => {
                      hapticImpact(ImpactStyle.Light);
                      const granted = await requestNotificationPermission();
                      setPermissionState(getNotificationPermission());
                      if (granted) {
                        updateCalendarNotificationSettings({ enabled: true });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold shrink-0 hover:bg-amber-700"
                  >
                    Enable
                  </button>
                )}
              </div>

              {/* Master Switch */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">Master Alerts</span>
                  <p className="text-[11px] text-slate-500">Enable calendar notifications across app</p>
                </div>
                <input
                  type="checkbox"
                  checked={calendarNotificationSettings.enabled}
                  onChange={(e) => updateCalendarNotificationSettings({ enabled: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Granular Categories */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select Event Categories
                </span>

                {[
                  { key: 'notifyOnEids', label: 'Holy Eids (Ghadir, Fitr, Adha, Mubahala, Mab\'ath)' },
                  { key: 'notifyOnWiladats', label: 'Wiladats (Births of 14 Ma\'soomeen)' },
                  { key: 'notifyOnShahadats', label: 'Shahadats & Urs (Ashura, Arbaeen, Ayyam-e-Fatimiyya)' },
                  { key: 'notifyOnFastingDays', label: 'Recommended Fasting Days (Dahwul Ardh, Rajab, Sha\'ban)' },
                  { key: 'notifyDayBefore', label: 'Advance Alert on the Eve / Day Before' }
                ].map(item => (
                  <label
                    key={`toggle-${item.key}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-medium pr-2">
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={(calendarNotificationSettings as any)[item.key]}
                      onChange={(e) => updateCalendarNotificationSettings({ [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                  </label>
                ))}
              </div>

              {/* Test Notification Button */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleTestNotification}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Bell size={14} />
                  <span>Send Test Notification Now</span>
                </button>
                {testNotificationStatus && (
                  <p className="mt-2 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {testNotificationStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOON SIGHTING / HIJRI OFFSET MODAL */}
      {isOffsetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon size={18} className="text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Local Moon Sighting
                </h3>
              </div>
              <button
                onClick={() => setIsOffsetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Islamic lunar months depend on the naked-eye sighting of the crescent moon (Ru&rsquo;yat al-Hilal). If your local Shia religious authority (e.g., Ayatullah Sistani / Khamenei in your region) announced the month 1 day earlier or later, adjust the offset below:
            </p>

            {/* Offset Selector */}
            <div className="grid grid-cols-5 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              {[-2, -1, 0, 1, 2].map(offset => (
                <button
                  key={`offset-${offset}`}
                  onClick={() => {
                    hapticImpact(ImpactStyle.Light);
                    setHijriOffset(offset);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    hijriOffset === offset
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {offset > 0 ? `+${offset}` : offset}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                Current Adjusted Date:
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 font-arabic">
                {todayHijri.formatted}
              </span>
            </div>

            <button
              onClick={() => setIsOffsetModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
