import { useLocale } from '@/app/useLocale';
import { ui } from '@/i18n/strings';
import { LanguageSelect } from './LanguageSelect';

/**
 * 홈의 섹션은 anchor로, 게임은 해시 라우트로 이동한다.
 * 게임에서 홈 섹션을 누르면 라우트가 함께 바뀌도록 `#/` 를 앞에 붙이지 않고
 * 섹션 anchor만 쓴다. 홈이 기본 라우트이므로 그대로 동작한다.
 */
const NAV_ITEMS = [
  { href: '#learn', label: ui.nav.learn },
  { href: '#scan', label: ui.nav.scan },
  { href: '#catalog', label: ui.nav.catalog },
  { href: '#chat', label: ui.nav.chat },
  { href: '#/game', label: ui.nav.game },
];

export function AppHeader() {
  const { t } = useLocale();

  return (
    <header className="app-header">
      <a className="skip-link" href="#main">
        {t(ui.common.skipToContent)}
      </a>

      <div className="app-header__bar">
        <h1 className="app-header__logo">K-SORT</h1>
        <LanguageSelect />
      </div>

      <nav className="app-header__nav" aria-label="K-SORT">
        {NAV_ITEMS.map((item) => (
          <a key={item.href} href={item.href}>
            {t(item.label)}
          </a>
        ))}
      </nav>
    </header>
  );
}
