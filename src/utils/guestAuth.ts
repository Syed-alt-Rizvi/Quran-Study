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
