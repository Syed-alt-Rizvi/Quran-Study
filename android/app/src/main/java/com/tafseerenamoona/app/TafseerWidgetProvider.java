package com.tafseerenamoona.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import com.tafseerenamoona.app.R;
import java.util.Calendar;

public class TafseerWidgetProvider extends AppWidgetProvider {

    private static final String[][] TAFSEER_ITEMS = {
        {
            "Surah Al-Ahzab (33:33) • Ayat al-Tatheer",
            "Tafseer Namoona",
            "إِنَّمَا يُرِيدُ اللَّهُ لِيُذْهِبَ عَنكُمُ الرِّجْسَ أَهْلَ الْبَيْتِ وَيُطَهِّرَكُمْ تَطْهِيرًا",
            "Ayat al-Tatheer conclusively establishes the divine infallibility and sacred purity of the Ahlulbayt (a.s) from all errors, defects, and sins, attested across both Shia and Sunni canonical transmissions."
        },
        {
            "Surah Ash-Shura (42:23) • Ayat al-Mawaddah",
            "Al-Kauthar fi Tafseer",
            "قُل لَّا أَسْأَلُكُمْ عَلَيْهِ أَجْرًا إِلَّا الْمَوَدَّةَ فِي الْقُرْبَىٰ",
            "The Prophet (s.a.w) declared that the only recompense for 23 years of divine prophethood is love, devotion, and obedience towards his Ahlulbayt (a.s)."
        },
        {
            "Surah Al-Kawthar (108:1) • The Abundant Grace",
            "Tafseer Namoona",
            "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ • فَصَلِّ لِرَبِّكَ وَانْحَرْ",
            "Al-Kawthar signifies abundant, endless blessing, embodied in Lady Fatimah al-Zahra (s.a) through whose descendants the noble lineage of the Prophet thrives eternally."
        },
        {
            "Surah Al-Baqarah (2:255) • Ayat al-Kursi",
            "Tafseer Namoona",
            "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
            "The crown of the Holy Quran, asserting the absolute sovereignty, omniscience, and unceasing preservation of the universe by Allah alone."
        },
        {
            "Surah Al-Ma'idah (5:67) • Ayat al-Tableegh",
            "Al-Kauthar fi Tafseer",
            "يَا أَيُّهَا الرَّسُولُ بَلِّغْ مَا أُنزِلَ إِلَيْكَ مِن رَّبِّكَ",
            "Revealed at Ghadeer Khumm, commanding the solemn proclamation of the Wilayah and Imamate of Amir al-Mu'minin Ali ibn Abi Talib (a.s) to complete divine religion."
        }
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_tafseer);

        int dayOfYear = Calendar.getInstance().get(Calendar.DAY_OF_YEAR);
        int index = Math.abs(dayOfYear % TAFSEER_ITEMS.length);
        String[] item = TAFSEER_ITEMS[index];

        views.setTextViewText(R.id.widget_tafseer_ayah_ref, item[0]);
        views.setTextViewText(R.id.widget_tafseer_source, item[1]);
        views.setTextViewText(R.id.widget_tafseer_arabic, item[2]);
        views.setTextViewText(R.id.widget_tafseer_content, item[3]);

        // Intent to launch Quran Tafseer in Shia Markaz
        Intent tafseerIntent = new Intent(context, MainActivity.class);
        tafseerIntent.setAction("OPEN_TAB_QURAN");
        tafseerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 203, tafseerIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        views.setOnClickPendingIntent(R.id.widget_btn_read_tafseer, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_tafseer_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
