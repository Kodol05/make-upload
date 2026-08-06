import { z } from 'zod';
import { itemIds, locales } from './types.js';

/**
 * 요청과 응답의 런타임 계약.
 *
 * 이 파일은 **Worker만 가져온다.** 프런트가 import하면 Zod가 브라우저 번들에
 * 들어가므로 하지 않는다. Worker가 이미 응답을 검증하고, 예상 밖의 값은 기능별
 * 오류 경계가 처리한다.
 *
 * 응답 스키마는 두 곳에 쓰인다. `z.toJSONSchema()`로 파생한 JSON Schema를 Gemini의
 * `responseSchema`로 넘겨 생성 단계에서 형식을 강제하고, 같은 스키마의 `parse()`로
 * 돌아온 값을 다시 검증한다.
 */

export const localeSchema = z.enum(locales);
export const itemIdSchema = z.enum(itemIds);

export const chatRequestSchema = z.object({
  locale: localeSchema,
  message: z.string().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      }),
    )
    .max(6),
  contextItemId: itemIdSchema.optional(),
  sessionId: z.string().min(1).max(128),
});

export const chatResponseSchema = z.object({
  answer: z.string().min(1).max(1200),
  matchedItemIds: z.array(itemIdSchema).max(5),
  sourceIds: z.array(z.string()).max(8),
  status: z.enum(['answered', 'needs_local_check', 'out_of_scope']),
});

/**
 * 스캔 요청.
 *
 * 이미지를 `multipart/form-data`가 아니라 base64 문자열로 받는다. 무료 Cloudflare
 * Workers의 요청당 CPU가 10ms라 1.5MB를 Worker에서 자바스크립트로 인코딩하면 이
 * 시간을 넘길 수 있다. 브라우저가 네이티브 API로 만들어 보내면 Worker는 받은
 * 문자열을 그대로 Gemini에 넘기기만 하면 된다.
 */
export const scanRequestSchema = z.object({
  locale: localeSchema,
  sessionId: z.string().min(1).max(128),
  image: z.object({
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    /** `data:` 접두사가 없는 순수 base64. */
    data: z.string().min(1),
  }),
});

/**
 * 스캔 결과의 품목 ID. 모델이 못 맞히면 `unknown`이다.
 *
 * `z.union([itemIdSchema, z.literal('unknown')])`으로 쓰면 JSON Schema가
 * `{ anyOf: [..., { const: 'unknown' }] }`가 되는데 Gemini는 `const`를 모른다.
 * 하나의 enum으로 두면 평평하게 나와 그대로 받는다.
 */
export const scanItemIdSchema = z.enum([...itemIds, 'unknown']);

const boxCoordinate = z.number().min(0).max(1000);

export const scanResponseSchema = z.object({
  objects: z
    .array(
      z.object({
        box: z.tuple([boxCoordinate, boxCoordinate, boxCoordinate, boxCoordinate]),
        itemId: scanItemIdSchema,
        label: z.string().min(1).max(80),
        certainty: z.enum(['high', 'medium', 'low']),
        reason: z.string().min(1).max(240),
      }),
    )
    .max(5),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type ScanRequestInput = z.infer<typeof scanRequestSchema>;
export type ChatResponseOutput = z.infer<typeof chatResponseSchema>;
export type ScanResponseOutput = z.infer<typeof scanResponseSchema>;
