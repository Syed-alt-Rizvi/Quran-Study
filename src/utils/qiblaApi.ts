// Canonical Qibla Geodesy & High-Precision Sensor Utilities
// Full client-side Great-Circle forward azimuth calculation with True North declination & 2D unit-vector filtering

export const KAABA_COORDINATES = {
  latitude: 21.4225, // Fixed 21.4225° N
  longitude: 39.8262  // Fixed 39.8262° E
};

export interface QiblaResult {
  direction: number; // Degrees from True North (0 - 359.9°)
  compassBearing: string; // e.g. "ENE", "WNW"
  distanceKm: number; // Kilometers to the Holy Kaaba
  location: {
    latitude: number;
    longitude: number;
  };
  source: 'geodesic' | 'ummahapi';
}

export interface Vector2D {
  x: number;
  y: number;
}

const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
];

/**
 * Convert degree angle to 16-point cardinal compass string
 */
export function degreesToCompassPoint(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return COMPASS_POINTS[index];
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Great-Circle forward azimuth formula to Mecca:
 * Δlon = lon_Mecca - lon_Device
 * X = cos(lat_Mecca) * sin(Δlon)
 * Y = cos(lat_Device) * sin(lat_Mecca) - sin(lat_Device) * cos(lat_Mecca) * cos(Δlon)
 * Qibla_Bearing = atan2(X, Y) normalized to 0-360°
 */
export function calculateGeodesicQibla(
  latitude: number,
  longitude: number
): { direction: number; distanceKm: number; compassBearing: string } {
  const phiDevice = toRadians(latitude);
  const phiMecca = toRadians(KAABA_COORDINATES.latitude);
  const deltaLon = toRadians(KAABA_COORDINATES.longitude - longitude);

  // Exact forward azimuth formula
  const x = Math.cos(phiMecca) * Math.sin(deltaLon);
  const y = Math.cos(phiDevice) * Math.sin(phiMecca) - Math.sin(phiDevice) * Math.cos(phiMecca) * Math.cos(deltaLon);
  
  let bearing = toDegrees(Math.atan2(x, y));
  bearing = (bearing + 360) % 360;

  // Haversine formula for distance in kilometers
  const deltaPhi = phiMecca - phiDevice;
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phiDevice) * Math.cos(phiMecca) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const earthRadiusKm = 6371;
  const distanceKm = Math.round(earthRadiusKm * c);

  return {
    direction: Math.round(bearing * 10) / 10,
    distanceKm,
    compassBearing: degreesToCompassPoint(bearing)
  };
}

/**
 * Estimate magnetic declination in degrees for a given latitude and longitude.
 * Used to convert Magnetic North readings to Geographic True North when OS doesn't provide True Heading.
 * True Heading = Magnetic Heading + Magnetic Declination
 */
export function estimateMagneticDeclination(latitude: number, longitude: number): number {
  const latRad = toRadians(latitude);
  const lonRad = toRadians(longitude);
  
  // Geomagnetic dipole position (2025 epoch: ~86.5° N, 162° E)
  const poleLat = toRadians(86.5);
  const poleLon = toRadians(162.0);
  
  const dLon = poleLon - lonRad;
  const y = Math.sin(dLon);
  const x = Math.cos(latRad) * Math.tan(poleLat) - Math.sin(latRad) * Math.cos(dLon);
  let declination = toDegrees(Math.atan2(y, x));
  
  if (isNaN(declination)) return 0;
  return Math.max(-40, Math.min(40, Math.round(declination * 10) / 10));
}

/**
 * Pure 2D Planar Compass Heading Extraction
 * Ensures only 2D horizontal yaw motion of the phone affects the compass heading.
 * Discards 3D pitch/roll distortion (beta and gamma) for rock-solid, precise Qibla tracking.
 */
/**
 * Safely get device screen orientation angle in degrees (0, 90, 180, 270)
 */
export function getScreenAngle(): number {
  if (typeof window === 'undefined') return 0;
  if (window.screen?.orientation && typeof window.screen.orientation.angle === 'number') {
    return window.screen.orientation.angle;
  }
  if (typeof (window as any).orientation === 'number') {
    return (window as any).orientation;
  }
  return 0;
}

/**
 * Pure 2D Planar Compass Heading Extraction
 * Ensures only 2D horizontal yaw motion of the phone affects the compass heading.
 * Discards 3D pitch/roll distortion (beta and gamma) for rock-solid, precise Qibla tracking.
 */
export function extract2DCompassHeading(
  alpha: number | null | undefined,
  webkitCompassHeading?: number | null | undefined,
  screenAngle: number = 0
): number | null {
  // 1. iOS Safari provides webkitCompassHeading directly relative to True/Magnetic North in 2D
  // (Screen orientation angle is already factored in natively by iOS WebKit)
  if (webkitCompassHeading !== undefined && webkitCompassHeading !== null && !isNaN(webkitCompassHeading)) {
    return (webkitCompassHeading + 360) % 360;
  }

  // 2. Android / W3C: alpha is 2D planar rotation around the vertical earth axis
  // e.alpha increases counter-clockwise, so (360 - alpha) is clockwise compass heading.
  // Add screenAngle to correctly map physical sensor axes when rotated (e.g. landscape mode).
  if (alpha !== null && alpha !== undefined && !isNaN(alpha)) {
    const rawHeading = ((360 - alpha) % 360 + 360) % 360;
    return (rawHeading + screenAngle + 360) % 360;
  }

  return null;
}

/**
 * 2D Unit Vector Math & Low-Pass Filtering
 * Transforms angle into [cos(θ), sin(θ)] Cartesian coordinates, eliminating 0°/360° modular wrapping discontinuities
 */
export function degreesToUnitVector(degrees: number): Vector2D {
  const rad = toRadians(degrees);
  return { x: Math.cos(rad), y: Math.sin(rad) };
}

export function unitVectorToDegrees(v: Vector2D): number {
  const rad = Math.atan2(v.y, v.x);
  let deg = toDegrees(rad);
  return (deg + 360) % 360;
}

export function lowPassFilterVector(current: Vector2D, target: Vector2D, alpha: number): Vector2D {
  const x = current.x + alpha * (target.x - current.x);
  const y = current.y + alpha * (target.y - current.y);
  const len = Math.hypot(x, y);
  if (len === 0) return target;
  return { x: x / len, y: y / len };
}

// In-memory cache for fast local instant lookups
const qiblaCache = new Map<string, QiblaResult>();

/**
 * Instant client-side Qibla computation (pure local mathematical geodesy)
 */
export async function fetchQiblaFromUmmahApi(latitude: number, longitude: number): Promise<QiblaResult> {
  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  if (qiblaCache.has(cacheKey)) {
    return qiblaCache.get(cacheKey)!;
  }

  // Pure local client-side Great-Circle calculation
  const fallback = calculateGeodesicQibla(latitude, longitude);
  const result: QiblaResult = {
    direction: fallback.direction,
    compassBearing: fallback.compassBearing,
    distanceKm: fallback.distanceKm,
    location: { latitude, longitude },
    source: 'geodesic'
  };

  qiblaCache.set(cacheKey, result);
  return result;
}
