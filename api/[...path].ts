import type { Env } from '../worker/src/env';
import worker from '../worker/src/index';
import { createRateLimiter } from '../worker/src/rateLimit';

/**
 * Vercel 진입점.
 *
 * Cloudflare Workers에서 옮겨 왔다. Google이 Cloudflare의 출구 IP를
 * "User location is not supported"로 막아 Gemini를 부를 수 없었기 때문이다.
 * Vercel 함수는 아래 `regions` 설정에 따라 미국에서 돌아 이 문제가 없다.
 *
 * 요청 처리 자체는 옮기지 않았다. 같은 `worker/src`의 코드를 그대로 부른다.
 * 달라진 것은 두 가지뿐이다. 설정을 바인딩 대신 환경 변수에서 읽고, 사용량
 * 제한을 메모리에 둔다.
 */

// 설계 문서가 정한 값과 같다.
const CHAT_RATE_LIMITER = createRateLimiter(10, 60_000);
const SCAN_RATE_LIMITER = createRateLimiter(5, 60_000);

function readEnv(): Env {
  return {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN ?? 'https://kodol05.github.io',
    CHAT_RATE_LIMITER,
    SCAN_RATE_LIMITER,
  };
}

export default {
  fetch(request: Request): Promise<Response> {
    return worker.fetch(request, readEnv());
  },
};
