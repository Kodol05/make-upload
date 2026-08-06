import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { resolveText } from '@shared/placeholder';
import { locales, type Locale, type LocalizedText } from '@shared/types';
import { LocaleContext } from './localeContext';

const STORAGE_KEY = 'k-sort-locale';

/** 지원하는 네 언어 중 하나인지 확인한다. */
function isSupported(value: string | null): value is Locale {
  return value !== null && (locales as readonly string[]).includes(value);
}

/**
 * 처음 보여 줄 언어를 고른다.
 * 저장된 선택이 먼저고, 없으면 브라우저 언어, 그것도 아니면 한국어다.
 */
function pickInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (isSupported(stored)) return stored;

  const browser = navigator.language.split('-')[0];
  if (isSupported(browser)) return browser;

  return 'ko';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(pickInitialLocale);

  // 문서 언어를 함께 바꿔 스크린 리더가 올바르게 읽도록 한다.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  // 검수 전 문안은 (임시값) 표시로 바꿔 화면을 눈으로 확인할 수 있게 한다.
  const t = useCallback((text: LocalizedText) => resolveText(text, locale), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
