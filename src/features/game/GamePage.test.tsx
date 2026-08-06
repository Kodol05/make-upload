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
  // 안내를 먼저 보여 주므로 시작을 눌러야 게임에 들어간다.
  await userEvent.click(screen.getByRole('button', { name: ui.game.start.ko }));
  await userEvent.click(screen.getByRole('button', { name: 'finish' }));
}

/** 결과 화면에서 다시 볼 품목으로 이어지는 링크들. */
function reviewLinks(): HTMLElement[] {
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('href')?.startsWith('#/catalog?item='));
}

describe('GamePage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
  });

  /**
   * 시작 전에 무엇을 하는 게임인지 한 번 말해 준다. 시작하고 나면 그 안내는
   * 사라진다. 계속 남아 있으면 품목과 수거함이 아래로 밀린다.
   */
  it('explains the game once, before it starts', async () => {
    render(
      <LocaleProvider>
        <GamePage experience={makeStubGame({ score: 0, learnedItemIds: [] })} />
      </LocaleProvider>,
    );

    expect(screen.getByText(ui.game.intro.ko)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'finish' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: ui.game.start.ko }));

    expect(screen.queryByText(ui.game.intro.ko)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'finish' })).toBeInTheDocument();
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

    // 아는 품목 하나만 남는다. 모르는 값이 빈 줄로 남으면 안 된다.
    expect(reviewLinks()).toHaveLength(1);
  });

  /**
   * 틀린 품목을 알려 주는 이유는 다시 안 틀리게 하려는 것이다. 다시 볼 곳으로
   * 데려다주지 않으면 거기서 길이 끊긴다.
   */
  it('sends each missed item back to its catalog entry', async () => {
    await playThrough({ score: 8, learnedItemIds: ['clear-pet', 'can'] });

    const links = reviewLinks();
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#/catalog?item=clear-pet',
      '#/catalog?item=can',
    ]);
  });

  it('lets the player start over', async () => {
    await playThrough({ score: 5, learnedItemIds: [] });

    await userEvent.click(screen.getByRole('button', { name: ui.game.playAgain.ko }));

    // 안내 화면으로 돌아간다. 규칙을 잊었을 수 있으니 다시 한 번 보여 준다.
    expect(screen.getByText(ui.game.intro.ko)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: ui.game.start.ko }));
    expect(screen.getByRole('button', { name: 'finish' })).toBeInTheDocument();
  });
});
