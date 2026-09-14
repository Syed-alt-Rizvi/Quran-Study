import { v4 as uuidv4 } from 'uuid';

export interface GuestProfile {
  userId: string;
  displayName: string;
}

export const getGuestProfile = (): GuestProfile | null => {
  const stored = localStorage.getItem('guest_profile');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const saveGuestProfile = (displayName: string): GuestProfile => {
  let userId = localStorage.getItem('guest_device_id');
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('guest_device_id', userId);
  }
  const profile: GuestProfile = { userId, displayName };
  localStorage.setItem('guest_profile', JSON.stringify(profile));
  return profile;
};

export const clearGuestProfile = () => {
  localStorage.removeItem('guest_profile');
};

export const hasAcceptedGuidelines = (): boolean => {
  return localStorage.getItem('shia_quran_guidelines_accepted') === 'true';
};

export const acceptGuidelines = () => {
  localStorage.setItem('shia_quran_guidelines_accepted', 'true');
};

export const getBlockedUserIds = (): string[] => {
  try {
    const raw = localStorage.getItem('shia_quran_blocked_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const blockUserId = (userId: string) => {
  if (!userId) return;
  const current = getBlockedUserIds();
  if (!current.includes(userId)) {
    const updated = [...current, userId];
    localStorage.setItem('shia_quran_blocked_users', JSON.stringify(updated));
  }
};

export const unblockUserId = (userId: string) => {
  const current = getBlockedUserIds();
  const updated = current.filter(id => id !== userId);
  localStorage.setItem('shia_quran_blocked_users', JSON.stringify(updated));
};

export const isUserBlocked = (userId: string): boolean => {
  if (!userId) return false;
  return getBlockedUserIds().includes(userId);
};

export const getReportedDiscussionIds = (): string[] => {
  try {
    const raw = localStorage.getItem('shia_quran_reported_discussions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const reportDiscussion = (discussionId: string, reason: string) => {
  if (!discussionId) return;
  const current = getReportedDiscussionIds();
  if (!current.includes(discussionId)) {
    const updated = [...current, discussionId];
    localStorage.setItem('shia_quran_reported_discussions', JSON.stringify(updated));
  }
  try {
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
  localStorage.removeItem('guest_profile');
  localStorage.removeItem('guest_device_id');
  localStorage.removeItem('shia_quran_guidelines_accepted');
  localStorage.removeItem('shia_quran_blocked_users');
  localStorage.removeItem('shia_quran_reported_discussions');
  localStorage.removeItem('shia_quran_report_details');
  localStorage.removeItem('shia-quran-settings');
  localStorage.removeItem('quran-app-settings');
  localStorage.removeItem('shia-quran-has-seen-welcome');
  localStorage.removeItem('shia-quran-active-surah');
  localStorage.removeItem('shia-quran-active-juz');
  localStorage.removeItem('shia-quran-surahs-cache');
};
