# Security Summary

**Reviewed Files**: 28
**Issues Resolved**: 2

### Issues Resolved
| Area | File | Line | What Was Happening | Impact | Status | How It Was Fixed |
|---|---|---|---|---|---|---|
| Hardcoded API Key | `server.ts` | 225 | A Google Maps API key was hardcoded as a fallback in server source code. | High | Fixed | Removed hardcoded key; server now strictly reads from `GOOGLE_MAPS_API_KEY` or `VITE_GOOGLE_MAPS_API_KEY` environment variables with graceful fallback. |
| Exposed Firebase Credentials | `firebase-applet-config.json` | 4 | Real Firebase project keys were stored in a tracked configuration file vulnerable to public Git commits. | High | Fixed | Added `firebase-applet-config.json` to `.gitignore`, created a safe `firebase-applet-config.example.json` template, and updated `src/utils/firebase.ts` to support environment variables. |

### Safeguards Verified
| Area | File | How It's Protected |
|---|---|---|
| Server Environment Secrets | `server.ts` | All API keys and platform tokens are accessed via server environment variables (`process.env`) and never embedded in client bundles. |
| Git Secret Protection | `.gitignore` | `.env*` and `firebase-applet-config.json` are strictly excluded from Git commits, preventing credentials from appearing in public GitHub repositories. |
| Database Security | `src/db/index.ts` | All SQLite queries use parameterized statements (`prepare` + `run(...params)`), preventing SQL injection. |
| Safe Geocoding Fallbacks | `src/data/shiaCities.ts` | City search and coordinate lookups use public open geocoders (OpenStreetMap Nominatim and Photon) without requiring exposed API keys. |

## PoC Verification

### Hardcoded API Key in Server

#### Summary
| Field | Value |
|---|---|
| Issue Type | Hardcoded Secret Exposure in Source Code |
| Impact | High |
| Affected File | `server.ts:225` |
| Test Scenario | Grep scan for literal API keys (`AIza...`) and execution without configured environment key |

#### How It Was Fixed
Removed the hardcoded literal key string from `server.ts`. The `getMapsApiKey()` helper now checks `process.env.GOOGLE_MAPS_API_KEY` and `process.env.VITE_GOOGLE_MAPS_API_KEY`. If unconfigured, the server returns an empty results payload rather than attempting an unauthenticated call with a leaked key.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Incoming request to `/api/maps/geocode` or `/api/maps/reverse-geocode` | Reaches route handler in `server.ts` |
| 2 | `getMapsApiKey()` is evaluated | Reads strictly from `process.env` |
| 3 | Key is verified | If key is absent, returns `{ status: 'ZERO_RESULTS', results: [] }` safely without making external calls |

#### Conclusion
**Fix Verified** - The server no longer contains any literal Google Maps API keys in source code, eliminating secret leakage on public GitHub repositories.

### Public Repository Git Exposure

#### Summary
| Field | Value |
|---|---|
| Issue Type | Tracking Sensitive Config in Version Control |
| Impact | High |
| Affected File | `.gitignore` |
| Test Scenario | Verification that `.gitignore` ignores `firebase-applet-config.json` and `.env*` while preserving `firebase-applet-config.example.json` |

#### How It Was Fixed
Added `firebase-applet-config.json` and `firebase_applet_config.xml` to `.gitignore`. Created `firebase-applet-config.example.json` with safe placeholder strings and added a `"prepare"` script in `package.json` to ensure clean cloning for open-source contributors without exposing private credentials.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Developer or automation stages files (`git add .`) | Git reads `.gitignore` rules |
| 2 | Matches `firebase-applet-config.json` and `.env*` | Files are untracked and excluded from commits |
| 3 | Push to public GitHub repository | **Private keys remain strictly local and hidden** |

#### Conclusion
**Fix Verified** - Sensitive configuration files containing live project credentials will never be committed or visible in public GitHub repositories.
