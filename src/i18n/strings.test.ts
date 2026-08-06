import { locales } from '@shared/types';
import { ui } from './strings';

/** 사전을 훑어 네 언어 값을 담은 잎 노드를 경로와 함께 모은다. */
function collectLeaves(
  node: unknown,
  path: string[] = [],
): Array<[string, Record<string, unknown>]> {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return [];
  const entries = Object.entries(node as Record<string, unknown>);
  const isLeaf = entries.length > 0 && entries.every(([, value]) => typeof value === 'string');
  if (isLeaf) return [[path.join('.'), node as Record<string, unknown>]];
  return entries.flatMap(([key, value]) => collectLeaves(value, [...path, key]));
}

describe('ui strings', () => {
  it('gives every entry all four locales', () => {
    const leaves = collectLeaves(ui);
    expect(leaves.length).toBeGreaterThan(0);

    for (const [path, value] of leaves) {
      for (const locale of locales) {
        expect(typeof value[locale], `${path}.${locale}`).toBe('string');
        expect(String(value[locale]).trim(), `${path}.${locale}`).not.toBe('');
      }
    }
  });

  it('has no entry with an unexpected key', () => {
    const allowed = new Set<string>(locales);
    for (const [path, value] of collectLeaves(ui)) {
      for (const key of Object.keys(value)) {
        expect(allowed.has(key), `${path}.${key}`).toBe(true);
      }
    }
  });

  it('covers the header navigation', () => {
    expect(collectLeaves(ui).map(([path]) => path)).toEqual(
      expect.arrayContaining([
        'nav.learn',
        'nav.scan',
        'nav.catalog',
        'nav.chat',
        'nav.game',
      ]),
    );
  });
});
