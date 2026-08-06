import type { Env } from '../worker/src/env.js';
import worker from '../worker/src/index.js';
import { createRateLimiter } from '../worker/src/rateLimit.js';

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

/**
 * 환경 변수를 `globalThis`를 거쳐 읽는다.
 *
 * `process.env`를 그대로 쓰면 Vercel이 API 함수를 타입 검사할 때 node 타입을
 * 못 찾아 `TS2591: Cannot find name 'process'`가 난다. 우리 tsconfig에는 node
 * 타입이 있어서 로컬에서는 통과하기 때문에 배포 로그를 봐야만 드러난다.
 * 전역에서 꺼내 오면 어느 쪽 설정에서도 검사를 통과한다.
 */
function readEnvVars(): Record<string, string | undefined> {
  const runtime = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return runtime.process?.env ?? {};
}

function readEnv(): Env {
  const vars = readEnvVars();
  return {
    GEMINI_API_KEY: vars.GEMINI_API_KEY,
    ALLOWED_ORIGIN: vars.ALLOWED_ORIGIN ?? 'https://kodol05.github.io',
    CHAT_RATE_LIMITER,
    SCAN_RATE_LIMITER,
  };
}

export default {
  fetch(request: Request): Promise<Response> {
    return worker.fetch(request, readEnv());
  },
};
