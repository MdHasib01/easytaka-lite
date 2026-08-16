import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import bnTranslation from './locales/bn.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  bn: {
    translation: bnTranslation,
  },
};

// Retrieve stored language or fallback to bn / en
const savedLang = localStorage.getItem('esytaka_lang') || 'bn'; // Default to Bangla / English

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'esytaka_lang',
      caches: ['localStorage'],
    },
  });

// Update html lang attribute when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem('esytaka_lang', lng);
  if (lng === 'bn') {
    document.body.classList.add('font-bangla');
  } else {
    document.body.classList.remove('font-bangla');
  }
});

// Set initial html lang attribute
document.documentElement.lang = i18n.language || 'bn';
if (i18n.language === 'bn') {
  document.body.classList.add('font-bangla');
}

export default i18n;
