/**
 * Worker를 부르는 얇은 클라이언트.
 *
 * 실패는 언제나 코드로만 전달한다. 화면 문구는 `ui.error`에서 현재 언어로 고르므로
 * 여기서 문장을 만들지 않는다.
 */
export class ApiError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'ApiError';
  }
}

/**
 * postJson이 실제로 쓰는 fetch의 모양.
 *
 * `typeof fetch`를 그대로 쓰면 넓은 시그니처에 묶여 테스트에서 가짜를 만들기 번거롭다.
 * Worker의 `FetchLike`와 같은 이유다.
 */
export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export interface PostOptions {
  baseUrl?: string;
  timeoutMs: number;
  fetchImpl?: FetchLike;
}

/** 배포 시 주입되는 Worker 주소. 아직 없으면 AI 기능을 끈다. */
const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

export async function postJson<T>(
  path: string,
  body: unknown,
  options: PostOptions,
): Promise<T> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  // 주소가 없으면 호출을 시도하지 않는다. 도감은 그대로 쓸 수 있다.
  if (!baseUrl) throw new ApiError('unavailable');

  const doFetch: FetchLike = options.fetchImpl ?? fetch;
  let response: Response;

  try {
    response = await doFetch(joinUrl(baseUrl, path), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(options.timeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('timeout');
    }
    throw new ApiError('network');
  }

  if (!response.ok) {
    if (response.status === 429) throw new ApiError('rate_limited');
    const code = await readErrorCode(response);
    throw new ApiError(code);
  }

  return (await response.json()) as T;
}

/** 서버가 준 코드를 읽는다. 읽을 수 없으면 일반 오류로 본다. */
async function readErrorCode(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? 'server_error';
  } catch {
    return 'server_error';
  }
}
