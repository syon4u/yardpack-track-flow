import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.05edb5ebbd654211b7e5faa8ef3c05a1',
  appName: 'yardpack-track-flow',
  webDir: 'dist',
  server: {
    url: 'https://05edb5eb-bd65-4211-b7e5-faa8ef3c05a1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;