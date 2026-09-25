import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { getGuestProfile } from './guestAuth';

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

// Track app launch, install, and device session gracefully without requesting unnecessary permissions
export async function trackAppLaunchAndTelemetry(): Promise<void> {
  try {
    let userId = localStorage.getItem('guest_device_id');
    if (!userId) {
      userId = 'dev_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('guest_device_id', userId);
    }

    const guest = getGuestProfile();
    const displayName = guest?.displayName || localStorage.getItem('shia_quran_user_name') || 'Guest Seeker';

    // Detect platform
    let platform = 'Web';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) platform = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) platform = 'iOS';

    const hasTrackedInstall = localStorage.getItem('shia_quran_install_tracked');
    if (!hasTrackedInstall) {
      localStorage.setItem('shia_quran_install_tracked', 'true');
      // Increment global downloads / installs in Firestore
      const statRef = doc(db, 'app_stats', 'global_metrics');
      await setDoc(statRef, {
        metric: 'downloads',
        count: increment(1),
        lastUpdated: serverTimestamp()
      }, { merge: true }).catch(() => {});
    }

    // Prepare user record in app_users
    const userRef = doc(db, 'app_users', userId);
    const existingSnap = await getDoc(userRef).catch(() => null);

    const baseData: any = {
      userId,
      displayName,
      devicePlatform: platform,
      lastActive: serverTimestamp(),
      sessionCount: increment(1),
      preferredLanguage: navigator.language || 'en'
    };

    if (!existingSnap || !existingSnap.exists()) {
      baseData.firstSeen = serverTimestamp();
    }

    // Save user doc
    await setDoc(userRef, baseData, { merge: true }).catch((err) => {
      console.warn("Telemetry ping:", err);
    });

  } catch (error) {
    console.warn("Telemetry init skipped:", error);
  }
}
