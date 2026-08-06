import { countTodos, findTodos, isTodo, localized, todo } from './placeholder';

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
