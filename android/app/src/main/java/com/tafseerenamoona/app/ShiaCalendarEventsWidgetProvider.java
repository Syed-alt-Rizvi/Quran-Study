package com.tafseerenamoona.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import java.util.Calendar;

public class ShiaCalendarEventsWidgetProvider extends AppWidgetProvider {

    private static final String[] HIJRI_MONTHS = {
        "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
        "Jumada al-Ula", "Jumada al-Thaniyah", "Rajab", "Sha'ban",
        "Ramadhan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    };

    private static final String[][] UPCOMING_EVENTS = {
        {"10 Muharram", "Day of Ashura • Martyrdom of Imam Hussain (a.s)", "TODAY"},
        {"20 Safar", "Arba'een of Imam Hussain (a.s)", "NEXT"},
        {"28 Safar", "Wafat of Prophet Muhammad (s.a.w) & Imam Hasan (a.s)", "SOON"},
        {"17 Rabi' I", "Wiladat of Prophet (s.a.w) & Imam Sadiq (a.s)", "SOON"},
        {"8 Rabi' II", "Wiladat of Imam Hasan al-Askari (a.s)", "TODAY"},
        {"13 Jumada I", "Ayyam al-Fatimiyyah • Shahadat of Lady Fatimah (s.a)", "NEXT"},
        {"3 Jumada II", "Shahadat of Lady Fatimah al-Zahra (s.a)", "SOON"},
        {"13 Rajab", "Wiladat of Amir al-Mu'minin Imam Ali (a.s)", "NEXT"},
        {"27 Rajab", "Eid al-Mab'ath al-Nabawi (s.a.w)", "SOON"},
        {"3 Sha'ban", "Wiladat of Imam Hussain (a.s)", "SOON"},
        {"15 Sha'ban", "Wiladat of Imam al-Mahdi (a.t.f.s) • Shab-e-Barat", "NEXT"},
        {"19 Ramadhan", "Night of Qadr • Wounding of Imam Ali (a.s)", "NEXT"},
        {"21 Ramadhan", "Shahadat of Amir al-Mu'minin Imam Ali (a.s)", "SOON"},
        {"1 Shawwal", "Eid al-Fitr Mubarak", "NEXT"},
        {"25 Shawwal", "Shahadat of Imam Ja'far al-Sadiq (a.s)", "SOON"},
        {"11 Dhu al-Qi'dah", "Wiladat of Imam Ali al-Rida (a.s)", "SOON"},
        {"18 Dhu al-Hijjah", "Eid al-Ghadeer Khumm Mubarak", "NEXT"},
        {"24 Dhu al-Hijjah", "Eid al-Mubahalah", "SOON"}
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_shia_calendar_events);

        Calendar cal = Calendar.getInstance();
        int dayOfYear = cal.get(Calendar.DAY_OF_YEAR);
        int hijriMonthIdx = ((dayOfYear * 12) / 365) % 12;
        views.setTextViewText(R.id.widget_events_header_month, HIJRI_MONTHS[hijriMonthIdx]);

        int baseIdx = Math.abs(dayOfYear % UPCOMING_EVENTS.length);
        int idx1 = baseIdx;
        int idx2 = (baseIdx + 1) % UPCOMING_EVENTS.length;
        int idx3 = (baseIdx + 2) % UPCOMING_EVENTS.length;

        views.setTextViewText(R.id.widget_event_1_tag, UPCOMING_EVENTS[idx1][2]);
        views.setTextViewText(R.id.widget_event_1_title, UPCOMING_EVENTS[idx1][1]);
        views.setTextViewText(R.id.widget_event_1_date, UPCOMING_EVENTS[idx1][0]);

        views.setTextViewText(R.id.widget_event_2_tag, UPCOMING_EVENTS[idx2][2]);
        views.setTextViewText(R.id.widget_event_2_title, UPCOMING_EVENTS[idx2][1]);
        views.setTextViewText(R.id.widget_event_2_date, UPCOMING_EVENTS[idx2][0]);

        views.setTextViewText(R.id.widget_event_3_tag, UPCOMING_EVENTS[idx3][2]);
        views.setTextViewText(R.id.widget_event_3_title, UPCOMING_EVENTS[idx3][1]);
        views.setTextViewText(R.id.widget_event_3_date, UPCOMING_EVENTS[idx3][0]);

        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction("OPEN_TAB_CALENDAR");
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 205, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        views.setOnClickPendingIntent(R.id.widget_calendar_events_root, pendingIntent);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
