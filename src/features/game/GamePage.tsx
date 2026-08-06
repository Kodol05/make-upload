import { useCallback, useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { SortMark } from '@/components/SortMark';
import { ui } from '@/i18n/strings';
import { catalogItems } from '@shared/catalog';
import type { GameResult } from '@shared/types';
import { GameExperience } from './GameExperience';
import type { GameExperienceProps } from './GameContract';
import { QUESTION_COUNT } from './gameQuestions';

/**
 * 게임 화면의 겉틀.
 *
 * 게임 내부 규칙은 알지 않고 결과만 받아 결과 화면을 보여 준다. 다시 볼 품목은
 * 도감으로 이어 준다. 존재하지 않는 품목 ID가 와도 버린다.
 */
export function GamePage({
  experience: Experience = GameExperience,
}: {
  experience?: (props: GameExperienceProps) => React.ReactElement;
}) {
  const { locale, t } = useLocale();
  const [result, setResult] = useState<GameResult | null>(null);
  const [round, setRound] = useState(0);

  const restart = useCallback(() => {
    setResult(null);
    setRound((value) => value + 1);
  }, []);

  if (!result) {
    return (
      <section className="game" aria-labelledby="game-title">
        <h2 id="game-title">{t(ui.game.title)}</h2>
        <p className="game__intro">{t(ui.game.intro)}</p>
        <Experience
          key={round}
          locale={locale}
          items={catalogItems}
          onComplete={setResult}
        />
      </section>
    );
  }

  const reviewItems = result.learnedItemIds
    .map((id) => catalogItems.find((item) => item.id === id))
    .filter((item) => item !== undefined);

  return (
    <section className="game game--result" aria-labelledby="game-result-title">
      <h2 id="game-result-title">{t(ui.game.resultTitle)}</h2>

      {/**
       * 점수를 숫자 하나로 크게 보여 주고, 그 아래 열 문제를 점으로 늘어놓는다.
       * 몇 개를 맞혔는지 세지 않아도 한눈에 들어온다.
       */}
      <div className="game-score">
        <p className="game-score__figure">
          <strong>{result.score}</strong>
          <span>/ {QUESTION_COUNT}</span>
        </p>
        <p className="game-score__label">{t(ui.game.score)}</p>
        <ul className="game-score__dots" aria-hidden="true">
          {Array.from({ length: QUESTION_COUNT }, (_, index) => (
            <li
              key={index}
              className={
                index < result.score ? 'game-score__dot game-score__dot--hit' : 'game-score__dot'
              }
            />
          ))}
        </ul>
      </div>

      {reviewItems.length === 0 ? (
        <p className="game__all-correct">{t(ui.game.allCorrect)}</p>
      ) : (
        <div className="game-review">
          <h3>
            {t(ui.game.reviewTitle)}
            <span className="game-review__count">{reviewItems.length}</span>
          </h3>
          <p className="game-review__hint">{t(ui.game.reviewHint)}</p>
          <ul className="game-review__list">
            {reviewItems.map((item) => (
              <li key={item.id} className="game-review__item">
                <SortMark tone={item.category} size="sm" />
                <span className="game-review__name">{t(item.name)}</span>
                <span className={`game-review__category game-review__category--${item.category}`}>
                  {t(ui.category[item.category])}
                </span>
              </li>
            ))}
          </ul>
          {/** 라우트가 넷으로 나뉘어 도감은 `#/catalog`다. `#catalog`는 이제 없는 주소다. */}
          <a className="game-review__link" href="#/catalog">
            {t(ui.game.openInCatalog)}
          </a>
        </div>
      )}

      <div className="game__actions">
        <button type="button" className="game__replay" onClick={restart}>
          {t(ui.game.playAgain)}
        </button>
        <a href="#/">{t(ui.game.backToHome)}</a>
      </div>
    </section>
  );
}
