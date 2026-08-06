import { createContext } from 'react';
import type { Locale, LocalizedText } from '@shared/types';

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** 현재 언어의 문자열을 고른다. */
  t: (text: LocalizedText) => string;
}

/**
 * Provider 밖에서 쓰면 곧바로 알아차리도록 기본값을 두지 않는다.
 * 컴포넌트와 훅을 다른 파일에 두는 이유는 Fast Refresh가 컴포넌트만 있는
 * 모듈을 기대하기 때문이다.
 */
export const LocaleContext = createContext<LocaleContextValue | null>(null);
