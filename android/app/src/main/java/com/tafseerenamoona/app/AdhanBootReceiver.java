package com.tafseerenamoona.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.PowerManager;
import android.util.Log;

/**
 * AdhanBootReceiver
 * Triggered upon device restart, timezone changes, manual clock adjustments, or app update.
 * Since AlarmManager alarms are cleared on reboot, this receiver immediately restores
 * the full 48-Hour Shia prayer alarm clock queue and refreshes home screen widgets.
 */
public class AdhanBootReceiver extends BroadcastReceiver {
    private static final String TAG = "AdhanBootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;

        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ShiaMarkaz::BootReceiverWakeLock");
            wakeLock.acquire(45 * 1000L); // 45s safety max
        }

        try {
            String action = intent.getAction();
            Log.i(TAG, "AdhanBootReceiver received broadcast: " + action);

            // Re-arm the entire 48-hour queue
            AdhanScheduler.reschedule48HourQueue(context);

            // Refresh home screen prayer widget
            String fajr = AdhanStorage.getFajrToday(context);
            String dhuhr = AdhanStorage.getDhuhrToday(context);
            String maghrib = AdhanStorage.getMaghribToday(context);
            AdhanStorage.updateWidgets(context, fajr, dhuhr, maghrib);

        } catch (Exception e) {
            Log.e(TAG, "Failed to reschedule adhan alarms after boot/timezone event", e);
        } finally {
            if (wakeLock != null && wakeLock.isHeld()) {
                try {
                    wakeLock.release();
                } catch (Exception ignored) {}
            }
        }
    }
}
