import { ApiError, postJson } from './api';

/** 인자 타입을 적어 두어야 호출 기록을 캐스팅 없이 꺼낼 수 있다. */
function stubFetch(status: number, body: unknown) {
  return vi.fn(async (_url: string, _init: RequestInit) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  );
}

describe('postJson', () => {
  it('reports that the API is not configured yet', async () => {
    // Worker 주소가 없으면 호출을 시도하지 않는다. 지금 배포본이 이 상태다.
    await expect(
      postJson('/api/chat', {}, { baseUrl: '', timeoutMs: 1000 }),
    ).rejects.toThrow(new ApiError('unavailable'));
  });

  it('returns the parsed body on success', async () => {
    const fetchImpl = stubFetch(200, { answer: 'hi' });
    const result = await postJson('/api/chat', { a: 1 }, {
      baseUrl: 'https://api.example',
      timeoutMs: 1000,
      fetchImpl,
    });
    expect(result).toEqual({ answer: 'hi' });
  });

  it('joins the base URL and the path without a double slash', async () => {
    const fetchImpl = stubFetch(200, {});
    await postJson('/api/chat', {}, {
      baseUrl: 'https://api.example/',
      timeoutMs: 1000,
      fetchImpl,
    });
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.example/api/chat');
  });

  it('turns 429 into a rate limit code', async () => {
    const fetchImpl = stubFetch(429, { error: 'rate_limited' });
    await expect(
      postJson('/api/chat', {}, { baseUrl: 'https://api.example', timeoutMs: 1000, fetchImpl }),
    ).rejects.toThrow(new ApiError('rate_limited'));
  });

  it('passes through the server error code', async () => {
    const fetchImpl = stubFetch(400, { error: 'bad_request' });
    await expect(
      postJson('/api/chat', {}, { baseUrl: 'https://api.example', timeoutMs: 1000, fetchImpl }),
    ).rejects.toThrow(new ApiError('bad_request'));
  });

  it('falls back to a generic code when the server says nothing useful', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init: RequestInit) => new Response('boom', { status: 500 }));
    await expect(
      postJson('/api/chat', {}, { baseUrl: 'https://api.example', timeoutMs: 1000, fetchImpl }),
    ).rejects.toThrow(new ApiError('server_error'));
  });

  it('turns an aborted request into a timeout code', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init: RequestInit) => {
      throw new DOMException('aborted', 'AbortError');
    });
    await expect(
      postJson('/api/chat', {}, { baseUrl: 'https://api.example', timeoutMs: 1000, fetchImpl }),
    ).rejects.toThrow(new ApiError('timeout'));
  });

  it('turns a connection failure into a network code', async () => {
    const fetchImpl = vi.fn(async (_url: string, _init: RequestInit) => {
      throw new TypeError('failed to fetch');
    });
    await expect(
      postJson('/api/chat', {}, { baseUrl: 'https://api.example', timeoutMs: 1000, fetchImpl }),
    ).rejects.toThrow(new ApiError('network'));
  });
});
