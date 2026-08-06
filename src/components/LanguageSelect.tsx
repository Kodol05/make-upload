import { useLocale } from '@/app/useLocale';
import { ui } from '@/i18n/strings';
import { locales, type Locale } from '@shared/types';

/** 언어 이름은 그 언어로 적어야 찾기 쉬우므로 번역하지 않는다. */
const LANGUAGE_NAMES: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
  vi: 'Tiếng Việt',
};

/** 전역 언어를 바꾸는 선택기. */
export function LanguageSelect() {
  const { locale, setLocale, t } = useLocale();

  return (
    <select
      className="language-select"
      aria-label={t(ui.common.language)}
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
    >
      {locales.map((value) => (
        <option key={value} value={value}>
          {LANGUAGE_NAMES[value]}
        </option>
      ))}
    </select>
  );
}
