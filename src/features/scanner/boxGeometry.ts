import type { Box } from '@shared/geometry';

export interface CssBox {
  top: string;
  left: string;
  width: string;
  height: string;
}

/** 소수점이 길어지면 스타일 문자열만 지저분해진다. */
function percent(value: number): string {
  return `${Number((value / 10).toFixed(2))}%`;
}

/** 모델 좌표를 사진 위에 겹칠 수 있도록 백분율로 바꾼다. */
export function toCssBox(box: Box): CssBox {
  const [yMin, xMin, yMax, xMax] = box;
  return {
    top: percent(yMin),
    left: percent(xMin),
    width: percent(xMax - xMin),
    height: percent(yMax - yMin),
  };
}
