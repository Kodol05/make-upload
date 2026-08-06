import { localized } from '@shared/placeholder';

/**
 * 도감·FAQ 데이터 바깥의 모든 화면 문자열.
 *
 * 한곳에 모아 두어야 박재웅이 파일 하나만 열고 번역할 수 있고, 모든 항목이 네 언어
 * 값을 갖는지 테스트가 재귀로 확인할 수 있다. 아직 채우지 못한 언어는
 * `__TODO__:ui.nav.learn.en` 형태로 화면에 그대로 보이므로 빠진 번역이 눈에 띈다.
 *
 * 화면을 만들면서 필요한 문자열을 이 사전에 계속 더한다.
 */
export const ui = {
  nav: {
    learn: localized('ui', 'nav.learn', { ko: '배우기' }),
    scan: localized('ui', 'nav.scan', { ko: 'AI 스캔' }),
    catalog: localized('ui', 'nav.catalog', { ko: '도감' }),
    chat: localized('ui', 'nav.chat', { ko: 'AI에게 묻기' }),
    game: localized('ui', 'nav.game', { ko: '게임' }),
  },
  common: {
    language: localized('ui', 'common.language', { ko: '언어' }),
    close: localized('ui', 'common.close', { ko: '닫기' }),
    retry: localized('ui', 'common.retry', { ko: '다시 시도' }),
    skipToContent: localized('ui', 'common.skipToContent', { ko: '본문으로 건너뛰기' }),
  },
  home: {
    intro: localized('ui', 'home.intro', {}),
  },
  game: {
    title: localized('ui', 'game.title', { ko: '게임으로 복습하기' }),
    backToHome: localized('ui', 'game.backToHome', { ko: '홈으로 돌아가기' }),
  },
};
