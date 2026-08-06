import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/App';
import { ui } from '@/i18n/strings';

function goTo(hash: string) {
  window.location.hash = hash;
  window.dispatchEvent(new Event('hashchange'));
}

function launcher() {
  return screen.getByRole('button', { name: ui.nav.chat.ko });
}

function panel() {
  return screen.getByRole('dialog', { name: ui.chat.title.ko });
}

/** 닫혀 있으면 접근성 트리에서 빠진다. 스크린 리더가 닫힌 패널을 읽으면 안 된다. */
function panelIsClosed() {
  return screen.queryByRole('dialog', { name: ui.chat.title.ko }) === null;
}

describe('ChatWidget', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
    window.location.hash = '';
  });

  it('starts closed and opens from the launcher', async () => {
    render(<App />);
    expect(panelIsClosed()).toBe(true);
    expect(launcher()).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(launcher());

    expect(panel()).toBeVisible();
    expect(
      screen.getByRole('button', { name: ui.common.close.ko, expanded: true }),
    ).toBeInTheDocument();
  });

  /**
   * 빈 화면으로 시작하면 무엇을 물어야 할지 몰라 멈춘다. 정해진 인사 한 마디를
   * 먼저 놓아 말을 걸기 쉽게 한다. 이 문장은 모델을 부르지 않는다.
   */
  it('greets first so the reader knows what to ask', async () => {
    render(<App />);
    await userEvent.click(launcher());

    expect(within(panel()).getByText(ui.chat.greeting.ko)).toBeInTheDocument();
  });

  /** 대화는 위, 추천 질문과 입력은 아래. 실제 대화 앱의 순서다. */
  it('puts the conversation above the place you type', async () => {
    render(<App />);
    await userEvent.click(launcher());

    const greeting = within(panel()).getByText(ui.chat.greeting.ko);
    const suggestions = within(panel()).getByText(ui.chat.suggestionsTitle.ko);
    const input = within(panel()).getByLabelText(ui.chat.inputLabel.ko);

    // compareDocumentPosition: 4 = 뒤에 온다
    expect(greeting.compareDocumentPosition(suggestions) & 4).toBeTruthy();
    expect(suggestions.compareDocumentPosition(input) & 4).toBeTruthy();
  });

  it('can be reached from every step of the journey', () => {
    render(<App />);

    for (const route of ['/', '/learn', '/catalog', '/game']) {
      act(() => goTo(`#${route}`));
      expect(launcher(), route).toBeInTheDocument();
    }
  });

  /**
   * 이 테스트가 이 컴포넌트의 존재 이유다.
   *
   * 챗봇을 라우트 안에 두면 페이지를 옮길 때 언마운트되면서 대화가 통째로
   * 사라진다. `AppShell`에 두어야 "어디서나 열 수 있다"가 성립한다.
   */
  it('keeps what was typed when the reader moves to another page', async () => {
    render(<App />);
    await userEvent.click(launcher());

    const input = within(panel()).getByLabelText(ui.chat.inputLabel.ko);
    await userEvent.type(input, '캔은 어떻게 버려요');

    act(() => goTo('#/game'));

    expect(within(panel()).getByLabelText(ui.chat.inputLabel.ko)).toHaveValue(
      '캔은 어떻게 버려요',
    );
  });

  /**
   * 전화기 아래쪽 홈 표시줄. 기기의 기능을 흉내 내지는 않고 대화를 닫기만 한다.
   * 닫기 버튼과 같은 이름을 쓰므로 패널 안에서 찾는다.
   */
  it('closes from the home bar at the bottom', async () => {
    render(<App />);
    await userEvent.click(launcher());

    const closers = within(panel()).getAllByRole('button', { name: ui.common.close.ko });
    await userEvent.click(closers[closers.length - 1]);

    expect(panelIsClosed()).toBe(true);
  });

  /**
   * 도감에서 못 찾은 사람에게 다음 수단이 있다는 것을 알린다. 도감이 아닌
   * 곳에서는 띄우지 않고, 열 초가 지나면 스스로 사라진다.
   */
  describe('도감에서 뜨는 말풍선', () => {
    it('stays away until the reader reaches the guide', () => {
      render(<App />);
      expect(screen.queryByText(ui.chat.nudge.ko)).not.toBeInTheDocument();

      act(() => goTo('#/catalog'));
      expect(screen.getByText(ui.chat.nudge.ko)).toBeInTheDocument();
    });

    it('goes away on its own after ten seconds', () => {
      vi.useFakeTimers();
      try {
        render(<App />);
        act(() => goTo('#/catalog'));

        act(() => void vi.advanceTimersByTime(10_000));

        expect(screen.queryByText(ui.chat.nudge.ko)).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    it('closes from the x without opening the chat', async () => {
      render(<App />);
      act(() => goTo('#/catalog'));

      const bubble = screen.getByText(ui.chat.nudge.ko).closest('div')!;
      await userEvent.click(
        within(bubble).getByRole('button', { name: ui.common.close.ko }),
      );

      expect(screen.queryByText(ui.chat.nudge.ko)).not.toBeInTheDocument();
      expect(panelIsClosed()).toBe(true);
    });

    it('opens the chat when the bubble itself is pressed', async () => {
      render(<App />);
      act(() => goTo('#/catalog'));

      await userEvent.click(screen.getByRole('button', { name: ui.chat.nudge.ko }));

      expect(screen.queryByText(ui.chat.nudge.ko)).not.toBeInTheDocument();
      expect(panel()).toBeVisible();
    });

    it('does not come back after it has been seen once', async () => {
      render(<App />);
      act(() => goTo('#/catalog'));
      await userEvent.click(screen.getByRole('button', { name: ui.chat.nudge.ko }));
      await userEvent.keyboard('{Escape}');

      act(() => goTo('#/'));
      act(() => goTo('#/catalog'));

      expect(screen.queryByText(ui.chat.nudge.ko)).not.toBeInTheDocument();
    });
  });

  it('closes with Escape and hands focus back to the launcher', async () => {
    render(<App />);
    await userEvent.click(launcher());

    await userEvent.keyboard('{Escape}');

    expect(panelIsClosed()).toBe(true);
    expect(launcher()).toHaveFocus();
  });
});
