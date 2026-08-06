import { useContext } from 'react';
import { LocaleContext, type LocaleContextValue } from './localeContext';

/** 전역 언어 상태와 번역 함수를 꺼낸다. */
export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used inside LocaleProvider');
  return value;
}
