package com.tafseerenamoona.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class ShiaCalendarCompactWidgetProvider extends AppWidgetProvider {

    private static final String[] HIJRI_MONTHS = {
        "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
        "Jumada al-Ula", "Jumada al-Thaniyah", "Rajab", "Sha'ban",
        "Ramadhan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    };

    private static final String[][] SHIA_OCCASIONS = {
        {"10 Muharram", "Day of Ashura • Imam Hussain (a.s)"},
        {"20 Safar", "Arba'een of Imam Hussain (a.s)"},
        {"28 Safar", "Wafat of Prophet (s.a.w) & Imam Hasan (a.s)"},
        {"17 Rabi' al-Awwal", "Wiladat of Prophet (s.a.w) & Imam Sadiq (a.s)"},
        {"8 Rabi' al-Thani", "Wiladat of Imam Hasan al-Askari (a.s)"},
        {"13 Jumada al-Ula", "Ayyam al-Fatimiyyah (s.a)"},
        {"3 Jumada al-Thaniyah", "Shahadat of Lady Fatimah (s.a)"},
        {"13 Rajab", "Wiladat of Imam Ali (a.s)"},
        {"27 Rajab", "Eid al-Mab'ath al-Nabawi (s.a.w)"},
        {"3 Sha'ban", "Wiladat of Imam Hussain (a.s)"},
        {"15 Sha'ban", "Wiladat of Imam al-Mahdi (a.t.f.s)"},
        {"19 Ramadhan", "Night of Qadr • Wounding of Imam Ali (a.s)"},
        {"21 Ramadhan", "Shahadat of Imam Ali (a.s)"},
        {"1 Shawwal", "Eid al-Fitr Mubarak"},
        {"25 Shawwal", "Shahadat of Imam Ja'far al-Sadiq (a.s)"},
        {"11 Dhu al-Qi'dah", "Wiladat of Imam Ali al-Rida (a.s)"},
        {"18 Dhu al-Hijjah", "Eid al-Ghadeer Khumm Mubarak"},
        {"24 Dhu al-Hijjah", "Eid al-Mubahalah"}
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_shia_calendar_compact);

        SimpleDateFormat sdf = new SimpleDateFormat("EEEE, d MMMM", Locale.getDefault());
        String gregorianStr = sdf.format(new Date());
        views.setTextViewText(R.id.widget_compact_gregorian, gregorianStr);

        Calendar cal = Calendar.getInstance();
        int dayOfYear = cal.get(Calendar.DAY_OF_YEAR);
        int hijriDay = ((dayOfYear * 355) / 365) % 29 + 1;
        int hijriMonthIdx = ((dayOfYear * 12) / 365) % 12;
        int hijriYear = 1448;

        views.setTextViewText(R.id.widget_compact_hijri_day, String.valueOf(hijriDay));
        views.setTextViewText(R.id.widget_compact_hijri_month, HIJRI_MONTHS[hijriMonthIdx] + " " + hijriYear + " AH");

        int occIdx = Math.abs(dayOfYear % SHIA_OCCASIONS.length);
        views.setTextViewText(R.id.widget_compact_occasion, SHIA_OCCASIONS[occIdx][1]);

        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction("OPEN_TAB_CALENDAR");
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 204, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        views.setOnClickPendingIntent(R.id.widget_calendar_compact_root, pendingIntent);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
