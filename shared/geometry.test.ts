import { isValidBox } from './geometry';

describe('isValidBox', () => {
  it('accepts a normal box', () => {
    expect(isValidBox([100, 200, 600, 800])).toBe(true);
  });

  it('rejects an inverted box', () => {
    // yMax가 yMin보다 작으면 화면에 그릴 수 없다.
    expect(isValidBox([600, 200, 100, 800])).toBe(false);
    expect(isValidBox([100, 800, 600, 200])).toBe(false);
  });

  it('rejects a box with no area', () => {
    expect(isValidBox([100, 200, 100, 800])).toBe(false);
    expect(isValidBox([100, 200, 600, 200])).toBe(false);
  });

  it('rejects coordinates outside the normalized range', () => {
    expect(isValidBox([-1, 200, 600, 800])).toBe(false);
    expect(isValidBox([100, 200, 1001, 800])).toBe(false);
  });

  it('rejects values that are not finite numbers', () => {
    expect(isValidBox([Number.NaN, 200, 600, 800])).toBe(false);
    expect(isValidBox([100, 200, Number.POSITIVE_INFINITY, 800])).toBe(false);
  });
});
