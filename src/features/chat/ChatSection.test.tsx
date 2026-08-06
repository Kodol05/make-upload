import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/app/LocaleProvider';
import { ui } from '@/i18n/strings';
import { faqs } from '@shared/faqs';
import { ApiError } from '@/lib/api';
import type { ChatRequest, ChatResponse } from '@shared/types';
import type { ChatAsk } from './askChat';
import { ChatSection } from './ChatSection';

function renderChat(
  send: (request: ChatRequest) => Promise<ChatResponse>,
  ask?: ChatAsk,
) {
  return render(
    <LocaleProvider>
      <ChatSection sendChat={send} ask={ask} />
    </LocaleProvider>,
  );
}

const answer: ChatResponse = {
  answer: '내용물을 비우고 라벨을 떼어 배출하세요.',
  matchedItemIds: ['clear-pet'],
  sourceIds: [],
  status: 'answered',
};

async function ask(text = '페트병 어떻게 버려요?') {
  await userEvent.type(screen.getByLabelText(ui.chat.inputLabel.ko), text);
  await userEvent.click(screen.getByRole('button', { name: ui.chat.send.ko }));
}

describe('ChatSection', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('k-sort-locale', 'ko');
  });

  /**
   * 도감 상세에서 넘어온 품목은 서버까지 가야 한다. `contextItemId`는 스키마와
   * 시스템 프롬프트에 오래 전부터 있었는데 정작 보내는 화면이 없었다.
   */
  it('carries the item the reader came from all the way to the request', async () => {
    const send = vi.fn(async () => answer);
    renderChat(send, { itemId: 'clear-pet', question: '투명 페트병' });

    // 넘어온 말이 입력란에 들어와 있고, 보내지지는 않았다.
    const input = screen.getByLabelText(ui.chat.inputLabel.ko);
    expect(input).toHaveValue('투명 페트병');
    expect(send).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: ui.chat.send.ko }));

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ contextItemId: 'clear-pet' }),
    );
  });

  it('leaves the item out when the reader opened the chat on their own', async () => {
    const send = vi.fn(async (_request: ChatRequest) => answer);
    renderChat(send);
    await ask();

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ contextItemId: undefined }),
    );
  });

  it('offers suggested questions', () => {
    renderChat(async () => answer);
    expect(screen.getByText(ui.chat.suggestionsTitle.ko)).toBeInTheDocument();
  });

  /**
   * 추천 질문은 우리가 고른 FAQ 그대로고 답도 검수해서 갖고 있다. 모델을 부르면
   * 기다림이 생기고 하루 한도를 쓰는데, 무엇보다 시연 중에 API가 막히면 추천
   * 질문조차 답을 못 한다.
   */
  it('answers a suggested question without calling the model', async () => {
    const send = vi.fn(async () => answer);
    renderChat(send);
    const first = faqs[0];

    await userEvent.click(screen.getByRole('button', { name: first.question.ko }));

    expect(send).not.toHaveBeenCalled();
    expect(screen.getByText(first.answer.ko)).toBeInTheDocument();
  });

  it('puts a new question in the slot that was used and leaves the rest', async () => {
    renderChat(async () => answer);
    const [first, second, third, fourth] = faqs;

    await userEvent.click(screen.getByRole('button', { name: first.question.ko }));

    expect(screen.queryByRole('button', { name: first.question.ko })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: fourth.question.ko })).toBeInTheDocument();
    // 나머지 둘은 그대로 있어야 고르려던 것을 잃지 않는다.
    expect(screen.getByRole('button', { name: second.question.ko })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: third.question.ko })).toBeInTheDocument();
  });

  it('still calls the model for a question the reader typed', async () => {
    const send = vi.fn(async () => answer);
    renderChat(send);
    await ask('고양이 모래는요?');

    expect(send).toHaveBeenCalledTimes(1);
  });

  it('shows the question and then the answer', async () => {
    renderChat(async () => answer);

    await ask();

    expect(screen.getByText('페트병 어떻게 버려요?')).toBeInTheDocument();
    expect(await screen.findByText(answer.answer)).toBeInTheDocument();
  });

  it('does not send an empty question', async () => {
    const send = vi.fn(async () => answer);
    renderChat(send);

    await userEvent.click(screen.getByRole('button', { name: ui.chat.send.ko }));

    expect(send).not.toHaveBeenCalled();
  });

  it('sends the current language with the question', async () => {
    const send = vi.fn(async () => answer);
    renderChat(send);

    await ask();

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ locale: 'ko' }));
  });

  it('keeps only the six most recent turns in the history it sends', async () => {
    const send = vi.fn(async (_request: ChatRequest) => answer);
    renderChat(send);

    for (let i = 0; i < 5; i += 1) await ask(`질문 ${i}`);

    const lastCall = send.mock.calls.at(-1)?.[0];
    expect(lastCall?.history.length).toBeLessThanOrEqual(6);
  });

  it('explains that the assistant is unavailable and points at the catalog', async () => {
    renderChat(async () => {
      throw new ApiError('unavailable');
    });

    await ask();

    expect(await screen.findByText(ui.error.unavailable.ko)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: ui.common.openCatalog.ko }),
    ).toHaveAttribute('href', '#/catalog');
  });

  it('explains a rate limit in the current language', async () => {
    renderChat(async () => {
      throw new ApiError('rate_limited');
    });

    await ask();

    expect(await screen.findByText(ui.error.rateLimited.ko)).toBeInTheDocument();
  });

  it('explains a timeout', async () => {
    renderChat(async () => {
      throw new ApiError('timeout');
    });

    await ask();

    expect(await screen.findByText(ui.error.timeout.ko)).toBeInTheDocument();
  });

  it('tells the user when the question is outside what it knows', async () => {
    renderChat(async () => ({ ...answer, answer: '', status: 'out_of_scope' }));

    await ask();

    expect(await screen.findByText(ui.chat.outOfScope.ko)).toBeInTheDocument();
  });

  it('adds the local difference notice when the answer needs it', async () => {
    renderChat(async () => ({ ...answer, status: 'needs_local_check' }));

    await ask();

    expect(await screen.findByText(ui.chat.needsLocalCheck.ko)).toBeInTheDocument();
  });

  it('links the matched item back to the catalog', async () => {
    renderChat(async () => answer);

    await ask();

    expect(await screen.findByRole('link', { name: /투명 페트병/ })).toHaveAttribute(
      'href',
      '#/catalog',
    );
  });

  it('never keeps the conversation after a remount', async () => {
    const { unmount } = renderChat(async () => answer);
    await ask();
    expect(await screen.findByText(answer.answer)).toBeInTheDocument();
    unmount();

    renderChat(async () => answer);

    // 대화는 컴포넌트 메모리에만 둔다. 새로고침하면 사라진다.
    expect(screen.queryByText(answer.answer)).not.toBeInTheDocument();
  });
});
