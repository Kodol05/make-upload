import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { LearnSection } from '@/features/learn/LearnSection';
import { ui } from '@/i18n/strings';
import { LocaleProvider } from './LocaleProvider';
import { useHashRoute } from './useHashRoute';
import { useLocale } from './useLocale';

/** 학습 여정 화면. 도감·스캐너·챗봇 섹션이 이어서 붙는다. */
function HomeRoute() {
  const { t } = useLocale();
  return (
    <>
      <p className="home-intro">{t(ui.home.intro)}</p>
      <LearnSection />
    </>
  );
}

/** 게임 화면. Task 9에서 실제 게임을 연결한다. */
function GameRoute() {
  const { t } = useLocale();
  return (
    <section>
      <h2>{t(ui.game.title)}</h2>
      <a href="#/">{t(ui.game.backToHome)}</a>
    </section>
  );
}

function AppShell() {
  const route = useHashRoute();

  return (
    <>
      <AppHeader />
      <main id="main">{route === '/game' ? <GameRoute /> : <HomeRoute />}</main>
      <AppFooter />
    </>
  );
}

export function App() {
  return (
    <LocaleProvider>
      <AppShell />
    </LocaleProvider>
  );
}
