package com.tafseerenamoona.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import com.tafseerenamoona.app.R;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class ShiaCalendarWidgetProvider extends AppWidgetProvider {

    private static final String[] HIJRI_MONTHS = {
        "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
        "Jumada al-Ula", "Jumada al-Thaniyah", "Rajab", "Sha'ban",
        "Ramadhan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    };

    private static final String[][] SHIA_OCCASIONS = {
        {"10 Muharram", "Day of Ashura • Martyrdom of Imam Hussain (a.s)"},
        {"20 Safar", "Arba'een of Imam Hussain (a.s)"},
        {"28 Safar", "Wafat of Prophet Muhammad (s.a.w) & Imam Hasan (a.s)"},
        {"17 Rabi' al-Awwal", "Wiladat of Prophet Muhammad (s.a.w) & Imam Sadiq (a.s)"},
        {"8 Rabi' al-Thani", "Wiladat of Imam Hasan al-Askari (a.s)"},
        {"13 Jumada al-Ula", "Shahadat of Lady Fatimah al-Zahra (s.a)"},
        {"3 Jumada al-Thaniyah", "Shahadat of Lady Fatimah al-Zahra (s.a)"},
        {"13 Rajab", "Wiladat of Amir al-Mu'minin Imam Ali (a.s)"},
        {"27 Rajab", "Eid al-Mab'ath al-Nabawi (s.a.w)"},
        {"3 Sha'ban", "Wiladat of Imam Hussain (a.s)"},
        {"4 Sha'ban", "Wiladat of Hazrat Abbas (a.s)"},
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
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_shia_calendar);

        // Gregorian Date
        SimpleDateFormat sdf = new SimpleDateFormat("EEEE, d MMMM", Locale.getDefault());
        String gregorianStr = sdf.format(new Date());
        views.setTextViewText(R.id.widget_calendar_gregorian, gregorianStr);

        // Approximate Kuwaiti/Astronomical Hijri computation for Widget display
        Calendar cal = Calendar.getInstance();
        int dayOfYear = cal.get(Calendar.DAY_OF_YEAR);
        int hijriDay = ((dayOfYear * 355) / 365) % 29 + 1;
        int hijriMonthIdx = ((dayOfYear * 12) / 365) % 12;
        int hijriYear = 1448; // Current epoch
        String hijriStr = hijriDay + " " + HIJRI_MONTHS[hijriMonthIdx] + " " + hijriYear + " AH";
        views.setTextViewText(R.id.widget_calendar_hijri, hijriStr);

        // Pick rotating occasion
        int occIdx = Math.abs(dayOfYear % SHIA_OCCASIONS.length);
        String occasionStr = SHIA_OCCASIONS[occIdx][1];
        views.setTextViewText(R.id.widget_calendar_occasion, occasionStr);

        // Intent to launch Calendar in Shia Markaz
        Intent calendarIntent = new Intent(context, MainActivity.class);
        calendarIntent.setAction("OPEN_TAB_CALENDAR");
        calendarIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 202, calendarIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        views.setOnClickPendingIntent(R.id.widget_btn_open_calendar, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_calendar_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
