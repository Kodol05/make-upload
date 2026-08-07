import { ApiError } from '@/lib/api';

/** 긴 변의 최대 길이. 이보다 크면 판별 정확도는 그대로인데 전송만 무거워진다. */
export const MAX_LONG_EDGE = 1280;

/** 이미지 최대 크기. Worker와 같은 값을 쓴다. */
export const MAX_IMAGE_BYTES = 1_500_000;

export const START_QUALITY = 0.82;

/** 더 내리면 재질과 글자가 뭉개져 판별이 어려워진다. */
export const MIN_QUALITY = 0.55;

const QUALITY_STEP = 0.1;

export interface Dimensions {
  width: number;
  height: number;
}

/** 비율을 지키면서 긴 변을 한도 안으로 줄인다. */
export function fitDimensions(width: number, height: number): Dimensions {
  const longEdge = Math.max(width, height);
  if (longEdge <= MAX_LONG_EDGE) return { width, height };

  const ratio = MAX_LONG_EDGE / longEdge;
  return {
    // 한 변이라도 0이 되면 canvas가 그리지 못한다.
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

/** 다음으로 시도할 품질. 바닥까지 내려왔으면 null이다. */
export function nextQuality(current: number): number | null {
  if (current <= MIN_QUALITY) return null;
  return Math.max(MIN_QUALITY, Number((current - QUALITY_STEP).toFixed(2)));
}

/** base64 문자열을 디코딩하지 않고 원본 바이트 수를 어림한다. */
export function estimateBytesFromBase64(base64: string): number {
  if (!base64) return 0;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return (base64.length * 3) / 4 - padding;
}

export interface CompressedImage {
  mimeType: string;
  /** `data:` 접두사가 없는 순수 base64. Gemini의 inlineData에 그대로 넣는다. */
  data: string;
}

/**
 * 브라우저에서 이미지를 읽어 canvas에 그릴 수 있는 형태로 만든다.
 *
 * 읽지 못하는 형식이면 코드를 붙여 던진다. 그냥 두면 화면이 이 예외를
 * ApiError로 알아보지 못해 "일시적으로 사용할 수 없습니다"로 뭉뚱그리고,
 * 사용자는 형식 문제인 줄 모른 채 같은 사진으로 다시 시도하게 된다.
 * 아이폰 카메라의 기본 형식인 HEIC가 여기에 걸린다.
 */
async function loadImage(file: File): Promise<ImageBitmap> {
  try {
    // createImageBitmap은 EXIF 방향을 알아서 적용한다.
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new ApiError('unsupported_type');
  }
}

function toBase64(dataUrl: string): string {
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

/**
 * 사진을 Worker로 보낼 수 있는 크기까지 줄인다.
 *
 * 브라우저가 base64까지 만들어 보내는 이유는 무료 Cloudflare Workers의 요청당 CPU가
 * 10ms이기 때문이다. 1.5MB를 Worker에서 자바스크립트로 인코딩하면 이 시간을 넘길 수
 * 있다. 브라우저는 네이티브 API로 처리하므로 부담이 없고 Worker는 받은 문자열을
 * 그대로 Gemini에 넘기기만 하면 된다.
 *
 * 품질을 바닥까지 내려도 한도를 못 맞추면 `null`을 돌려준다. 화면은 더 작은 사진을
 * 고르도록 안내한다.
 */
export async function compressImage(file: File): Promise<CompressedImage | null> {
  const bitmap = await loadImage(file);
  const { width, height } = fitDimensions(bitmap.width, bitmap.height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality: number | null = START_QUALITY;
  while (quality !== null) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const data = toBase64(dataUrl);
    if (estimateBytesFromBase64(data) <= MAX_IMAGE_BYTES) {
      return { mimeType: 'image/jpeg', data };
    }
    quality = nextQuality(quality);
  }

  return null;
}
