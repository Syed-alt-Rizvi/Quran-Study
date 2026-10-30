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
 * W3C Device Orientation Tilt-Compensated Heading
 * Projects the top-of-device vector onto the horizontal plane using intrinsic Z-X-Y Euler rotation angles (alpha, beta, gamma).
 * Prevents compass distortion when the device is held naturally at a tilted angle (30° to 70°).
 */
export function calculateTiltCompensatedHeading(
  alpha: number,
  beta: number | null,
  gamma: number | null
): number {
  const alphaRad = toRadians(alpha);
  const betaRad = toRadians(beta ?? 0);
  const gammaRad = toRadians(gamma ?? 0);

  const cA = Math.cos(alphaRad);
  const sA = Math.sin(alphaRad);
  const cB = Math.cos(betaRad);
  const sB = Math.sin(betaRad);
  const cG = Math.cos(gammaRad);
  const sG = Math.sin(gammaRad);

  // Projection of device Y-axis (top of device) onto the Earth horizontal plane
  const rA = -cA * sG - sA * sB * cG;
  const rB = -sA * sG + cA * sB * cG;

  // When lying completely flat (beta near 0, gamma near 0), rA and rB approach 0
  if (Math.hypot(rA, rB) < 1e-4) {
    return (360 - alpha) % 360;
  }

  const deg = toDegrees(Math.atan2(rA, rB));
  return (deg + 360) % 360;
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
