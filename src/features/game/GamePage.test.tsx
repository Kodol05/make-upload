import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/app/LocaleProvider';
import { ui } from '@/i18n/strings';
import { catalogItems } from '@shared/catalog';
import type { GameResult } from '@shared/types';
import { GamePage } from './GamePage';
import { QUESTION_COUNT } from './gameQuestions';
import type { GameExperienceProps } from './GameContract';

/** 게임 내부는 몰라도 되도록 결과만 돌려주는 대역을 쓴다. */
function makeStubGame(result: GameResult) {
  return function StubGame({ onComplete }: GameExperienceProps) {
    return (
      <button type="button" onClick={() => onComplete(result)}>
        finish
      </button>
    );
  };
}

async function playThrough(result: GameResult) {
  render(
    <LocaleProvider>
      <GamePage experience={makeStubGame(result)} />
    </LocaleProvider>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'finish' }));
}

describe('GamePage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
  });

  it('shows how many questions were answered correctly', async () => {
    await playThrough({ score: 8, learnedItemIds: [] });

    expect(screen.getByRole('heading', { name: ui.game.resultTitle.ko })).toBeInTheDocument();
    expect(screen.getByText(/8/)).toBeInTheDocument();
  });

  it('names what was missed and where it belongs', async () => {
    await playThrough({ score: 9, learnedItemIds: ['clear-pet'] });

    const missed = catalogItems[0];
    expect(screen.getByText(missed.name.ko)).toBeInTheDocument();
    // 분류까지 함께 보여야 "왜 틀렸는지"의 실마리가 된다.
    expect(screen.getByText(ui.category[missed.category].ko)).toBeInTheDocument();
  });

  it('sends the reader to the guide page that actually exists', async () => {
    await playThrough({ score: 9, learnedItemIds: ['clear-pet'] });

    // 라우트가 넷으로 나뉘어 도감은 `#/catalog`다. `#catalog`는 없는 주소라 소개로 튕긴다.
    expect(
      screen.getByRole('link', { name: ui.game.openInCatalog.ko }),
    ).toHaveAttribute('href', '#/catalog');
  });

  it('shows the score against the total', async () => {
    await playThrough({ score: 7, learnedItemIds: ['clear-pet'] });

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText(`/ ${QUESTION_COUNT}`)).toBeInTheDocument();
  });

  it('says so when nothing needs reviewing', async () => {
    await playThrough({ score: 10, learnedItemIds: [] });

    expect(screen.getByText(ui.game.allCorrect.ko)).toBeInTheDocument();
  });

  it('ignores an item ID the catalog does not know', async () => {
    await playThrough({ score: 9, learnedItemIds: ['clear-pet', 'ghost-item'] as never });

    expect(screen.getAllByRole('link', { name: /./ }).length).toBeLessThanOrEqual(2);
  });

  it('lets the player start over', async () => {
    await playThrough({ score: 5, learnedItemIds: [] });

    await userEvent.click(screen.getByRole('button', { name: ui.game.playAgain.ko }));

    expect(screen.getByRole('button', { name: 'finish' })).toBeInTheDocument();
  });
});
