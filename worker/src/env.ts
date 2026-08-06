/**
 * Cloudflare rate limit 바인딩에서 우리가 쓰는 부분만 적었다.
 * 전체 타입에 묶이지 않아 테스트에서 가짜를 만들기 쉽다.
 */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  /** Cloudflare secret으로만 넣는다. 없으면 AI 기능을 끄고 503을 돌려준다. */
  GEMINI_API_KEY?: string;
  /** 운영 배포 주소. wrangler 설정의 vars에서 온다. */
  ALLOWED_ORIGIN: string;
  CHAT_RATE_LIMITER: RateLimitBinding;
  SCAN_RATE_LIMITER: RateLimitBinding;
}
