import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { FeatureErrorBoundary } from '@/components/FeatureErrorBoundary';
import { useFocusTrap } from '@/components/useFocusTrap';
import { ui } from '@/i18n/strings';
import { ChatSection } from './ChatSection';

/**
 * 어디서나 열 수 있는 챗봇.
 *
 * 우하단 버튼을 누르면 패널이 나온다. Intercom이 만든 문법을 따르되 라이브러리는
 * 쓰지 않는다. shadcn 블록은 Tailwind 전제라 우리 순수 CSS와 안 맞고,
 * react-chat-widget은 자체 스타일이 토큰 체계와 부딪힌다. 대화 화면인
 * `ChatSection`이 이미 있으므로 껍데기만 만들어 감싼다.
 *
 * **`AppShell`에 두고 라우트 안에 넣지 않는다.** 라우트 안에 있으면 페이지를
 * 옮길 때 언마운트되면서 대화가 통째로 사라진다.
 *
 * 닫혀 있어도 `ChatSection`은 마운트된 채로 두고 패널만 숨긴다. 그래야 답을
 * 받아 놓고 페이지를 옮겼다가 다시 열어도 대화가 남아 있다.
 */
export function ChatWidget() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(panelRef, () => setOpen(false), open);

  /** 열면 패널로 들어가고, 닫으면 눌렀던 버튼으로 돌아온다. */
  useEffect(() => {
    if (open) panelRef.current?.focus();
    else launcherRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <div className="chat-widget">
      <div
        ref={panelRef}
        id="chat-widget-panel"
        className="chat-widget__panel"
        role="dialog"
        aria-modal="false"
        aria-label={t(ui.chat.title)}
        tabIndex={-1}
        hidden={!open}
      >
        {/** 화면 위쪽 띠. 전화기의 앱 표시줄처럼 보이게 해서 "대화 중"임을 알린다. */}
        <div className="chat-widget__bar">
          <span className="chat-widget__who">
            <span className="chat-widget__avatar" aria-hidden="true">
              AI
            </span>
            <span>
              <strong>{t(ui.chat.title)}</strong>
              <small>{t(ui.chat.intro)}</small>
            </span>
          </span>
          <button type="button" onClick={() => setOpen(false)}>
            {t(ui.common.close)}
          </button>
        </div>
        <div className="chat-widget__body">
          <FeatureErrorBoundary>
            <ChatSection />
          </FeatureErrorBoundary>
        </div>

        {/**
         * 전화기 아래쪽의 홈 표시줄. 실제 기기의 기능을 흉내 내지는 않고,
         * 누르면 대화가 닫힌다. "뒤로 나간다"는 감각만 가져온다.
         */}
        <button
          type="button"
          className="chat-widget__home"
          aria-label={t(ui.common.close)}
          onClick={() => setOpen(false)}
        >
          <span aria-hidden="true" />
        </button>
      </div>

      <button
        ref={launcherRef}
        type="button"
        className="chat-widget__launcher"
        aria-expanded={open}
        aria-controls="chat-widget-panel"
        onClick={() => setOpen((was) => !was)}
      >
        <span className="chat-widget__launcher-badge" aria-hidden="true">
          AI
        </span>
        {open ? t(ui.common.close) : t(ui.nav.chat)}
      </button>
    </div>
  );
}
