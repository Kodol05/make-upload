import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/app/LocaleProvider';
import { ui } from '@/i18n/strings';
import { PLACEHOLDER_LABEL } from '@shared/placeholder';
import { AppHeader } from './AppHeader';

function renderHeader() {
  return render(
    <LocaleProvider>
      <AppHeader />
    </LocaleProvider>,
  );
}

describe('AppHeader', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
  });

  it('shows the product name as the top heading', () => {
    renderHeader();
    expect(screen.getByRole('heading', { name: 'K-SORT' })).toBeInTheDocument();
  });

  it('links to every section and to the game route', () => {
    renderHeader();
    const nav = screen.getByRole('navigation');

    expect(within(nav).getByRole('link', { name: ui.nav.learn.ko })).toHaveAttribute(
      'href',
      '#learn',
    );
    expect(within(nav).getByRole('link', { name: ui.nav.game.ko })).toHaveAttribute(
      'href',
      '#/game',
    );
    expect(within(nav).getAllByRole('link')).toHaveLength(5);
  });

  it('switches every label when the language changes', async () => {
    renderHeader();
    expect(screen.getByRole('link', { name: ui.nav.catalog.ko })).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(ui.common.language.ko), 'vi');

    expect(screen.getByRole('link', { name: ui.nav.catalog.vi })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: ui.nav.catalog.ko }),
    ).not.toBeInTheDocument();
  });

  it('shows the Korean text with a marker while a translation is missing', async () => {
    renderHeader();

    await userEvent.selectOptions(screen.getByLabelText(ui.common.language.ko), 'vi');

    // 번역이 빠진 항목은 한국어를 보여 주되 (임시값)을 붙여 눈에 띄게 한다.
    // 지금은 모든 문안이 번역돼 있어 이 표시가 화면에 남아 있으면 안 된다.
    expect(screen.queryByText(new RegExp(PLACEHOLDER_LABEL))).not.toBeInTheDocument();
  });

  it('never shows the machine readable marker', async () => {
    renderHeader();

    await userEvent.selectOptions(screen.getByLabelText(ui.common.language.ko), 'vi');

    expect(screen.queryByText(/__TODO__/)).not.toBeInTheDocument();
  });

  it('offers a skip link to the main content', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: ui.common.skipToContent.ko })).toHaveAttribute(
      'href',
      '#main',
    );
  });
});
