import { isValidBox, type Box } from '../../shared/geometry';
import { scanRequestSchema, scanResponseSchema } from '../../shared/schemas';
import { itemIds, type Locale, type ScanObject, type ScanResponse } from '../../shared/types';
import type { Env } from './env';
import { SCAN_MODEL, callGemini, type FetchLike } from './gemini';
import { errorResponse, jsonResponse } from './security';

const TIMEOUT_MS = 15_000;
const MAX_OBJECTS = 5;
const MAX_IMAGE_BYTES = 1_500_000;

/** docs/AI_PROCESS_AND_PROMPTS.md의 AI Sort Scan 프롬프트를 그대로 옮겼다. */
const SYSTEM_PROMPT = `Analyze only discardable waste objects in the provided image for the K-SORT Korean recycling guide.

APPROVED_ITEM_IDS contains the only item IDs you may return. Detect at most five prominent waste objects. Ignore people, faces, screens, documents, addresses, names, and all other personal information. Do not identify brands.

For each detected waste object:
1. Return a tight 2D bounding box as [yMin, xMin, yMax, xMax], normalized from 0 to 1000.
2. Map it to one APPROVED_ITEM_ID. If no approved item is a safe match, return "unknown".
3. Write a short label and reason in REQUEST_LOCALE.
4. Use certainty "high" only for an obvious visible material and object. Use "medium" when user confirmation is needed. Use "low" when the image is unclear.
5. Do not infer cleanliness, hidden contents, or material that cannot be seen.`;

/** base64를 디코딩하지 않고 원본 바이트 수를 어림한다. */
function estimateBytes(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return (base64.length * 3) / 4 - padding;
}

/**
 * 모델이 돌려준 결과를 화면에 그릴 수 있는 형태로 정리한다.
 *
 * 그릴 수 없는 좌표는 버리고, 등록되지 않은 품목은 버리는 대신 `unknown`으로 바꾼다.
 * 무엇인지 못 맞혀도 어디 있는지는 알려 주는 편이 사용자에게 낫다.
 */
export function sanitiseObjects(objects: ScanObject[]): ScanObject[] {
  const known = new Set<string>(itemIds);

  return objects
    .filter((object) => isValidBox(object.box as Box))
    .slice(0, MAX_OBJECTS)
    .map((object) => ({
      ...object,
      itemId: known.has(object.itemId) ? object.itemId : ('unknown' as const),
    }));
}

function buildInput(locale: Locale): string {
  return [
    `REQUEST_LOCALE: ${locale}`,
    `APPROVED_ITEM_IDS: ${JSON.stringify(itemIds)}`,
  ].join('\n\n');
}

/**
 * `POST /api/scan`.
 *
 * 사진은 Gemini로 전송되며 여기서 저장하거나 로그에 남기지 않는다.
 * 오류 응답에도 이미지 데이터를 담지 않는다.
 */
export async function handleScan(
  request: Request,
  env: Env,
  origin: string,
  fetchImpl?: FetchLike,
): Promise<Response> {
  let parsed;
  try {
    parsed = scanRequestSchema.safeParse(await request.json());
  } catch {
    return errorResponse('bad_request', 400, origin);
  }

  if (!parsed.success) {
    // 지원하지 않는 형식인지 아닌지를 구분해야 화면이 알맞게 안내할 수 있다.
    const isTypeIssue = parsed.error.issues.some((issue) =>
      issue.path.join('.') === 'image.mimeType',
    );
    return errorResponse(isTypeIssue ? 'unsupported_type' : 'bad_request', 400, origin);
  }

  const { locale, image } = parsed.data;

  if (estimateBytes(image.data) > MAX_IMAGE_BYTES) {
    return errorResponse('image_too_large', 413, origin);
  }

  try {
    const result = await callGemini({
      apiKey: env.GEMINI_API_KEY as string,
      model: SCAN_MODEL,
      systemInstruction: SYSTEM_PROMPT,
      parts: [
        { text: buildInput(locale) },
        { inlineData: { mimeType: image.mimeType, data: image.data } },
      ],
      schema: scanResponseSchema,
      timeoutMs: TIMEOUT_MS,
      fetchImpl,
    });

    const cleaned: ScanResponse = { objects: sanitiseObjects(result.objects) };
    return jsonResponse(cleaned, origin);
  } catch {
    // 모델 오류에는 프롬프트가 섞일 수 있으므로 그대로 내보내지 않는다.
    return errorResponse('upstream_failed', 502, origin);
  }
}
