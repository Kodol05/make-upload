import { localized } from './placeholder';
import type { Source } from './types';

/**
 * 공식 출처를 한곳에서 관리한다.
 *
 * AI가 URL을 만들어 내지 못하도록 응답에서는 여기 등록된 ID만 받고, 실제 주소는
 * 앱이 연결한다. `url`은 박재웅이 문서를 직접 열어 내용이 해당 규칙을 실제로
 * 뒷받침하는지 확인한 뒤에만 채운다.
 *
 * 미확인 상태는 빈 문자열로 둔다. 잘못된 주소는 없는 것보다 나쁘기 때문에
 * 자리 표시를 쓰지 않으며, 도감 UI는 `url`이 비어 있으면 링크를 만들지 않는다.
 */
export const sources: Record<string, Source> = {
  'me-recyclable': {
    title: localized('me-recyclable', 'title', {}),
    url: '',
  },
  'me-food-waste': {
    title: localized('me-food-waste', 'title', {}),
    url: '',
  },
  'me-general-waste': {
    title: localized('me-general-waste', 'title', {}),
    url: '',
  },
  'keco-special-waste': {
    title: localized('keco-special-waste', 'title', {}),
    url: '',
  },
  'local-government': {
    title: localized('local-government', 'title', {}),
    url: '',
  },
};
