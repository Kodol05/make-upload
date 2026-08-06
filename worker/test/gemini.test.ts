// @vitest-environment node
import { z } from 'zod';
import { chatResponseSchema, scanResponseSchema } from '@shared/schemas';
import { CHAT_MODEL, SCAN_MODEL, callGemini, toGeminiSchema } from '../src/gemini';

/** 응답 스키마를 훑어 특정 키가 남아 있는지 본다. */
function hasKey(node: unknown, key: string): boolean {
  if (Array.isArray(node)) return node.some((child) => hasKey(child, key));
  if (!node || typeof node !== 'object') return false;
  const record = node as Record<string, unknown>;
  if (key in record) return true;
  return Object.values(record).some((child) => hasKey(child, key));
}

describe('toGeminiSchema', () => {
  it('keeps the property shape', () => {
    const result = toGeminiSchema(z.object({ answer: z.string(), count: z.number() }));
    expect(result.type).toBe('object');
    expect(result.properties).toMatchObject({
      answer: { type: 'string' },
      count: { type: 'number' },
    });
  });

  it('keeps required fields', () => {
    const result = toGeminiSchema(z.object({ answer: z.string() }));
    expect(result.required).toEqual(['answer']);
  });

  it('keeps enum values', () => {
    const result = toGeminiSchema(z.object({ status: z.enum(['a', 'b']) }));
    expect(JSON.stringify(result)).toContain('"a"');
  });

  it('drops keys Gemini does not accept', () => {
    // $schema와 additionalProperties가 남으면 400 INVALID_ARGUMENT가 난다.
    const result = toGeminiSchema(chatResponseSchema);
    expect(hasKey(result, '$schema')).toBe(false);
    expect(hasKey(result, 'additionalProperties')).toBe(false);
  });

  it('resolves references so nothing points outside the document', () => {
    // $ref / $defs 가 남으면 Gemini가 해석하지 못한다.
    const result = toGeminiSchema(scanResponseSchema);
    expect(hasKey(result, '$ref')).toBe(false);
    expect(hasKey(result, '$defs')).toBe(false);
  });

  it('survives the real chat and scan schemas', () => {
    expect(() => toGeminiSchema(chatResponseSchema)).not.toThrow();
    expect(() => toGeminiSchema(scanResponseSchema)).not.toThrow();
  });
});

/**
 * 실제 Gemini를 부르지 않고 fetch만 바꿔치기한다.
 * 인자 타입을 적어 두어야 호출 기록을 캐스팅 없이 꺼낼 수 있다.
 */
function stubFetch(body: unknown, status = 200) {
  return vi.fn(async (_url: string, _init: RequestInit) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  );
}

function modelReply(payload: unknown) {
  return { candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }] };
}

const validAnswer = {
  answer: '내용물을 비우고 배출하세요.',
  matchedItemIds: ['clear-pet'],
  sourceIds: ['me-recyclable'],
  status: 'answered',
};

describe('callGemini', () => {
  const options = {
    apiKey: 'test-key',
    model: CHAT_MODEL,
    systemInstruction: 'you are a test',
    parts: [{ text: 'hello' }],
    schema: chatResponseSchema,
    timeoutMs: 1000,
  };

  it('calls the model it was given', async () => {
    const fetchMock = stubFetch(modelReply(validAnswer));
    await callGemini({ ...options, model: SCAN_MODEL, fetchImpl: fetchMock });
    expect(fetchMock.mock.calls[0][0]).toContain(`${SCAN_MODEL}:generateContent`);
  });

  it('keeps chat and scan on different models', () => {
    // 무료 한도는 모델마다 따로 잡힌다. 같은 모델을 쓰면 버킷을 나눠 쓰지 못한다.
    expect(CHAT_MODEL).not.toBe(SCAN_MODEL);
  });

  it('returns the parsed and validated answer', async () => {
    const fetchMock = stubFetch(modelReply(validAnswer));
    const result = await callGemini({ ...options, fetchImpl: fetchMock });
    expect(result).toEqual(validAnswer);
  });

  it('sends the API key in a header, never in the URL', async () => {
    const fetchMock = stubFetch(modelReply(validAnswer));
    await callGemini({ ...options, fetchImpl: fetchMock });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).not.toContain('test-key');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('test-key');
  });

  it('asks the model for JSON in the agreed shape', async () => {
    const fetchMock = stubFetch(modelReply(validAnswer));
    await callGemini({ ...options, fetchImpl: fetchMock });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.generationConfig.responseSchema.type).toBe('object');
    expect(body.systemInstruction.parts[0].text).toBe('you are a test');
  });

  it('rejects an answer that breaks the contract', async () => {
    const fetchMock = stubFetch(modelReply({ ...validAnswer, status: 'made-up' }));
    await expect(callGemini({ ...options, fetchImpl: fetchMock })).rejects.toThrow();
  });

  it('rejects an item ID that is not in the catalog', async () => {
    const fetchMock = stubFetch(modelReply({ ...validAnswer, matchedItemIds: ['nope'] }));
    await expect(callGemini({ ...options, fetchImpl: fetchMock })).rejects.toThrow();
  });

  it('fails clearly when the model returns nothing usable', async () => {
    const fetchMock = stubFetch({ candidates: [] });
    await expect(callGemini({ ...options, fetchImpl: fetchMock })).rejects.toThrow(
      /empty/,
    );
  });

  it('fails clearly on an HTTP error', async () => {
    const fetchMock = stubFetch({ error: 'nope' }, 429);
    await expect(callGemini({ ...options, fetchImpl: fetchMock })).rejects.toThrow(
      /429/,
    );
  });
});
