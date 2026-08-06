import { useMemo, useState } from 'react';
import { ItemImage } from '@/components/ItemImage';
import { ui } from '@/i18n/strings';
import { resolveText } from '@shared/placeholder';
import { categories, type Category, type ItemId, type LocalizedText } from '@shared/types';
import type { GameExperienceProps } from './GameContract';
import { QUESTION_COUNT, buildQuestions } from './gameQuestions';

/** 한 단계에서 두 번 틀리면 정답을 알려 주고 넘어간다. */
const MAX_TRIES = 2;

type Step = 'prepare' | 'sort' | 'reviewed';

interface Attempt {
  prepareWrong: number;
  sortWrong: number;
  revealed: boolean;
}

const FRESH: Attempt = { prepareWrong: 0, sortWrong: 0, revealed: false };

/**
 * 분리배출 게임.
 *
 * 위에 쓰레기가 보이고 아래에 분리수거 통이 있다. 바로 버릴 수 있는 상태면 통이
 * 열려 있고, 먼저 처리해야 하는 상태면 통이 잠긴 채 처리 방법을 먼저 고르게 한다.
 *
 * 시간을 재지 않는다. 학습 도구이므로 천천히 생각하고 고르면 된다.
 */
export function GameExperience({ locale, items, onComplete }: GameExperienceProps) {
  const questions = useMemo(() => buildQuestions(), []);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>(
    questions[0].needsPreparation ? 'prepare' : 'sort',
  );
  const [attempt, setAttempt] = useState<Attempt>(FRESH);
  const [wrongItemIds, setWrongItemIds] = useState<ItemId[]>([]);

  const question = questions[index];
  const item = items.find((candidate) => candidate.id === question.itemId)!;
  const t = (text: LocalizedText) => resolveText(text, locale);

  const showHint =
    (step === 'prepare' && attempt.prepareWrong === 1) ||
    (step === 'sort' && attempt.sortWrong === 1);

  function goNext() {
    const failed = attempt.prepareWrong > 0 || attempt.sortWrong > 0;
    const nextWrong = failed ? [...wrongItemIds, question.itemId] : wrongItemIds;

    if (index + 1 >= questions.length) {
      onComplete({
        score: QUESTION_COUNT - nextWrong.length,
        learnedItemIds: nextWrong,
      });
      return;
    }

    setWrongItemIds(nextWrong);
    setIndex(index + 1);
    setStep(questions[index + 1].needsPreparation ? 'prepare' : 'sort');
    setAttempt(FRESH);
  }

  function answerPrepare(correct: boolean) {
    if (correct) {
      setStep('sort');
      return;
    }
    const wrong = attempt.prepareWrong + 1;
    // 두 번째로 틀리면 정답을 알려 주고 통을 열어 준다.
    setAttempt({ ...attempt, prepareWrong: wrong, revealed: wrong >= MAX_TRIES });
    if (wrong >= MAX_TRIES) setStep('sort');
  }

  function answerSort(category: Category) {
    if (category === item.category) {
      setStep('reviewed');
      return;
    }
    const wrong = attempt.sortWrong + 1;
    setAttempt({ ...attempt, sortWrong: wrong, revealed: wrong >= MAX_TRIES });
    if (wrong >= MAX_TRIES) setStep('reviewed');
  }

  const binsLocked = step === 'prepare';

  return (
    <div className="game-play">
      <p className="game-play__progress">
        {t(ui.game.progress)} {index + 1} / {questions.length}
      </p>

      <div className="game-play__item">
        <ItemImage item={item} className="game-play__image" />
        <p className="game-play__name" data-testid="game-item-name">
          {t(item.name)}
        </p>
        {question.needsPreparation && (
          <p className="game-play__condition">{t(item.commonMistake)}</p>
        )}
      </div>

      {step === 'prepare' && (
        <div className="game-play__quiz">
          <p className="game-play__question">{t(ui.game.prepQuestion)}</p>
          <ul className="game-play__choices">
            {question.choices.map((choice, choiceIndex) => (
              <li key={choiceIndex}>
                <button type="button" onClick={() => answerPrepare(choice.correct)}>
                  {t(choice.text)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 'sort' && (
        <p className="game-play__question">{t(ui.game.sortQuestion)}</p>
      )}

      {showHint && (
        <div className="game-play__hint">
          <strong>{t(ui.game.hintTitle)}</strong>
          <p>{t(item.summary)}</p>
          <p className="game-play__retry">{t(ui.game.wrongAgain)}</p>
        </div>
      )}

      {step === 'reviewed' && (
        <div className="game-play__verdict">
          {attempt.revealed ? (
            <>
              <p className="game-play__revealed">{t(ui.game.revealed)}</p>
              <p className="game-play__answer">{t(ui.category[item.category])}</p>
            </>
          ) : (
            <p className="game-play__correct">{t(ui.game.correct)}</p>
          )}
          <button type="button" onClick={goNext}>
            {t(ui.game.nextQuestion)}
          </button>
        </div>
      )}

      <div className="game-play__bins">
        {binsLocked && <p className="game-play__locked">{t(ui.game.binsLocked)}</p>}
        <div className="game-play__bin-row" role="group" aria-label={t(ui.game.sortQuestion)}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`game-play__bin game-play__bin--${category}`}
              disabled={step !== 'sort'}
              onClick={() => answerSort(category)}
            >
              {t(ui.category[category])}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
