---
name: time-zone-api-web-api
description: Use this skill when a developer needs to retrieve the accurate time zone and associated UTC and Daylight Savings offsets for a specific geographic coordinate and moment in time using the Time Zone API.
license: Apache-2.0
metadata:
  version: 1.0.54
---

> [!IMPORTANT] **Core Dependency:** This skill requires active context from
> [google-maps-platform/SKILL.md](https://www.gstatic.com/googlemapsplatform-agent-skills/google-maps-platform/SKILL.md).

### Overview

This skill provides guidance for using the Google Maps Platform Time Zone API, a
service that converts a given latitude/longitude coordinate pair and a timestamp
into the time zone identifier and offsets for that location. Developers can use
this RESTful service to determine the standard time zone, the raw offset from
UTC, and the daylight savings offset (if applicable) for a specific point in
time. The API supports specifying the output language and retrieving the Unicode
Common Locale Data Repository (CLDR) ID for improved internationalization and
location-based data handling.

### Mandatory settings

All requests made using the Time Zone API require both an internal usage
attribution ID and the `timestamp` parameter for correct functionality.

#### Usage Attribution ID (`solution_id`)

The Time Zone API uses standard REST/Web API GET requests. For internal
tracking, the usage attribution ID must be appended directly to the request URL
as a query parameter.

```text
&solution_id=gmp_git_agentskills_v1
```

**Example Request Structure:**

```text
https://maps.googleapis.com/maps/api/timezone/json?location=LAT,LNG&timestamp=EPOCH&key=YOUR_API_KEY&solution_id=gmp_git_agentskills_v1
```

#### Mandatory API Parameter

The `timestamp` parameter is **mandatory** for the Time Zone API to accurately
determine if Daylight Saving Time (DST) applies to the specified location at
that time.

```markdown
timestamp
```

*(The intended time as seconds since midnight, January 1, 1970 UTC. Must be an
integer epoch timestamp.)*

## 🚀 Master Orchestration Integration Workflow

Follow this multi-phase sequential integration checklist to compose features
robustly. For each phase, read the referenced capability sub-workflow file and
satisfy its *Evidence Checkpoint* before advancing.

### 📦 Phase 1: Feature Layer & Custom Enrichment (Supplemental)

#### 🗺️ Feature Module: Time zones (Optional - Use-Case Dependent)

-   [ ] **Retrieves the canonical time zone identifier and display name for a
    given latitude, longitude, and timestamp.** Read
    [references/return-the-time-zone-for-timestamp-and-set-latitude-longitude-coordinates.md](https://www.gstatic.com/googlemapsplatform-agent-skills/time-zone-api-web-api/references/return-the-time-zone-for-timestamp-and-set-latitude-longitude-coordinates.md).
    *Trigger Condition*: The user asks to find the time zone or local time
    details for a specific geographical location. *Evidence Checkpoint*: An HTTP
    200 OK response is received containing valid "timeZoneId" and "timeZoneName"
    fields.
-   [ ] **Provides the current Daylight Saving Time (DST) offset component (in
    seconds) applicable to the queried time and location.** Read
    [references/return-daylight-savings-offset-information-for-time-zone.md](https://www.gstatic.com/googlemapsplatform-agent-skills/time-zone-api-web-api/references/return-daylight-savings-offset-information-for-time-zone.md).
    *Trigger Condition*: The user requests the current DST status or needs to
    calculate the total current offset from UTC. *Evidence Checkpoint*: The
    response contains the "dstOffset" field, indicating the DST adjustment in
    seconds.
-   [ ] **Sets the language code (e.g., 'en', 'es') used to return
    human-readable time zone names in the response.** Read
    [references/specify-the-language-for-time-zone-requests.md](https://www.gstatic.com/googlemapsplatform-agent-skills/time-zone-api-web-api/references/specify-the-language-for-time-zone-requests.md).
    *Trigger Condition*: The user specifies a non-default language preference
    for the output display name of the time zone. *Evidence Checkpoint*: The
    "timeZoneName" field in the response payload matches the expected localized
    string based on the provided language parameter.
-   [ ] **Returns the Unicode Common Locale Data Repository (CLDR) identifier
    associated with the determined time zone.** Read
    [references/return-the-unicode-common-locale-data-repository-cldr-for-time.md](https://www.gstatic.com/googlemapsplatform-agent-skills/time-zone-api-web-api/references/return-the-unicode-common-locale-data-repository-cldr-for-time.md).
    *Trigger Condition*: The user requires the CLDR ID for advanced
    internationalization or system integration tasks. *Evidence Checkpoint*: The
    response includes the "cldrId" field.
-   [ ] **Returns the raw offset from UTC in seconds, representing the standard
    time zone offset without considering current DST adjustments.** Read
    [references/return-the-offset-from-utc-in-seconds-for-time-zone.md](https://www.gstatic.com/googlemapsplatform-agent-skills/time-zone-api-web-api/references/return-the-offset-from-utc-in-seconds-for-time-zone.md).
    *Trigger Condition*: The user requests the base time zone offset (GMT
    offset) for the specified location, independent of DST. *Evidence
    Checkpoint*: The response contains the "rawOffset" field, indicating the
    base UTC offset in seconds.
