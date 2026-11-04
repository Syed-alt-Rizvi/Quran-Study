package com.tafseerenamoona.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

/**
 * BackgroundMediaService
 * Manages foreground service lifecycle, ongoing Android system media notification,
 * and CPU WakeLock during Quran and sacred recitations playback.
 * Prevents OS from freezing audio when app is minimized or screen is turned off.
 */
public class BackgroundMediaService extends Service {
    private static final String TAG = "BackgroundMediaService";

    public static final String ACTION_START = "com.tafseerenamoona.app.ACTION_START_MEDIA";
    public static final String ACTION_UPDATE = "com.tafseerenamoona.app.ACTION_UPDATE_MEDIA";
    public static final String ACTION_STOP = "com.tafseerenamoona.app.ACTION_STOP_MEDIA";

    public static final String ACTION_PREV = "com.tafseerenamoona.app.ACTION_MEDIA_PREV";
    public static final String ACTION_PLAY_PAUSE = "com.tafseerenamoona.app.ACTION_MEDIA_PLAY_PAUSE";
    public static final String ACTION_NEXT = "com.tafseerenamoona.app.ACTION_MEDIA_NEXT";

    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_ARTIST = "artist";
    public static final String EXTRA_IS_PLAYING = "isPlaying";

    private static final String CHANNEL_ID = "quran_background_audio_channel";
    private static final int NOTIFICATION_ID = 911002;

    private PowerManager.WakeLock wakeLock;
    private String currentTitle = "The Holy Qur'an";
    private String currentArtist = "Recitation";
    private boolean isPlaying = false;
    private static boolean isServiceRunning = false;

    public static boolean isRunning() {
        return isServiceRunning;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        String action = intent.getAction();

        if (ACTION_STOP.equals(action)) {
            handleStop();
            return START_NOT_STICKY;
        }

        if (ACTION_PREV.equals(action)) {
            MediaNativePlugin.sendMediaAction("prev");
            return START_STICKY;
        }

        if (ACTION_PLAY_PAUSE.equals(action)) {
            MediaNativePlugin.sendMediaAction(isPlaying ? "pause" : "play");
            return START_STICKY;
        }

        if (ACTION_NEXT.equals(action)) {
            MediaNativePlugin.sendMediaAction("next");
            return START_STICKY;
        }

        if (ACTION_START.equals(action) || ACTION_UPDATE.equals(action)) {
            String title = intent.getStringExtra(EXTRA_TITLE);
            String artist = intent.getStringExtra(EXTRA_ARTIST);
            if (title != null && !title.isEmpty()) currentTitle = title;
            if (artist != null && !artist.isEmpty()) currentArtist = artist;
            isPlaying = intent.getBooleanExtra(EXTRA_IS_PLAYING, true);

            isServiceRunning = true;
            Notification notification = buildMediaNotification();

            try {
                startForeground(NOTIFICATION_ID, notification);
            } catch (Exception e) {
                Log.e(TAG, "Error starting foreground service: " + e.getMessage());
            }

            if (isPlaying) {
                acquireWakeLock();
            } else {
                releaseWakeLock();
            }
        }

        return START_STICKY;
    }

    private void handleStop() {
        isServiceRunning = false;
        releaseWakeLock();
        try {
            stopForeground(true);
        } catch (Exception ignored) {}
        stopSelf();
        MediaNativePlugin.sendMediaAction("stop");
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Qur'an & Recitations Audio Playback",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Ongoing media playback controls for the Holy Qur'an and sacred recitations");
            channel.setShowBadge(false);
            channel.setSound(null, null);
            channel.enableVibration(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildMediaNotification() {
        // Tap intent to open MainActivity
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentPendingIntent = PendingIntent.getActivity(
                this,
                0,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        // Action Intents
        PendingIntent prevPendingIntent = createActionPendingIntent(ACTION_PREV, 1);
        PendingIntent playPausePendingIntent = createActionPendingIntent(ACTION_PLAY_PAUSE, 2);
        PendingIntent nextPendingIntent = createActionPendingIntent(ACTION_NEXT, 3);
        PendingIntent stopPendingIntent = createActionPendingIntent(ACTION_STOP, 4);

        int playPauseIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        String playPauseTitle = isPlaying ? "Pause" : "Play";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(currentTitle)
                .setContentText(currentArtist)
                .setSubText("Shia Markaz")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(contentPendingIntent)
                .setOngoing(isPlaying)
                .setOnlyAlertOnce(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .addAction(android.R.drawable.ic_media_previous, "Previous", prevPendingIntent)
                .addAction(playPauseIcon, playPauseTitle, playPausePendingIntent)
                .addAction(android.R.drawable.ic_media_next, "Next", nextPendingIntent)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Close", stopPendingIntent);

        return builder.build();
    }

    private PendingIntent createActionPendingIntent(String action, int requestCode) {
        Intent intent = new Intent(this, BackgroundMediaService.class);
        intent.setAction(action);
        return PendingIntent.getService(
                this,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );
    }

    private synchronized void acquireWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) return;
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ShiaMarkaz:QuranBackgroundMedia");
                // Allow up to 3 hours continuous recitation per session
                wakeLock.acquire(180 * 60 * 1000L);
                Log.d(TAG, "Acquired PARTIAL_WAKE_LOCK for background audio playback");
            }
        } catch (Exception e) {
            Log.w(TAG, "WakeLock acquisition notice: " + e.getMessage());
        }
    }

    private synchronized void releaseWakeLock() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
                Log.d(TAG, "Released PARTIAL_WAKE_LOCK");
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onDestroy() {
        isServiceRunning = false;
        releaseWakeLock();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
