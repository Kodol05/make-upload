/** Gemini가 돌려주는 좌표. `[yMin, xMin, yMax, xMax]`를 0~1000으로 정규화한 값이다. */
export type Box = [number, number, number, number];

export const MAX_COORDINATE = 1000;

/**
 * 화면에 그릴 수 있는 좌표인지 본다.
 *
 * 모델이 뒤집힌 좌표나 범위 밖 값을 돌려줄 수 있다. Worker가 먼저 걸러 내고
 * 화면도 같은 기준으로 판단할 수 있도록 여기에 둔다.
 */
export function isValidBox(box: Box): boolean {
  if (!box.every((value) => Number.isFinite(value))) return false;
  if (box.some((value) => value < 0 || value > MAX_COORDINATE)) return false;

  const [yMin, xMin, yMax, xMax] = box;
  return yMax > yMin && xMax > xMin;
}
