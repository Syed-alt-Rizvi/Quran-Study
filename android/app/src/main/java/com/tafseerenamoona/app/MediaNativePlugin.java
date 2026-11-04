package com.tafseerenamoona.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * MediaNativePlugin
 * Capacitor Native Bridge between React AudioPlayer / MafatihAudio and Android OS Foreground Media Service.
 * Manages notification bar controls and lockscreen ongoing playback.
 */
@CapacitorPlugin(name = "MediaNative")
public class MediaNativePlugin extends Plugin {
    private static MediaNativePlugin activeInstance;

    @Override
    public void load() {
        super.load();
        activeInstance = this;
    }

    public static void sendMediaAction(String action) {
        if (activeInstance != null) {
            JSObject data = new JSObject();
            data.put("action", action);
            activeInstance.notifyListeners("mediaAction", data);
        }
    }

    @PluginMethod
    public void startMediaNotification(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context unavailable");
            return;
        }

        String title = call.getString("title", "The Holy Qur'an");
        String artist = call.getString("artist", "Recitation");
        boolean isPlaying = call.getBoolean("isPlaying", true);

        Intent intent = new Intent(context, BackgroundMediaService.class);
        intent.setAction(BackgroundMediaService.ACTION_START);
        intent.putExtra(BackgroundMediaService.EXTRA_TITLE, title);
        intent.putExtra(BackgroundMediaService.EXTRA_ARTIST, artist);
        intent.putExtra(BackgroundMediaService.EXTRA_IS_PLAYING, isPlaying);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ContextCompat.startForegroundService(context, intent);
            } else {
                context.startService(intent);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to start background media service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void updateMediaNotification(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context unavailable");
            return;
        }

        String title = call.getString("title", "The Holy Qur'an");
        String artist = call.getString("artist", "Recitation");
        boolean isPlaying = call.getBoolean("isPlaying", true);

        Intent intent = new Intent(context, BackgroundMediaService.class);
        intent.setAction(BackgroundMediaService.ACTION_UPDATE);
        intent.putExtra(BackgroundMediaService.EXTRA_TITLE, title);
        intent.putExtra(BackgroundMediaService.EXTRA_ARTIST, artist);
        intent.putExtra(BackgroundMediaService.EXTRA_IS_PLAYING, isPlaying);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ContextCompat.startForegroundService(context, intent);
            } else {
                context.startService(intent);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to update background media service: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopMediaNotification(PluginCall call) {
        Context context = getContext();
        if (context != null) {
            Intent intent = new Intent(context, BackgroundMediaService.class);
            intent.setAction(BackgroundMediaService.ACTION_STOP);
            try {
                context.startService(intent);
            } catch (Exception ignored) {}
        }
        call.resolve();
    }
}
