package com.tafseerenamoona.app;

import android.app.AlarmManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * AdhanNativePlugin
 * Capacitor Native Bridge between React/TypeScript and Android's OS-Level AlarmManager.
 * Manages exact alarm permissions (Android 12/14+), battery optimization bypass,
 * and background 48-hour prayer queue scheduling.
 */
@CapacitorPlugin(name = "AdhanNative")
public class AdhanNativePlugin extends Plugin {

    @PluginMethod
    public void scheduleAlarms(PluginCall call) {
        Context context = getContext();

        String todayDate = call.getString("todayDate", "");
        String fajrToday = call.getString("fajrToday", "");
        String dhuhrToday = call.getString("dhuhrToday", "");
        String maghribToday = call.getString("maghribToday", "");

        String tomorrowDate = call.getString("tomorrowDate", "");
        String fajrTomorrow = call.getString("fajrTomorrow", "");
        String dhuhrTomorrow = call.getString("dhuhrTomorrow", "");
        String maghribTomorrow = call.getString("maghribTomorrow", "");

        boolean autoPlayFajr = call.getBoolean("autoPlayFajr", true);
        boolean autoPlayDhuhr = call.getBoolean("autoPlayDhuhr", true);
        boolean autoPlayMaghrib = call.getBoolean("autoPlayMaghrib", true);

        double latitude = call.getDouble("latitude", 0.0);
        double longitude = call.getDouble("longitude", 0.0);

        try {
            // 1. Save all timings and settings persistently in SharedPreferences
            AdhanStorage.saveTimings(
                    context,
                    todayDate, fajrToday, dhuhrToday, maghribToday,
                    tomorrowDate, fajrTomorrow, dhuhrTomorrow, maghribTomorrow,
                    autoPlayFajr, autoPlayDhuhr, autoPlayMaghrib,
                    latitude, longitude
            );

            // 2. Schedule alarms via AlarmManager.setAlarmClock()
            AdhanScheduler.reschedule48HourQueue(context);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "48-hour Shia Adhan queue scheduled via AlarmManager.setAlarmClock");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to schedule alarms: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void cancelAllAlarms(PluginCall call) {
        try {
            AdhanScheduler.cancelAllAlarms(getContext());
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to cancel alarms", e);
        }
    }

    @PluginMethod
    public void checkExactAlarmPermission(PluginCall call) {
        Context context = getContext();
        boolean granted = AdhanScheduler.canScheduleExactAlarms(context);
        boolean required = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S;

        JSObject ret = new JSObject();
        ret.put("granted", granted);
        ret.put("required", required);
        ret.put("sdkInt", Build.VERSION.SDK_INT);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestExactAlarmPermission(PluginCall call) {
        Context context = getContext();
        JSObject ret = new JSObject();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null && !alarmManager.canScheduleExactAlarms()) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.parse("package:" + context.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
                ret.put("opened", true);
                call.resolve(ret);
                return;
            }
        }

        ret.put("opened", false);
        ret.put("alreadyGranted", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void checkBatteryOptimization(PluginCall call) {
        Context context = getContext();
        boolean ignoring = false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                ignoring = pm.isIgnoringBatteryOptimizations(context.getPackageName());
            }
        } else {
            ignoring = true;
        }

        JSObject ret = new JSObject();
        ret.put("ignoringBatteryOptimizations", ignoring);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimization(PluginCall call) {
        Context context = getContext();
        JSObject ret = new JSObject();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                if (pm != null && !pm.isIgnoringBatteryOptimizations(context.getPackageName())) {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + context.getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                    ret.put("requested", true);
                    call.resolve(ret);
                    return;
                }
            } catch (Exception e) {
                ret.put("error", e.getMessage());
            }
        }

        ret.put("requested", false);
        call.resolve(ret);
    }

    @PluginMethod
    public void playAdhanNow(PluginCall call) {
        Context context = getContext();
        String prayerName = call.getString("prayerName", "Shia Adhan");

        try {
            Intent serviceIntent = new Intent(context, AdhanPlaybackService.class);
            serviceIntent.setAction(AdhanPlaybackService.ACTION_START_PLAYBACK);
            serviceIntent.putExtra(AdhanPlaybackService.EXTRA_PRAYER_NAME, prayerName);

            ContextCompat.startForegroundService(context, serviceIntent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to trigger Adhan service: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopAdhanPlayback(PluginCall call) {
        Context context = getContext();
        try {
            Intent serviceIntent = new Intent(context, AdhanPlaybackService.class);
            serviceIntent.setAction(AdhanPlaybackService.ACTION_STOP_PLAYBACK);
            context.startService(serviceIntent);

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to stop Adhan playback", e);
        }
    }

    @PluginMethod
    public void getAlarmStatus(PluginCall call) {
        Context context = getContext();
        JSObject ret = new JSObject();
        ret.put("hasStoredTimings", AdhanStorage.hasStoredTimings(context));
        ret.put("todayDate", AdhanStorage.getTodayDate(context));
        ret.put("fajrToday", AdhanStorage.getFajrToday(context));
        ret.put("dhuhrToday", AdhanStorage.getDhuhrToday(context));
        ret.put("maghribToday", AdhanStorage.getMaghribToday(context));
        ret.put("autoPlayFajr", AdhanStorage.isFajrEnabled(context));
        ret.put("autoPlayDhuhr", AdhanStorage.isDhuhrEnabled(context));
        ret.put("autoPlayMaghrib", AdhanStorage.isMaghribEnabled(context));
        ret.put("canScheduleExactAlarms", AdhanScheduler.canScheduleExactAlarms(context));
        call.resolve(ret);
    }
}
