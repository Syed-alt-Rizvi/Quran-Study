package com.tafseerenamoona.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import com.tafseerenamoona.app.R;
import java.util.Calendar;

public class DailyAyahWidgetProvider extends AppWidgetProvider {

    private static final String[][] FEATURED_AYAHS = {
        {"بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "In the name of Allah, the Entirely Merciful, the Especially Merciful.", "Surah Al-Fatiha (1:1)"},
        {"إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "It is You we worship and You we ask for help.", "Surah Al-Fatiha (1:5)"},
        {"ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", "Guide us to the straight path.", "Surah Al-Fatiha (1:6)"},
        {"اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence.", "Ayat al-Kursi (2:255)"},
        {"إِنَّمَا يُرِيدُ اللَّهُ لِيُذْهِبَ عَنكُمُ الرِّجْسَ أَهْلَ الْبَيْتِ وَيُطَهِّرَكُمْ تَطْهِيرًا", "Allah only intends to keep evil away from you, O Ahlulbayt, and to purify you completely.", "Surah Al-Ahzab (33:33)"},
        {"قُل لَّا أَسْأَلُكُمْ عَلَيْهِ أَجْرًا إِلَّا الْمَوَدَّةَ فِي الْقُرْبَىٰ", "Say: I do not ask of you any reward for it other than love for my near relatives.", "Surah Ash-Shura (42:23)"},
        {"إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", "Indeed, We have granted you, [O Muhammad], al-Kawthar.", "Surah Al-Kawthar (108:1)"}
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_daily_ayah);

        // Pick Ayah based on day of year
        int dayOfYear = Calendar.getInstance().get(Calendar.DAY_OF_YEAR);
        int index = Math.abs(dayOfYear % FEATURED_AYAHS.length);
        String[] ayah = FEATURED_AYAHS[index];

        views.setTextViewText(R.id.widget_ayah_arabic, ayah[0]);
        views.setTextViewText(R.id.widget_ayah_translation, ayah[1]);
        views.setTextViewText(R.id.widget_ayah_ref, ayah[2]);

        // Intent to launch Holy Quran Reader
        Intent quranIntent = new Intent(context, MainActivity.class);
        quranIntent.setAction("OPEN_TAB_QURAN");
        quranIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent quranPending = PendingIntent.getActivity(
                context, 201, quranIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        views.setOnClickPendingIntent(R.id.widget_btn_read_quran, quranPending);
        views.setOnClickPendingIntent(R.id.widget_ayah_root, quranPending);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
