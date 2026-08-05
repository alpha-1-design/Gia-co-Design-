import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alpha1studio.giacodesign',
  appName: 'Gia-co-Design',
  webDir: 'dist',
  backgroundColor: '#faf8f5',
  android: {
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
