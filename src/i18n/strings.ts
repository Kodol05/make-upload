import { localized } from '@shared/placeholder';

/**
 * 도감·FAQ 데이터 바깥의 모든 화면 문자열.
 *
 * 한곳에 모아 두어야 박재웅이 파일 하나만 열고 번역할 수 있고, 모든 항목이 네 언어
 * 값을 갖는지 테스트가 재귀로 확인할 수 있다. 아직 채우지 못한 언어는 화면에
 * `(임시값)`으로 보인다.
 *
 * **아직 만들지 않은 화면의 문자열도 미리 적어 둔다.** 화면을 만들면서 조금씩 늘리면
 * 번역을 여러 번 나눠 해야 하므로, 설계 문서에 정의된 화면의 문안을 먼저 확정해
 * 한 번에 번역할 수 있게 한다. 구현하면서 문구가 어색하면 한국어만 고치고 번역은
 * 그대로 두면 된다.
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
    loading: localized('ui', 'common.loading', { ko: '불러오는 중' }),
    openCatalog: localized('ui', 'common.openCatalog', { ko: '도감에서 찾기' }),
  },

  category: {
    all: localized('ui', 'category.all', { ko: '전체' }),
    recyclable: localized('ui', 'category.recyclable', { ko: '재활용' }),
    food: localized('ui', 'category.food', { ko: '음식물' }),
    general: localized('ui', 'category.general', { ko: '일반' }),
    special: localized('ui', 'category.special', { ko: '특수' }),
  },

  home: {
    intro: localized('ui', 'home.intro', {
      ko: '한국의 분리배출을 영상으로 배우고, 사진으로 찾고, 도감에서 확인하세요.',
    }),
  },

  learn: {
    title: localized('ui', 'learn.title', { ko: '영상으로 배우기' }),
    videoUnavailable: localized('ui', 'learn.videoUnavailable', {
      ko: '영상을 재생할 수 없습니다',
    }),
    videoSummary: localized('ui', 'learn.videoSummary', {
      ko: '아래 4대 원칙과 도감으로 같은 내용을 확인할 수 있습니다.',
    }),
    subtitleLabel: localized('ui', 'learn.subtitleLabel', { ko: '자막' }),
    principlesTitle: localized('ui', 'learn.principlesTitle', {
      ko: '분리배출 4대 원칙',
    }),
    /** 원칙 이름 네 가지는 설계 문서가 정한 값이다. 설명은 검수 뒤에 채운다. */
    principles: {
      empty: {
        label: localized('ui', 'learn.principles.empty.label', { ko: '비운다' }),
        description: localized('ui', 'learn.principles.empty.description', {}),
      },
      rinse: {
        label: localized('ui', 'learn.principles.rinse.label', { ko: '헹군다' }),
        description: localized('ui', 'learn.principles.rinse.description', {}),
      },
      separate: {
        label: localized('ui', 'learn.principles.separate.label', { ko: '분리한다' }),
        description: localized('ui', 'learn.principles.separate.description', {}),
      },
      dontMix: {
        label: localized('ui', 'learn.principles.dontMix.label', { ko: '섞지 않는다' }),
        description: localized('ui', 'learn.principles.dontMix.description', {}),
      },
    },
  },

  catalog: {
    title: localized('ui', 'catalog.title', { ko: '분리배출 도감' }),
    searchLabel: localized('ui', 'catalog.searchLabel', { ko: '품목 검색' }),
    searchPlaceholder: localized('ui', 'catalog.searchPlaceholder', {
      ko: '예: 페트병, 컵라면',
    }),
    filterLabel: localized('ui', 'catalog.filterLabel', { ko: '분류로 거르기' }),
    resultCount: localized('ui', 'catalog.resultCount', { ko: '개 품목' }),
    empty: localized('ui', 'catalog.empty', { ko: '찾는 품목이 없습니다' }),
    emptyHint: localized('ui', 'catalog.emptyHint', {
      ko: '다른 말로 검색하거나 AI에게 물어보세요.',
    }),
    stepsTitle: localized('ui', 'catalog.stepsTitle', { ko: '처리 순서' }),
    mistakeTitle: localized('ui', 'catalog.mistakeTitle', { ko: '흔한 실수' }),
    localCheckTitle: localized('ui', 'catalog.localCheckTitle', {
      ko: '지역 확인이 필요합니다',
    }),
    localCheckBody: localized('ui', 'catalog.localCheckBody', {
      ko: '지역마다 배출 방법이 다를 수 있습니다. 거주지 안내도 함께 확인하세요.',
    }),
    sourcesTitle: localized('ui', 'catalog.sourcesTitle', { ko: '공식 출처' }),
    sourceUnverified: localized('ui', 'catalog.sourceUnverified', {
      ko: '출처 확인 중',
    }),
    askAi: localized('ui', 'catalog.askAi', { ko: '이 품목을 AI에게 묻기' }),
  },

  scanner: {
    title: localized('ui', 'scanner.title', { ko: 'AI로 찾기' }),
    intro: localized('ui', 'scanner.intro', {
      ko: '무엇인지 모르겠으면 사진을 찍고, 알고 있으면 아래에서 고르세요.',
    }),
    takePhoto: localized('ui', 'scanner.takePhoto', { ko: '사진 찍기' }),
    choosePhoto: localized('ui', 'scanner.choosePhoto', { ko: '사진 올리기' }),
    pickFromList: localized('ui', 'scanner.pickFromList', { ko: '목록에서 고르기' }),
    analyzing: localized('ui', 'scanner.analyzing', { ko: '분석하는 중' }),
    resultTitle: localized('ui', 'scanner.resultTitle', { ko: '찾은 물건' }),
    privacyNotice: localized('ui', 'scanner.privacyNotice', {
      ko: '사진은 Google Gemini로 전송되어 분석되며 K-SORT 서버에는 저장하지 않습니다. 무료 등급을 사용하므로 Google의 서비스 개선에 활용될 수 있으니 개인정보가 담긴 사진은 올리지 마세요.',
    }),
    certaintyHigh: localized('ui', 'scanner.certaintyHigh', { ko: '확실' }),
    certaintyMedium: localized('ui', 'scanner.certaintyMedium', { ko: '확인 필요' }),
    certaintyLow: localized('ui', 'scanner.certaintyLow', { ko: '불확실' }),
    unknownLabel: localized('ui', 'scanner.unknownLabel', { ko: '판단하지 못했습니다' }),
    confirmPrompt: localized('ui', 'scanner.confirmPrompt', {
      ko: '이 중에 맞는 것이 있나요?',
    }),
    noObjects: localized('ui', 'scanner.noObjects', {
      ko: '버릴 물건을 찾지 못했습니다',
    }),
    imageTooLarge: localized('ui', 'scanner.imageTooLarge', {
      ko: '사진이 너무 큽니다. 더 작은 사진을 골라 주세요.',
    }),
    unsupportedType: localized('ui', 'scanner.unsupportedType', {
      ko: 'JPEG, PNG, WebP 사진만 사용할 수 있습니다.',
    }),
    showExample: localized('ui', 'scanner.showExample', { ko: '예시 결과 보기' }),
    exampleNotice: localized('ui', 'scanner.exampleNotice', {
      ko: '미리 준비한 예시입니다. 지금 분석한 결과가 아닙니다.',
    }),
  },

  chat: {
    title: localized('ui', 'chat.title', { ko: 'AI에게 묻기' }),
    intro: localized('ui', 'chat.intro', {
      ko: '검수된 도감과 자주 묻는 질문 안에서만 답합니다.',
    }),
    inputLabel: localized('ui', 'chat.inputLabel', { ko: '질문 입력' }),
    inputPlaceholder: localized('ui', 'chat.inputPlaceholder', {
      ko: '무엇이 궁금한가요?',
    }),
    send: localized('ui', 'chat.send', { ko: '보내기' }),
    thinking: localized('ui', 'chat.thinking', { ko: '답변을 찾는 중' }),
    suggestionsTitle: localized('ui', 'chat.suggestionsTitle', { ko: '추천 질문' }),
    relatedItems: localized('ui', 'chat.relatedItems', { ko: '관련 품목' }),
    sources: localized('ui', 'chat.sources', { ko: '출처' }),
    needsLocalCheck: localized('ui', 'chat.needsLocalCheck', {
      ko: '지역마다 다를 수 있으니 거주지 안내를 확인하세요.',
    }),
    outOfScope: localized('ui', 'chat.outOfScope', {
      ko: '분리배출과 관련된 질문에만 답할 수 있습니다.',
    }),
    tooLong: localized('ui', 'chat.tooLong', { ko: '질문은 500자까지 쓸 수 있습니다.' }),
  },

  game: {
    title: localized('ui', 'game.title', { ko: '게임으로 복습하기' }),
    intro: localized('ui', 'game.intro', {
      ko: '쓰레기를 보고 알맞은 곳에 버려 보세요. 열 문제입니다.',
    }),
    start: localized('ui', 'game.start', { ko: '시작하기' }),
    progress: localized('ui', 'game.progress', { ko: '문제' }),
    prepQuestion: localized('ui', 'game.prepQuestion', {
      ko: '이대로는 버릴 수 없어요. 먼저 무엇을 해야 할까요?',
    }),
    sortQuestion: localized('ui', 'game.sortQuestion', { ko: '어디에 버릴까요?' }),
    binsLocked: localized('ui', 'game.binsLocked', {
      ko: '먼저 처리 방법을 고르면 열립니다',
    }),
    hintTitle: localized('ui', 'game.hintTitle', { ko: '힌트' }),
    wrongAgain: localized('ui', 'game.wrongAgain', { ko: '다시 한 번 골라 보세요' }),
    revealed: localized('ui', 'game.revealed', { ko: '정답은 이것입니다' }),
    correct: localized('ui', 'game.correct', { ko: '맞았습니다' }),
    nextQuestion: localized('ui', 'game.nextQuestion', { ko: '다음 문제' }),
    score: localized('ui', 'game.score', { ko: '맞힌 문제' }),
    resultTitle: localized('ui', 'game.resultTitle', { ko: '결과' }),
    playAgain: localized('ui', 'game.playAgain', { ko: '다시 하기' }),
    reviewTitle: localized('ui', 'game.reviewTitle', { ko: '다시 볼 품목' }),
    allCorrect: localized('ui', 'game.allCorrect', { ko: '모두 맞혔습니다' }),
    backToHome: localized('ui', 'game.backToHome', { ko: '홈으로 돌아가기' }),
  },

  error: {
    sectionFailed: localized('ui', 'error.sectionFailed', {
      ko: '이 부분을 불러오지 못했습니다',
    }),
    sectionFailedHint: localized('ui', 'error.sectionFailedHint', {
      ko: '다른 기능은 그대로 쓸 수 있습니다.',
    }),
    network: localized('ui', 'error.network', {
      ko: '연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    }),
    rateLimited: localized('ui', 'error.rateLimited', {
      ko: '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
    }),
    timeout: localized('ui', 'error.timeout', {
      ko: '응답이 늦어지고 있습니다. 다시 시도해 주세요.',
    }),
    unavailable: localized('ui', 'error.unavailable', {
      ko: 'AI 기능을 지금 쓸 수 없습니다. 도감에서 직접 찾아보세요.',
    }),
  },
};
