// @vitest-environment node
import { buildApprovedKnowledge, handleChat } from '../src/chat';
import type { Env } from '../src/env';
import type { FetchLike } from '../src/gemini';

const ORIGIN = 'https://kodol05.github.io';

function makeEnv(): Env {
  return {
    GEMINI_API_KEY: 'test-key',
    ALLOWED_ORIGIN: ORIGIN,
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    SCAN_RATE_LIMITER: { limit: async () => ({ success: true }) },
  };
}

function chatRequest(body: unknown) {
  return new Request('https://api.example/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify(body),
  });
}

const validBody = {
  locale: 'ko',
  message: '페트병은 어떻게 버려요?',
  history: [],
  sessionId: 'session-1',
};

/** 모델이 이렇게 답했다고 가정한다. */
function replyWith(payload: unknown): FetchLike {
  return async () =>
    new Response(
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
}

const goodAnswer = {
  answer: '내용물을 비우고 라벨을 떼어 배출하세요.',
  matchedItemIds: ['clear-pet'],
  sourceIds: ['me-recyclable'],
  status: 'answered',
};

describe('buildApprovedKnowledge', () => {
  it('leaves out items whose Korean text is still a placeholder', () => {
    // 지금은 모든 문안이 검수 전이므로 쓸 수 있는 지식이 없다.
    const knowledge = buildApprovedKnowledge();
    expect(knowledge.items).toEqual([]);
    expect(knowledge.faqs).toEqual([]);
  });

  it('never lets the placeholder marker reach the model', () => {
    expect(JSON.stringify(buildApprovedKnowledge())).not.toContain('__TODO__');
  });

  it('offers only source IDs that have a verified URL', () => {
    // 출처 URL이 아직 비어 있으므로 인용할 출처도 없다.
    expect(buildApprovedKnowledge().sourceIds).toEqual([]);
  });
});

describe('handleChat', () => {
  it('rejects a message longer than 500 characters', async () => {
    const response = await handleChat(
      chatRequest({ ...validBody, message: 'ㄱ'.repeat(501) }),
      makeEnv(),
      ORIGIN,
      replyWith(goodAnswer),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'bad_request' });
  });

  it('rejects a body that does not match the contract', async () => {
    const response = await handleChat(
      chatRequest({ locale: 'fr', message: 'hi', history: [], sessionId: 'x' }),
      makeEnv(),
      ORIGIN,
      replyWith(goodAnswer),
    );
    expect(response.status).toBe(400);
  });

  it('rejects a body that is not JSON at all', async () => {
    const request = new Request('https://api.example/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Origin: ORIGIN },
      body: 'not json',
    });
    const response = await handleChat(request, makeEnv(), ORIGIN, replyWith(goodAnswer));
    expect(response.status).toBe(400);
  });

  it('answers out_of_scope without calling the model when no knowledge is ready', async () => {
    const fetchImpl = vi.fn(replyWith(goodAnswer));

    const response = await handleChat(
      chatRequest(validBody),
      makeEnv(),
      ORIGIN,
      fetchImpl,
    );

    // 검수된 지식이 없으면 물어볼 것이 없다. Gemini를 부르지 않는다.
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'out_of_scope' });
  });

  it('keeps CORS headers on a rejection', async () => {
    const response = await handleChat(
      chatRequest({ ...validBody, message: '' }),
      makeEnv(),
      ORIGIN,
      replyWith(goodAnswer),
    );
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
  });

  it('never echoes the user message back in an error', async () => {
    const secret = '내 주소는 서울시 어딘가입니다';
    const response = await handleChat(
      chatRequest({ ...validBody, message: `${secret}${'ㄱ'.repeat(500)}` }),
      makeEnv(),
      ORIGIN,
      replyWith(goodAnswer),
    );
    expect(await response.text()).not.toContain(secret);
  });
});
