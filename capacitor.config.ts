import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tafseerenamoona.app',
  appName: 'Shia Markaz',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    LocalNotifications: {
      smallIcon: "ic_lock_idle_alarm",
      iconColor: "#047857",
      sound: "shia_adhan.mp3",
    },
  },
};

export default config;
