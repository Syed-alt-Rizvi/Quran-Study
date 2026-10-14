package com.tafseerenamoona.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import java.util.Calendar;

/**
 * AdhanScheduler
 * High-precision scheduling engine utilizing AlarmManager.setAlarmClock().
 * Guarantees to-the-second execution during deep Doze Mode and OEM task-killer states.
 * Manages a rolling 48-hour prayer queue and a daily "Midnight Refresh" cycle.
 */
public class AdhanScheduler {
    private static final String TAG = "AdhanScheduler";

    // Request Codes for distinct prayer and refresh alarms
    public static final int RC_FAJR_TODAY = 1001;
    public static final int RC_DHUHR_TODAY = 1002;
    public static final int RC_MAGHRIB_TODAY = 1003;

    public static final int RC_FAJR_TOMORROW = 2001;
    public static final int RC_DHUHR_TOMORROW = 2002;
    public static final int RC_MAGHRIB_TOMORROW = 2003;

    public static final int RC_MIDNIGHT_REFRESH = 9999;

    /**
     * Checks if exact alarm scheduling is granted by the system (Android 12+ / API 31+)
     */
    public static boolean canScheduleExactAlarms(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            return alarmManager != null && alarmManager.canScheduleExactAlarms();
        }
        return true;
    }

    /**
     * Schedules a single exact alarm clock event via AlarmManager.setAlarmClock()
     */
    public static void setAlarmClock(Context context, long triggerAtMillis, int requestCode, String prayerName, String action) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                Log.w(TAG, "Cannot schedule exact alarm: SCHEDULE_EXACT_ALARM permission not granted!");
                return;
            }
        }

        // 1. Intent that triggers the BroadcastReceiver when alarm fires
        Intent receiverIntent = new Intent(context, AdhanAlarmReceiver.class);
        receiverIntent.setAction(action);
        receiverIntent.putExtra(AdhanAlarmReceiver.EXTRA_PRAYER_NAME, prayerName);

        PendingIntent operationIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                receiverIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // 2. Intent shown on lockscreen / status bar if user taps alarm clock icon
        Intent showIntent = new Intent(context, MainActivity.class);
        showIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent showPendingIntent = PendingIntent.getActivity(
                context,
                requestCode + 10000,
                showIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        AlarmManager.AlarmClockInfo clockInfo = new AlarmManager.AlarmClockInfo(triggerAtMillis, showPendingIntent);

        try {
            alarmManager.setAlarmClock(clockInfo, operationIntent);
            Log.i(TAG, String.format("AlarmClock set: %s at %d (RC: %d)", prayerName, triggerAtMillis, requestCode));
        } catch (SecurityException se) {
            Log.e(TAG, "SecurityException while setting AlarmClock", se);
        }
    }

    /**
     * Parse "HH:mm" time string into epoch milliseconds for a given date offset (0 = today, 1 = tomorrow)
     */
    public static long parsePrayerTimeToMillis(String timeStr, int dayOffset) {
        if (timeStr == null || timeStr.trim().isEmpty()) return -1;
        try {
            String clean = timeStr.trim().split(" ")[0];
            String[] parts = clean.split(":");
            if (parts.length < 2) return -1;

            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);

            Calendar cal = Calendar.getInstance();
            if (dayOffset != 0) {
                cal.add(Calendar.DAY_OF_YEAR, dayOffset);
            }
            cal.set(Calendar.HOUR_OF_DAY, hour);
            cal.set(Calendar.MINUTE, minute);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);

            return cal.getTimeInMillis();
        } catch (Exception e) {
            return -1;
        }
    }

    /**
     * Cancels all scheduled prayer alarms and refresh alarms
     */
    public static void cancelAllAlarms(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        int[] requestCodes = {
                RC_FAJR_TODAY, RC_DHUHR_TODAY, RC_MAGHRIB_TODAY,
                RC_FAJR_TOMORROW, RC_DHUHR_TOMORROW, RC_MAGHRIB_TOMORROW,
                RC_MIDNIGHT_REFRESH
        };

        for (int rc : requestCodes) {
            Intent intent = new Intent(context, AdhanAlarmReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(
                    context,
                    rc,
                    intent,
                    PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
            );
            if (pi != null) {
                alarmManager.cancel(pi);
                pi.cancel();
            }
        }
        Log.i(TAG, "All scheduled Adhan alarms cancelled cleanly.");
    }

    /**
     * Reads prayer timings from storage and arms the complete 48-Hour Rolling Queue
     * plus the daily Midnight Refresh cycle.
     */
    public static void reschedule48HourQueue(Context context) {
        if (!AdhanStorage.hasStoredTimings(context)) {
            Log.w(TAG, "No stored timings to schedule.");
            return;
        }

        cancelAllAlarms(context);

        long now = System.currentTimeMillis();
        boolean autoFajr = AdhanStorage.isFajrEnabled(context);
        boolean autoDhuhr = AdhanStorage.isDhuhrEnabled(context);
        boolean autoMaghrib = AdhanStorage.isMaghribEnabled(context);

        // 1. TODAY'S PRAYERS (Day Offset 0)
        String fajrToday = AdhanStorage.getFajrToday(context);
        String dhuhrToday = AdhanStorage.getDhuhrToday(context);
        String maghribToday = AdhanStorage.getMaghribToday(context);

        if (autoFajr) {
            long tFajr = parsePrayerTimeToMillis(fajrToday, 0);
            if (tFajr > now) {
                setAlarmClock(context, tFajr, RC_FAJR_TODAY, "Fajr (Subh)", AdhanAlarmReceiver.ACTION_TRIGGER_ADHAN);
            }
        }

        if (autoDhuhr) {
            long tDhuhr = parsePrayerTimeToMillis(dhuhrToday, 0);
            if (tDhuhr > now) {
                setAlarmClock(context, tDhuhr, RC_DHUHR_TODAY, "Dhuhr (Zuhr)", AdhanAlarmReceiver.ACTION_TRIGGER_ADHAN);
            }
        }

        if (autoMaghrib) {
            long tMaghrib = parsePrayerTimeToMillis(maghribToday, 0);
            if (tMaghrib > now) {
                setAlarmClock(context, tMaghrib, RC_MAGHRIB_TODAY, "Maghrib", AdhanAlarmReceiver.ACTION_TRIGGER_ADHAN);
            }
        }

        // 2. TOMORROW'S PRAYERS (Day Offset 1)
        String fajrTomorrow = AdhanStorage.getFajrTomorrow(context);
        String dhuhrTomorrow = AdhanStorage.getDhuhrTomorrow(context);
        String maghribTomorrow = AdhanStorage.getMaghribTomorrow(context);

        // Fallback to today's times if tomorrow was not calculated yet
        if (fajrTomorrow.isEmpty()) fajrTomorrow = fajrToday;
        if (dhuhrTomorrow.isEmpty()) dhuhrTomorrow = dhuhrToday;
        if (maghribTomorrow.isEmpty()) maghribTomorrow = maghribToday;

        if (autoFajr) {
            long tFajrTom = parsePrayerTimeToMillis(fajrTomorrow, 1);
            if (tFajrTom > now) {
                setAlarmClock(context, tFajrTom, RC_FAJR_TOMORROW, "Fajr (Subh)", AdhanAlarmReceiver.ACTION_TRIGGER_ADHAN);
            }
        }

        if (autoDhuhr) {
            long tDhuhrTom = parsePrayerTimeToMillis(dhuhrTomorrow, 1);
            if (tDhuhrTom > now) {
                setAlarmClock(context, tDhuhrTom, RC_DHUHR_TOMORROW, "Dhuhr (Zuhr)", AdhanAlarmReceiver.ACTION_TRIGGER_ADHAN);
            }
        }

        if (autoMaghrib) {
            long tMaghribTom = parsePrayerTimeToMillis(maghribTomorrow, 1);
            if (tMaghribTom > now) {
                setAlarmClock(context, tMaghribTom, RC_MAGHRIB_TOMORROW, "Maghrib", AdhanAlarmReceiver.ACTION_TRIGGER_ADHAN);
            }
        }

        // 3. MIDNIGHT REFRESH ALARM (Scheduled for next 00:02 AM)
        Calendar midnightCal = Calendar.getInstance();
        midnightCal.set(Calendar.HOUR_OF_DAY, 0);
        midnightCal.set(Calendar.MINUTE, 2);
        midnightCal.set(Calendar.SECOND, 0);
        midnightCal.set(Calendar.MILLISECOND, 0);

        if (midnightCal.getTimeInMillis() <= now) {
            // If already past 00:02 AM today, schedule for 00:02 AM tomorrow
            midnightCal.add(Calendar.DAY_OF_YEAR, 1);
        }

        setAlarmClock(
                context,
                midnightCal.getTimeInMillis(),
                RC_MIDNIGHT_REFRESH,
                "Midnight Prayer Calculation Refresh",
                AdhanAlarmReceiver.ACTION_MIDNIGHT_REFRESH
        );

        Log.i(TAG, "48-Hour Shia Adhan rolling queue re-armed successfully.");
    }
}
