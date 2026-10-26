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

public class ShiaCalendarWidgetProvider extends AppWidgetProvider {

    private static final String[] HIJRI_URDU_MONTHS = {
        "محرم الحرام", "صفر المظفر", "ربیع الاول", "ربیع الثانی",
        "جمادی الاول", "جمادی الثانی", "رجب المرجب", "شعبان المعظم",
        "رمضان المبارک", "شوال المکرم", "ذی القعدہ", "ذی الحجہ"
    };

    private static final String[] DAY_NAMES_URDU = {
        "", "اتوار • Sunday", "پیر • Monday", "منگل • Tuesday",
        "بدھ • Wednesday", "جمعرات • Thursday", "جمعۃ المبارک • Friday", "ہفتہ • Saturday"
    };

    private static final String[] DAILY_DHIKR = {
        "",
        "ذکرِ امروز: یا ذا الجلال و الاکرام (۱۰۰ مرتبہ)", // Sunday
        "ذکرِ امروز: یا قاضی الحاجات (۱۰۰ مرتبہ)",        // Monday
        "ذکرِ امروز: یا ارحم الراحمین (۱۰۰ مرتبہ)",       // Tuesday
        "ذکرِ امروز: یا حی یا قیوم (۱۰۰ مرتبہ)",          // Wednesday
        "ذکرِ امروز: لا اله الا الله الملك الحق المبین",    // Thursday
        "ذکرِ امروز: اللهم صل علی محمد و آل محمد",       // Friday
        "ذکرِ امروز: یا رب العالمین (۱۰۰ مرتبہ)"          // Saturday
    };

    private static final String[] SHIA_OCCASIONS = {
        "ولادت با سعادت حضرت امام علی علیہ السلام (۱۳ رجب)",
        "عیدِ سعید غدیرِ خم • عید اللہ الاکبر (۱۸ ذی الحجہ)",
        "ولادت با سعادت رسولِ اکرم (ص) و امام جعفر صادق (ع)",
        "شہادتِ سید الشہداء حضرت امام حسین علیہ السلام (عاشوراء)",
        "اربعینِ حسینی • چہلم حضرت امام حسین (ع)",
        "شبِ قدر • نزولِ قرآن مجید و مناجاتِ امیرالمومنین (ع)",
        "ولادت با سعادت حضرت امام زمانہ عجل اللہ تعالی فرجہ الشریف (۱۵ شعبان)",
        "شہادتِ حضرت فاطمہ زہرا سلام اللہ علیہا (ایامِ فاطمیہ)",
        "عید الفطر مبارک • شکرانہ طاعت و بندگی",
        "عید الاضحیٰ مبارک • عیدِ قربان و فداکاری",
        "عیدِ مباہلہ • روزِ نزولِ آیۂ تطہیر و فتحِ اسلام (۲۴ ذی الحجہ)",
        "ولادت با سعادت حضرت امام حسن مجتبیٰ علیہ السلام (۱۵ رمضان)"
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_shia_calendar);

        Calendar cal = Calendar.getInstance();
        Date now = new Date();

        // 1. Gregorian Date
        SimpleDateFormat sdf = new SimpleDateFormat("EEEE, d MMMM yyyy", Locale.getDefault());
        views.setTextViewText(R.id.widget_calendar_gregorian, sdf.format(now));

        // 2. Approximate Astronomical Hijri Calculation
        int dayOfYear = cal.get(Calendar.DAY_OF_YEAR);
        int hijriDay = ((dayOfYear * 355) / 365) % 29 + 1;
        int hijriMonthIdx = ((dayOfYear * 12) / 365) % 12;
        int hijriYear = 1448;

        String urduDayDigits = toUrduDigits(hijriDay);
        String urduYearDigits = toUrduDigits(hijriYear);

        views.setTextViewText(R.id.widget_calendar_hijri_day, urduDayDigits);
        views.setTextViewText(R.id.widget_calendar_hijri_month, HIJRI_URDU_MONTHS[hijriMonthIdx] + " " + urduYearDigits + " ھ");

        // 3. Day of week
        int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
        if (dayOfWeek >= 1 && dayOfWeek < DAY_NAMES_URDU.length) {
            views.setTextViewText(R.id.widget_calendar_day_name, DAY_NAMES_URDU[dayOfWeek]);
            views.setTextViewText(R.id.widget_calendar_dhikr, DAILY_DHIKR[dayOfWeek]);
        }

        // 4. Next Shia Prayer Time
        String nextPrayerDisplay = calculateNextPrayer(context, cal);
        views.setTextViewText(R.id.widget_calendar_next_prayer, nextPrayerDisplay);

        // 5. Shia Occasion of the Day / Week
        int occIdx = Math.abs((dayOfYear + cal.get(Calendar.MONTH)) % SHIA_OCCASIONS.length);
        views.setTextViewText(R.id.widget_calendar_occasion, SHIA_OCCASIONS[occIdx]);

        // 6. Navigation PendingIntent to Calendar Tab
        Intent calendarIntent = new Intent(context, MainActivity.class);
        calendarIntent.setAction("OPEN_TAB_CALENDAR");
        calendarIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 202, calendarIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        views.setOnClickPendingIntent(R.id.widget_btn_open_calendar, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_calendar_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static String calculateNextPrayer(Context context, Calendar cal) {
        String fajr = AdhanStorage.getFajrToday(context);
        String dhuhr = AdhanStorage.getDhuhrToday(context);
        String maghrib = AdhanStorage.getMaghribToday(context);

        int currentMinutes = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE);

        int fajrMin = parseTimeToMinutes(fajr, 5 * 60 + 15);
        int dhuhrMin = parseTimeToMinutes(dhuhr, 12 * 60 + 15);
        int maghribMin = parseTimeToMinutes(maghrib, 18 * 60 + 15);

        if (currentMinutes < fajrMin) {
            return "نمازِ فجر • " + (fajr != null && !fajr.isEmpty() ? fajr : "5:15 AM");
        } else if (currentMinutes < dhuhrMin) {
            return "نمازِ ظہر • " + (dhuhr != null && !dhuhr.isEmpty() ? dhuhr : "12:15 PM");
        } else if (currentMinutes < maghribMin) {
            return "نمازِ مغرب • " + (maghrib != null && !maghrib.isEmpty() ? maghrib : "6:15 PM");
        } else {
            return "نمازِ فجر (فردا) • " + (fajr != null && !fajr.isEmpty() ? fajr : "5:15 AM");
        }
    }

    private static int parseTimeToMinutes(String timeStr, int fallback) {
        if (timeStr == null || timeStr.isEmpty()) return fallback;
        try {
            String clean = timeStr.trim().toUpperCase(Locale.US);
            boolean isPm = clean.endsWith("PM");
            boolean isAm = clean.endsWith("AM");
            clean = clean.replace("AM", "").replace("PM", "").trim();
            String[] parts = clean.split(":");
            int h = Integer.parseInt(parts[0].trim());
            int m = Integer.parseInt(parts[1].trim());
            if (isPm && h < 12) h += 12;
            if (isAm && h == 12) h = 0;
            return h * 60 + m;
        } catch (Exception e) {
            return fallback;
        }
    }

    private static String toUrduDigits(int number) {
        String s = String.valueOf(number);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '0': sb.append('۰'); break;
                case '1': sb.append('۱'); break;
                case '2': sb.append('۲'); break;
                case '3': sb.append('۳'); break;
                case '4': sb.append('۴'); break;
                case '5': sb.append('۵'); break;
                case '6': sb.append('۶'); break;
                case '7': sb.append('۷'); break;
                case '8': sb.append('۸'); break;
                case '9': sb.append('۹'); break;
                default: sb.append(c); break;
            }
        }
        return sb.toString();
    }
}
