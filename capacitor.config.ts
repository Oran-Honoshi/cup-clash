import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'live.cupclash.app',
  appName: 'Cup Clash',
  webDir: 'public',
  server: {
    url: 'https://cupclash.live',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#050810',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#050810',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
