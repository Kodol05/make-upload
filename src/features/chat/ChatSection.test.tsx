import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/app/LocaleProvider';
import { ui } from '@/i18n/strings';
import { ApiError } from '@/lib/api';
import type { ChatRequest, ChatResponse } from '@shared/types';
import { ChatSection } from './ChatSection';

function renderChat(send: (request: ChatRequest) => Promise<ChatResponse>) {
  return render(
    <LocaleProvider>
      <ChatSection sendChat={send} />
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

  it('offers suggested questions', () => {
    renderChat(async () => answer);
    expect(screen.getByText(ui.chat.suggestionsTitle.ko)).toBeInTheDocument();
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
    ).toHaveAttribute('href', '#catalog');
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
      '#catalog',
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
