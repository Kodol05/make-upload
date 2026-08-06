import type { ChatResponse, Faq, LocalizedText } from '@shared/types';

/**
 * 추천 질문에 대한 답.
 *
 * 추천 질문은 우리가 고른 FAQ 그대로고, 답도 이미 검수해서 갖고 있다. 모델에게
 * 물을 이유가 없다. 부르지 않으면 세 가지가 함께 좋아진다.
 *
 * - **시연이 안전해진다.** 무료 한도가 걸리거나 망이 끊겨도 챗봇이 답을 한다
 * - **기다림이 없다.** 정해진 답을 받는 데 몇 초를 기다릴 이유가 없다
 * - **한도를 아낀다.** 무료 등급이라 하루 호출 수가 빡빡하다
 *
 * 출처와 관련 품목까지 FAQ가 들고 있어서 화면 쪽은 모델 답과 똑같이 다룬다.
 */
export function answerFromFaq(faq: Faq, t: (text: LocalizedText) => string): ChatResponse {
  return {
    answer: t(faq.answer),
    matchedItemIds: faq.relatedItemIds,
    sourceIds: faq.sourceIds,
    status: 'answered',
  };
}

/**
 * 추천 질문 자리들.
 *
 * `slots`는 지금 화면에 걸린 질문의 번호, `next`는 다음에 꺼낼 번호다.
 */
export interface SuggestionSlots {
  slots: number[];
  next: number;
}

export function initialSuggestions(total: number, count: number): SuggestionSlots {
  const shown = Math.min(count, total);
  return {
    slots: Array.from({ length: shown }, (_, index) => index),
    next: total === 0 ? 0 : shown % total,
  };
}

/**
 * 한 자리를 쓰고 그 자리에만 다음 질문을 넣는다.
 *
 * 나머지 자리는 그대로 둔다. 하나 눌렀다고 셋이 다 바뀌면 고르려던 것을 잃는다.
 * 끝까지 돌면 처음 질문으로 되돌아온다.
 */
export function takeSuggestion(
  state: SuggestionSlots,
  position: number,
  total: number,
): SuggestionSlots {
  if (total === 0) return state;
  return {
    slots: state.slots.map((value, index) => (index === position ? state.next : value)),
    next: (state.next + 1) % total,
  };
}
