export type ShiaEventType = 'celebration' | 'commemoration' | 'eid' | 'urs' | 'other';

export interface ShiaCalendarEvent {
  id: string;
  name: string;
  arabicName?: string;
  hijriMonth: number; // 1 to 12
  hijriDay: number; // 1 to 30
  type: ShiaEventType;
  shortDescription: string;
  description?: string;
  slug?: string;
  image?: string;
  source?: string;
  sourceLink?: string;
  importance?: 'major' | 'standard';
  isFastingRecommended?: boolean;
  isFastingForbidden?: boolean;
  recommendedAmaal?: string[];
  recommendedDuas?: {
    title: string;
    mafatihId?: string;
  }[];
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthNameEn: string;
  monthNameAr: string;
  monthNameUr: string;
  formatted: string;
}

export interface CalendarDay {
  date: Date;
  gregorianYear: number;
  gregorianMonth: number;
  gregorianDay: number;
  hijri: HijriDate;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: ShiaCalendarEvent[];
}

export interface HijriMonthInfo {
  number: number;
  nameEn: string;
  nameAr: string;
  nameUr: string;
  isSacred: boolean; // Muharram, Rajab, Dhul Qa'dah, Dhul Hijjah
  description: string;
  virtues: string;
}

export interface CalendarNotificationSettings {
  enabled: boolean;
  notifyOnEids: boolean;
  notifyOnWiladats: boolean;
  notifyOnShahadats: boolean;
  notifyOnUrs: boolean;
  notifyOnFastingDays: boolean;
  notifyDayBefore: boolean;
  notificationTime: string; // HH:mm format, e.g. "08:00"
  lastNotifiedDate?: string;
}
