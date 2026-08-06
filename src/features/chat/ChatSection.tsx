import { useRef, useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { ui } from '@/i18n/strings';
import { ApiError } from '@/lib/api';
import { catalogItems } from '@shared/catalog';
import { faqs } from '@shared/faqs';
import { sources } from '@shared/sources';
import type { ChatRequest, ChatResponse, ItemId, LocalizedText } from '@shared/types';
import type { ChatAsk } from './askChat';
import { createSessionId, sendChat as defaultSendChat } from './chatApi';
import { answerFromFaq, initialSuggestions, takeSuggestion } from './faqAnswers';

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
  ask,
}: {
  sendChat?: (request: ChatRequest) => Promise<ChatResponse>;
  /** 도감이나 검색에서 넘어온 거리. 없으면 그냥 빈 대화로 시작한다. */
  ask?: ChatAsk | null;
}) {
  const { locale, t } = useLocale();
  const [draft, setDraft] = useState('');
  /** 어느 품목을 보다가 왔는지. 서버가 그 품목을 아는 채로 답한다. */
  const [contextItemId, setContextItemId] = useState<ItemId | undefined>();
  const [suggestions, setSuggestions] = useState(() =>
    initialSuggestions(faqs.length, SUGGESTION_COUNT),
  );
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const sessionId = useRef(createSessionId());
  const nextId = useRef(0);

  /**
   * 밖에서 부른 것을 받는다. 부를 때마다 새 객체가 오므로 한 번씩만 반응한다.
   *
   * 보내지는 않고 입력란에 넣어만 둔다. 무엇이 물어질지 보고 나서 고칠 수 있어야
   * 한다. 품목 이름만 덩그러니 보내고 싶지 않은 사람이 대부분일 것이다.
   *
   * 효과가 아니라 렌더 중에 맞춘다. 효과로 넣으면 빈 입력란이 한 번 그려진 뒤에
   * 글자가 들어와 깜빡인다.
   */
  const [answered, setAnswered] = useState<ChatAsk | null | undefined>(null);
  if (ask && ask !== answered) {
    setAnswered(ask);
    setContextItemId(ask.itemId);
    if (ask.question) setDraft(ask.question);
  }

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
        contextItemId,
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

  /**
   * 추천 질문은 모델을 부르지 않고 바로 답한다.
   *
   * 우리가 고른 FAQ 그대로고 답도 검수해서 갖고 있다. 부르지 않으면 기다림이
   * 없고, 하루 한도를 아끼고, 무엇보다 시연 중에 API가 막혀도 챗봇이 답을 한다.
   *
   * 쓴 질문 자리에만 다음 질문이 들어온다. 스무 개를 다 쓰면 처음으로 돌아온다.
   */
  function answerFromGuide(position: number) {
    const faq = faqs[suggestions.slots[position]];
    if (!faq) return;

    const id = (nextId.current += 1);
    setTurns((prev) => [
      ...prev,
      { id, question: t(faq.question), answer: answerFromFaq(faq, t) },
    ]);
    setSuggestions((prev) => takeSuggestion(prev, position, faqs.length));
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
          {suggestions.slots.map((faqIndex, position) => {
            const faq = faqs[faqIndex];
            if (!faq) return null;
            return (
              <li key={faq.id}>
                <button type="button" onClick={() => answerFromGuide(position)}>
                  {t(faq.question)}
                </button>
              </li>
            );
          })}
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
