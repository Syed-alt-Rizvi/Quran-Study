# Subsystem 1: Data Layer Hardening & Resilience

A comprehensive architectural plan and deep-dive technical audit to harden Shia Markaz's data layer across Quran text, Shia tafsir commentaries, translations, and Mafatih supplications—preventing data corruption, network stalls, and cache poisoning while guaranteeing reliable offline-first fallback and executing strictly within today's quota limit.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions govern this implementation:
> - **Quota Limit & High-Efficiency Execution**: Strict adherence to the user's directive: execute all modifications efficiently without wasting tool calls. Edits are batched across target files in single passes, using deferred verification (`compile_applet` and `lint_applet` only at the end) to preserve API quota.
> - **Data Corruption & Schema Handling**: When data corruption, invalid formatting, or malformed payloads are detected in Quran or Mafatih records, the system must immediately fall back to verified bundled assets and notify the user with a non-intrusive recovery notice.
> - **Offline & Dual-Environment Caching**: Architect a hybrid caching strategy combining high-throughput memory caching (Tier 1), versioned IndexedDB with storage quota resilience (Tier 2), and bundled verified static fallback (Tier 3) to guarantee 0ms latency in high-speed zones and 100% reliability in low-connectivity areas.
> - **Sacred Content Inviolability**: Zero modification or regeneration of Quranic text or sacred supplications. Only structural schema wrapping and fallback piping are applied.

- **Confirmed Decision 1**: Implement defensive runtime schema validation and data integrity checks on all deserialized Quran, Tafseer, and Mafatih payloads before they can enter memory or persistent caches.
- **Confirmed Decision 2**: Introduce a unified Bundled Asset Fallback Registry ensuring that core surahs, ziyaraat, and du'as can never fail or render a blank screen even during catastrophic upstream API outages.
- **Confirmed Decision 3**: Quota preservation guarantee—all file writes and updates are executed sequentially in pristine blocks without exploratory churn.

---

## 1. Overview & Core Concept

- **What It Does**: Hardens the application's foundational data pipeline. Every piece of sacred text, commentary, translation, and supplication loaded from external APIs, local storage, or network proxies is strictly validated against structural schemas, guarded against corrupted local records, and backed by offline bundled reserves.
- **Target Audience**: Believers, researchers, and reciters in both fast metropolitan fiber environments and low-connectivity travel or high-latency rural zones.
- **Key Value**: Zero blank screens, zero silent crashes from corrupted cache entries, and predictable sub-10ms response times for all cached and bundled holy recitations.

---

## 2. Technical Audit: Discover & Interrogate

### A. Discovery: How Subsystem 1 Works Today

1. **Holy Quran Metadata & Chapters**:
   - `src/api.ts` (`fetchSurahs`): Seeds from `src/surahList.json` into `surahMetaCache`. On cache miss, checks `fastStorage` under key `shia-quran-surahs-cache`, falling back to `https://api.alquran.cloud/v1/surah`.
   - `fetchSurahDetail(id)`: Checks `surahDetailCache` (L1 Map), then `pendingSurahRequests` (in-flight deduplication), then `fastStorage` (`quran-surah-detail-${id}`). If un-cached, requests 4 editions (`quran-uthmani`, `en.asad`, `ur.jalandhry`, `ar.alafasy`) via `fetchWithTimeout` (12s, 1 retry).
   - `fetchJuzDetail(id)`: Executes 4 parallel network calls to `api.alquran.cloud`, strips Bismillah prefixes, applies manual slicing for Juz 20/21 boundary anomalies, and caches the result.

2. **Shia Tafseer Pipeline**:
   - `src/services/tafseerScraper.ts` (`fetchTafseer`):
     - *Tafseer Al-Kauthar*: Checks in-memory cache, then `fastStorage` (IndexedDB), then `localStorage`, then adjacent ayah ranges (e.g. 1–5). On miss, queries static JSON `/tafseer_kauthar/s${s}_a${a}.json`, then backend proxy `/api/tafseer/kauthar/${s}/${a}`, then native HTTP (`CapacitorHttp`), and finally three web CORS proxies.
     - *Tafseer Namoona*: Checks memory, `fastStorage`, static surah bundle `/tafseer_namoona/surah_${s}.json`, server API, and as a final fallback parses raw HTML React Server Component (RSC) chunks (`self.__next_f.push`).

3. **Mafatih Al Jinan Supplications & Duas**:
   - `src/mafatihApi.ts` (`getFullIndex`, `fetchMafatihItem`):
     - Loads `mafatih_index.json` (1500+ recitations).
     - Resolves canonical aliases (`dua-kumayl` -> `maf_dua40`, `ziyarat-ashura` -> `maf_ziy86`).
     - Looks up item detail via in-memory Map, then IndexedDB (`mafatih_detail_${id}`), then bundled JSON `/mafatih_items/${id}.json`, then server API (`/api/mafatih/items/${id}` with 15s timeout).
     - If all fails, synthesizes a fallback object from the index entry.

4. **Storage Engine (`src/utils/fastStorage.ts`)**:
   - Tier 1: In-memory `Map<string, any>` (`memoryL1`).
   - Tier 2: IndexedDB database `shia_markaz_fast_cache` with store `kv_store`.
   - Fallback: `localStorage` capped at 500,000 characters.

---

### B. Interrogation: Weak Points & Failure Modes

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VULNERABILITY SURFACE                           │
├────────────────────────────────┬───────────────────────────────────────┤
│ Failure Mode                   │ Current Real-World Consequence        │
├────────────────────────────────┼───────────────────────────────────────┤
│ 1. Upstream Malformed Response │ api.alquran.cloud returns 200 with    │
│    or Partial Write            │ empty ayahs or error payload. App     │
│                                │ caches corrupted object in IndexedDB. │
│                                │ Next startup throws TypeError.        │
├────────────────────────────────┼───────────────────────────────────────┤
│ 2. Unbounded Fetches           │ mafatih_index.json & static tafseer   │
│    Without Timeout             │ use bare fetch(). Stalls indefinitely │
│                                │ on 2G or captive portals.             │
├────────────────────────────────┼───────────────────────────────────────┤
│ 3. Storage Quota Rejection     │ IndexedDB put() throws QuotaExceeded. │
│                                │ Error is unhandled, leaving state     │
│                                │ inconsistent between memory and disk. │
├────────────────────────────────┼───────────────────────────────────────┤
│ 4. Total Offline Outage on     │ If a user opens an uncached Surah on  │
│    Uncached Surahs             │ an airplane or subway, it throws an   │
│                                │ unhandled network error.              │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Lightweight Runtime Schema Guards vs. Heavy Validation Libraries
- **Chosen Approach**: Built-in, high-speed pure TypeScript schema validator functions with zero runtime dependencies (`src/utils/dataIntegrity.ts`).
- **Why**: Zero external bundle bloat, sub-millisecond execution overhead, and zero third-party vulnerability footprint.
- **Alternatives Considered**:
  - *Zod / Yup*: +40KB bundle penalty, unnecessary parsing overhead on large surah arrays.
  - *No Validation (Status Quo)*: Vulnerable to cache poisoning and corrupt writes.

### Decision 2: Multi-Tier Resilient Caching ("Best of Both Worlds")
- **Chosen Approach**: A 3-tier cascade:
  1. *L1 In-Memory Cache*: 0ms instant retrieval during active sessions.
  2. *L2 IndexedDB Cache with Quota Management*: Asynchronous persistent storage with automatic stale eviction if quota limits are approached.
  3. *L3 Verified Bundled Asset Fallback*: Bundled static JSON data for offline resilience when remote APIs fail.
- **Why**: Delivers instant speed on fast broadband and 100% offline uptime in remote areas.

### Decision 3: Quota-Conscious Implementation Execution
- **Chosen Approach**: Execute all implementation steps with minimal tool churn. Create `src/utils/dataIntegrity.ts`, update `src/utils/fastStorage.ts`, `src/api.ts`, and `src/mafatihApi.ts` in planned contiguous steps, then verify once with `lint_applet` and `compile_applet`.
- **Why**: Preserves token and API call quotas while strictly fulfilling the task.

---

## 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                       Subsystem 1: Data Layer                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  Quran & Translation │ │   Tafseer Service    │ │     Mafatih API      │
│  (src/api.ts)        │ │  (tafseerScraper.ts) │ │   (mafatihApi.ts)    │
└──────────┬───────────┘ └──────────┬───────────┘ └──────────┬───────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Data Integrity & Schema Validator                    │
│     - validateSurahDetail()         - validateMafatihDetail()          │
│     - validateJuzDetail()           - validateTafseerContent()         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                   ┌────────────────┴────────────────┐
                   ▼                                 ▼
      ┌─────────────────────────┐       ┌─────────────────────────┐
      │ Tier 1: In-Memory L1    │       │ Tier 2: fastStorage     │
      │ (Instant Map, 0ms)      │       │ (IndexedDB + Quota)     │
      └─────────────────────────┘       └────────────┬────────────┘
                                                     │ (On Error / Miss)
                                                     ▼
                                        ┌─────────────────────────┐
                                        │ Tier 3: Bundled Fallback│
                                        │ (Static Verified Assets)│
                                        └─────────────────────────┘
```

### Proposed Code Changes & Implementation Steps

1. **Create `src/utils/dataIntegrity.ts`**:
   - Provide lightweight schema validators:
     - `isValidSurahDetail(data: any): data is SurahDetail`
     - `isValidJuzDetail(data: any): data is JuzDetail`
     - `isValidMafatihDetail(data: any): data is MafatihDetail`
     - `isValidTafseerContent(data: any): data is TafseerContent`
   - Provide fallback synthesizers that repair or substitute missing fields from verified bundled datasets without ever altering Quranic text.

2. **Harden `src/utils/fastStorage.ts`**:
   - Add quota error detection (`QuotaExceededError`) with safe fallback.
   - Add record integrity verification on retrieval (ignore and safely evict malformed records).

3. **Harden `src/api.ts`**:
   - Wrap all API responses and IndexedDB reads through `isValidSurahDetail` / `isValidJuzDetail`.
   - Implement graceful fallback to bundled translation arrays if remote editions are truncated.
   - Enforce strict 10s request timeouts with AbortController on all fetch operations.

4. **Harden `src/mafatihApi.ts` & `src/services/tafseerScraper.ts`**:
   - Enforce timeouts on static and proxy fetches.
   - Validate items before placing them into storage to eliminate cache poisoning.
