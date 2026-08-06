// @vitest-environment node
import type { Env } from '../src/env';

/**
 * 검수된 지식이 하나도 없을 때의 동작을 잠근다.
 *
 * 실제 도감이 채워지면서 이 상황은 평소에 재현되지 않지만, 규칙 자체는 남아야 한다.
 * 지식이 비면 Gemini를 부르지 않고 `out_of_scope`로 답한다. 물어볼 근거가 없는데
 * 모델을 부르면 지어낸 답이 나오고, 무료 한도만 축낸다.
 */
vi.mock('../../shared/catalog.js', () => ({ catalogItems: [] }));
vi.mock('../../shared/faqs.js', () => ({ faqs: [] }));

const ORIGIN = 'https://kodol05.github.io';

function makeEnv(): Env {
  return {
    GEMINI_API_KEY: 'test-key',
    ALLOWED_ORIGIN: ORIGIN,
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    SCAN_RATE_LIMITER: { limit: async () => ({ success: true }) },
  };
}

describe('handleChat with no verified knowledge', () => {
  it('answers out_of_scope without calling the model', async () => {
    const { handleChat } = await import('../src/chat');
    const fetchImpl = vi.fn();

    const request = new Request('https://api.example/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Origin: ORIGIN },
      body: JSON.stringify({
        locale: 'ko',
        message: '페트병은 어떻게 버려요?',
        history: [],
        sessionId: 'session-1',
      }),
    });

    const response = await handleChat(request, makeEnv(), ORIGIN, fetchImpl);

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'out_of_scope' });
  });
});
