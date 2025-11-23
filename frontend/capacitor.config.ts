import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rimac.rimiapp',
  appName: 'RimiApp',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
