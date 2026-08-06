// @vitest-environment node
import {
  corsHeaders,
  errorResponse,
  isAllowedOrigin,
  jsonResponse,
  limitHistory,
  preflightResponse,
  readSessionId,
} from '../src/security';

const ALLOWED = 'https://kodol05.github.io';

describe('isAllowedOrigin', () => {
  it('accepts the deployed site', () => {
    expect(isAllowedOrigin(ALLOWED, ALLOWED)).toBe(true);
  });

  it('accepts the local dev server', () => {
    expect(isAllowedOrigin('http://localhost:5173', ALLOWED)).toBe(true);
  });

  it('rejects any other origin', () => {
    expect(isAllowedOrigin('https://evil.example', ALLOWED)).toBe(false);
  });

  it('rejects a missing origin', () => {
    expect(isAllowedOrigin(null, ALLOWED)).toBe(false);
  });

  it('rejects an origin that merely starts with the allowed one', () => {
    // https://kodol05.github.io.evil.example 같은 주소를 통과시키면 안 된다.
    expect(isAllowedOrigin(`${ALLOWED}.evil.example`, ALLOWED)).toBe(false);
  });
});

describe('corsHeaders', () => {
  it('echoes the allowed origin', () => {
    const headers = corsHeaders(ALLOWED);
    expect(headers['Access-Control-Allow-Origin']).toBe(ALLOWED);
    expect(headers.Vary).toBe('Origin');
  });
});

describe('preflightResponse', () => {
  it('answers OPTIONS with 204 and no body', async () => {
    const response = preflightResponse(ALLOWED);
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED);
  });
});

describe('errorResponse', () => {
  it('returns a machine readable code the app can translate', async () => {
    const response = errorResponse('rate_limited', 429, ALLOWED);
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: 'rate_limited' });
  });

  it('keeps CORS headers so the browser can read the failure', () => {
    const response = errorResponse('server_error', 500, ALLOWED);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED);
  });

  it('never includes the original request or prompt text', async () => {
    const body = await errorResponse('bad_request', 400, ALLOWED).json();
    expect(Object.keys(body as object)).toEqual(['error']);
  });
});

describe('jsonResponse', () => {
  it('sends JSON with CORS headers', async () => {
    const response = jsonResponse({ ok: true }, ALLOWED);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({ ok: true });
  });
});

describe('limitHistory', () => {
  it('keeps only the most recent six turns', () => {
    const history = Array.from({ length: 9 }, (_, i) => ({
      role: 'user' as const,
      content: String(i),
    }));
    const limited = limitHistory(history);
    expect(limited).toHaveLength(6);
    expect(limited[0].content).toBe('3');
    expect(limited[5].content).toBe('8');
  });

  it('leaves a shorter history alone', () => {
    const history = [{ role: 'user' as const, content: 'hi' }];
    expect(limitHistory(history)).toEqual(history);
  });
});

describe('readSessionId', () => {
  it('accepts a normal session id', () => {
    expect(readSessionId('abc-123')).toBe('abc-123');
  });

  it('falls back to anonymous when missing so rate limiting still applies', () => {
    expect(readSessionId(undefined)).toBe('anonymous');
    expect(readSessionId('')).toBe('anonymous');
  });

  it('trims an over long id instead of failing the request', () => {
    expect(readSessionId('x'.repeat(200))).toHaveLength(128);
  });
});
