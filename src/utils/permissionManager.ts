import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface PermissionStatus {
  notifications: 'granted' | 'denied' | 'prompt' | 'unknown';
  location: 'granted' | 'denied' | 'prompt' | 'unknown';
}

const PERMISSIONS_ASKED_KEY = 'shia_markaz_permissions_requested_v2';

export function isPermissionPromptNeeded(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const asked = localStorage.getItem(PERMISSIONS_ASKED_KEY);
    return !asked;
  } catch {
    return false;
  }
}

export function markPermissionsHandled(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PERMISSIONS_ASKED_KEY, 'true');
  } catch {}
}

export async function checkPermissionStatus(): Promise<PermissionStatus> {
  const status: PermissionStatus = {
    notifications: 'unknown',
    location: 'unknown',
  };

  // Check Notifications
  try {
    if (Capacitor.isPluginAvailable('LocalNotifications')) {
      const notifStatus = await LocalNotifications.checkPermissions();
      status.notifications = notifStatus.display === 'granted' ? 'granted' : notifStatus.display === 'denied' ? 'denied' : 'prompt';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      status.notifications = Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'prompt';
    }
  } catch {}

  // Check Location
  try {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      const loc = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      status.location = loc.state;
    }
  } catch {}

  return status;
}

export async function requestAppPermissions(): Promise<{ notifications: boolean; location: boolean }> {
  let notificationsGranted = false;
  let locationGranted = false;

  // 1. Request Notifications Permission (for Adhan & Daily reminders)
  try {
    if (Capacitor.isPluginAvailable('LocalNotifications')) {
      const res = await LocalNotifications.requestPermissions();
      notificationsGranted = res.display === 'granted';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      notificationsGranted = res === 'granted';
    }
  } catch (e) {
    console.warn('Notification permission request error:', e);
  }

  // 2. Request Geolocation Permission (for exact Prayer times & Qibla compass)
  try {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            locationGranted = true;
            try {
              localStorage.setItem('shia_user_lat', String(pos.coords.latitude));
              localStorage.setItem('shia_user_lng', String(pos.coords.longitude));
            } catch {}
            resolve();
          },
          () => {
            locationGranted = false;
            resolve();
          },
          { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
        );
      });
    }
  } catch (e) {
    console.warn('Geolocation permission request error:', e);
  }

  markPermissionsHandled();
  return { notifications: notificationsGranted, location: locationGranted };
}
