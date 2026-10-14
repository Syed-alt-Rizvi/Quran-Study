# iOS High-Precision Shia Adhan Architecture & Critical Alerts Setup

This document specifies the exact architecture and implementation for reliable, to-the-second Shia Adhan playback on Apple iOS devices, fulfilling all Apple App Store guidelines and hardware mute switch bypass capabilities.

---

## 1. Operating System Background Execution Constraints on iOS

Apple strictly forbids arbitrary background CPU loops, background timers (`NSTimer`, `Task.sleep`), or background WebSocket threads. If an app attempts to run a continuous background loop to check prayer times, iOS **instantly suspends or terminates the process** within 30 seconds.

### The Correct iOS Solution
Instead of running background loops, **Shia Markaz uses Apple's native UserNotifications framework with `UNCalendarNotificationTrigger`**.
- A rolling 48-hour queue (Today + Tomorrow: Fajr, Dhuhr, and Maghrib) is computed and pre-registered directly into the iOS kernel.
- The operating system kernel itself triggers the alert at the exact second, regardless of whether the app is in the foreground, background, suspended, or completely terminated by the user.

---

## 2. Bypassing Hardware Mute Switch and Focus Modes (Critical Alerts)

Standard iOS local notifications are silenced when the iPhone's physical hardware switch is set to Mute / Silent mode, or when Do Not Disturb / Focus Mode is active.

To guarantee that the **Adhan rings aloud as an authentic alarm clock**, Apple provides the **Critical Alerts** entitlement (`com.apple.developer.usernotifications.critical-alerts`).

### Step A: Request the Entitlement from Apple Developer Portal
1. Navigate to [developer.apple.com/contact/request/notifications-critical-alerts-entitlement](https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement).
2. Provide your App ID: `com.tafseerenamoona.app`.
3. Category: **Alarm / Religious Prayer Call Clock**.
4. Explanation: *"Shia Markaz is a devotional prayer alarm clock application. Critical Alerts ensure that user-configured daily prayer calls (Adhan) sound at the prescribed astronomical prayer times even if the device hardware mute switch is toggled or Focus Mode is engaged."*

### Step B: Xcode Entitlements (`App.entitlements`)
Add the boolean key `com.apple.developer.usernotifications.critical-alerts` to your iOS Target entitlements:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.usernotifications.critical-alerts</key>
    <true/>
</dict>
</plist>
```

### Step C: Requesting Authorization in `AppDelegate.swift`
In your `AppDelegate.swift`, request authorization including `.criticalAlert`:

```swift
import UIKit
import UserNotifications
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        
        // Request authorization with Critical Alert permission
        center.requestAuthorization(options: [.alert, .sound, .badge, .criticalAlert]) { granted, error in
            if granted {
                print("Adhan Critical Alert permission granted by user.")
            } else if let error = error {
                print("Error requesting notification authorization: \(error.localizedDescription)")
            }
        }
        
        return true
    }

    // Deliver critical alert sound even while app is currently in foreground
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .list])
    }
}
```

### Step D: Scheduling with `UNCalendarNotificationTrigger` and Critical Sound
In native Swift (or mapped via `@capacitor/local-notifications`):

```swift
let content = UNMutableNotificationContent()
content.title = "Shia Adhan • Fajr (Subh)"
content.body = "It is now time for Fajr prayer (Ja'fari Method)"
// Critical alert sound at 100% volume bypassing mute switch
content.sound = UNNotificationSound.criticalSoundNamed(UNNotificationSoundName("shia_adhan.caf"), withAudioVolume: 1.0)
content.categoryIdentifier = "SHIA_ADHAN_CATEGORY"

var dateComponents = DateComponents()
dateComponents.year = 2026
dateComponents.month = 10
dateComponents.day = 15
dateComponents.hour = 5
dateComponents.minute = 12
dateComponents.second = 0

let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: false)
let request = UNNotificationRequest(identifier: "shia_adhan_fajr_today", content: content, trigger: trigger)

UNUserNotificationCenter.current().add(request) { error in
    if let error = error {
        print("Failed to schedule Adhan: \(error)")
    }
}
```

---

## 3. Audio Asset Formatting for iOS

iOS requires notification audio files to be in one of the following formats packaged in the Main App Bundle:
- Linear PCM (`.caf` or `.wav`)
- IMA4 / AAC (`.caf`)
- MP3 (`.mp3` or `.caf`)

The bundled sound file is placed in `ios/App/App/shia_adhan.caf` (or `.mp3`) and referenced by name in `sound: 'shia_adhan.mp3'`.

---

## 4. Summary of Guarantees
1. **Zero Battery Drain**: No infinite polling loops or background drain.
2. **Reliable Wake-Up**: Kernel-level firing via `UNCalendarNotificationTrigger`.
3. **Mute Switch Bypass**: Full audio output through `UNNotificationSound.criticalSoundNamed`.
4. **48-Hour Safety Net**: Two consecutive days of prayer times are always queued in advance.
