import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/app/LocaleProvider';
import { ui } from '@/i18n/strings';
import { catalogItems } from '@shared/catalog';
import { CatalogSection } from './CatalogSection';

function renderCatalog() {
  return render(
    <LocaleProvider>
      <CatalogSection />
    </LocaleProvider>,
  );
}

const petName = catalogItems[0].name.ko;

describe('CatalogSection', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
  });

  it('lists all sixteen items at first', () => {
    renderCatalog();
    expect(screen.getAllByRole('button', { name: /./ }).length).toBeGreaterThan(16);
    expect(screen.getByText(petName)).toBeInTheDocument();
  });

  it('narrows the list as the user types', async () => {
    renderCatalog();

    await userEvent.type(screen.getByLabelText(ui.catalog.searchLabel.ko), '페트병');

    expect(screen.getByText(petName)).toBeInTheDocument();
    expect(screen.queryByText(catalogItems[5].name.ko)).not.toBeInTheDocument();
  });

  it('marks the active category filter for screen readers', async () => {
    renderCatalog();
    const all = screen.getByRole('button', { name: ui.category.all.ko });
    expect(all).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: ui.category.special.ko }));

    expect(all).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: ui.category.special.ko })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('tells the user when nothing matches', async () => {
    renderCatalog();

    await userEvent.type(
      screen.getByLabelText(ui.catalog.searchLabel.ko),
      '존재하지않는물건',
    );

    expect(screen.getByText(ui.catalog.empty.ko)).toBeInTheDocument();
  });

  it('opens the detail dialog when a card is chosen', async () => {
    renderCatalog();

    await userEvent.click(screen.getByRole('button', { name: new RegExp(petName) }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: petName })).toBeInTheDocument();
    expect(within(dialog).getByText(ui.catalog.stepsTitle.ko)).toBeInTheDocument();
  });

  it('shows every processing step in the dialog', async () => {
    renderCatalog();

    await userEvent.click(screen.getByRole('button', { name: new RegExp(petName) }));

    const dialog = screen.getByRole('dialog');
    // 투명 페트병은 4단계다.
    expect(within(within(dialog).getByRole('list', { name: ui.catalog.stepsTitle.ko })).getAllByRole('listitem')).toHaveLength(4);
  });

  it('closes the dialog on Escape and returns focus to the card', async () => {
    renderCatalog();
    const card = screen.getByRole('button', { name: new RegExp(petName) });
    await userEvent.click(card);

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(card).toHaveFocus();
  });

  it('warns about local differences only for items that need it', async () => {
    renderCatalog();

    await userEvent.click(screen.getByRole('button', { name: new RegExp(petName) }));
    expect(screen.queryByText(ui.catalog.localCheckTitle.ko)).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    const battery = catalogItems.find((item) => item.id === 'battery')!;
    await userEvent.click(screen.getByRole('button', { name: new RegExp(battery.name.ko) }));
    expect(screen.getByText(ui.catalog.localCheckTitle.ko)).toBeInTheDocument();
  });

  it('links a source only to an address that was actually verified', async () => {
    renderCatalog();

    await userEvent.click(screen.getByRole('button', { name: new RegExp(petName) }));

    const dialog = screen.getByRole('dialog');
    // 주소를 지어내지 않는다. 링크가 생겼다면 등록된 https 주소여야 한다.
    for (const link of within(dialog).getAllByRole('link')) {
      expect(link).toHaveAttribute('href', expect.stringMatching(/^https:\/\//));
      expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    }
  });

  it('keeps the steps readable when the image fails to load', async () => {
    renderCatalog();
    await userEvent.click(screen.getByRole('button', { name: new RegExp(petName) }));
    const dialog = screen.getByRole('dialog');

    fireEvent.error(within(dialog).getByRole('img'));

    expect(within(dialog).queryByRole('img')).not.toBeInTheDocument();
    // 이미지가 사라져도 처리 순서와 흔한 실수는 그대로 남는다.
    expect(within(dialog).getByText(ui.catalog.stepsTitle.ko)).toBeInTheDocument();
    expect(within(dialog).getByText(ui.catalog.mistakeTitle.ko)).toBeInTheDocument();
    expect(within(within(dialog).getByRole('list', { name: ui.catalog.stepsTitle.ko })).getAllByRole('listitem')).toHaveLength(4);
  });
});
