package com.tafseerenamoona.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import org.json.JSONObject;

/**
 * AdhanStorage
 * Persists Shia prayer timings (48-hour queue: today + tomorrow),
 * calculation coordinates, and notification preferences to Android SharedPreferences.
 * Accessible by native Background Services and BroadcastReceivers even when the WebView is killed.
 */
public class AdhanStorage {
    private static final String PREF_NAME = "shia_adhan_alarm_prefs";

    private static final String KEY_FAJR_TODAY = "fajr_today";
    private static final String KEY_DHUHR_TODAY = "dhuhr_today";
    private static final String KEY_MAGHRIB_TODAY = "maghrib_today";
    private static final String KEY_TODAY_DATE = "today_date";

    private static final String KEY_FAJR_TOMORROW = "fajr_tomorrow";
    private static final String KEY_DHUHR_TOMORROW = "dhuhr_tomorrow";
    private static final String KEY_MAGHRIB_TOMORROW = "maghrib_tomorrow";
    private static final String KEY_TOMORROW_DATE = "tomorrow_date";

    private static final String KEY_AUTOPLAY_FAJR = "autoplay_fajr";
    private static final String KEY_AUTOPLAY_DHUHR = "autoplay_dhuhr";
    private static final String KEY_AUTOPLAY_MAGHRIB = "autoplay_maghrib";

    private static final String KEY_LATITUDE = "latitude";
    private static final String KEY_LONGITUDE = "longitude";
    private static final String KEY_LAST_SCHEDULED_TIMESTAMP = "last_scheduled_timestamp";

    private static SharedPreferences getPrefs(Context context) {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static void saveTimings(
            Context context,
            String todayDate,
            String fajrToday,
            String dhuhrToday,
            String maghribToday,
            String tomorrowDate,
            String fajrTomorrow,
            String dhuhrTomorrow,
            String maghribTomorrow,
            boolean autoPlayFajr,
            boolean autoPlayDhuhr,
            boolean autoPlayMaghrib,
            double latitude,
            double longitude
    ) {
        SharedPreferences.Editor editor = getPrefs(context).edit();
        editor.putString(KEY_TODAY_DATE, todayDate);
        editor.putString(KEY_FAJR_TODAY, fajrToday);
        editor.putString(KEY_DHUHR_TODAY, dhuhrToday);
        editor.putString(KEY_MAGHRIB_TODAY, maghribToday);

        editor.putString(KEY_TOMORROW_DATE, tomorrowDate);
        editor.putString(KEY_FAJR_TOMORROW, fajrTomorrow);
        editor.putString(KEY_DHUHR_TOMORROW, dhuhrTomorrow);
        editor.putString(KEY_MAGHRIB_TOMORROW, maghribTomorrow);

        editor.putBoolean(KEY_AUTOPLAY_FAJR, autoPlayFajr);
        editor.putBoolean(KEY_AUTOPLAY_DHUHR, autoPlayDhuhr);
        editor.putBoolean(KEY_AUTOPLAY_MAGHRIB, autoPlayMaghrib);

        editor.putString(KEY_LATITUDE, String.valueOf(latitude));
        editor.putString(KEY_LONGITUDE, String.valueOf(longitude));
        editor.putLong(KEY_LAST_SCHEDULED_TIMESTAMP, System.currentTimeMillis());
        editor.apply();

        // Update home screen widget with fresh timings
        updateWidgets(context, fajrToday, dhuhrToday, maghribToday);
    }

    public static String getFajrToday(Context context) {
        return getPrefs(context).getString(KEY_FAJR_TODAY, "");
    }

    public static String getDhuhrToday(Context context) {
        return getPrefs(context).getString(KEY_DHUHR_TODAY, "");
    }

    public static String getMaghribToday(Context context) {
        return getPrefs(context).getString(KEY_MAGHRIB_TODAY, "");
    }

    public static String getTodayDate(Context context) {
        return getPrefs(context).getString(KEY_TODAY_DATE, "");
    }

    public static String getFajrTomorrow(Context context) {
        return getPrefs(context).getString(KEY_FAJR_TOMORROW, "");
    }

    public static String getDhuhrTomorrow(Context context) {
        return getPrefs(context).getString(KEY_DHUHR_TOMORROW, "");
    }

    public static String getMaghribTomorrow(Context context) {
        return getPrefs(context).getString(KEY_MAGHRIB_TOMORROW, "");
    }

    public static String getTomorrowDate(Context context) {
        return getPrefs(context).getString(KEY_TOMORROW_DATE, "");
    }

    public static boolean isFajrEnabled(Context context) {
        return getPrefs(context).getBoolean(KEY_AUTOPLAY_FAJR, true);
    }

    public static boolean isDhuhrEnabled(Context context) {
        return getPrefs(context).getBoolean(KEY_AUTOPLAY_DHUHR, true);
    }

    public static boolean isMaghribEnabled(Context context) {
        return getPrefs(context).getBoolean(KEY_AUTOPLAY_MAGHRIB, true);
    }

    public static double getLatitude(Context context) {
        try {
            return Double.parseDouble(getPrefs(context).getString(KEY_LATITUDE, "0.0"));
        } catch (Exception e) {
            return 0.0;
        }
    }

    public static double getLongitude(Context context) {
        try {
            return Double.parseDouble(getPrefs(context).getString(KEY_LONGITUDE, "0.0"));
        } catch (Exception e) {
            return 0.0;
        }
    }

    public static boolean hasStoredTimings(Context context) {
        SharedPreferences prefs = getPrefs(context);
        return !prefs.getString(KEY_FAJR_TODAY, "").isEmpty();
    }

    /**
     * Advance tomorrow's timings to today's slot upon midnight rollover
     */
    public static void advanceDayOnMidnight(Context context) {
        SharedPreferences prefs = getPrefs(context);
        String tomFajr = prefs.getString(KEY_FAJR_TOMORROW, "");
        String tomDhuhr = prefs.getString(KEY_DHUHR_TOMORROW, "");
        String tomMaghrib = prefs.getString(KEY_MAGHRIB_TOMORROW, "");
        String tomDate = prefs.getString(KEY_TOMORROW_DATE, "");

        if (!tomFajr.isEmpty()) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString(KEY_TODAY_DATE, tomDate);
            editor.putString(KEY_FAJR_TODAY, tomFajr);
            editor.putString(KEY_DHUHR_TODAY, tomDhuhr);
            editor.putString(KEY_MAGHRIB_TODAY, tomMaghrib);
            editor.apply();

            updateWidgets(context, tomFajr, tomDhuhr, tomMaghrib);
        }
    }

    public static void updateWidgets(Context context, String fajr, String dhuhr, String maghrib) {
        try {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            ComponentName widget = new ComponentName(context, ShiaCalendarWidgetProvider.class);
            int[] appWidgetIds = manager.getAppWidgetIds(widget);
            if (appWidgetIds != null && appWidgetIds.length > 0) {
                Intent updateIntent = new Intent(context, ShiaCalendarWidgetProvider.class);
                updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
                context.sendBroadcast(updateIntent);
            }
        } catch (Exception ignored) {}
    }
}
