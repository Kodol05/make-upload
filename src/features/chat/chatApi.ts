import { postJson } from '@/lib/api';
import type { ChatRequest, ChatResponse } from '@shared/types';

const TIMEOUT_MS = 12_000;

/** 챗봇에게 질문한다. 실패는 ApiError의 코드로 전달된다. */
export function sendChat(request: ChatRequest): Promise<ChatResponse> {
  return postJson<ChatResponse>('/api/chat', request, { timeoutMs: TIMEOUT_MS });
}

/**
 * 세션 ID를 만든다.
 *
 * 사용량 제한을 세션별로 걸기 위한 값이라 사람을 식별하지 않고 저장하지도 않는다.
 * 새로고침하면 새로 생긴다.
 */
export function createSessionId(): string {
  return crypto.randomUUID();
}
