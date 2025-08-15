import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    supportedLngs: ['en', 'en-US', 'de-DE', 'es-ES', 'fr', 'hi-IN', 'nl-NL', 'pt-BR', 'ru-RU', 'ta-IN', 'zh-Hant'],
    load: 'languageOnly',
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: { useSuspense: true },
    interpolation: { escapeValue: false },
  });

export default i18n;
