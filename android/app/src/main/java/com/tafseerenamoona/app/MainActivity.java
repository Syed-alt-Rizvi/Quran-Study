package com.tafseerenamoona.app;

import android.content.Intent;
import android.os.Bundle;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.graphics.Insets;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdhanNativePlugin.class);
        registerPlugin(MediaNativePlugin.class);
        super.onCreate(savedInstanceState);
        handleWidgetIntent(getIntent());

        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
            }
            ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (v, insets) -> {
                Insets sbInsets = insets.getInsets(WindowInsetsCompat.Type.statusBars());
                float density = getResources().getDisplayMetrics().density;
                int statusBarDp = Math.round(sbInsets.top / (density > 0 ? density : 1.0f));
                if (statusBarDp > 0 && getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().post(() -> {
                        String js = "document.documentElement.style.setProperty('--android-status-bar', '" + statusBarDp + "px');" +
                                    "document.documentElement.classList.add('capacitor-android');" +
                                    "document.body.classList.add('capacitor-android');";
                        getBridge().getWebView().evaluateJavascript(js, null);
                    });
                }
                return insets;
            });
        } catch (Exception ignored) {}
    }

    @Override
    public void onPause() {
        super.onPause();
        // Keep WebView media active in background so Quran and Mafatih audio continues uninterrupted
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().onResume();
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onStop() {
        super.onStop();
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().onResume();
            }
        } catch (Exception ignored) {}
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleWidgetIntent(intent);
    }

    private void handleWidgetIntent(Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        String action = intent.getAction();
        if ("OPEN_TAB_QURAN".equals(action)) {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().postDelayed(() -> {
                    getBridge().getWebView().evaluateJavascript("window.dispatchEvent(new CustomEvent('open-app-tab', { detail: 'quran' }))", null);
                }, 600);
            }
        } else if ("OPEN_TAB_MAFATIH".equals(action)) {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().postDelayed(() -> {
                    getBridge().getWebView().evaluateJavascript("window.dispatchEvent(new CustomEvent('open-app-tab', { detail: 'mafatih' }))", null);
                }, 600);
            }
        } else if ("OPEN_TAB_CALENDAR".equals(action)) {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().postDelayed(() -> {
                    getBridge().getWebView().evaluateJavascript("window.dispatchEvent(new CustomEvent('open-app-tab', { detail: 'calendar' }))", null);
                }, 600);
            }
        } else if ("OPEN_TAB_TAFSEER".equals(action)) {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().postDelayed(() -> {
                    getBridge().getWebView().evaluateJavascript("window.dispatchEvent(new CustomEvent('open-app-tab', { detail: 'quran' }))", null);
                }, 600);
            }
        }
    }
}
