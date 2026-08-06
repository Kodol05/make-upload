// @vitest-environment node
import { catalogItems } from '../../shared/catalog';
import { faqs } from '../../shared/faqs';
import { isTodo } from '../../shared/placeholder';
import { sources } from '../../shared/sources';
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
  it('includes an item only when its Korean text is fully verified', () => {
    // 데이터가 채워질수록 통과 조건이 바뀌면 안 되므로 개수 대신 규칙을 검사한다.
    const included = new Set(buildApprovedKnowledge().items.map((item) => item.id));

    for (const item of catalogItems) {
      const koreanReady = ![
        item.summary.ko,
        item.commonMistake.ko,
        ...item.steps.map((step) => step.text.ko),
      ].some(isTodo);
      expect(included.has(item.id), item.id).toBe(koreanReady);
    }
  });

  it('includes a FAQ only when its Korean text is fully verified', () => {
    const included = new Set(buildApprovedKnowledge().faqs.map((faq) => faq.id));

    for (const faq of faqs) {
      const koreanReady = !isTodo(faq.question.ko) && !isTodo(faq.answer.ko);
      expect(included.has(faq.id), faq.id).toBe(koreanReady);
    }
  });

  it('never lets the placeholder marker reach the model', () => {
    expect(JSON.stringify(buildApprovedKnowledge())).not.toContain('__TODO__');
  });

  it('offers only source IDs that have a verified URL', () => {
    const offered = buildApprovedKnowledge().sourceIds;

    for (const id of offered) {
      expect(sources[id]?.url, id).toMatch(/^https:\/\//);
    }
    for (const [id, source] of Object.entries(sources)) {
      if (!source.url) expect(offered, id).not.toContain(id);
    }
  });

  it('lets an item cite only the sources that are verified', () => {
    for (const item of buildApprovedKnowledge().items) {
      for (const id of item.sourceIds) {
        expect(sources[id]?.url, `${item.id} -> ${id}`).toMatch(/^https:\/\//);
      }
    }
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

  it('asks the model once the knowledge is ready', async () => {
    const fetchImpl = vi.fn(replyWith(goodAnswer));

    const response = await handleChat(
      chatRequest(validBody),
      makeEnv(),
      ORIGIN,
      fetchImpl,
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'answered' });
  });

  /**
   * 도감 밖의 물건도 답한다. 다만 근거의 등급을 나눈다는 것을 지시문이 담아야 한다.
   * 처음에는 도감에 없으면 전부 거절해서, 16종에 없는 물건을 물으면 아무 도움이
   * 되지 않았다.
   */
  it('tells the model to help beyond the guide, without borrowing its authority', async () => {
    const fetchImpl = vi.fn(replyWith(goodAnswer));
    await handleChat(chatRequest(validBody), makeEnv(), ORIGIN, fetchImpl);

    const body = String((fetchImpl.mock.calls[0]?.[1] as RequestInit).body);
    // 도감 밖도 답한다
    expect(body).toContain('still answer with what you know');
    // 다만 출처는 붙이지 않는다
    expect(body).toContain('Leave sourceIds empty');
    // 분리배출과 무관하면 여전히 답하지 않는다
    expect(body).toContain('out_of_scope');
  });

  /**
   * 범위를 "어느 통에 넣는가"로만 적어 두니 모델이 그대로 읽어서, "분리배출을
   * 하면 뭐가 좋아?"나 "약품은 어떻게 버려?"까지 거절했다. 분명히 분리배출
   * 이야기인데 답을 못 받는다.
   */
  it('tells the model to answer when it is unsure whether something counts', async () => {
    const fetchImpl = vi.fn(replyWith(goodAnswer));
    await handleChat(chatRequest(validBody), makeEnv(), ORIGIN, fetchImpl);

    const body = String((fetchImpl.mock.calls[0]?.[1] as RequestInit).body);
    expect(body).toContain('LEAN TOWARDS ANSWERING');
    expect(body).toContain('When you are unsure whether something counts, answer it');
    // 거절은 드물어야 한다는 것을 지시문이 직접 말한다
    expect(body).toContain('This should be rare');
  });

  /** 범위 안에 무엇이 드는지를 지시문이 예로 들어 준다. 목록이 곧 경계다. */
  it('spells out the kinds of question that count as waste separation', async () => {
    const fetchImpl = vi.fn(replyWith(goodAnswer));
    await handleChat(chatRequest(validBody), makeEnv(), ORIGIN, fetchImpl);

    const body = String((fetchImpl.mock.calls[0]?.[1] as RequestInit).body);
    for (const kind of [
      'why the rules exist',
      'what are the benefits',
      'medicines',
      'where to buy bags',
    ]) {
      expect(body, kind).toContain(kind);
    }
  });

  /** 모델이 등록되지 않은 출처를 붙여 와도 화면까지 가지 못한다. */
  it('drops a source the model made up', async () => {
    const response = await handleChat(
      chatRequest(validBody),
      makeEnv(),
      ORIGIN,
      replyWith({ ...goodAnswer, sourceIds: ['me-recyclable', 'made-up-source'] }),
    );

    const answer = (await response.json()) as { sourceIds: string[] };
    expect(answer.sourceIds).toEqual(['me-recyclable']);
  });

  it('sends the verified knowledge to the model', async () => {
    const fetchImpl = vi.fn(replyWith(goodAnswer));
    await handleChat(chatRequest(validBody), makeEnv(), ORIGIN, fetchImpl);

    const body = String((fetchImpl.mock.calls[0]?.[1] as RequestInit).body);
    expect(body).toContain('APPROVED_KNOWLEDGE');
    // 검수 전 문안은 지식에 들어가지 않는다. 모델이 자리 표시를 사실처럼 인용하면 안 된다.
    expect(body).not.toContain('__TODO__');
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
