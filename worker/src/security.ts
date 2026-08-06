/**
 * 요청 검증과 응답 만들기.
 *
 * 오류 응답에는 사람이 읽는 문장 대신 코드만 담는다. 화면 문구는 앱이 현재 언어로
 * 고르고, 프롬프트나 사용자가 보낸 내용이 응답이나 로그에 섞이지 않게 하기 위해서다.
 */

/** 개발용 origin. 운영 origin은 wrangler 설정의 ALLOWED_ORIGIN에서 온다. */
const DEV_ORIGIN = 'http://localhost:5173';

const MAX_HISTORY = 6;
const MAX_SESSION_ID = 128;

/** 정확히 일치하는 origin만 통과시킨다. 접두사 비교는 우회당한다. */
export function isAllowedOrigin(origin: string | null, allowed: string): boolean {
  if (!origin) return false;
  return origin === allowed || origin === DEV_ORIGIN;
}

export function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    // origin에 따라 응답이 달라지므로 캐시가 섞이지 않게 한다.
    Vary: 'Origin',
  };
}

export function preflightResponse(origin: string): Response {
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export function jsonResponse(body: unknown, origin: string, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'content-type': 'application/json' },
  });
}

/** 앱이 현재 언어로 번역할 수 있도록 코드만 돌려준다. */
export function errorResponse(code: string, status: number, origin: string): Response {
  return jsonResponse({ error: code }, origin, status);
}

/** 대화 이력을 최근 여섯 개로 자른다. */
export function limitHistory<T>(history: T[]): T[] {
  return history.length <= MAX_HISTORY ? history : history.slice(-MAX_HISTORY);
}

/**
 * 세션 ID를 읽는다.
 *
 * 없거나 지나치게 길어도 요청을 실패시키지 않는다. 대신 값을 정리해 rate limit이
 * 항상 어딘가에는 걸리도록 한다.
 */
export function readSessionId(value: string | undefined): string {
  if (!value) return 'anonymous';
  return value.slice(0, MAX_SESSION_ID);
}
