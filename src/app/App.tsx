import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { FeatureErrorBoundary } from '@/components/FeatureErrorBoundary';
import { SortMark } from '@/components/SortMark';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CatalogSection } from '@/features/catalog/CatalogSection';
import { ChatWidget } from '@/features/chat/ChatWidget';
import { GamePage } from '@/features/game/GamePage';
import { LearnSection } from '@/features/learn/LearnSection';
import { ScannerSection } from '@/features/scanner/ScannerSection';
import { ui } from '@/i18n/strings';
import { categories, type ItemId } from '@shared/types';
import { journey, stepIndexOf } from './journey';
import { LocaleProvider } from './LocaleProvider';
import { useHashRoute } from './useHashRoute';
import { useLocale } from './useLocale';

/**
 * ① 소개.
 *
 * 이 앱이 가르치는 것은 결국 "이 표시를 읽는 법"이다. 그래서 긴 소개 문장 대신
 * 네 분류를 표시로 나란히 세운다. 한 눈에 체계가 들어오고, 뒤의 도감에서 같은
 * 표시를 다시 만나면서 눈에 익는다.
 */
function IntroRoute() {
  const { t } = useLocale();

  return (
    <section className="masthead">
      <h2 className="masthead__title">{t(ui.catalog.title)}</h2>
      <p className="masthead__intro">{t(ui.home.intro)}</p>
      <div className="masthead__marks">
        {categories.map((category) => (
          <SortMark
            key={category}
            tone={category}
            label={t(ui.category[category])}
            size="lg"
          />
        ))}
      </div>
    </section>
  );
}

/** ② 영상으로 배우기. */
function LearnRoute() {
  return (
    <FeatureErrorBoundary>
      <LearnSection />
    </FeatureErrorBoundary>
  );
}

/**
 * ③ 도감과 AI 찾기.
 *
 * 스캐너가 고른 품목의 상세를 열 수 있도록 요청을 여기서 들고 있다가 도감에
 * 넘긴다. 두 섹션이 서로를 직접 알 필요가 없다.
 */
function CatalogRoute() {
  const [requestedItemId, setRequestedItemId] = useState<ItemId | null>(null);
  const clearRequest = useCallback(() => setRequestedItemId(null), []);

  return (
    <>
      <FeatureErrorBoundary>
        <ScannerSection onOpenItem={setRequestedItemId} />
      </FeatureErrorBoundary>
      <FeatureErrorBoundary>
        <CatalogSection
          requestedItemId={requestedItemId}
          onRequestHandled={clearRequest}
        />
      </FeatureErrorBoundary>
    </>
  );
}

/** ④ 게임으로 복습. */
function GameRoute() {
  return (
    <FeatureErrorBoundary>
      <GamePage />
    </FeatureErrorBoundary>
  );
}

/** 지금 어디쯤인지 알려 준다. 상단 메뉴를 강조하지 않기로 해서 이게 더 중요해졌다. */
function JourneyProgress({ index }: { index: number }) {
  const { t } = useLocale();
  const current = index + 1;
  const total = journey.length;

  return (
    <div className="journey-progress">
      <div
        className="journey-progress__track"
        role="progressbar"
        aria-label={t(ui.journey.progressLabel)}
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <span style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <span className="journey-progress__count">
        {current} / {total}
      </span>
    </div>
  );
}

/**
 * 다음 페이지로 가는 버튼.
 *
 * 화면 아래에 고정하지 않고 본문 흐름 맨 끝에 둔다. 고정하면 우하단 챗봇 버튼과
 * 좁은 화면에서 겹치고, 무엇보다 "다 봤으면 넘어가라"는 뜻이 위치로 전달된다.
 */
function JourneyNext({ index }: { index: number }) {
  const { t } = useLocale();
  const step = journey[index];

  // 링크 하나뿐이라 nav 랜드마크로 감싸지 않는다. 헤더 메뉴와 헷갈리게만 만든다.
  return (
    <div className="journey-next">
      <p className="journey-next__hint">{t(ui.journey.stayHint)}</p>
      <a className="journey-next__button" href={`#${step.nextRoute}`}>
        {t(step.nextLabel)}
      </a>
    </div>
  );
}

function AppShell() {
  const route = useHashRoute();
  const index = stepIndexOf(route);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  /**
   * 페이지를 옮기면 본문으로 포커스를 보낸다. 화면만 바뀌고 포커스가 헤더에
   * 남아 있으면 키보드와 스크린 리더 사용자는 이동한 줄을 모른다.
   * 처음 열 때는 건너뛴다. 사용자가 아직 아무것도 누르지 않았기 때문이다.
   */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus();
    // scrollTo 대신 값을 직접 준다. jsdom이 scrollTo를 구현하지 않아 테스트가 시끄러워진다.
    document.documentElement.scrollTop = 0;
  }, [route]);

  const page = [
    <IntroRoute key="intro" />,
    <LearnRoute key="learn" />,
    <CatalogRoute key="catalog" />,
    <GameRoute key="game" />,
  ][index];

  return (
    <>
      <AppHeader currentRoute={journey[index].route} />
      <JourneyProgress index={index} />
      <main id="main" ref={mainRef} tabIndex={-1}>
        {page}
        <JourneyNext index={index} />
      </main>
      <AppFooter />
      {/**
       * 챗봇은 라우트 바깥에 둔다. 안에 두면 페이지를 옮길 때 컴포넌트가 사라지면서
       * 대화가 통째로 날아간다. "어디서나 열 수 있게"의 전제 조건이다.
       */}
      <ChatWidget />
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
