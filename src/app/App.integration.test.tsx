import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ui } from '@/i18n/strings';
import { catalogItems } from '@shared/catalog';
import { PLACEHOLDER_LABEL } from '@shared/placeholder';
import { locales } from '@shared/types';
import { App } from './App';

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

  it('assembles the whole learning journey on the home route', () => {
    render(<App />);

    for (const title of [
      ui.learn.title.ko,
      ui.scanner.title.ko,
      ui.catalog.title.ko,
      ui.chat.title.ko,
    ]) {
      expect(screen.getByRole('heading', { name: title, level: 2 })).toBeInTheDocument();
    }
  });

  it('keeps one h1 and puts every section under it', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('switches every section together when the language changes', async () => {
    render(<App />);

    await userEvent.selectOptions(languageSelect(), 'vi');

    // 한 섹션만 바뀌고 나머지가 한국어로 남는 일이 없어야 한다.
    for (const title of [ui.learn.title, ui.catalog.title, ui.chat.title]) {
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

  it('never leaks the raw placeholder in any language, on either route', async () => {
    const { container } = render(<App />);

    for (const locale of locales) {
      await userEvent.selectOptions(languageSelect(), locale);
      expect(container.textContent, `home/${locale}`).not.toContain('__TODO__');

      act(() => goTo('#/game'));
      expect(container.textContent, `game/${locale}`).not.toContain('__TODO__');
      act(() => goTo('#/'));
    }
  });

  it('opens the catalog entry chosen from the scanner shortcuts', async () => {
    render(<App />);
    const shortcuts = screen.getByRole('list', { name: ui.scanner.pickFromList.ko });
    const petName = catalogItems[0].name.ko;

    await userEvent.click(
      within(shortcuts).getByRole('button', { name: new RegExp(petName) }),
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: petName })).toBeInTheDocument();
  });

  it('closes that dialog again', async () => {
    render(<App />);
    const shortcuts = screen.getByRole('list', { name: ui.scanner.pickFromList.ko });
    await userEvent.click(
      within(shortcuts).getByRole('button', { name: new RegExp(catalogItems[0].name.ko) }),
    );

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the header, footer and skip link on the game route', () => {
    render(<App />);
    act(() => goTo('#/game'));

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Make Upload')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: ui.common.skipToContent.ko }),
    ).toBeInTheDocument();
  });
});
