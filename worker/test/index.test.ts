// @vitest-environment node
import type { Env } from '../src/env';
import worker from '../src/index';

const ALLOWED = 'https://kodol05.github.io';

/** 항상 통과하는 rate limiter. 막히는 경우는 따로 만든다. */
function passingLimiter() {
  return { limit: vi.fn(async () => ({ success: true })) };
}

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    GEMINI_API_KEY: 'test-key',
    ALLOWED_ORIGIN: ALLOWED,
    CHAT_RATE_LIMITER: passingLimiter(),
    SCAN_RATE_LIMITER: passingLimiter(),
    ...overrides,
  };
}

function request(path: string, init: RequestInit = {}, origin: string | null = ALLOWED) {
  const headers = new Headers(init.headers);
  if (origin) headers.set('Origin', origin);
  return new Request(`https://api.example${path}`, { ...init, headers });
}

async function call(path: string, init?: RequestInit, env = makeEnv(), origin?: string | null) {
  return worker.fetch(request(path, init, origin === undefined ? ALLOWED : origin), env);
}

describe('worker routing', () => {
  it('answers a preflight with 204', async () => {
    const response = await call('/api/chat', { method: 'OPTIONS' });
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED);
  });

  it('allows the local dev server', async () => {
    const response = await call('/api/chat', { method: 'OPTIONS' }, makeEnv(), 'http://localhost:5173');
    expect(response.status).toBe(204);
  });

  it('rejects an unknown origin before doing any work', async () => {
    const response = await call('/api/chat', { method: 'POST' }, makeEnv(), 'https://evil.example');
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'forbidden_origin' });
  });

  it('rejects a request with no origin', async () => {
    const response = await call('/api/chat', { method: 'POST' }, makeEnv(), null);
    expect(response.status).toBe(403);
  });

  it('returns 404 for an unknown path', async () => {
    const response = await call('/api/nope', { method: 'POST' });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });

  it('returns 405 when the method is wrong', async () => {
    const response = await call('/api/chat', { method: 'GET' });
    expect(response.status).toBe(405);
    expect(await response.json()).toEqual({ error: 'method_not_allowed' });
  });

  it('returns 503 when the API key is not configured', async () => {
    const env = makeEnv({ GEMINI_API_KEY: undefined });
    const response = await call('/api/chat', { method: 'POST' }, env);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'not_configured' });
  });

  it('returns 429 when the session used up its quota', async () => {
    const env = makeEnv({
      CHAT_RATE_LIMITER: { limit: vi.fn(async () => ({ success: false })) },
    });
    const response = await call('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ sessionId: 'abc' }),
    }, env);
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: 'rate_limited' });
  });

  it('uses the scan limiter for the scan route', async () => {
    const chat = passingLimiter();
    const scan = passingLimiter();
    const env = makeEnv({ CHAT_RATE_LIMITER: chat, SCAN_RATE_LIMITER: scan });

    await call('/api/scan', { method: 'POST' }, env);

    expect(scan.limit).toHaveBeenCalled();
    expect(chat.limit).not.toHaveBeenCalled();
  });

  it('keeps CORS headers on every failure so the browser can read it', async () => {
    const response = await call('/api/nope', { method: 'POST' });
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED);
  });

  it('never leaks the API key in any response', async () => {
    const response = await call('/api/chat', { method: 'POST' });
    const text = await response.text();
    expect(text).not.toContain('test-key');
    expect(JSON.stringify([...response.headers])).not.toContain('test-key');
  });
});
