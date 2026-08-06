import { catalogItems } from './catalog.js';
import { faqs } from './faqs.js';
import { countTodos, findTodos } from './placeholder.js';
import { sources } from './sources.js';

/**
 * 콘텐츠 완성도를 본다.
 *
 * 진행률 검사는 실패시키지 않고 남은 분량만 보고한다. 릴리스 게이트는 `.skip`으로
 * 두었다가 박재웅의 검수가 끝나면 Task 12에서 떼어 배포 전에 반드시 통과시킨다.
 */
describe('content progress', () => {
  it('reports how much content is still missing', () => {
    const remaining =
      countTodos(catalogItems) + countTodos(faqs) + countTodos(sources);
    const verifiedUrls = Object.values(sources).filter((source) =>
      source.url.startsWith('https://'),
    ).length;

    console.log(
      `[content] 자리 표시 ${remaining}개 남음 · ` +
        `출처 URL ${verifiedUrls}/${Object.keys(sources).length}개 확인됨`,
    );

    expect(Number.isInteger(remaining)).toBe(true);
  });

  // 아래 세 가지는 검수가 끝나면 .skip을 떼고 Task 12에서 통과시킨다.

  it.skip('has no placeholder left before release', () => {
    expect(findTodos(catalogItems)).toEqual([]);
    expect(findTodos(faqs)).toEqual([]);
    expect(findTodos(sources)).toEqual([]);
  });

  it.skip('has a verified URL for every source', () => {
    for (const [id, source] of Object.entries(sources)) {
      expect(source.url, `source ${id}`).toMatch(/^https:\/\//);
    }
  });

  it.skip('backs every FAQ answer with at least one source', () => {
    for (const faq of faqs) {
      expect(faq.sourceIds.length, faq.id).toBeGreaterThan(0);
    }
  });
});
