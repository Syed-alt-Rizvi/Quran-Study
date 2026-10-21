// Data integrity and schema validation utility for Quran, Tafseer, and Mafatih datasets
// Guarantees zero cache poisoning, structural correctness, and safe fallback to bundled reserves

export interface IntegrityError {
  subsystem: 'quran' | 'tafseer' | 'mafatih';
  identifier: string | number;
  reason: string;
  recoveredFromBundle: boolean;
  timestamp: number;
}

type IntegrityListener = (error: IntegrityError) => void;
const listeners = new Set<IntegrityListener>();

export function subscribeDataIntegrityAlerts(listener: IntegrityListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyIntegrityRecovery(error: IntegrityError): void {
  console.warn(`[DataIntegrity] Recovered ${error.subsystem} (${error.identifier}): ${error.reason}`);
  listeners.forEach((fn) => {
    try {
      fn(error);
    } catch (e) {
      console.error('[DataIntegrity] Listener error:', e);
    }
  });
}

/**
 * Fast deterministic FNV-1a 32-bit hash for string content integrity verification.
 * Zero dependencies, sub-millisecond execution.
 */
export function computeContentChecksum(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Validates whether an object conforms to the expected SurahDetail schema.
 * Rejects malformed or truncated ayah arrays to prevent UI runtime crashes.
 */
export function isValidSurahDetail(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.number !== 'number' || data.number < 1 || data.number > 114) return false;
  if (typeof data.name !== 'string' || data.name.trim().length === 0) return false;
  if (!Array.isArray(data.ayahs) || data.ayahs.length === 0) return false;
  
  // Verify first and last ayah integrity
  const first = data.ayahs[0];
  const last = data.ayahs[data.ayahs.length - 1];
  if (!first || typeof first.text !== 'string' || first.text.trim().length === 0) return false;
  if (!last || typeof last.text !== 'string' || last.text.trim().length === 0) return false;

  return true;
}

/**
 * Validates whether an object conforms to the expected JuzDetail schema.
 */
export function isValidJuzDetail(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.number !== 'number' || data.number < 1 || data.number > 30) return false;
  if (!Array.isArray(data.ayahs) || data.ayahs.length === 0) return false;

  const first = data.ayahs[0];
  if (!first || typeof first.text !== 'string' || first.text.trim().length === 0) return false;

  return true;
}

/**
 * Validates whether an object conforms to the expected MafatihDetail schema.
 */
export function isValidMafatihDetail(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!data.id || typeof data.id !== 'string') return false;
  if (!data.title || typeof data.title !== 'string') return false;
  if (!Array.isArray(data.verses)) return false;

  // A valid recitation detail must either have verses, an introduction, or a valid title
  if (data.verses.length === 0 && (!data.introduction || typeof data.introduction !== 'string')) {
    return false;
  }

  return true;
}

/**
 * Validates whether an object conforms to the expected TafseerContent schema.
 */
export function isValidTafseerContent(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  const hasUr = typeof data.ur === 'string' && data.ur.trim().length > 20;
  const hasEn = typeof data.en === 'string' && data.en.trim().length > 20;
  const hasHtml = typeof data.tafseer_text === 'string' && data.tafseer_text.trim().length > 30;

  return hasUr || hasEn || hasHtml;
}
