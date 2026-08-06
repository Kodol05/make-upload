import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/app/LocaleProvider';
import { ui } from '@/i18n/strings';
import { catalogItems } from '@shared/catalog';
import type { GameResult } from '@shared/types';
import { GameExperience } from './GameExperience';

function renderGame() {
  localStorage.setItem('k-sort-locale', 'ko');
  const onComplete = vi.fn<(result: GameResult) => void>();
  // 품목 이미지가 전역 언어를 쓰므로 앱과 같은 형태로 감싼다.
  render(
    <LocaleProvider>
      <GameExperience locale="ko" items={catalogItems} onComplete={onComplete} />
    </LocaleProvider>,
  );
  return { onComplete };
}

/** 화면에 보이는 쓰레기의 올바른 분류 이름. */
function correctBinName() {
  const name = screen.getByTestId('game-item-name').textContent ?? '';
  const item = catalogItems.find((candidate) => candidate.name.ko === name)!;
  return ui.category[item.category].ko;
}

function bins() {
  return screen.getByRole('group', { name: ui.game.sortQuestion.ko });
}

/** 현재 문제가 선처리 단계인지 본다. */
function isPrepStep() {
  return screen.queryByText(ui.game.prepQuestion.ko) !== null;
}

describe('GameExperience', () => {
  it('shows the progress out of ten', () => {
    renderGame();
    expect(screen.getByText(/1 \/ 10/)).toBeInTheDocument();
  });

  it('locks the bins until the preparation is chosen', async () => {
    renderGame();
    // 선처리 문제가 나올 때까지 넘긴다.
    while (!isPrepStep()) {
      await userEvent.click(screen.getByRole('button', { name: correctBinName() }));
      await userEvent.click(screen.getByRole('button', { name: ui.game.nextQuestion.ko }));
    }

    expect(screen.getByText(ui.game.binsLocked.ko)).toBeInTheDocument();
    for (const bin of screen.getAllByRole('button', { hidden: false })) {
      if (bins().contains(bin)) expect(bin).toBeDisabled();
    }
  });

  it('shows a hint after the first wrong bin and the answer after the second', async () => {
    renderGame();
    while (isPrepStep()) {
      // 바로 버릴 수 있는 문제가 나올 때까지 넘긴다.
      const choices = screen.getAllByRole('button');
      await userEvent.click(choices[0]);
      const next = screen.queryByRole('button', { name: ui.game.nextQuestion.ko });
      if (next) await userEvent.click(next);
    }

    const wrongBin = ['재활용', '음식물', '일반', '특수'].find(
      (name) => name !== correctBinName(),
    )!;

    await userEvent.click(screen.getByRole('button', { name: wrongBin }));
    expect(screen.getByText(ui.game.hintTitle.ko)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: wrongBin }));
    expect(screen.getByText(ui.game.revealed.ko)).toBeInTheDocument();
  });

  it('reports the result after ten questions', async () => {
    const { onComplete } = renderGame();

    for (let i = 0; i < 10; i += 1) {
      if (isPrepStep()) {
        // 선처리 선택지 중 아무거나 두 번 눌러 정답 공개로 넘어간다.
        const choice = screen.getAllByRole('button')[0];
        await userEvent.click(choice);
        if (isPrepStep()) await userEvent.click(screen.getAllByRole('button')[0]);
      }
      await userEvent.click(screen.getByRole('button', { name: correctBinName() }));
      await userEvent.click(screen.getByRole('button', { name: ui.game.nextQuestion.ko }));
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    const result = onComplete.mock.calls[0][0];
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
  });
});
