import type { RateLimitBinding } from './env';

const MAX_TRACKED_KEYS = 2000;

/**
 * 메모리에 두는 사용량 제한.
 *
 * Cloudflare의 rate limit 바인딩을 대신한다. 서버리스라 인스턴스마다 따로 세므로
 * 전역 상한은 아니지만, 한 사람이 연달아 눌러 무료 한도를 태우는 것은 막는다.
 * 무료 한도를 지키는 진짜 방어선은 Gemini 쪽 일일 한도다.
 *
 * 시간은 인자로 받아 테스트에서 흐르게 만들 수 있다.
 */
export function createRateLimiter(
  limit: number,
  windowMs: number,
  now: () => number = Date.now,
): RateLimitBinding {
  const hits = new Map<string, number[]>();

  /** 창 밖으로 나간 기록만 남기지 않는다. */
  function recent(key: string, at: number): number[] {
    return (hits.get(key) ?? []).filter((time) => at - time < windowMs);
  }

  return {
    async limit({ key }) {
      const at = now();
      const times = recent(key, at);

      if (times.length >= limit) {
        hits.set(key, times);
        return { success: false };
      }

      times.push(at);
      hits.set(key, times);

      // 오래 방치된 키가 쌓여 메모리를 먹지 않게 가끔 치운다.
      if (hits.size > MAX_TRACKED_KEYS) {
        for (const [other, times] of hits) {
          if (times.every((time) => at - time >= windowMs)) hits.delete(other);
        }
      }

      return { success: true };
    },
  };
}
