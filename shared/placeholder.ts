import type { Locale, LocalizedText } from './types';

/**
 * 아직 검수되지 않은 문안의 자리를 표시하는 접두사.
 *
 * 화면에 그대로 보이므로 빠진 번역이 눈에 띄고, `git grep __TODO__`로 남은 항목을
 * 한 번에 찾을 수 있다. 배포 전에는 `shared/content-progress.test.ts`의 릴리스
 * 게이트가 하나도 남지 않았음을 확인한다.
 */
export const TODO = '__TODO__';

/** 아직 채우지 못한 문안의 자리를 만든다. */
export function todo(itemId: string, field: string, locale: Locale): string {
  return `${TODO}:${itemId}.${field}.${locale}`;
}

/** 자리 표시 문자열인지 확인한다. */
export function isTodo(value: string): boolean {
  return value.startsWith(TODO);
}

/** 주어진 언어만 채우고 나머지 언어는 자리 표시로 메운다. */
export function localized(
  itemId: string,
  field: string,
  values: Partial<LocalizedText>,
): LocalizedText {
  return {
    ko: values.ko ?? todo(itemId, field, 'ko'),
    en: values.en ?? todo(itemId, field, 'en'),
    zh: values.zh ?? todo(itemId, field, 'zh'),
    vi: values.vi ?? todo(itemId, field, 'vi'),
  };
}

/** 중첩된 값 안에 남아 있는 자리 표시를 모두 찾는다. */
export function findTodos(value: unknown): string[] {
  if (typeof value === 'string') return isTodo(value) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(findTodos);
  if (value && typeof value === 'object') return Object.values(value).flatMap(findTodos);
  return [];
}

/** 남아 있는 자리 표시의 개수를 센다. */
export function countTodos(value: unknown): number {
  return findTodos(value).length;
}
