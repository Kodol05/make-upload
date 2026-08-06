import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { FeatureErrorBoundary } from '@/components/FeatureErrorBoundary';
import { useEffect, useRef, type CSSProperties } from 'react';
import { CatalogSection } from '@/features/catalog/CatalogSection';
import { AskChatProvider } from '@/features/chat/askChat';
import { ChatWidget } from '@/features/chat/ChatWidget';
import { GamePage } from '@/features/game/GamePage';
import { IntroPage } from '@/features/intro/IntroPage';
import { LearnSection } from '@/features/learn/LearnSection';
import { ui } from '@/i18n/strings';
import { assetUrl } from '@/lib/assetUrl';
import { journey, stepIndexOf } from './journey';
import { LocaleProvider } from './LocaleProvider';
import { useHashRoute } from './useHashRoute';
import { useLocale } from './useLocale';

/** ① 소개. 다음으로 가는 단추까지 `IntroPage`가 들고 있다. */
function IntroRoute() {
  return <IntroPage />;
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
 * ③ 도감.
 *
 * 사진으로 찾기가 도감 안으로 들어가면서 이 화면은 섹션 하나가 됐다. 예전에는
 * 스캔 화면과 도감이 위아래로 나뉘어 있었는데, 스캔 아래의 16종 목록이 도감과
 * 같은 일을 해서 같은 화면을 두 번 만든 셈이었다.
 */
function CatalogRoute() {
  return (
    <FeatureErrorBoundary>
      <CatalogSection />
    </FeatureErrorBoundary>
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

/**
 * 지금 어디쯤인지 알려 준다.
 *
 * 화면 아래 "다음" 버튼 옆에 둔다. 헤더 밑에 있으면 늘 눈에 걸리기만 하고,
 * 정작 필요한 순간은 다 보고 나서 넘어갈지 정할 때다.
 */
function JourneyProgress({ index }: { index: number }) {
  const { t } = useLocale();
  const current = index + 1;
  const total = journey.length;

  /**
   * 막대를 단계 수만큼 칸으로 나눈다. 이어진 막대는 얼마나 왔는지만 알려 주지만,
   * 칸으로 나누면 **전부 몇 단계인지**도 같이 읽힌다. 칸 사이의 실선이 그 경계다.
   */
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
        {journey.map((step, position) => (
          <span
            key={step.route}
            className={
              position <= index
                ? 'journey-progress__step journey-progress__step--done'
                : 'journey-progress__step'
            }
          />
        ))}
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
function JourneyNext({
  index,
  tone = 'strong',
}: {
  index: number;
  /** 소개 화면에서는 조용하게 둔다. 붙잡아 둘 내용이 없는 화면이라 강하게 밀 이유가 없다. */
  tone?: 'strong' | 'quiet';
}) {
  const { t } = useLocale();
  const step = journey[index];

  // 링크 하나뿐이라 nav 랜드마크로 감싸지 않는다. 헤더 메뉴와 헷갈리게만 만든다.
  return (
    <div className={`journey-next journey-next--${tone}`}>
      {tone === 'strong' && (
        <p className="journey-next__hint">{t(ui.journey.stayHint)}</p>
      )}
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
      {/**
       * 화면 전체 뒤에 까는 질감.
       *
       * 배경색만으로는 판이 밋밋해서 산과 숲 사진을 아주 흐리게 깐다. 투명도가
       * 7%라 무엇인지 알아보기보다 색이 살짝 깊어지는 정도로만 작동한다.
       * 경로는 여기서 넘긴다. Vite가 CSS의 `url()`에는 base를 붙이지 않는다.
       */}
      <div
        className="page-texture"
        aria-hidden="true"
        style={
          {
            '--page-texture': `url(${assetUrl('/images/page-texture.webp')})`,
          } as CSSProperties
        }
      />
      <AppHeader currentRoute={journey[index].route} />
      <main id="main" ref={mainRef} tabIndex={-1}>
        {page}
        {/**
         * 진행 표시와 다음 버튼을 아래에 함께 둔다. 헤더 밑에 있으면 화면을
         * 가로막기만 하고, 정작 필요한 순간은 "넘어갈까" 하고 정할 때다.
         */}
        <div className="journey-foot">
          <JourneyProgress index={index} />
          {/* 소개는 가운데에 이미 있다. 같은 버튼을 두 번 두지 않는다. */}
          {index > 0 && <JourneyNext index={index} />}
        </div>
      </main>
      <AppFooter />
      {/**
       * 챗봇은 라우트 바깥에 둔다. 안에 두면 페이지를 옮길 때 컴포넌트가 사라지면서
       * 대화가 통째로 날아간다. "어디서나 열 수 있게"의 전제 조건이다.
       */}
      <ChatWidget hint={journey[index].route === '/catalog'} />
    </>
  );
}

export function App() {
  return (
    <LocaleProvider>
      {/* 도감·검색에서 챗봇을 부르는 통로. 챗봇은 라우트 바깥에 있고 부르는 쪽은 안쪽이다. */}
      <AskChatProvider>
        <AppShell />
      </AskChatProvider>
    </LocaleProvider>
  );
}
