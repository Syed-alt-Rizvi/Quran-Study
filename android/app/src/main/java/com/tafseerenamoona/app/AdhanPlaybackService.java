package com.tafseerenamoona.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

/**
 * AdhanPlaybackService
 * Bulletproof Foreground Service with START_NOT_STICKY and persistent ongoing notification.
 * Plays authentic Shia Ithna-Ashari Adhan audio with USAGE_ALARM audio attributes and CPU WakeLock.
 * Prevents OS from killing audio playback midway through the 3+ minute recitation.
 */
public class AdhanPlaybackService extends Service {
    private static final String TAG = "AdhanPlaybackService";

    public static final String ACTION_START_PLAYBACK = "com.tafseerenamoona.app.ACTION_START_PLAYBACK";
    public static final String ACTION_STOP_PLAYBACK = "com.tafseerenamoona.app.ACTION_STOP_PLAYBACK";
    public static final String EXTRA_PRAYER_NAME = "prayer_name";

    private static final String CHANNEL_ID = "shia_adhan_alarm_playback_channel";
    private static final int NOTIFICATION_ID = 911001;

    private MediaPlayer mediaPlayer;
    private PowerManager.WakeLock wakeLock;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;

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
        if (ACTION_STOP_PLAYBACK.equals(action)) {
            stopAdhan();
            return START_NOT_STICKY;
        }

        String prayerName = intent.getStringExtra(EXTRA_PRAYER_NAME);
        if (prayerName == null || prayerName.isEmpty()) {
            prayerName = "Prayer Time";
        }

        // 1. Immediately start foreground with ongoing notification (mandatory within 5s)
        Notification notification = buildForegroundNotification(prayerName);
        startForeground(NOTIFICATION_ID, notification);

        // 2. Acquire CPU WakeLock (maximum 6 minutes duration for full adhan)
        acquireWakeLock();

        // 3. Play Adhan audio through ALARM stream
        playAdhanAudio();

        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Shia Adhan Prayer Calls",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Authentic Shia Adhan Audio Broadcasts");
            channel.enableVibration(true);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            channel.setBypassDnd(true);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildForegroundNotification(String prayerName) {
        // Tap on notification opens MainActivity
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentPendingIntent = PendingIntent.getActivity(
                this,
                1001,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // "Stop Adhan" action button
        Intent stopIntent = new Intent(this, AdhanPlaybackService.class);
        stopIntent.setAction(ACTION_STOP_PLAYBACK);
        PendingIntent stopPendingIntent = PendingIntent.getService(
                this,
                1002,
                stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Shia Adhan • " + prayerName)
                .setContentText("Allāhu Akbar • Ja'fari Prayer Call in Progress")
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentIntent(contentPendingIntent)
                .setOngoing(true)
                .setAutoCancel(false)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .addAction(android.R.drawable.ic_media_pause, "Stop Adhan", stopPendingIntent)
                .build();
    }

    private void acquireWakeLock() {
        try {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null && wakeLock == null) {
                wakeLock = powerManager.newWakeLock(
                        PowerManager.PARTIAL_WAKE_LOCK,
                        "ShiaMarkaz::AdhanPlaybackWakeLock"
                );
                // Auto-release after 6 minutes (360,000ms) safety fallback
                wakeLock.acquire(360000L);
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to acquire wake lock", e);
        }
    }

    private void releaseWakeLock() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        } catch (Exception ignored) {}
        wakeLock = null;
    }

    private void playAdhanAudio() {
        try {
            if (mediaPlayer != null) {
                mediaPlayer.release();
                mediaPlayer = null;
            }

            audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            requestAudioStreamFocus();

            mediaPlayer = new MediaPlayer();

            // Direct audio to USAGE_ALARM stream so it bypasses media mute / ringtone settings
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();
            mediaPlayer.setAudioAttributes(audioAttributes);

            // Raw resource URI for bundled authentic Shia Adhan MP3
            Uri audioUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.shia_adhan);
            mediaPlayer.setDataSource(this, audioUri);
            mediaPlayer.setLooping(false);

            mediaPlayer.setOnPreparedListener(mp -> {
                try {
                    mp.start();
                } catch (Exception e) {
                    Log.e(TAG, "Error starting MediaPlayer", e);
                    stopAdhan();
                }
            });

            mediaPlayer.setOnCompletionListener(mp -> {
                Log.i(TAG, "Adhan recitation completed cleanly.");
                stopAdhan();
            });

            mediaPlayer.setOnErrorListener((mp, what, extra) -> {
                Log.e(TAG, "MediaPlayer error: " + what + ", " + extra);
                stopAdhan();
                return true;
            });

            mediaPlayer.prepareAsync();

        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Adhan playback", e);
            stopAdhan();
        }
    }

    private void requestAudioStreamFocus() {
        if (audioManager == null) return;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AudioAttributes playbackAttributes = new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build();

                audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                        .setAudioAttributes(playbackAttributes)
                        .setAcceptsDelayedFocusGain(false)
                        .setOnAudioFocusChangeListener(focusChange -> {
                            // Continue playing alarm audio unless permanently abandoned
                        })
                        .build();
                audioManager.requestAudioFocus(audioFocusRequest);
            } else {
                audioManager.requestAudioFocus(
                        null,
                        AudioManager.STREAM_ALARM,
                        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK
                );
            }
        } catch (Exception ignored) {}
    }

    private void abandonAudioStreamFocus() {
        if (audioManager == null) return;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
                audioManager.abandonAudioFocusRequest(audioFocusRequest);
            } else {
                audioManager.abandonAudioFocus(null);
            }
        } catch (Exception ignored) {}
    }

    private void stopAdhan() {
        try {
            if (mediaPlayer != null) {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
                mediaPlayer = null;
            }
        } catch (Exception ignored) {}

        abandonAudioStreamFocus();
        releaseWakeLock();

        try {
            stopForeground(true);
        } catch (Exception ignored) {}

        stopSelf();
    }

    @Override
    public void onDestroy() {
        stopAdhan();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
