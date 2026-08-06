import { useCallback, useState } from 'react';
import { useLocale } from '@/app/useLocale';
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
    <section className="game" aria-labelledby="game-result-title">
      <h2 id="game-result-title">{t(ui.game.resultTitle)}</h2>

      <p className="game__score">
        {t(ui.game.score)} {result.score} / {QUESTION_COUNT}
      </p>

      {reviewItems.length === 0 ? (
        <p className="game__all-correct">{t(ui.game.allCorrect)}</p>
      ) : (
        <>
          <h3>{t(ui.game.reviewTitle)}</h3>
          <ul className="game__review">
            {reviewItems.map((item) => (
              <li key={item.id}>
                <a href="#catalog">{t(item.name)}</a>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="game__actions">
        <button type="button" onClick={restart}>
          {t(ui.game.playAgain)}
        </button>
        <a href="#/">{t(ui.game.backToHome)}</a>
      </div>
    </section>
  );
}
