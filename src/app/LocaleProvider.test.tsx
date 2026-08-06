import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { locales, type Locale } from '@shared/types';
import { LocaleProvider } from './LocaleProvider';
import { useLocale } from './useLocale';

/** provider가 내려 준 값을 화면에 드러내는 테스트용 컴포넌트. */
function LanguageProbe() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translated">
        {t({ ko: '한국어', en: 'English', zh: '中文', vi: 'Tiếng Việt' })}
      </span>
      <select
        aria-label="Language"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
      >
        {locales.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
}

function renderProbe() {
  return render(
    <LocaleProvider>
      <LanguageProbe />
    </LocaleProvider>,
  );
}

describe('LocaleProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists the selected language', async () => {
    renderProbe();

    await userEvent.selectOptions(screen.getByLabelText('Language'), 'vi');

    expect(localStorage.getItem('k-sort-locale')).toBe('vi');
    expect(screen.getByTestId('locale')).toHaveTextContent('vi');
  });

  it('translates using the current language', async () => {
    renderProbe();
    expect(screen.getByTestId('translated')).toHaveTextContent('English');

    await userEvent.selectOptions(screen.getByLabelText('Language'), 'zh');

    expect(screen.getByTestId('translated')).toHaveTextContent('中文');
  });

  it('restores a stored language', () => {
    localStorage.setItem('k-sort-locale', 'zh');

    renderProbe();

    expect(screen.getByTestId('locale')).toHaveTextContent('zh');
  });

  it('ignores a stored value that is not supported', () => {
    localStorage.setItem('k-sort-locale', 'fr');

    renderProbe();

    // 저장값이 쓸 수 없으면 브라우저 언어로 넘어간다. jsdom은 en-US다.
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('uses the browser language when nothing is stored', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('vi-VN');

    renderProbe();

    expect(screen.getByTestId('locale')).toHaveTextContent('vi');
  });

  it('falls back to Korean when the browser language is not supported', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');

    renderProbe();

    expect(screen.getByTestId('locale')).toHaveTextContent('ko');
  });
});
