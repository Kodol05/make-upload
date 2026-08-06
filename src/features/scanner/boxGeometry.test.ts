import { toCssBox } from './boxGeometry';

describe('toCssBox', () => {
  it('turns model coordinates into CSS percentages', () => {
    // Gemini는 [yMin, xMin, yMax, xMax]를 0~1000으로 정규화해 돌려준다.
    expect(toCssBox([100, 200, 600, 800])).toEqual({
      top: '10%',
      left: '20%',
      width: '60%',
      height: '50%',
    });
  });

  it('handles a box that fills the image', () => {
    expect(toCssBox([0, 0, 1000, 1000])).toEqual({
      top: '0%',
      left: '0%',
      width: '100%',
      height: '100%',
    });
  });

  it('keeps a small box small', () => {
    expect(toCssBox([500, 500, 550, 550])).toEqual({
      top: '50%',
      left: '50%',
      width: '5%',
      height: '5%',
    });
  });

  it('rounds so the style string stays short', () => {
    const box = toCssBox([333, 333, 666, 666]);
    expect(box.top).toBe('33.3%');
    expect(box.width).toBe('33.3%');
  });
});
