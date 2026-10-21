export interface UserTelemetry {
  userId: string;
  displayName: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  devicePlatform: string;
  lastActive: any;
  firstSeen?: any;
  sessionCount?: number;
  preferredLanguage?: string;
}

export async function trackAppLaunchAndTelemetry(): Promise<void> {
  // Pure local storage session registration
  try {
    let userId = localStorage.getItem('guest_device_id');
    if (!userId) {
      userId = 'dev_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('guest_device_id', userId);
    }
  } catch {}
}
