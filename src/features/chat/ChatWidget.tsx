import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { FeatureErrorBoundary } from '@/components/FeatureErrorBoundary';
import { useFocusTrap } from '@/components/useFocusTrap';
import { ui } from '@/i18n/strings';
import { useAskChat, type ChatAsk } from './askChat';
import { ChatSection } from './ChatSection';

/** 말풍선이 스스로 사라지기까지. */
const NUDGE_MS = 10_000;

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
export function ChatWidget({ hint = false }: { hint?: boolean }) {
  const { t } = useLocale();
  const { pending } = useAskChat();
  const [open, setOpen] = useState(false);
  const [nudging, setNudging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  /** 한 번 보여 준 뒤에는 다시 띄우지 않는다. 오갈 때마다 뜨면 성가시다. */
  const nudgeSpent = useRef(false);

  /**
   * 도감에 처음 닿았을 때 말풍선을 한 번 띄운다. 도감에서 못 찾은 사람에게
   * 다음 수단이 있다는 것을 알려 주는 것이라, 도감이 아닌 곳에서는 띄우지 않는다.
   */
  useEffect(() => {
    if (!hint || open || nudgeSpent.current) return;
    nudgeSpent.current = true;
    setNudging(true);
    const timer = window.setTimeout(() => setNudging(false), NUDGE_MS);
    return () => window.clearTimeout(timer);
  }, [hint, open]);

  /**
   * 도감이나 검색에서 부르면 스스로 열린다.
   *
   * `pending`은 부를 때마다 새 객체라 같은 품목을 다시 눌러도 한 번씩 반응한다.
   * 효과가 아니라 렌더 중에 맞춘다. 효과로 열면 닫힌 화면이 한 번 그려진 뒤에
   * 열려서 깜빡인다.
   */
  const [answered, setAnswered] = useState<ChatAsk | null>(null);
  if (pending && pending !== answered) {
    setAnswered(pending);
    setOpen(true);
  }

  useFocusTrap(panelRef, () => setOpen(false), open);

  /** 열면 패널로 들어가고, 닫으면 눌렀던 버튼으로 돌아온다. */
  useEffect(() => {
    if (open) panelRef.current?.focus();
    else launcherRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <div className="chat-widget">
      {/**
       * 버튼 옆에서 잠깐 떴다 사라지는 말풍선. 열 초가 지나거나 x를 누르면
       * 닫히고, 말풍선 자체를 누르면 대화가 열린다.
       */}
      {nudging && !open && (
        <div className="chat-widget__nudge">
          <button
            type="button"
            className="chat-widget__nudge-open"
            onClick={() => {
              setNudging(false);
              setOpen(true);
            }}
          >
            {t(ui.chat.nudge)}
          </button>
          <button
            type="button"
            className="chat-widget__nudge-close"
            aria-label={t(ui.common.close)}
            onClick={() => setNudging(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}

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
            <ChatSection ask={pending} />
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
