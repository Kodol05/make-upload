import { ui } from '@/i18n/strings';
import type { LocalizedText } from '@shared/types';

/**
 * 네 페이지를 지나가는 학습 여정.
 *
 * 순서가 한 방향이라는 뜻이지 강제한다는 뜻은 아니다. 각 페이지에 머물러
 * 영상을 다시 보거나 도감을 더 뒤질 수 있고, 상단 메뉴로 아무 데나 갈 수도 있다.
 * 다만 아무것도 고르지 않았을 때 자연스럽게 흘러가는 길은 하나여야 한다.
 *
 * 헤더 메뉴·진행 표시·다음 버튼이 모두 이 배열 하나를 본다. 여정을 바꿀 때
 * 세 곳을 따로 고치다 어긋나는 일이 없게 하려는 것이다.
 */
export interface JourneyStep {
  /** 해시 경로. 페이지마다 주소가 있어야 새로고침해도 그 자리로 돌아온다. */
  route: string;
  /** 상단 메뉴에 적히는 짧은 이름 */
  navLabel: LocalizedText;
  /** 다음 페이지로 가는 버튼에 적히는 말. 마지막 단계는 처음으로 돌아간다. */
  nextLabel: LocalizedText;
  /** 눌렀을 때 가는 곳 */
  nextRoute: string;
}

export const journey: JourneyStep[] = [
  {
    route: '/',
    navLabel: ui.nav.home,
    nextLabel: ui.journey.begin,
    nextRoute: '/learn',
  },
  {
    route: '/learn',
    navLabel: ui.nav.learn,
    nextLabel: ui.journey.toCatalog,
    nextRoute: '/catalog',
  },
  {
    route: '/catalog',
    navLabel: ui.nav.catalog,
    nextLabel: ui.journey.toGame,
    nextRoute: '/game',
  },
  {
    route: '/game',
    navLabel: ui.nav.game,
    nextLabel: ui.journey.restart,
    nextRoute: '/',
  },
];

/** 모르는 주소로 들어오면 첫 페이지로 본다. */
export function stepIndexOf(route: string): number {
  const index = journey.findIndex((step) => step.route === route);
  return index === -1 ? 0 : index;
}
