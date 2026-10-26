package com.tafseerenamoona.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import java.util.Calendar;

public class QuranWidgetProvider extends AppWidgetProvider {

    private static class QuranAyahEntry {
        final String surahRef;
        final String arabicText;
        final String urduTranslation;
        final String tafseerNote;

        QuranAyahEntry(String surahRef, String arabicText, String urduTranslation, String tafseerNote) {
            this.surahRef = surahRef;
            this.arabicText = arabicText;
            this.urduTranslation = urduTranslation;
            this.tafseerNote = tafseerNote;
        }
    }

    private static final QuranAyahEntry[] CURATED_AYAHS = new QuranAyahEntry[] {
        new QuranAyahEntry(
            "سورۃ الانسان (۷۶:۸) • آیتِ اطعام",
            "وَيُطْعِمُونَ الطَّعَامَ عَلَىٰ حُبِّهِ مِسْكِينًا وَيَتِيمًا وَأَسِيرًا",
            "اور وہ اللہ کی محبت میں مسکین، یتیم اور قیدی کو کھانا کھلاتے ہیں",
            "تفسیر نمونہ و الکوثر: شانِ نزول در فضیلت نذر اہل بیت اطہار (ع)"
        ),
        new QuranAyahEntry(
            "سورۃ الاحزاب (۳۳:۳۳) • آیتِ تطہیر",
            "إِنَّمَا يُرِيدُ اللَّهُ لِيُذْهِبَ عَنكُمُ الرِّجْسَ أَهْلَ الْبَيْتِ وَيُطَهِّرَكُمْ تَطْهِيرًا",
            "اللہ کا بس یہی ارادہ ہے کہ تم اہل بیت سے ہر برائی دور رکھے اور تمہیں پاک و پاکیزہ رکھے",
            "تفسیر نمونہ: دلالت بر عصمتِ مطلقہ پنجتن پاک و ائمہ معصومین (ع)"
        ),
        new QuranAyahEntry(
            "سورۃ الشوریٰ (۴۲:۲۳) • آیتِ مودت",
            "قُل لَّا أَسْأَلُكُمْ عَلَيْهِ أَجْرًا إِلَّا الْمَوَدَّةَ فِي الْقُرْبَىٰ",
            "کہہ دیجیے کہ میں تم سے اس رسالت پر سوائے اپنے قرابتداروں کی محبت کے کوئی اجر نہیں مانگتا",
            "تفسیر الکوثر: محبت و ولایتِ اہل بیت (ع) اساس و اجرِ رسالت ہے"
        ),
        new QuranAyahEntry(
            "سورۃ المائدہ (۵:۵۵) • آیتِ ولایت",
            "إِنَّمَا وَلِيُّكُمُ اللَّهُ وَرَسُولُهُ وَالَّذِينَ آمَنُوا الَّذِينَ يُقِيمُونَ الصَّلَاةَ وَيُؤْتُونَ الزَّكَاةَ وَهُمْ رَاكِعُونَ",
            "تمہارا ولی صرف اللہ، اس کا رسول اور وہ مومنین ہیں جو حالتِ رکوع میں زکوٰۃ دیتے ہیں",
            "تفسیر نمونہ و الکوثر: بالاتفاق نزول در شأن خاتم بخشی امیرالمومنین علی (ع)"
        ),
        new QuranAyahEntry(
            "سورۃ المائدہ (۵:۶۷) • آیتِ تبلیغ",
            "يَا أَيُّهَا الرَّسُولُ بَلِّغْ مَا أُنزِلَ إِلَيْكَ مِن رَّبِّكَ ۖ وَإِن لَّمْ تَفْعَلْ فَمَا بَلَّغْتَ رِسَالَتَهُ",
            "اے رسول! جو کچھ آپ پر نازل کیا گیا ہے اسے پہنچا دیجیے، اگر ایسا نہ کیا تو رسالت کا حق ادا نہ کیا",
            "تفسیر نمونہ: واقعہ غدیر خم و اعلانِ ولایت و خلافتِ بلافصل امام علی (ع)"
        ),
        new QuranAyahEntry(
            "سورۃ الکوثر (۱۰۸:۱-۳)",
            "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ • فَصَلِّ لِرَبِّكَ وَانْحَرْ • إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ",
            "بے شک ہم نے آپ کو کوثر عطا کیا، پس اپنے رب کے لیے نماز پڑھیں اور قربانی دیں",
            "تفسیر الکوثر: کوثر سے مراد خیرِ کثیر اور نسلِ پاک سیدہ فاطمہ زہرا (س) ہے"
        ),
        new QuranAyahEntry(
            "سورۃ البقرہ (۲:۲۵۵) • آیۃ الکرسی",
            "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
            "اللہ وہ ہے جس کے سوا کوئی معبود نہیں، وہ ہمیشہ زندہ اور قائم رکھنے والا ہے",
            "تفسیر نمونہ: توحیدِ ذات و صفاتِ الٰہیہ کا سب سے جامع اور روشن بیان"
        ),
        new QuranAyahEntry(
            "سورۃ الفاتحہ (۱:۶-۷)",
            "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ • صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
            "ہمیں سیدھے راستے کی ہدایت فرما، ان لوگوں کا راستہ جن پر تو نے انعام فرمایا",
            "احادیثِ اہل بیت: صراطِ مستقیم سے مراد رسولِ خدا (ص) اور ائمہ معصومین (ع) ہیں"
        )
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_quran);

        Calendar cal = Calendar.getInstance();
        int dayOfYear = cal.get(Calendar.DAY_OF_YEAR);
        int index = Math.abs(dayOfYear % CURATED_AYAHS.length);

        QuranAyahEntry entry = CURATED_AYAHS[index];
        if (entry != null) {
            views.setTextViewText(R.id.widget_quran_surah_ref, entry.surahRef);
            views.setTextViewText(R.id.widget_quran_arabic, entry.arabicText);
            views.setTextViewText(R.id.widget_quran_translation, entry.urduTranslation);
            views.setTextViewText(R.id.widget_quran_tafseer_badge, entry.tafseerNote);
        }

        // Navigation PendingIntent to Quran Tab
        Intent quranIntent = new Intent(context, MainActivity.class);
        quranIntent.setAction("OPEN_TAB_QURAN");
        quranIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 204, quranIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        views.setOnClickPendingIntent(R.id.widget_btn_open_quran, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_quran_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
