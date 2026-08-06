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

    // 베트남어 문안이 아직 없으므로 한국어와 (임시값) 표시가 함께 보인다.
    expect(
      screen.getByRole('link', { name: `${ui.nav.catalog.ko} ${PLACEHOLDER_LABEL}` }),
    ).toBeInTheDocument();
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
