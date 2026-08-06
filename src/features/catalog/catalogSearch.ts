import { catalogItems } from '@shared/catalog';
import { isTodo } from '@shared/placeholder';
import type { CatalogItem, Category, Locale } from '@shared/types';

export type CategoryFilter = Category | 'all';

/**
 * 검색 대상이 되는 말들을 모은다.
 *
 * 아직 번역되지 않은 이름은 화면에도 한국어가 보이므로, 보이는 대로 검색되도록
 * 한국어 이름으로 넘어간다. 자리 표시 문자열 자체가 검색어에 걸리는 일은 없어야 한다.
 */
function searchableTerms(item: CatalogItem, locale: Locale): string[] {
  const translated = item.name[locale];
  const name = isTodo(translated) ? item.name.ko : translated;
  const names = isTodo(name) ? [] : [name];
  return [...names, ...item.aliases[locale]];
}

/** 검색어와 분류에 맞는 품목을 고른다. 도감에 정해 둔 순서를 유지한다. */
export function findCatalogItems(
  query: string,
  category: CategoryFilter,
  locale: Locale,
): CatalogItem[] {
  const needle = query.trim().toLowerCase();

  return catalogItems.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (!needle) return true;
    return searchableTerms(item, locale).some((term) =>
      term.toLowerCase().includes(needle),
    );
  });
}
