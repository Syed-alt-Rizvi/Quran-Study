package com.tafseerenamoona.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import com.tafseerenamoona.app.R;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class ShiaPrayerWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_shia_prayer);

        // Current Date display
        SimpleDateFormat sdf = new SimpleDateFormat("EEEE, d MMMM", Locale.getDefault());
        views.setTextViewText(R.id.widget_date, sdf.format(new Date()));

        // Intent to launch Holy Quran
        Intent quranIntent = new Intent(context, MainActivity.class);
        quranIntent.setAction("OPEN_TAB_QURAN");
        quranIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent quranPending = PendingIntent.getActivity(
                context, 101, quranIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_btn_quran, quranPending);

        // Intent to launch Mafatih al-Jinan
        Intent mafatihIntent = new Intent(context, MainActivity.class);
        mafatihIntent.setAction("OPEN_TAB_MAFATIH");
        mafatihIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent mafatihPending = PendingIntent.getActivity(
                context, 102, mafatihIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_btn_mafatih, mafatihPending);

        // Entire widget root click opens the main app
        Intent mainIntent = new Intent(context, MainActivity.class);
        mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent mainPending = PendingIntent.getActivity(
                context, 100, mainIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, mainPending);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
