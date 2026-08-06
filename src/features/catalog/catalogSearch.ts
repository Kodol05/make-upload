import { catalogItems } from '@shared/catalog';
import { isTodo } from '@shared/placeholder';
import type { CatalogItem, Category, Locale } from '@shared/types';

export type CategoryFilter = Category | 'all';

/**
 * 검색 대상이 되는 말들을 모은다.
 *
 * 고른 언어의 이름과 별칭에 더해 **한국어도 항상 함께 찾는다.** 수거함과 봉투에는
 * 한국어가 적혀 있어서, 유학생이 그 글자를 그대로 옮겨 적고 검색하는 일이 잦기
 * 때문이다. 번역이 아직 없는 이름은 화면에도 한국어가 보이므로 이때도 같은 규칙으로
 * 걸린다. 자리 표시 문자열 자체가 검색어에 걸리는 일은 없어야 한다.
 */
function searchableTerms(item: CatalogItem, locale: Locale): string[] {
  const candidates = [
    item.name[locale],
    item.name.ko,
    ...item.aliases[locale],
    ...item.aliases.ko,
  ];
  return candidates.filter((term) => !isTodo(term));
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
