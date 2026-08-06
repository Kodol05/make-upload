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
    render(<App />);

    // 소개
    expect(
      screen.getByRole('heading', { name: ui.catalog.title.ko, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: ui.learn.title.ko })).not.toBeInTheDocument();

    act(() => goTo('#/learn'));
    expect(
      screen.getByRole('heading', { name: ui.learn.title.ko, level: 2 }),
    ).toBeInTheDocument();

    act(() => goTo('#/catalog'));
    for (const title of [ui.scanner.title.ko, ui.catalog.title.ko]) {
      expect(screen.getByRole('heading', { name: title, level: 2 })).toBeInTheDocument();
    }

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

    // 한 섹션만 바뀌고 나머지가 한국어로 남는 일이 없어야 한다.
    for (const title of [ui.scanner.title, ui.catalog.title]) {
      expect(
        screen.getByRole('heading', { name: title.vi, level: 2 }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { name: title.ko, level: 2 }),
      ).not.toBeInTheDocument();
    }
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

  it('opens the catalog entry chosen from the scanner shortcuts', async () => {
    render(<App />);
    act(() => goTo('#/catalog'));
    const shortcuts = screen.getByRole('list', { name: ui.scanner.pickFromList.ko });
    const petName = catalogItems[0].name.ko;

    await userEvent.click(
      within(shortcuts).getByRole('button', { name: new RegExp(petName) }),
    );

    const dialog = screen.getByRole('dialog', { name: petName });
    expect(within(dialog).getByRole('heading', { name: petName })).toBeInTheDocument();
  });

  it('closes that dialog again', async () => {
    render(<App />);
    act(() => goTo('#/catalog'));
    const shortcuts = screen.getByRole('list', { name: ui.scanner.pickFromList.ko });
    const petName = catalogItems[0].name.ko;
    await userEvent.click(
      within(shortcuts).getByRole('button', { name: new RegExp(petName) }),
    );

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: petName })).not.toBeInTheDocument();
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

  it('takes the reader back to the first step from the logo', () => {
    render(<App />);
    act(() => goTo('#/game'));

    expect(screen.getByRole('link', { name: /K-SORT/ })).toHaveAttribute('href', '#/');
  });
});
