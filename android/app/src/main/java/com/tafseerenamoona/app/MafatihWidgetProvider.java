package com.tafseerenamoona.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import java.util.Calendar;

public class MafatihWidgetProvider extends AppWidgetProvider {

    private static class DailyDuaEntry {
        final String dayTag;
        final String duaTitle;
        final String category;
        final String arabicExcerpt;
        final String urduTranslation;
        final String masoomTag;

        DailyDuaEntry(String dayTag, String duaTitle, String category,
                       String arabicExcerpt, String urduTranslation, String masoomTag) {
            this.dayTag = dayTag;
            this.duaTitle = duaTitle;
            this.category = category;
            this.arabicExcerpt = arabicExcerpt;
            this.urduTranslation = urduTranslation;
            this.masoomTag = masoomTag;
        }
    }

    // Daily Duas & Ziyaraat mapped by Calendar.DAY_OF_WEEK (1 = Sunday ... 7 = Saturday)
    private static final DailyDuaEntry[] DAILY_ENTRIES = new DailyDuaEntry[] {
        null, // Index 0 unused
        // 1: Sunday (اتوار)
        new DailyDuaEntry(
            "اتوار • Sunday",
            "زیارتِ امیرالمومنین (ع) و فاطمہ زہرا (س)",
            "اعمال و ادعیہ روزِ یکشنبه",
            "السَّلامُ عَلَيْكَ يَا أَمِيرَ الْمُؤْمِنِينَ وَسَيِّدَ الْوَصِيِّينَ • السَّلامُ عَلَيْكِ يَا سَيِّدَةَ نِسَاءِ الْعَالَمِينَ",
            "سلام ہو آپ پر اے امیرالمومنین اور وصیوں کے سردار • سلام ہو آپ پر اے دونوں جہانوں کی بیبیوں کی سردار",
            "زیارتِ مخصوص: امیرالمومنین و فاطمہ زہرا (ع)"
        ),
        // 2: Monday (پیر)
        new DailyDuaEntry(
            "پیر • Monday",
            "زیارتِ حسنین کریمین (ع)",
            "اعمال و ادعیہ روزِ دوشنبه",
            "السَّلامُ عَلَيْكَ يَا ابْنَ رَسُولِ رَبِّ الْعَالَمِينَ • السَّلامُ عَلَيْكَ يَا سَيِّدَ شَبَابِ أَهْلِ الْجَنَّةِ",
            "سلام ہو آپ پر اے رسول اللہ کے فرزند • سلام ہو آپ پر اے نوجوانانِ جنت کے سردار",
            "زیارتِ مخصوص: امام حسن (ع) و امام حسین (ع)"
        ),
        // 3: Tuesday (منگل)
        new DailyDuaEntry(
            "منگل • Tuesday",
            "دعائے توسل • زیارتِ آئمہ بقیع (ع)",
            "اعمال و ادعیہ روزِ سه‌شنبه",
            "يَا أَبَا الْحَسَنِ يَا أَمِيرَ الْمُؤْمِنِينَ يَا حُجَّةَ اللَّهِ عَلَى خَلْقِهِ • اشْفَعْ لَنَا عِنْدَ اللَّهِ",
            "اے اللہ کی حجت اس کی مخلوق پر! اللہ کی بارگاہ میں ہمارے شفیع بن جائیے",
            "زیارتِ مخصوص: امام سجاد، باقر و صادق (ع)"
        ),
        // 4: Wednesday (بدھ)
        new DailyDuaEntry(
            "بدھ • Wednesday",
            "زیارتِ کاظمین و مشہد مقدس (ع)",
            "اعمال و ادعیہ روزِ چهارشنبه",
            "السَّلامُ عَلَيْكُمْ يَا أَوْلِيَاءَ اللَّهِ السَّلامُ عَلَيْكُمْ يَا حُجَجَ اللَّهِ • أَتَيْتُكُمْ عَارِفاً بِحَقِّكُمْ",
            "سلام ہو آپ پر اے اللہ کے اولیاء اور اس کی حجتیں • میں آپ کے حق کی معرفت کے ساتھ حاضر ہوا ہوں",
            "زیارتِ مخصوص: امام کاظم، رضا، جواد و ہادی (ع)"
        ),
        // 5: Thursday (جمعرات / شبِ جمعہ)
        new DailyDuaEntry(
            "شبِ جمعہ • Thursday Night",
            "دعائے کمیل • زیارتِ امام حسین (ع)",
            "اعمالِ شبِ جمعہ و مناجاتِ کمیل",
            "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ وَبِقُوَّتِكَ الَّتِي قَهَرْتَ بِهَا كُلَّ شَيْءٍ",
            "اے معبود! میں تجھ سے تیری اس رحمت کے ذریعے سوال کرتا ہوں جو ہر شے پر محیط ہے",
            "زیارتِ مخصوص: سید الشہداء امام حسین (ع)"
        ),
        // 6: Friday (جمعۃ المبارک)
        new DailyDuaEntry(
            "جمعۃ المبارک • Friday",
            "دعائے ندبہ، دعائے سمات و زیارتِ آلِ یاسین",
            "اعمالِ روزِ جمعہ و استغاثہ",
            "أَيْنَ بَقِيَّةُ اللَّهِ الَّتِي لا تَخْلُو مِنَ الْعِتْرَةِ الْهَادِيَةِ • فَعَلَى الأَطائِبِ مِنْ أَهْلِ بَيْتِ مُحَمَّدٍ فَلْيَبْكِ الْباكُونَ",
            "کہاں ہے وہ بقیۃ اللہ جو خاندانِ ہدایت سے خالی نہیں! پس پاکیزہ اہل بیت پر رونے والے گریہ کریں",
            "زیارتِ مخصوص: حضرت امام مہدی (عج)"
        ),
        // 7: Saturday (ہفتہ)
        new DailyDuaEntry(
            "ہفتہ • Saturday",
            "زیارتِ حضرت رسولِ اکرم (ص)",
            "اعمال و ادعیہ روزِ شنبه",
            "أَشْهَدُ أَنْ لا إِلَهَ إِلا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّكَ مُحَمَّدُ بْنُ عَبْدِ اللَّهِ رَسُولُ اللَّهِ",
            "میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں اور آپ اللہ کے سچے رسول اور برگزیدہ بندے ہیں",
            "زیارتِ مخصوص: خاتم الانبیاء محمد مصطفیٰ (ص)"
        )
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_mafatih);

        Calendar cal = Calendar.getInstance();
        int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
        if (dayOfWeek < 1 || dayOfWeek > 7) dayOfWeek = 5;

        DailyDuaEntry entry = DAILY_ENTRIES[dayOfWeek];
        if (entry != null) {
            views.setTextViewText(R.id.widget_mafatih_day_tag, entry.dayTag);
            views.setTextViewText(R.id.widget_mafatih_dua_title, entry.duaTitle);
            views.setTextViewText(R.id.widget_mafatih_category, entry.category);
            views.setTextViewText(R.id.widget_mafatih_arabic_excerpt, entry.arabicExcerpt);
            views.setTextViewText(R.id.widget_mafatih_urdu_translation, entry.urduTranslation);
            views.setTextViewText(R.id.widget_mafatih_masoom_tag, entry.masoomTag);
        }

        // Navigation PendingIntent to Mafatih Tab
        Intent mafatihIntent = new Intent(context, MainActivity.class);
        mafatihIntent.setAction("OPEN_TAB_MAFATIH");
        mafatihIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 203, mafatihIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        views.setOnClickPendingIntent(R.id.widget_btn_open_mafatih, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_mafatih_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
