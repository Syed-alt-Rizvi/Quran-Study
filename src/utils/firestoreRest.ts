import firebaseConfig from '../../firebase-applet-config.json';

export interface FirestoreAnnouncementRest {
  active: boolean;
  message: string;
  type?: 'info' | 'alert' | 'update';
  link?: string;
  linkText?: string;
}

/**
 * Direct HTTPS REST Fetch to Firestore.
 * Bypasses WebSocket / gRPC channel requirements on mobile networks
 * and works independently of whether a backend Node/Express server is reachable.
 */
export async function fetchAnnouncementViaFirestoreRest(): Promise<FirestoreAnnouncementRest | null> {
  const { projectId, firestoreDatabaseId, apiKey } = firebaseConfig;
  if (!projectId || !firestoreDatabaseId || !apiKey) return null;

  // 1. Try app_stats/announcement document
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/app_stats/announcement?key=${apiKey}&_t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const fields = data.fields;
      if (fields) {
        const active = fields.active?.booleanValue ?? false;
        const message = fields.message?.stringValue ?? '';
        const type = (fields.type?.stringValue as any) || 'info';
        const link = fields.link?.stringValue || undefined;
        const linkText = fields.linkText?.stringValue || undefined;

        if (active && message) {
          return { active, message, type, link, linkText };
        }
      }
    }
  } catch (e) {
    console.warn('REST fetch app_stats/announcement failed:', e);
  }

  // 2. Try discussions/official_hq_announcement document
  try {
    const discUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/discussions/official_hq_announcement?key=${apiKey}&_t=${Date.now()}`;
    const res = await fetch(discUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const fields = data.fields;
      if (fields) {
        const isAnnouncement = fields.isAnnouncement?.booleanValue ?? false;
        const content = fields.content?.stringValue ?? '';
        if (isAnnouncement && content) {
          const cleanMsg = content.replace(/^📢\s*\[OFFICIAL ANNOUNCEMENT\]\s*/i, '').split('\n\n🔗')[0];
          const linkMatch = content.match(/🔗\s*([^:]+):\s*(https?:\/\/[^\s]+)/i);
          return {
            active: true,
            message: cleanMsg,
            type: 'info',
            link: linkMatch ? linkMatch[2] : undefined,
            linkText: linkMatch ? linkMatch[1] : undefined
          };
        }
      }
    }
  } catch (e) {
    console.warn('REST fetch discussions/official_hq_announcement failed:', e);
  }

  return null;
}
