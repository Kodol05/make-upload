import { useRef, useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { ui } from '@/i18n/strings';
import { ApiError } from '@/lib/api';
import { catalogItems } from '@shared/catalog';
import { faqs } from '@shared/faqs';
import { sources } from '@shared/sources';
import type { ChatRequest, ChatResponse, ItemId, LocalizedText } from '@shared/types';
import { createSessionId, sendChat as defaultSendChat } from './chatApi';

/** 화면에 남기는 한 줄. 대화는 이 배열에만 있고 어디에도 저장하지 않는다. */
interface Turn {
  id: number;
  question: string;
  answer?: ChatResponse;
  errorCode?: string;
}

const SUGGESTION_COUNT = 3;
const MAX_HISTORY = 6;

/** 오류 코드를 현재 언어 문구로 바꾼다. */
function errorText(code: string): LocalizedText {
  if (code === 'rate_limited') return ui.error.rateLimited;
  if (code === 'timeout') return ui.error.timeout;
  if (code === 'network') return ui.error.network;
  return ui.error.unavailable;
}

export function ChatSection({
  sendChat = defaultSendChat,
}: {
  sendChat?: (request: ChatRequest) => Promise<ChatResponse>;
}) {
  const { locale, t } = useLocale();
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const sessionId = useRef(createSessionId());
  const nextId = useRef(0);

  async function submit(question: string) {
    const trimmed = question.trim();
    if (!trimmed || pending) return;

    const id = (nextId.current += 1);
    setTurns((prev) => [...prev, { id, question: trimmed }]);
    setDraft('');
    setPending(true);

    // 서버도 최근 여섯 개만 쓰지만 보낼 때부터 줄여 요청을 가볍게 한다.
    const history = turns
      .flatMap((turn) => [
        { role: 'user' as const, content: turn.question },
        ...(turn.answer?.answer ? [{ role: 'assistant' as const, content: turn.answer.answer }] : []),
      ])
      .slice(-MAX_HISTORY);

    try {
      const answer = await sendChat({
        locale,
        message: trimmed,
        history,
        sessionId: sessionId.current,
      });
      setTurns((prev) => prev.map((turn) => (turn.id === id ? { ...turn, answer } : turn)));
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unavailable';
      setTurns((prev) =>
        prev.map((turn) => (turn.id === id ? { ...turn, errorCode: code } : turn)),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="chat" className="chat" aria-labelledby="chat-title">
      <h2 id="chat-title">{t(ui.chat.title)}</h2>
      <p className="chat__intro">{t(ui.chat.intro)}</p>

      {/**
       * 대화는 위, 쓰는 자리는 아래. 실제 대화 앱의 순서를 그대로 따른다.
       *
       * 맨 위의 인사는 정해진 문장이라 모델을 부르지 않는다. 빈 화면으로 시작하면
       * 무엇을 물어야 할지 몰라 멈추는데, 한 마디가 있으면 말을 걸기 쉬워진다.
       */}
      <div className="chat__stream">
        <p className="chat__greeting">{t(ui.chat.greeting)}</p>

        <ol className="chat__turns">
          {turns.map((turn) => (
            <li key={turn.id} className="chat__turn">
              <p className="chat__question">{turn.question}</p>
              <ChatAnswer turn={turn} />
            </li>
          ))}
        </ol>
      </div>

      {/** 추천 질문과 입력 줄은 한 덩어리로 아래에 붙는다. */}
      <div className="chat__composer">
        <h3 className="chat__suggestions-title">{t(ui.chat.suggestionsTitle)}</h3>
        <ul className="chat__suggestions">
          {faqs.slice(0, SUGGESTION_COUNT).map((faq) => (
            <li key={faq.id}>
              <button type="button" onClick={() => submit(t(faq.question))}>
                {t(faq.question)}
              </button>
            </li>
          ))}
        </ul>

        <form
          className="chat__form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(draft);
          }}
        >
          <label className="chat__input">
            <span>{t(ui.chat.inputLabel)}</span>
            <input
              value={draft}
              maxLength={500}
              placeholder={t(ui.chat.inputPlaceholder)}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          <button type="submit" disabled={pending}>
            {pending ? t(ui.chat.thinking) : t(ui.chat.send)}
          </button>
        </form>
      </div>
    </section>
  );
}

/** 한 질문에 대한 답, 또는 실패했을 때의 안내. */
function ChatAnswer({ turn }: { turn: Turn }) {
  const { t } = useLocale();

  if (turn.errorCode) {
    return (
      <div className="chat__error">
        <p>{t(errorText(turn.errorCode))}</p>
        <a href="#/catalog">{t(ui.common.openCatalog)}</a>
      </div>
    );
  }

  if (!turn.answer) return <p className="chat__pending">{t(ui.chat.thinking)}</p>;

  const { answer, status, matchedItemIds, sourceIds } = turn.answer;

  if (status === 'out_of_scope') {
    return (
      <div className="chat__answer">
        <p>{t(ui.chat.outOfScope)}</p>
        <a href="#/catalog">{t(ui.common.openCatalog)}</a>
      </div>
    );
  }

  return (
    <div className="chat__answer">
      <p>{answer}</p>

      {status === 'needs_local_check' && (
        <p className="chat__local-check">{t(ui.chat.needsLocalCheck)}</p>
      )}

      {matchedItemIds.length > 0 && (
        <p className="chat__related">
          <span>{t(ui.chat.relatedItems)}</span>
          {matchedItemIds.map((id) => (
            <ItemLink key={id} itemId={id} />
          ))}
        </p>
      )}

      {sourceIds.length > 0 && (
        <p className="chat__sources">
          <span>{t(ui.chat.sources)}</span>
          {sourceIds.map((id) => {
            const source = sources[id];
            if (!source?.url) return null;
            return (
              <a key={id} href={source.url} target="_blank" rel="noreferrer noopener">
                {t(source.title)}
              </a>
            );
          })}
        </p>
      )}
    </div>
  );
}

/** 답변이 가리키는 품목을 도감으로 이어 준다. */
function ItemLink({ itemId }: { itemId: ItemId }) {
  const { t } = useLocale();
  const item = catalogItems.find((candidate) => candidate.id === itemId);
  if (!item) return null;
  return <a href="#/catalog">{t(item.name)}</a>;
}
