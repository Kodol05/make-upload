import { z } from 'zod';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * 무료 한도는 모델마다 따로 잡힌다. 챗봇과 스캔을 다른 모델에 두면 버킷이 갈라져
 * 쓸 수 있는 총량이 늘어난다. 한 모델에 몰면 리허설 도중 바닥난다.
 *
 * - `gemini-3.5-flash-lite`: 15 RPM · 500 RPD
 * - `gemini-3.6-flash`: 5 RPM · 20 RPD
 *
 * 스캔이 훨씬 빡빡하므로, Lite가 이미지 입력을 받는지 확인되면 스캔도 Lite로 옮긴다.
 */
export const CHAT_MODEL = 'gemini-3.5-flash-lite';
export const SCAN_MODEL = 'gemini-3.6-flash';

function endpointFor(model: string): string {
  return `${BASE_URL}/${model}:generateContent`;
}

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

/**
 * callGemini가 실제로 쓰는 fetch의 모양.
 *
 * `typeof fetch`를 그대로 쓰면 런타임마다 다른 넓은 시그니처에 묶여 테스트에서
 * 가짜를 만들기 번거롭다. 우리가 부르는 형태만 적는다.
 */
export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** Gemini가 받는 OpenAPI 부분집합에 없는 키. 남겨 두면 400을 돌려준다. */
const UNSUPPORTED_KEYS = new Set([
  '$schema',
  '$id',
  '$ref',
  '$defs',
  'definitions',
  'additionalProperties',
]);

/**
 * Zod가 만든 JSON Schema를 Gemini가 이해하는 형태로 다듬는다.
 *
 * Zod 4는 2020-12 초안을 내놓지만 Gemini는 OpenAPI 부분집합만 받는다.
 * 확인한 차이는 두 가지다.
 *
 * - `$schema`와 `additionalProperties`가 들어간다.
 * - 튜플이 `prefixItems`로 나온다. Gemini는 이 키를 모른다.
 *
 * 튜플은 길이가 고정된 배열로 바꾼다. 첫 원소의 모양만 남기므로 원소마다 타입이
 * 다른 튜플이면 정보가 줄지만, Gemini가 애초에 그런 형태를 표현하지 못한다.
 * 여기서 넘기는 스키마는 모델에게 주는 힌트이고, 돌아온 값은 같은 Zod 스키마로
 * 다시 검증하므로 계약이 느슨해지지는 않는다.
 */
export function toGeminiSchema(schema: z.ZodType<unknown>): Record<string, unknown> {
  return adapt(z.toJSONSchema(schema)) as Record<string, unknown>;
}

function adapt(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(adapt);
  if (!node || typeof node !== 'object') return node;

  const source = node as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (UNSUPPORTED_KEYS.has(key) || key === 'prefixItems') continue;
    out[key] = adapt(value);
  }

  const prefixItems = source.prefixItems;
  if (Array.isArray(prefixItems) && prefixItems.length > 0) {
    out.items = adapt(prefixItems[0]);
    out.minItems = prefixItems.length;
    out.maxItems = prefixItems.length;
  }

  // Gemini는 const를 모른다. 값이 하나뿐인 enum으로 바꾼다.
  if ('const' in source) {
    delete out.const;
    out.enum = [source.const];
    out.type ??= typeof source.const;
  }

  return out;
}

/**
 * 구조화된 JSON 응답을 요구하고 같은 스키마로 검증해 돌려준다.
 *
 * 챗봇과 스캐너가 이 함수를 함께 쓴다. 이미지는 `parts`에 `inlineData`로 담는다.
 * 프롬프트와 요청 본문, 모델 응답 본문은 로그에 남기지 않는다.
 */
export async function callGemini<T>(opts: {
  apiKey: string;
  model: string;
  systemInstruction: string;
  parts: GeminiPart[];
  schema: z.ZodType<T>;
  timeoutMs: number;
  /** 테스트에서 갈아 끼우기 위한 자리. 운영에서는 전역 fetch를 쓴다. */
  fetchImpl?: FetchLike;
}): Promise<T> {
  const doFetch: FetchLike = opts.fetchImpl ?? fetch;

  const response = await doFetch(endpointFor(opts.model), {
    method: 'POST',
    headers: {
      // 키를 URL에 넣으면 로그와 referrer에 남는다. 헤더로만 보낸다.
      'x-goog-api-key': opts.apiKey,
      'content-type': 'application/json',
    },
    signal: AbortSignal.timeout(opts.timeoutMs),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.systemInstruction }] },
      contents: [{ role: 'user', parts: opts.parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: toGeminiSchema(opts.schema),
      },
    }),
  });

  if (!response.ok) throw new Error(`gemini_http_${response.status}`);

  const body = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('gemini_empty_response');

  return opts.schema.parse(JSON.parse(text));
}
