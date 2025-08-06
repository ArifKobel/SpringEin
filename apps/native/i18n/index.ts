import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

export const i18n = new I18n({
  de: {
    settings: {
      title: "Einstellungen",
    },
  },
});

i18n.locale = getLocales()[0].languageCode ?? 'en';