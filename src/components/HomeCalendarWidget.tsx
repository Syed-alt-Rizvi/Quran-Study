import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronRight, Moon } from 'lucide-react';
import { useSettingsStore } from '../store';
import { getHijriDate, getEventsForHijriDate } from '../utils/hijriCalendar';
import { toUrduNumerals } from '../utils/mafatihUrdu';
import { t } from '../i18n';
import { hapticImpact, ImpactStyle } from '../utils/haptics';

interface HomeCalendarWidgetProps {
  onOpenCalendar: () => void;
  onSelectMafatihItem?: (id: string) => void;
}

export default function HomeCalendarWidget({ onOpenCalendar, onSelectMafatihItem }: HomeCalendarWidgetProps) {
  const { hijriOffset, appLanguage } = useSettingsStore();
  const isUrdu = appLanguage === 'ur';

  const today = useMemo(() => new Date(), []);
  const hijri = useMemo(() => getHijriDate(today, hijriOffset || 0), [today, hijriOffset]);
  const events = useMemo(() => getEventsForHijriDate(hijri.month, hijri.day), [hijri]);

  const topEvent = events.length > 0 ? events[0] : null;

  const gregorianFormatted = useMemo(() => {
    return new Intl.DateTimeFormat(isUrdu ? 'ur-PK' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(today);
  }, [today, isUrdu]);

  const hijriDisplay = useMemo(() => {
    if (isUrdu) {
      return `${toUrduNumerals(hijri.day)} ${hijri.monthNameUr} ${toUrduNumerals(hijri.year)} ھ`;
    }
    return `${hijri.day} ${hijri.monthNameEn} ${hijri.year} AH`;
  }, [hijri, isUrdu]);

  return (
    <div
      onClick={() => {
        hapticImpact(ImpactStyle.Light);
        onOpenCalendar();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenCalendar();
        }
      }}
      className="mb-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-xs cursor-pointer select-none group"
      title={isUrdu ? 'مکمل شیعہ تقویم دیکھیں' : 'View Full Shia Islamic Calendar'}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Moon size={15} />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
              {isUrdu ? 'اسلامی شیعہ تقویم' : 'Shia Islamic Calendar'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2">
              {gregorianFormatted}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
          <span className="text-[11px] font-semibold">{hijriDisplay}</span>
          <ChevronRight size={14} className={isUrdu ? 'rotate-180' : ''} />
        </div>
      </div>

      {topEvent ? (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Moon size={13} className="text-amber-500 shrink-0" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              {isUrdu ? (topEvent.arabicName || topEvent.name) : topEvent.name}
            </p>
          </div>
          {topEvent.recommendedDuas && topEvent.recommendedDuas.length > 0 && onSelectMafatihItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                hapticImpact(ImpactStyle.Light);
                const firstDua = topEvent.recommendedDuas![0];
                if (firstDua?.mafatihId) onSelectMafatihItem(firstDua.mafatihId);
                else onOpenCalendar();
              }}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
            >
              {isUrdu ? 'مستحب دعا' : 'Recommended Dua'}
            </button>
          )}
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>{isUrdu ? 'ماہانہ شیعہ مناسبات اور ایامِ متبرکہ' : 'Monthly Holy Occasions & Daily Ziyaraat'}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {isUrdu ? 'تقویم کھولیں' : 'Open Calendar'}
          </span>
        </div>
      )}
    </div>
  );
}
