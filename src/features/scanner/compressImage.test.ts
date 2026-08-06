import {
  MAX_IMAGE_BYTES,
  MAX_LONG_EDGE,
  MIN_QUALITY,
  START_QUALITY,
  estimateBytesFromBase64,
  fitDimensions,
  nextQuality,
} from './compressImage';

/**
 * canvas는 jsdom에 없다. 버그가 숨는 곳은 canvas 호출이 아니라 계산이므로
 * 크기와 품질 계산을 순수 함수로 뽑아 촘촘히 확인한다.
 */
describe('fitDimensions', () => {
  it('leaves a small image alone', () => {
    expect(fitDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('shrinks a wide image to the long edge', () => {
    expect(fitDimensions(2560, 1440)).toEqual({ width: 1280, height: 720 });
  });

  it('shrinks a tall image to the long edge', () => {
    expect(fitDimensions(1440, 2560)).toEqual({ width: 720, height: 1280 });
  });

  it('keeps a square image square', () => {
    expect(fitDimensions(2000, 2000)).toEqual({ width: 1280, height: 1280 });
  });

  it('never returns a zero side', () => {
    // 아주 길쭉한 사진이라도 한 변이 0이 되면 canvas가 그리지 못한다.
    const result = fitDimensions(4000, 3);
    expect(result.width).toBe(MAX_LONG_EDGE);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });

  it('rounds to whole pixels', () => {
    const result = fitDimensions(1333, 999);
    expect(Number.isInteger(result.width)).toBe(true);
    expect(Number.isInteger(result.height)).toBe(true);
  });
});

describe('nextQuality', () => {
  it('steps down by a tenth', () => {
    expect(nextQuality(START_QUALITY)).toBeCloseTo(0.72, 5);
  });

  it('stops at the lowest quality we accept', () => {
    // 더 내리면 글자와 재질이 뭉개져 판별이 어려워진다.
    expect(nextQuality(0.6)).toBe(MIN_QUALITY);
    expect(nextQuality(MIN_QUALITY)).toBeNull();
  });

  it('never goes below the floor', () => {
    let quality: number | null = START_QUALITY;
    const seen: number[] = [];
    while (quality !== null) {
      seen.push(quality);
      quality = nextQuality(quality);
    }
    expect(Math.min(...seen)).toBe(MIN_QUALITY);
    expect(seen.length).toBeLessThan(10);
  });
});

describe('estimateBytesFromBase64', () => {
  it('estimates the decoded size without decoding', () => {
    // base64는 3바이트를 4글자로 담는다.
    expect(estimateBytesFromBase64('a'.repeat(4))).toBe(3);
    expect(estimateBytesFromBase64('a'.repeat(400))).toBe(300);
  });

  it('accounts for padding', () => {
    expect(estimateBytesFromBase64('abc=')).toBe(2);
    expect(estimateBytesFromBase64('ab==')).toBe(1);
  });

  it('treats an empty string as zero', () => {
    expect(estimateBytesFromBase64('')).toBe(0);
  });

  it('knows when an image is over the limit', () => {
    const tooBig = 'a'.repeat(Math.ceil((MAX_IMAGE_BYTES + 1000) / 3) * 4);
    expect(estimateBytesFromBase64(tooBig)).toBeGreaterThan(MAX_IMAGE_BYTES);
  });
});
