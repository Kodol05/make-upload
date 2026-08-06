import { journey } from '@/app/journey';
import { useLocale } from '@/app/useLocale';
import { ui } from '@/i18n/strings';
import { LanguageSelect } from './LanguageSelect';
import { SortMark } from './SortMark';

/**
 * 상단 메뉴는 네 페이지로 직접 갈 수 있게 열어 두되 강조하지 않는다.
 * 권하는 길은 각 페이지 아래의 "다음" 버튼이고, 이건 필요한 사람을 위한 지름길이다.
 *
 * 로고는 언제나 첫 페이지로 돌아간다.
 */
export function AppHeader({ currentRoute }: { currentRoute: string }) {
  const { t } = useLocale();

  return (
    <header className="app-header">
      <a className="skip-link" href="#main">
        {t(ui.common.skipToContent)}
      </a>

      <div className="app-header__bar">
        <h1 className="app-header__title">
          <a className="app-header__logo" href="#/">
            <SortMark tone="brand" size="sm" />
            K-SORT
          </a>
        </h1>
        <LanguageSelect />
      </div>

      <nav className="app-header__nav" aria-label="K-SORT">
        {journey.map((step) => (
          <a
            key={step.route}
            href={`#${step.route}`}
            aria-current={step.route === currentRoute ? 'page' : undefined}
          >
            {t(step.navLabel)}
          </a>
        ))}
      </nav>
    </header>
  );
}
