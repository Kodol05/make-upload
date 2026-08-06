import { render, screen } from '@testing-library/react';
import { LocaleProvider } from '@/app/LocaleProvider';
import { ui } from '@/i18n/strings';
import { FeatureErrorBoundary } from './FeatureErrorBoundary';

function Boom(): never {
  throw new Error('내부 사정과 사용자 입력이 섞인 메시지');
}

describe('FeatureErrorBoundary', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
    // React가 오류 경계 테스트에서 콘솔에 찍는 것을 가린다.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows the child when nothing goes wrong', () => {
    render(
      <LocaleProvider>
        <FeatureErrorBoundary>
          <p>정상</p>
        </FeatureErrorBoundary>
      </LocaleProvider>,
    );
    expect(screen.getByText('정상')).toBeInTheDocument();
  });

  it('keeps the rest of the page when one feature throws', () => {
    render(
      <LocaleProvider>
        <FeatureErrorBoundary>
          <Boom />
        </FeatureErrorBoundary>
        <p>다른 기능</p>
      </LocaleProvider>,
    );

    expect(screen.getByText(ui.error.sectionFailed.ko)).toBeInTheDocument();
    expect(screen.getByText('다른 기능')).toBeInTheDocument();
  });

  it('never shows the error message itself', () => {
    const { container } = render(
      <LocaleProvider>
        <FeatureErrorBoundary>
          <Boom />
        </FeatureErrorBoundary>
      </LocaleProvider>,
    );
    expect(container.textContent).not.toContain('내부 사정');
  });

  it('points at the catalog so the user can keep going', () => {
    render(
      <LocaleProvider>
        <FeatureErrorBoundary>
          <Boom />
        </FeatureErrorBoundary>
      </LocaleProvider>,
    );
    expect(screen.getByRole('link', { name: ui.common.openCatalog.ko })).toHaveAttribute(
      'href',
      '#/catalog',
    );
  });

  it('announces the failure to screen readers', () => {
    render(
      <LocaleProvider>
        <FeatureErrorBoundary>
          <Boom />
        </FeatureErrorBoundary>
      </LocaleProvider>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
