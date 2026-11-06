package com.tafseerenamoona.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.content.ContextCompat;

/**
 * AdhanAlarmReceiver
 * Receives exact system alarms scheduled via AlarmManager.setAlarmClock().
 * Bypasses Android Doze Mode, OEM App Standby buckets, and deep battery sleep.
 * Holds a CPU WakeLock and starts the AdhanPlaybackService immediately.
 */
public class AdhanAlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AdhanAlarmReceiver";

    public static final String ACTION_TRIGGER_ADHAN = "com.tafseerenamoona.app.ACTION_TRIGGER_ADHAN";
    public static final String ACTION_MIDNIGHT_REFRESH = "com.tafseerenamoona.app.ACTION_MIDNIGHT_REFRESH";
    public static final String EXTRA_PRAYER_NAME = "prayer_name";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;

        // Acquire a temporary WakeLock so device CPU does not sleep before ForegroundService starts
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ShiaMarkaz::ReceiverWakeLock");
            wakeLock.acquire(60 * 1000L); // 60 seconds safety max
        }

        try {
            String action = intent.getAction();
            Log.i(TAG, "AdhanAlarmReceiver woke up with action: " + action);

            if (ACTION_TRIGGER_ADHAN.equals(action)) {
                String prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME);
                if (prayerName == null || prayerName.isEmpty()) {
                    prayerName = "Prayer Time";
                }

                try {
                    java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US);
                    String todayStr = sdf.format(new java.util.Date());
                    AdhanStorage.markPrayerPlayed(context, prayerName, todayStr);
                } catch (Exception ignored) {}

                Intent serviceIntent = new Intent(context, AdhanPlaybackService.class);
                serviceIntent.setAction(AdhanPlaybackService.ACTION_START_PLAYBACK);
                serviceIntent.putExtra(AdhanPlaybackService.EXTRA_PRAYER_NAME, prayerName);

                ContextCompat.startForegroundService(context, serviceIntent);

            } else if (ACTION_MIDNIGHT_REFRESH.equals(action)) {
                Log.i(TAG, "Midnight Refresh alarm fired. Re-queueing next 24-48 hours of Shia prayers.");
                AdhanStorage.advanceDayOnMidnight(context);
                AdhanScheduler.reschedule48HourQueue(context);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling Adhan alarm intent", e);
        } finally {
            if (wakeLock != null && wakeLock.isHeld()) {
                try {
                    wakeLock.release();
                } catch (Exception ignored) {}
            }
        }
    }
}
