import { render, screen, within } from '@testing-library/react';
import { LocaleProvider } from '@/app/LocaleProvider';
import { ui } from '@/i18n/strings';
import { catalogItems } from '@shared/catalog';
import { CatalogDialog } from './CatalogDialog';

/**
 * 확인되지 않은 출처는 링크로 만들지 않는다.
 *
 * 실제 출처 5개에 주소가 모두 채워진 뒤에도 이 규칙은 남아야 한다. 나중에 출처를
 * 더하면서 주소를 비워 두는 일이 생기기 때문이다. 잘못된 주소는 없는 것보다 나쁘다.
 */
vi.mock('@shared/sources', () => ({
  sources: {
    'me-recyclable': {
      title: { ko: '확인 중인 출처', en: '', zh: '', vi: '' },
      url: '',
    },
  },
}));

describe('CatalogDialog with an unverified source', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
  });

  it('shows a pending notice instead of a link', () => {
    const item = catalogItems.find((entry) => entry.sourceIds.includes('me-recyclable'))!;

    render(
      <LocaleProvider>
        <CatalogDialog item={item} onClose={() => {}} />
      </LocaleProvider>,
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).queryByRole('link')).not.toBeInTheDocument();
    expect(within(dialog).getByText(ui.catalog.sourceUnverified.ko)).toBeInTheDocument();
  });
});
