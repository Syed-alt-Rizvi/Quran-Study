package com.tafseerenamoona.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import com.tafseerenamoona.app.R;

public class QuranAudioWidgetProvider extends AppWidgetProvider {

    private static final String ACTION_PREV_SURAH = "com.tafseerenamoona.app.ACTION_PREV_SURAH";
    private static final String ACTION_NEXT_SURAH = "com.tafseerenamoona.app.ACTION_NEXT_SURAH";
    private static final String PREF_NAME = "quran_audio_widget_prefs";
    private static final String KEY_CURRENT_SURAH = "current_surah_idx";

    private static final String[][] POPULAR_SURAHS = {
        {"1", "سُورَةُ الْفَاتِحَةِ", "Surah Al-Fatiha (The Opening) • 7 Ayahs"},
        {"36", "سُورَةُ يس", "Surah Yaseen (Heart of Quran) • 83 Ayahs"},
        {"55", "سُورَةُ الرَّحْمَٰنِ", "Surah Ar-Rahman (The Beneficent) • 78 Ayahs"},
        {"56", "سُورَةُ الْوَاقِعَةِ", "Surah Al-Waqi'ah (The Inevitable) • 96 Ayahs"},
        {"67", "سُورَةُ الْمُلْكِ", "Surah Al-Mulk (The Sovereignty) • 30 Ayahs"},
        {"112", "سُورَةُ الْإِخْلَاصِ", "Surah Al-Ikhlas (The Sincerity) • 4 Ayahs"},
        {"113", "سُورَةُ الْفَلَقِ", "Surah Al-Falaq (The Daybreak) • 5 Ayahs"},
        {"114", "سُورَةُ النَّاسِ", "Surah An-Nas (Mankind) • 6 Ayahs"}
    };

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();

        if (ACTION_PREV_SURAH.equals(action) || ACTION_NEXT_SURAH.equals(action)) {
            SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            int idx = prefs.getInt(KEY_CURRENT_SURAH, 0);

            if (ACTION_PREV_SURAH.equals(action)) {
                idx = (idx - 1 + POPULAR_SURAHS.length) % POPULAR_SURAHS.length;
            } else {
                idx = (idx + 1) % POPULAR_SURAHS.length;
            }

            prefs.edit().putInt(KEY_CURRENT_SURAH, idx).apply();

            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            ComponentName thisWidget = new ComponentName(context, QuranAudioWidgetProvider.class);
            int[] appWidgetIds = manager.getAppWidgetIds(thisWidget);
            onUpdate(context, manager, appWidgetIds);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quran_audio);

        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        int idx = prefs.getInt(KEY_CURRENT_SURAH, 0);
        idx = Math.max(0, Math.min(idx, POPULAR_SURAHS.length - 1));
        String[] surah = POPULAR_SURAHS[idx];

        views.setTextViewText(R.id.widget_audio_arabic_title, surah[1]);
        views.setTextViewText(R.id.widget_audio_surah_desc, surah[2]);
        views.setTextViewText(R.id.widget_audio_reciter, "Mishary Alafasy");

        // Prev Action
        Intent prevIntent = new Intent(context, QuranAudioWidgetProvider.class);
        prevIntent.setAction(ACTION_PREV_SURAH);
        PendingIntent prevPending = PendingIntent.getBroadcast(
                context, 301, prevIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_audio_btn_prev, prevPending);

        // Next Action
        Intent nextIntent = new Intent(context, QuranAudioWidgetProvider.class);
        nextIntent.setAction(ACTION_NEXT_SURAH);
        PendingIntent nextPending = PendingIntent.getBroadcast(
                context, 302, nextIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_audio_btn_next, nextPending);

        // Play Action -> Launches Quran View with audio
        Intent playIntent = new Intent(context, MainActivity.class);
        playIntent.setAction("OPEN_TAB_QURAN");
        playIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent playPending = PendingIntent.getActivity(
                context, 303, playIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_audio_btn_play, playPending);
        views.setOnClickPendingIntent(R.id.widget_audio_root, playPending);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
