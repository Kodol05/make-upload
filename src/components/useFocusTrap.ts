import { useEffect, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), select, input, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * 열려 있는 패널 안에 포커스를 가둔다.
 *
 * 도감 상세와 챗봇 패널이 같은 규칙을 쓴다. Tab이 뒤 화면으로 새면 키보드
 * 사용자는 지금 무엇이 열려 있는지 알 수 없게 된다. Escape로 닫는 것도 함께 둔다.
 *
 * `active`가 false면 아무것도 하지 않으므로, 닫힌 동안에는 문서에 리스너가 붙지 않는다.
 */
export function useFocusTrap(
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  active = true,
) {
  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [panelRef, onClose, active]);
}
