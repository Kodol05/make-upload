import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { useCallback, useState } from 'react';
import { CatalogSection } from '@/features/catalog/CatalogSection';
import { ChatSection } from '@/features/chat/ChatSection';
import { LearnSection } from '@/features/learn/LearnSection';
import { ScannerSection } from '@/features/scanner/ScannerSection';
import { ui } from '@/i18n/strings';
import type { ItemId } from '@shared/types';
import { LocaleProvider } from './LocaleProvider';
import { useHashRoute } from './useHashRoute';
import { useLocale } from './useLocale';

/**
 * 학습 여정 화면.
 *
 * 스캐너가 고른 품목의 도감 상세를 열 수 있도록 요청을 여기서 들고 있다가
 * 도감에 넘긴다. 두 섹션이 서로를 직접 알 필요가 없다.
 */
function HomeRoute() {
  const { t } = useLocale();
  const [requestedItemId, setRequestedItemId] = useState<ItemId | null>(null);
  const clearRequest = useCallback(() => setRequestedItemId(null), []);

  return (
    <>
      <p className="home-intro">{t(ui.home.intro)}</p>
      <LearnSection />
      <ScannerSection onOpenItem={setRequestedItemId} />
      <CatalogSection
        requestedItemId={requestedItemId}
        onRequestHandled={clearRequest}
      />
      <ChatSection />
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
