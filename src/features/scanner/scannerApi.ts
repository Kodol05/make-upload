import { postJson } from '@/lib/api';
import type { Locale, ScanResponse } from '@shared/types';
import type { CompressedImage } from './compressImage';

const TIMEOUT_MS = 18_000;

/** 줄인 사진을 보내 판별을 요청한다. 실패는 ApiError의 코드로 전달된다. */
export function scanImage(
  image: CompressedImage,
  locale: Locale,
  sessionId: string,
): Promise<ScanResponse> {
  return postJson<ScanResponse>(
    '/api/scan',
    { locale, sessionId, image },
    { timeoutMs: TIMEOUT_MS },
  );
}
