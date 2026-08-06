// @vitest-environment node
import { createRateLimiter } from '../src/rateLimit';

/** 시간을 손으로 흐르게 한다. */
function clock(start = 0) {
  let value = start;
  return { now: () => value, advance: (ms: number) => (value += ms) };
}

describe('createRateLimiter', () => {
  it('allows requests up to the limit', async () => {
    const limiter = createRateLimiter(3, 60_000, clock().now);
    for (let i = 0; i < 3; i += 1) {
      expect((await limiter.limit({ key: 'a' })).success).toBe(true);
    }
  });

  it('blocks the one past the limit', async () => {
    const limiter = createRateLimiter(2, 60_000, clock().now);
    await limiter.limit({ key: 'a' });
    await limiter.limit({ key: 'a' });
    expect((await limiter.limit({ key: 'a' })).success).toBe(false);
  });

  it('counts each session on its own', async () => {
    const limiter = createRateLimiter(1, 60_000, clock().now);
    expect((await limiter.limit({ key: 'a' })).success).toBe(true);
    expect((await limiter.limit({ key: 'b' })).success).toBe(true);
  });

  it('lets the session through again once the window passes', async () => {
    const time = clock();
    const limiter = createRateLimiter(1, 60_000, time.now);
    await limiter.limit({ key: 'a' });
    expect((await limiter.limit({ key: 'a' })).success).toBe(false);

    time.advance(60_001);

    expect((await limiter.limit({ key: 'a' })).success).toBe(true);
  });

  it('keeps blocking while the window is still open', async () => {
    const time = clock();
    const limiter = createRateLimiter(1, 60_000, time.now);
    await limiter.limit({ key: 'a' });

    time.advance(59_000);

    expect((await limiter.limit({ key: 'a' })).success).toBe(false);
  });
});
