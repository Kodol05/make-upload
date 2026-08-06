import { catalogItems } from '@shared/catalog';
import { findCatalogItems } from './catalogSearch';

describe('findCatalogItems', () => {
  it('returns everything when the query is empty', () => {
    expect(findCatalogItems('', 'all', 'ko')).toHaveLength(catalogItems.length);
  });

  it('keeps the catalog order', () => {
    const ids = findCatalogItems('', 'all', 'ko').map((item) => item.id);
    expect(ids).toEqual(catalogItems.map((item) => item.id));
  });

  it('finds an item by its Korean name', () => {
    const ids = findCatalogItems('페트병', 'all', 'ko').map((item) => item.id);
    expect(ids).toContain('clear-pet');
  });

  it('finds an item by a Korean alias', () => {
    // '생수병'은 이름에 없고 별칭에만 있다.
    const ids = findCatalogItems('생수병', 'all', 'ko').map((item) => item.id);
    expect(ids).toEqual(['clear-pet']);
  });

  it('matches part of a word', () => {
    const ids = findCatalogItems('라면', 'all', 'ko').map((item) => item.id);
    expect(ids).toContain('cup-noodle');
  });

  it('ignores surrounding spaces and letter case', () => {
    const ids = findCatalogItems('  페트병 ', 'all', 'ko').map((item) => item.id);
    expect(ids).toContain('clear-pet');
  });

  it('filters by category', () => {
    const special = findCatalogItems('', 'special', 'ko');
    expect(special.length).toBeGreaterThan(0);
    for (const item of special) expect(item.category).toBe('special');
  });

  it('applies the query and the category together', () => {
    // 캔은 재활용이므로 특수 분류에서는 걸리지 않는다.
    expect(findCatalogItems('캔', 'special', 'ko')).toHaveLength(0);
    expect(findCatalogItems('캔', 'recyclable', 'ko').map((i) => i.id)).toContain('can');
  });

  it('returns nothing when the query matches no item', () => {
    expect(findCatalogItems('존재하지않는물건', 'all', 'ko')).toEqual([]);
  });

  it('falls back to the Korean name while a translation is missing', () => {
    // 베트남어 이름이 아직 없으면 화면에도 한국어가 보인다. 보이는 대로 검색돼야 한다.
    const ids = findCatalogItems('캔', 'all', 'vi').map((i) => i.id);
    expect(ids).toContain('can');
  });

  it('never matches the placeholder marker itself', () => {
    // 자리 표시가 남은 동안 '__TODO__'로 검색하면 전 품목이 걸리면 안 된다.
    expect(findCatalogItems('__TODO__', 'all', 'ko')).toEqual([]);
  });
});
