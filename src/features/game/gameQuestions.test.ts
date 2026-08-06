import { catalogItems } from '@shared/catalog';
import { QUESTION_COUNT, buildQuestions } from './gameQuestions';

/** 섞기를 결정적으로 만들기 위한 가짜 난수. */
function fixedRandom(values: number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

describe('buildQuestions', () => {
  it('draws ten questions', () => {
    expect(buildQuestions(fixedRandom([0.5]))).toHaveLength(QUESTION_COUNT);
  });

  it('never repeats the same situation twice in one round', () => {
    const ids = buildQuestions(fixedRandom([0.1, 0.9, 0.4])).map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('mixes items that are ready to sort with items that need work first', () => {
    // 모든 문제가 한쪽으로 쏠리면 게임이 단조로워진다.
    const questions = buildQuestions(fixedRandom([0.3, 0.7, 0.1, 0.9]));
    const needing = questions.filter((q) => q.needsPreparation);
    expect(needing.length).toBeGreaterThan(0);
    expect(needing.length).toBeLessThan(QUESTION_COUNT);
  });

  it('gives a prepared item no quiz at all', () => {
    const ready = buildQuestions(fixedRandom([0.5])).find((q) => !q.needsPreparation);
    expect(ready?.choices).toEqual([]);
  });

  it('gives an unprepared item four choices with exactly one right answer', () => {
    const needing = buildQuestions(fixedRandom([0.5])).find((q) => q.needsPreparation);
    expect(needing?.choices).toHaveLength(4);
    expect(needing?.choices.filter((choice) => choice.correct)).toHaveLength(1);
  });

  it('takes the wrong choices from other categories so they are clearly wrong', () => {
    const questions = buildQuestions(fixedRandom([0.5]));
    for (const question of questions.filter((q) => q.needsPreparation)) {
      const item = catalogItems.find((candidate) => candidate.id === question.itemId)!;
      const wrong = question.choices.filter((choice) => !choice.correct);
      for (const choice of wrong) {
        const owner = catalogItems.find((candidate) =>
          candidate.steps.some((step) => step.text.ko === choice.text.ko),
        );
        expect(owner?.category).not.toBe(item.category);
      }
    }
  });

  it('only uses items from the catalog', () => {
    const known = new Set(catalogItems.map((item) => item.id));
    for (const question of buildQuestions(fixedRandom([0.5]))) {
      expect(known.has(question.itemId)).toBe(true);
    }
  });

  it('changes the draw when the shuffle changes', () => {
    const a = buildQuestions(fixedRandom([0.1])).map((q) => q.id);
    const b = buildQuestions(fixedRandom([0.9])).map((q) => q.id);
    expect(a).not.toEqual(b);
  });
});
