// @vitest-environment node
import type { Env } from '../src/env';
import type { FetchLike } from '../src/gemini';
import type { ScanObject } from '@shared/types';
import { handleScan, sanitiseObjects } from '../src/scan';

const ORIGIN = 'https://kodol05.github.io';

function makeEnv(): Env {
  return {
    GEMINI_API_KEY: 'test-key',
    ALLOWED_ORIGIN: ORIGIN,
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    SCAN_RATE_LIMITER: { limit: async () => ({ success: true }) },
  };
}

const smallImage = { mimeType: 'image/jpeg', data: 'AAAA' };

function scanRequest(body: unknown) {
  return new Request('https://api.example/api/scan', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify(body),
  });
}

const validBody = { locale: 'ko', sessionId: 'session-1', image: smallImage };

function replyWith(payload: unknown): FetchLike {
  return async () =>
    new Response(
      JSON.stringify({
        candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
}

// 타입을 적어야 배열 리터럴이 number[]가 아니라 좌표 튜플로 추론된다.
const detected: ScanObject = {
  box: [100, 200, 600, 800],
  itemId: 'clear-pet',
  label: '투명 페트병',
  certainty: 'high',
  reason: '라벨이 없는 투명 플라스틱 병이 보입니다.',
};

describe('sanitiseObjects', () => {
  it('keeps a well formed detection', () => {
    expect(sanitiseObjects([detected])).toEqual([detected]);
  });

  it('drops a box the screen cannot draw', () => {
    // yMax가 yMin보다 작으면 그릴 수 없다.
    const inverted: ScanObject = { ...detected, box: [600, 200, 100, 800] };
    expect(sanitiseObjects([inverted])).toEqual([]);
  });

  it('keeps at most five objects', () => {
    const many = Array.from({ length: 9 }, () => detected);
    expect(sanitiseObjects(many)).toHaveLength(5);
  });

  it('turns an unregistered item into unknown instead of dropping it', () => {
    // 무엇인지 못 맞혀도 위치는 알려 주는 편이 사용자에게 낫다.
    const strange = { ...detected, itemId: 'made-up-item' } as unknown as ScanObject;
    expect(sanitiseObjects([strange])[0].itemId).toBe('unknown');
  });

  it('leaves an explicit unknown alone', () => {
    const unknown: ScanObject = { ...detected, itemId: 'unknown' };
    expect(sanitiseObjects([unknown])[0].itemId).toBe('unknown');
  });
});

describe('handleScan', () => {
  it('returns the cleaned objects', async () => {
    const response = await handleScan(
      scanRequest(validBody),
      makeEnv(),
      ORIGIN,
      replyWith({ objects: [detected] }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ objects: [detected] });
  });

  it('rejects an unsupported image type', async () => {
    const response = await handleScan(
      scanRequest({ ...validBody, image: { mimeType: 'image/gif', data: 'AAAA' } }),
      makeEnv(),
      ORIGIN,
      replyWith({ objects: [] }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'unsupported_type' });
  });

  it('rejects an image over the size limit before calling the model', async () => {
    const fetchImpl = vi.fn(replyWith({ objects: [] }));
    const tooBig = 'a'.repeat(2_200_000);

    const response = await handleScan(
      scanRequest({ ...validBody, image: { mimeType: 'image/jpeg', data: tooBig } }),
      makeEnv(),
      ORIGIN,
      fetchImpl,
    );

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: 'image_too_large' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects a body that does not match the contract', async () => {
    const response = await handleScan(
      scanRequest({ locale: 'ko' }),
      makeEnv(),
      ORIGIN,
      replyWith({ objects: [] }),
    );
    expect(response.status).toBe(400);
  });

  it('sends the image as inline data alongside the prompt', async () => {
    const fetchImpl = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      const parts = body.contents[0].parts;
      expect(parts[0].text).toContain('clear-pet');
      expect(parts[1].inlineData).toEqual(smallImage);
      return new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: JSON.stringify({ objects: [] }) }] } }],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    await handleScan(scanRequest(validBody), makeEnv(), ORIGIN, fetchImpl);

    expect(fetchImpl).toHaveBeenCalled();
  });

  it('turns a model failure into an upstream error', async () => {
    const failing: FetchLike = async () => new Response('nope', { status: 500 });
    const response = await handleScan(scanRequest(validBody), makeEnv(), ORIGIN, failing);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'upstream_failed' });
  });

  it('never echoes the image data back', async () => {
    const failing: FetchLike = async () => new Response('nope', { status: 500 });
    const response = await handleScan(scanRequest(validBody), makeEnv(), ORIGIN, failing);
    expect(await response.text()).not.toContain(smallImage.data);
  });
});
