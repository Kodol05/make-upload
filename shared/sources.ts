import { localized } from './placeholder.js';
import type { Source } from './types.js';

/**
 * 공식 출처를 한곳에서 관리한다.
 *
 * AI가 URL을 만들어 내지 못하도록 응답에서는 여기 등록된 ID만 받고, 실제 주소는
 * 앱이 연결한다.
 *
 * 미확인 상태는 빈 문자열로 둔다. 잘못된 주소는 없는 것보다 나쁘기 때문에
 * 자리 표시를 쓰지 않으며, 도감 UI는 `url`이 비어 있으면 링크를 만들지 않는다.
 *
 * 아래 주소는 2026-08-07에 직접 열어 내용이 해당 규칙을 뒷받침하는지 확인했다.
 * ⚠️ 환경부는 기후에너지환경부로 바뀌었다. 옛 `me.go.kr`은 `mcee.go.kr`로 넘어가므로
 * 새 주소를 쓴다.
 */
export const sources: Record<string, Source> = {
  'me-recyclable': {
    title: localized('me-recyclable', 'title', {
      ko: '생활폐기물 분리배출 누리집 — 폐기물 종류별 분리배출 방법',
    }),
    url: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/typeItem.do?searchCnd=11',
  },
  'me-food-waste': {
    title: localized('me-food-waste', 'title', {
      ko: '생활폐기물 분리배출 누리집 — 품목사전',
    }),
    url: 'https://xn--oy2b29bd3a601b.kr/front/dischargeMethod/dictionary.do',
  },
  'me-general-waste': {
    title: localized('me-general-waste', 'title', {
      ko: '기후에너지환경부 재활용품 분리배출 가이드라인',
    }),
    url: 'https://mcee.go.kr/home/web/public_info/read.do?condition.publicInfoMasterId=6&publicInfoId=934&menuId=10357',
  },
  'keco-special-waste': {
    title: localized('keco-special-waste', 'title', {
      ko: '재활용가능자원의 분리수거 등에 관한 지침 (국가법령정보센터)',
    }),
    url: 'https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000216235&chrClsCd=010201',
  },
  'local-government': {
    title: localized('local-government', 'title', {
      ko: '생활폐기물 분리배출 누리집 — 지역별 분리배출 안내',
    }),
    url: 'https://xn--oy2b29bd3a601b.kr/front/support/bannerCollection.do',
  },
};
