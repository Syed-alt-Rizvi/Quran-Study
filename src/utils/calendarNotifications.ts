import { ShiaCalendarEvent, CalendarNotificationSettings, HijriDate } from '../types/calendar';
import { getTodayEvents, getTomorrowEvents } from './hijriCalendar';

export const DEFAULT_NOTIFICATION_SETTINGS: CalendarNotificationSettings = {
  enabled: true,
  notifyOnEids: true,
  notifyOnWiladats: true,
  notifyOnShahadats: true,
  notifyOnUrs: true,
  notifyOnFastingDays: true,
  notifyDayBefore: true,
  notificationTime: '08:00',
};

/**
 * Checks whether the current environment supports Web Notifications.
 */
export function isWebNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Returns current permission status ('granted', 'denied', or 'default').
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isWebNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Requests notification permission from the user across Web & Capacitor.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  let granted = false;

  // 1. Try Capacitor LocalNotifications first if in native app container
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const status = await LocalNotifications.requestPermissions();
    if (status.display === 'granted') {
      granted = true;
    }
  } catch {
    // Not running inside Capacitor or plugin error, fallback to Web API
  }

  // 2. Web Notifications API
  if (isWebNotificationSupported()) {
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        granted = true;
      }
    } catch {
      // Browser blocked or error
    }
  }

  return granted;
}

/**
 * Dispatches an immediate notification to the user.
 */
export async function showNotification(title: string, options: {
  body: string;
  tag?: string;
  icon?: string;
  data?: any;
}): Promise<boolean> {
  let displayed = false;

  // 1. Try Capacitor Local Notifications
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Math.random() * 1000000),
          title,
          body: options.body,
          schedule: { at: new Date(Date.now() + 500) },
          sound: undefined,
          actionTypeId: '',
          extra: options.data || null,
        }
      ]
    });
    displayed = true;
  } catch {
    // Fall back to web
  }

  // 2. Try Web Notifications
  if (isWebNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: options.body,
        icon: options.icon || '/logo-192.webp',
        badge: '/logo-192.webp',
        tag: options.tag || 'shia-calendar-event',
        silent: false,
      });
      displayed = true;
    } catch (e) {
      console.warn('Web notification dispatch failed:', e);
    }
  }

  return displayed;
}

/**
 * Tests the notification system immediately with an authentic Shia message.
 */
export async function sendTestNotification(): Promise<boolean> {
  const perm = await requestNotificationPermission();
  if (!perm) return false;

  return showNotification('🕌 Shia Markaz Calendar Alert', {
    body: 'Notifications are active! You will receive timely reminders for Holy Eids, Wiladats, Shahadats, and Recommended Fasting days.',
    tag: 'test-notification'
  });
}

/**
 * Checks today's and tomorrow's events and triggers notifications if criteria are met
 * and not already triggered today.
 */
export async function checkAndDispatchCalendarNotifications(
  settings: CalendarNotificationSettings,
  hijriOffset = 0,
  onRecordNotified?: (dateStr: string) => void
): Promise<void> {
  if (!settings.enabled) return;

  const todayStr = new Date().toISOString().split('T')[0];
  if (settings.lastNotifiedDate === todayStr) {
    // Already notified today
    return;
  }

  // Check today's events
  const { hijri: todayHijri, events: todayEvents } = getTodayEvents(hijriOffset);
  const matchingToday = todayEvents.filter(ev => shouldNotifyEvent(ev, settings));

  if (matchingToday.length > 0) {
    const primary = matchingToday[0];
    const prefix = primary.type === 'eid' 
      ? '🎉 Mubarak! Today is' 
      : primary.type === 'celebration' 
      ? '🌸 Blessed Wiladat:' 
      : primary.type === 'urs' || primary.type === 'commemoration'
      ? '🖤 Solemn Commemoration:' 
      : '🗓️ Islamic Day:';

    const title = `${prefix} ${primary.name}`;
    const body = `${primary.arabicName ? primary.arabicName + '\n' : ''}${todayHijri.formatted} • ${primary.shortDescription || 'Tap to view details and recommended deeds.'}`;

    const sent = await showNotification(title, {
      body,
      tag: `event-${primary.id}-${todayStr}`,
    });

    if (sent && onRecordNotified) {
      onRecordNotified(todayStr);
      return;
    }
  }

  // Check tomorrow's events if advance warning is enabled
  if (settings.notifyDayBefore) {
    const { hijri: tomorrowHijri, events: tomorrowEvents } = getTomorrowEvents(hijriOffset);
    const matchingTomorrow = tomorrowEvents.filter(ev => shouldNotifyEvent(ev, settings));

    if (matchingTomorrow.length > 0) {
      const primary = matchingTomorrow[0];
      const title = `🌙 Tomorrow: ${primary.name}`;
      const body = `Approaching on ${tomorrowHijri.formatted}. ${primary.isFastingRecommended ? 'Recommended fast tomorrow. ' : ''}${primary.shortDescription || 'Prepare for tonight\'s recommended deeds.'}`;

      const sent = await showNotification(title, {
        body,
        tag: `eve-${primary.id}-${todayStr}`,
      });

      if (sent && onRecordNotified) {
        onRecordNotified(todayStr);
      }
    }
  }
}

function shouldNotifyEvent(event: ShiaCalendarEvent, settings: CalendarNotificationSettings): boolean {
  if (event.type === 'eid' && settings.notifyOnEids) return true;
  if (event.type === 'celebration' && settings.notifyOnWiladats) return true;
  if (event.type === 'urs' && (settings.notifyOnUrs || settings.notifyOnShahadats)) return true;
  if (event.type === 'commemoration' && settings.notifyOnShahadats) return true;
  if (event.isFastingRecommended && settings.notifyOnFastingDays) return true;
  return false;
}
