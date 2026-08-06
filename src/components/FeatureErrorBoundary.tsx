import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocale } from '@/app/useLocale';
import { ui } from '@/i18n/strings';

/** 한 기능이 무너져도 나머지는 그대로 쓸 수 있다고 알려 준다. */
function FeatureErrorFallback() {
  const { t } = useLocale();
  return (
    <div className="feature-error" role="alert">
      <p className="feature-error__title">{t(ui.error.sectionFailed)}</p>
      <p className="feature-error__hint">{t(ui.error.sectionFailedHint)}</p>
      <a href="#catalog">{t(ui.common.openCatalog)}</a>
    </div>
  );
}

/**
 * 기능 하나를 감싸는 오류 경계.
 *
 * 영상·스캐너·도감·챗봇·게임을 각각 감싸므로 한 곳이 예외를 던져도 나머지 화면은
 * 그대로 남는다. 설계 문서가 정한 "한 기능의 오류가 나머지를 막지 않는다"를
 * 실제로 지키는 장치다.
 *
 * 오류 내용은 화면에 보여 주지 않는다. 사용자가 보낸 내용이나 내부 사정이 섞일 수 있다.
 */
export class FeatureErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 개발 중에만 확인할 수 있게 남기고 화면에는 드러내지 않는다.
    if (import.meta.env.DEV) console.error('feature failed', error, info.componentStack);
  }

  render() {
    return this.state.failed ? <FeatureErrorFallback /> : this.props.children;
  }
}
