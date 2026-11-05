import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pokeradar/idioma';

export const LANGUAGES = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
];

const LanguageContext = createContext(null);

// Idioma das descrições da Pokédex. Começa em português e a escolha fica salva no aparelho.
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('pt');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value === 'pt' || value === 'en') setLanguage(value);
      })
      .catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (code) => {
        setLanguage(code);
        AsyncStorage.setItem(STORAGE_KEY, code).catch(() => {});
      },
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
