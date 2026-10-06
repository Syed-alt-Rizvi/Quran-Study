import { v4 as uuidv4 } from 'uuid';

export interface GuestProfile {
  userId: string;
  displayName: string;
}

export const getGuestProfile = (): GuestProfile | null => {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('guest_profile') : null;
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    return null;
  }
  return null;
};

export const saveGuestProfile = (displayName: string): GuestProfile => {
  let userId = '';
  try {
    userId = typeof localStorage !== 'undefined' ? (localStorage.getItem('guest_device_id') || '') : '';
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('guest_device_id', userId);
    }
    const profile: GuestProfile = { userId, displayName };
    localStorage.setItem('guest_profile', JSON.stringify(profile));
    return profile;
  } catch {
    return { userId: userId || uuidv4(), displayName };
  }
};

export const clearGuestProfile = () => {
  try {
    localStorage.removeItem('guest_profile');
  } catch {}
};

export const hasAcceptedGuidelines = (): boolean => {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('shia_quran_guidelines_accepted') === 'true';
  } catch {
    return true;
  }
};

export const acceptGuidelines = () => {
  try {
    localStorage.setItem('shia_quran_guidelines_accepted', 'true');
  } catch {}
};

export const getBlockedUserIds = (): string[] => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('shia_quran_blocked_users') : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const blockUserId = (userId: string) => {
  if (!userId) return;
  try {
    const current = getBlockedUserIds();
    if (!current.includes(userId)) {
      const updated = [...current, userId];
      localStorage.setItem('shia_quran_blocked_users', JSON.stringify(updated));
    }
  } catch {}
};

export const unblockUserId = (userId: string) => {
  try {
    const current = getBlockedUserIds();
    const updated = current.filter(id => id !== userId);
    localStorage.setItem('shia_quran_blocked_users', JSON.stringify(updated));
  } catch {}
};

export const isUserBlocked = (userId: string): boolean => {
  if (!userId) return false;
  return getBlockedUserIds().includes(userId);
};

export const getReportedDiscussionIds = (): string[] => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('shia_quran_reported_discussions') : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const reportDiscussion = (discussionId: string, reason: string) => {
  if (!discussionId) return;
  try {
    const current = getReportedDiscussionIds();
    if (!current.includes(discussionId)) {
      const updated = [...current, discussionId];
      localStorage.setItem('shia_quran_reported_discussions', JSON.stringify(updated));
    }
    const reportsRaw = localStorage.getItem('shia_quran_report_details') || '[]';
    const reports = JSON.parse(reportsRaw);
    reports.push({ discussionId, reason, timestamp: new Date().toISOString() });
    localStorage.setItem('shia_quran_report_details', JSON.stringify(reports));
  } catch {}
};

export const isDiscussionReported = (discussionId: string): boolean => {
  if (!discussionId) return false;
  return getReportedDiscussionIds().includes(discussionId);
};

export const deleteGuestAccountAndAllData = () => {
  try {
    const keys = [
      'guest_profile',
      'guest_device_id',
      'shia_quran_guidelines_accepted',
      'shia_quran_blocked_users',
      'shia_quran_reported_discussions',
      'shia_quran_report_details',
      'shia-quran-settings',
      'quran-app-settings',
      'shia-quran-has-seen-welcome',
      'shia-quran-active-surah',
      'shia-quran-active-juz',
      'shia-quran-surahs-cache'
    ];
    for (const k of keys) {
      localStorage.removeItem(k);
    }
  } catch {}
};
