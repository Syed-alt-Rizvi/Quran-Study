package com.tafseerenamoona.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleWidgetIntent(getIntent());
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
        }
    }
}
