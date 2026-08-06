import { handleChat } from './chat';
import { handleScan } from './scan';
import type { Env, RateLimitBinding } from './env';
import { errorResponse, isAllowedOrigin, preflightResponse, readSessionId } from './security';

interface Route {
  path: string;
  limiter: (env: Env) => RateLimitBinding;
  handle: ((request: Request, env: Env, origin: string) => Promise<Response>) | null;
}

const ROUTES: Route[] = [
  { path: '/api/chat', limiter: (env) => env.CHAT_RATE_LIMITER, handle: handleChat },
  { path: '/api/scan', limiter: (env) => env.SCAN_RATE_LIMITER, handle: handleScan },
];

/** 본문에서 세션 ID만 조심스럽게 꺼낸다. 본문이 깨져 있어도 요청을 죽이지 않는다. */
async function peekSessionId(request: Request): Promise<string> {
  try {
    const clone = request.clone();
    const type = clone.headers.get('content-type') ?? '';
    if (type.includes('application/json')) {
      const body = (await clone.json()) as { sessionId?: string };
      return readSessionId(body.sessionId);
    }
    if (type.includes('multipart/form-data')) {
      const form = await clone.formData();
      return readSessionId(String(form.get('sessionId') ?? ''));
    }
  } catch {
    // 본문을 못 읽어도 rate limit은 걸려야 한다.
  }
  return readSessionId(undefined);
}

/**
 * Worker 진입점.
 *
 * 순서를 지킨다. origin을 먼저 막고, 설정을 확인하고, 사용량을 제한한 뒤에야
 * 실제 처리로 넘어간다. 앞 단계에서 걸리면 Gemini를 부르지 않는다.
 *
 * 오류에는 코드만 담는다. 화면 문구는 앱이 현재 언어로 고른다.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');

    if (!isAllowedOrigin(origin, env.ALLOWED_ORIGIN)) {
      // origin을 되돌려주지 않는다. 허용되지 않은 곳이 응답을 읽을 이유가 없다.
      return new Response(JSON.stringify({ error: 'forbidden_origin' }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
      });
    }
    const allowed = origin as string;

    if (request.method === 'OPTIONS') return preflightResponse(allowed);

    const route = ROUTES.find((item) => new URL(request.url).pathname === item.path);
    if (!route) return errorResponse('not_found', 404, allowed);

    if (request.method !== 'POST') {
      return errorResponse('method_not_allowed', 405, allowed);
    }

    if (!env.GEMINI_API_KEY) {
      return errorResponse('not_configured', 503, allowed);
    }

    const sessionId = await peekSessionId(request);
    const { success } = await route.limiter(env).limit({ key: sessionId });
    if (!success) return errorResponse('rate_limited', 429, allowed);

    if (!route.handle) return errorResponse('not_implemented', 501, allowed);

    try {
      return await route.handle(request, env, allowed);
    } catch {
      // 처리 중 예외 내용에는 프롬프트나 사용자 입력이 섞일 수 있다.
      return errorResponse('server_error', 500, allowed);
    }
  },
};
