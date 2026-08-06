import { catalogItems } from '@shared/catalog';
import type { CatalogItem, ItemId, LocalizedText } from '@shared/types';

/** 한 판에 내는 문제 수. 발표에서 짧게 보여 주기 좋은 길이다. */
export const QUESTION_COUNT = 10;

const CHOICE_COUNT = 4;

export interface GameChoice {
  text: LocalizedText;
  correct: boolean;
}

export interface GameQuestion {
  id: string;
  itemId: ItemId;
  /**
   * 바로 배출할 수 없는 상태로 낸 문제인가.
   *
   * 도감의 "흔한 실수"가 곧 잘못된 상태다. 이 상태로 내면 먼저 어떻게 처리할지
   * 고른 뒤에야 분리수거 통이 열린다.
   */
  needsPreparation: boolean;
  /** 선처리 문제의 선택지. 바로 배출할 수 있는 문제면 비어 있다. */
  choices: GameChoice[];
}

/** 배열을 섞는다. 난수를 받아 테스트에서 결정적으로 만들 수 있다. */
function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * 오답으로 쓸 처리 방법을 다른 분류에서 가져온다.
 *
 * 같은 분류에서 가져오면 실제로 맞는 방법일 수 있어 문제가 애매해진다.
 */
function wrongChoices(item: CatalogItem, random: () => number): GameChoice[] {
  const others = catalogItems.filter((candidate) => candidate.category !== item.category);
  const steps = others.flatMap((candidate) => candidate.steps.map((step) => step.text));
  return shuffle(steps, random)
    .slice(0, CHOICE_COUNT - 1)
    .map((text) => ({ text, correct: false }));
}

/**
 * 한 판에 낼 문제를 뽑는다.
 *
 * 품목마다 두 가지 상태로 낼 수 있다. 깨끗한 상태면 바로 통을 고르고, 흔한 실수
 * 상태면 어떻게 처리할지 먼저 골라야 한다. 16종 × 2 = 32개에서 10개를 뽑는다.
 * 새로 만든 콘텐츠는 없고 모두 도감에서 가져온다.
 */
export function buildQuestions(random: () => number = Math.random): GameQuestion[] {
  const pool: GameQuestion[] = catalogItems.flatMap((item) => [
    { id: `${item.id}:ready`, itemId: item.id, needsPreparation: false, choices: [] },
    {
      id: `${item.id}:prepare`,
      itemId: item.id,
      needsPreparation: true,
      choices: shuffle(
        [
          // 첫 단계가 손으로 하는 준비 행동이다. 마지막 단계는 배출이라 문제가 안 된다.
          { text: item.steps[0].text, correct: true },
          ...wrongChoices(item, random),
        ],
        random,
      ),
    },
  ]);

  return shuffle(pool, random).slice(0, QUESTION_COUNT);
}
