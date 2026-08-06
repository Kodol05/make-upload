import { faqs } from '@shared/faqs';
import { answerFromFaq, initialSuggestions, takeSuggestion } from './faqAnswers';

const ko = (text: { ko: string }) => text.ko;

describe('answerFromFaq', () => {
  it('answers straight from the checked FAQ', () => {
    const faq = faqs[0];
    const answer = answerFromFaq(faq, ko);

    expect(answer.answer).toBe(faq.answer.ko);
    expect(answer.status).toBe('answered');
    expect(answer.sourceIds).toEqual(faq.sourceIds);
    expect(answer.matchedItemIds).toEqual(faq.relatedItemIds);
  });
});

describe('추천 질문 자리', () => {
  it('starts with the first few questions', () => {
    expect(initialSuggestions(20, 3)).toEqual({ slots: [0, 1, 2], next: 3 });
  });

  /** 하나 눌렀다고 셋이 다 바뀌면 고르려던 것을 잃는다. */
  it('replaces only the slot that was used', () => {
    const after = takeSuggestion(initialSuggestions(20, 3), 1, 20);
    expect(after.slots).toEqual([0, 3, 2]);
  });

  /**
   * 끝까지 쓰면 처음으로 되돌아온다. 스무 번 눌러 보는 대신 자리 계산만 돌린다.
   */
  it('comes back to the first question once every one has been used', () => {
    let state = initialSuggestions(20, 3);
    for (let turn = 0; turn < 20; turn += 1) {
      state = takeSuggestion(state, turn % 3, 20);
    }
    expect(state.next).toBe(3);
    // 스무 번 도는 동안 화면에 걸린 번호가 범위를 벗어나지 않는다.
    expect(state.slots.every((value) => value >= 0 && value < 20)).toBe(true);
  });

  it('never divides by zero when there is nothing to suggest', () => {
    const empty = initialSuggestions(0, 3);
    expect(empty).toEqual({ slots: [], next: 0 });
    expect(takeSuggestion(empty, 0, 0)).toEqual(empty);
  });

  it('shows fewer slots than asked for when the guide is small', () => {
    expect(initialSuggestions(2, 3).slots).toEqual([0, 1]);
  });
});
