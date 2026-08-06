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

  it('closes with Escape and hands focus back to the launcher', async () => {
    render(<App />);
    await userEvent.click(launcher());

    await userEvent.keyboard('{Escape}');

    expect(panelIsClosed()).toBe(true);
    expect(launcher()).toHaveFocus();
  });
});
