import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ui } from '@/i18n/strings';
import { catalogItems } from '@shared/catalog';
import { PLACEHOLDER_LABEL } from '@shared/placeholder';
import { locales } from '@shared/types';
import { App } from './App';
import { journey } from './journey';

function goTo(hash: string) {
  window.location.hash = hash;
  window.dispatchEvent(new Event('hashchange'));
}

function languageSelect() {
  return screen.getByRole('combobox');
}

describe('App integration', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
    window.location.hash = '';
  });

  it('gives each step of the journey its own page', () => {
    const { container } = render(<App />);

    // 소개
    expect(container.querySelector('.intro__video')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: ui.learn.title.ko })).not.toBeInTheDocument();

    act(() => goTo('#/learn'));
    expect(
      screen.getByRole('heading', { name: ui.learn.title.ko, level: 2 }),
    ).toBeInTheDocument();

    act(() => goTo('#/catalog'));
    expect(
      screen.getByRole('heading', { name: ui.catalog.title.ko, level: 2 }),
    ).toBeInTheDocument();

    act(() => goTo('#/game'));
    expect(
      screen.getByRole('heading', { name: ui.game.title.ko, level: 2 }),
    ).toBeInTheDocument();
  });

  it('falls back to the first step for an address it does not know', () => {
    render(<App />);
    act(() => goTo('#/nope'));

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  });

  /**
   * 막대는 지나온 칸만 칠한다. 한때 CSS 특이도 때문에 네 칸이 늘 칠해져 있었다.
   * 여기서는 표시가 붙는 규칙만 검사한다.
   */
  it('fills only the steps already passed', () => {
    const { container } = render(<App />);

    act(() => goTo('#/learn'));
    expect(container.querySelectorAll('.journey-progress__step')).toHaveLength(
      journey.length,
    );
    expect(container.querySelectorAll('.journey-progress__step--done')).toHaveLength(2);

    act(() => goTo('#/'));
    expect(container.querySelectorAll('.journey-progress__step--done')).toHaveLength(1);
  });

  it('reports the current step so the reader knows where they are', () => {
    render(<App />);

    act(() => goTo('#/catalog'));
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemax', String(journey.length));
  });

  it('moves to the next step from the button at the end of the page', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('link', { name: ui.journey.begin.ko }));

    expect(
      screen.getByRole('heading', { name: ui.learn.title.ko, level: 2 }),
    ).toBeInTheDocument();
  });

  it('returns to the first step from the last one', () => {
    render(<App />);
    act(() => goTo('#/game'));

    expect(
      screen.getByRole('link', { name: ui.journey.restart.ko }),
    ).toHaveAttribute('href', '#/');
  });

  it('keeps one h1 across every route', () => {
    render(<App />);

    for (const step of journey) {
      act(() => goTo(`#${step.route}`));
      expect(screen.getAllByRole('heading', { level: 1 }), step.route).toHaveLength(1);
    }
  });

  it('switches the whole page together when the language changes', async () => {
    render(<App />);
    act(() => goTo('#/catalog'));

    await userEvent.selectOptions(languageSelect(), 'vi');

    // 제목만 바뀌고 안내문이 한국어로 남는 일이 없어야 한다.
    expect(
      screen.getByRole('heading', { name: ui.catalog.title.vi, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText(ui.scanner.intro.vi)).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: ui.catalog.title.ko, level: 2 }),
    ).not.toBeInTheDocument();
    // 번역이 빠진 곳에만 붙는 표시다. 지금은 어디에도 남아 있으면 안 된다.
    expect(screen.queryByText(new RegExp(PLACEHOLDER_LABEL))).not.toBeInTheDocument();
  });

  it('never leaks the raw placeholder in any language, on any route', async () => {
    const { container } = render(<App />);

    for (const locale of locales) {
      await userEvent.selectOptions(languageSelect(), locale);
      for (const step of journey) {
        act(() => goTo(`#${step.route}`));
        expect(container.textContent, `${step.route}/${locale}`).not.toContain('__TODO__');
      }
      act(() => goTo('#/'));
    }
  });

  it('opens a catalog entry from the grid', async () => {
    render(<App />);
    act(() => goTo('#/catalog'));
    const petName = catalogItems[0].name.ko;

    await userEvent.click(screen.getByRole('button', { name: new RegExp(petName) }));

    const dialog = screen.getByRole('dialog', { name: petName });
    expect(within(dialog).getByRole('heading', { name: petName })).toBeInTheDocument();
  });

  /**
   * 도감은 정해진 16종의 정해진 답이고 챗봇은 그 밖도 답한다. 둘 사이를
   * 사용자가 직접 건너가게 두면 "이건 알겠는데 내 경우는?"에서 길이 끊긴다.
   */
  it('hands the reader from a catalog entry to the chat', async () => {
    render(<App />);
    act(() => goTo('#/catalog'));
    const petName = catalogItems[0].name.ko;
    await userEvent.click(screen.getByRole('button', { name: new RegExp(petName) }));

    await userEvent.click(
      screen.getByRole('button', { name: ui.catalog.askAboutThis.ko }),
    );

    // 상세는 닫힌다. 포커스를 가둔 채로 두면 키보드가 챗봇에 닿지 못한다.
    expect(screen.queryByRole('dialog', { name: petName })).not.toBeInTheDocument();
    // 챗봇이 열리고 품목 이름이 입력란에 들어와 있다.
    expect(screen.getByLabelText(ui.chat.inputLabel.ko)).toHaveValue(petName);
  });

  /**
   * 게임에서 틀린 품목을 누르면 도감 상세가 열려야 한다. 주소에 품목을 담기
   * 때문에 새로고침해도 그 자리다.
   */
  it('opens the catalog entry the address points at', () => {
    render(<App />);
    const pet = catalogItems[0];

    act(() => goTo(`#/catalog?item=${pet.id}`));

    // 물음표가 붙어도 도감 화면으로 읽혀야 한다.
    expect(screen.getByRole('dialog', { name: pet.name.ko })).toBeInTheDocument();
  });

  it('forgets the item once the reader closes it, so it does not reopen', async () => {
    render(<App />);
    const pet = catalogItems[0];
    act(() => goTo(`#/catalog?item=${pet.id}`));

    // "닫기"는 챗봇에도 있다. 상세 안의 것으로 좁힌다.
    const dialog = screen.getByRole('dialog', { name: pet.name.ko });
    await userEvent.click(within(dialog).getByRole('button', { name: ui.common.close.ko }));
    act(() => goTo(window.location.hash));

    expect(screen.queryByRole('dialog', { name: pet.name.ko })).not.toBeInTheDocument();
    expect(window.location.hash).toBe('#/catalog');
  });

  it('closes that dialog again', async () => {
    render(<App />);
    act(() => goTo('#/catalog'));
    const petName = catalogItems[0].name.ko;
    await userEvent.click(screen.getByRole('button', { name: new RegExp(petName) }));

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: petName })).not.toBeInTheDocument();
  });

  /**
   * 사진으로 찾기는 도감의 한 갈래다. 예전에는 스캔 화면이 따로 있고 그 아래에
   * 16종 목록이 또 있어서 도감과 같은 일을 두 번 했다.
   */
  it('keeps finding by photo inside the guide, and only after asking', async () => {
    render(<App />);
    act(() => goTo('#/catalog'));

    // 열기 전에는 고지문이 없다. 늘 띄워 두면 읽지 않는다.
    expect(screen.queryByText(ui.scanner.privacyNotice.ko)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: ui.scanner.openFinder.ko }));

    expect(screen.getByText(ui.scanner.privacyNotice.ko)).toBeInTheDocument();
    expect(screen.getByLabelText(ui.scanner.choosePhoto.ko)).toBeInTheDocument();
  });

  it('keeps the header, footer and skip link on every route', () => {
    render(<App />);

    for (const step of journey) {
      act(() => goTo(`#${step.route}`));
      expect(screen.getByRole('navigation', { name: 'K-SORT' }), step.route).toBeInTheDocument();
      expect(screen.getByText('Make Upload'), step.route).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: ui.common.skipToContent.ko }),
        step.route,
      ).toBeInTheDocument();
    }
  });

  /** 어디에 있든 로고를 누르면 소개로 돌아온다. */
  it('takes the reader back to the first step from the logo', async () => {
    render(<App />);

    for (const route of ['/learn', '/catalog', '/game']) {
      act(() => goTo(`#${route}`));
      const logo = screen.getByRole('link', { name: /K-SORT/ });
      expect(logo, route).toHaveAttribute('href', '#/');

      // jsdom은 앵커 클릭으로 hash를 바꾸지 않는다. 브라우저가 하는 일을 대신한다.
      await userEvent.click(logo);
      act(() => goTo('#/'));

      expect(screen.getByRole('progressbar'), route).toHaveAttribute('aria-valuenow', '1');
    }
  });
});
