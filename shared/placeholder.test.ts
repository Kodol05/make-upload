import {
  PLACEHOLDER_LABEL,
  countTodos,
  findTodos,
  isTodo,
  localized,
  resolveText,
  todo,
} from './placeholder';

describe('placeholder', () => {
  it('makes a traceable marker for a missing string', () => {
    expect(todo('clear-pet', 'summary', 'vi')).toBe('__TODO__:clear-pet.summary.vi');
  });

  it('keeps given values and fills the rest', () => {
    const result = localized('clear-pet', 'name', { ko: '투명 페트병' });
    expect(result.ko).toBe('투명 페트병');
    expect(isTodo(result.ko)).toBe(false);
    expect(isTodo(result.en)).toBe(true);
    expect(isTodo(result.zh)).toBe(true);
    expect(isTodo(result.vi)).toBe(true);
  });

  it('never produces an empty string', () => {
    const result = localized('can', 'summary', {});
    for (const value of Object.values(result)) {
      expect(value.trim()).not.toBe('');
    }
  });

  it('finds markers nested in objects and arrays', () => {
    const value = { a: 'done', b: [{ c: todo('can', 'summary', 'en') }] };
    expect(findTodos(value)).toEqual(['__TODO__:can.summary.en']);
    expect(countTodos(value)).toBe(1);
  });

  it('counts nothing when everything is filled', () => {
    expect(countTodos({ a: 'done', b: ['also done'] })).toBe(0);
  });
});

describe('resolveText', () => {
  it('returns the translation when it exists', () => {
    const text = localized('can', 'name', { ko: '캔', vi: 'Lon' });
    expect(resolveText(text, 'vi')).toBe('Lon');
  });

  it('falls back to Korean with a visible marker', () => {
    const text = localized('clear-pet', 'name', { ko: '투명 페트병' });
    // 한국어를 함께 보여 줘야 실제 문안 길이로 화면이 넘치는지 판단할 수 있다.
    expect(resolveText(text, 'vi')).toBe(`투명 페트병 ${PLACEHOLDER_LABEL}`);
  });

  it('shows only the marker when Korean is missing too', () => {
    const text = localized('clear-pet', 'summary', {});
    expect(resolveText(text, 'ko')).toBe(PLACEHOLDER_LABEL);
    expect(resolveText(text, 'vi')).toBe(PLACEHOLDER_LABEL);
  });

  it('never leaks the machine readable marker to the screen', () => {
    const text = localized('clear-pet', 'summary', { ko: '요약' });
    for (const locale of ['ko', 'en', 'zh', 'vi'] as const) {
      expect(resolveText(text, locale)).not.toContain('__TODO__');
    }
  });

  it('keeps the raw marker in the data so the release gate still works', () => {
    const text = localized('clear-pet', 'summary', { ko: '요약' });
    // 화면 표시만 바꾸고 데이터는 그대로다.
    expect(isTodo(text.vi)).toBe(true);
    expect(countTodos(text)).toBe(3);
  });
});
