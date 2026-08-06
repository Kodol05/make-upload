import { catalogItems } from './catalog';
import { faqs } from './faqs';
import { sources } from './sources';
import { categories, itemIds, locales } from './types';

/**
 * 콘텐츠의 *구조*만 검사한다. 완성도는 `content-progress.test.ts`가 본다.
 * 자리 표시도 빈 문자열이 아니므로 박재웅의 검수 전에도 통과한다.
 */
describe('shared content structure', () => {
  it('contains exactly the approved 16 items in the agreed order', () => {
    expect(catalogItems).toHaveLength(16);
    expect(catalogItems.map((item) => item.id)).toEqual([...itemIds]);
  });

  it('contains 20 FAQs with unique ids', () => {
    expect(faqs).toHaveLength(20);
    expect(new Set(faqs.map((faq) => faq.id)).size).toBe(20);
  });

  it('gives every item 3-4 steps', () => {
    for (const item of catalogItems) {
      expect(item.steps.length, item.id).toBeGreaterThanOrEqual(3);
      expect(item.steps.length, item.id).toBeLessThanOrEqual(4);
    }
  });

  it('uses a registered category for every item', () => {
    for (const item of catalogItems) {
      expect(categories, item.id).toContain(item.category);
    }
  });

  it('points every step image at the agreed path', () => {
    for (const item of catalogItems) {
      for (const step of item.steps) {
        expect(step.image, `${item.id}/${step.id}`).toBe(
          `/images/items/${item.id}/${step.id}.webp`,
        );
      }
    }
  });

  it('references only registered source IDs', () => {
    for (const item of catalogItems) {
      expect(item.sourceIds.length, item.id).toBeGreaterThan(0);
      for (const sourceId of item.sourceIds) {
        expect(sources[sourceId], `${item.id} -> ${sourceId}`).toBeDefined();
      }
    }
    for (const faq of faqs) {
      for (const sourceId of faq.sourceIds) {
        expect(sources[sourceId], `${faq.id} -> ${sourceId}`).toBeDefined();
      }
    }
  });

  it('references only registered item IDs from FAQs', () => {
    for (const faq of faqs) {
      for (const itemId of faq.relatedItemIds) {
        expect(itemIds, `${faq.id} -> ${itemId}`).toContain(itemId);
      }
    }
  });

  it('gives every locale a non-empty string', () => {
    for (const item of catalogItems) {
      for (const locale of locales) {
        expect(item.name[locale].trim(), `${item.id}.name.${locale}`).not.toBe('');
        expect(item.summary[locale].trim(), `${item.id}.summary.${locale}`).not.toBe('');
        expect(
          item.commonMistake[locale].trim(),
          `${item.id}.commonMistake.${locale}`,
        ).not.toBe('');
        for (const step of item.steps) {
          expect(step.text[locale].trim(), `${item.id}.${step.id}.text.${locale}`).not.toBe('');
          expect(step.alt[locale].trim(), `${item.id}.${step.id}.alt.${locale}`).not.toBe('');
        }
      }
    }
  });
});
