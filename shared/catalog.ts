import { localized } from './placeholder';
import type { CatalogItem, CatalogStep, ItemId } from './types';

/**
 * 품목별 처리 단계를 만든다.
 *
 * 단계 개수와 이미지 경로는 구조이므로 지금 정하고, 실제 행동 설명과 대체 텍스트는
 * 박재웅의 사실 검수 뒤에 채운다. 검수 결과 단계 수가 달라지면 이 숫자를 조정한다.
 */
function steps(itemId: ItemId, count: 3 | 4): CatalogStep[] {
  return Array.from({ length: count }, (_, index) => {
    const id = String(index + 1).padStart(2, '0');
    return {
      id,
      image: `/images/items/${itemId}/${id}.webp`,
      text: localized(itemId, `step${id}`, {}),
      alt: localized(itemId, `step${id}alt`, {}),
    };
  });
}

/** 별칭이 아직 없는 언어는 빈 배열로 둔다. 검색은 이름으로도 동작한다. */
function aliases(ko: string[]): CatalogItem['aliases'] {
  return { ko, en: [], zh: [], vi: [] };
}

/**
 * 도감 16종.
 *
 * `id`와 순서는 `types.ts`의 `itemIds`와 정확히 일치해야 한다.
 * 한국어 이름과 분류는 `docs/CONTENT_CHECKLIST.md`에서 팀이 이미 정한 값이다.
 * 요약·단계 설명·흔한 실수는 실제 배출 방법이므로 검수 전까지 자리 표시로 둔다.
 */
export const catalogItems: CatalogItem[] = [
  {
    id: 'clear-pet',
    category: 'recyclable',
    name: localized('clear-pet', 'name', { ko: '투명 페트병' }),
    aliases: aliases(['페트병', '생수병', '음료수병']),
    summary: localized('clear-pet', 'summary', {}),
    steps: steps('clear-pet', 4),
    commonMistake: localized('clear-pet', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'delivery-container',
    category: 'recyclable',
    name: localized('delivery-container', 'name', { ko: '배달용기' }),
    aliases: aliases(['배달 용기', '플라스틱 용기']),
    summary: localized('delivery-container', 'summary', {}),
    steps: steps('delivery-container', 3),
    commonMistake: localized('delivery-container', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'cup-noodle',
    category: 'recyclable',
    name: localized('cup-noodle', 'name', { ko: '컵라면 용기' }),
    aliases: aliases(['컵라면', '사발면']),
    summary: localized('cup-noodle', 'summary', {}),
    steps: steps('cup-noodle', 3),
    commonMistake: localized('cup-noodle', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'disposable-cup',
    category: 'recyclable',
    name: localized('disposable-cup', 'name', { ko: '일회용 컵·뚜껑·빨대' }),
    aliases: aliases(['일회용컵', '테이크아웃컵', '빨대']),
    summary: localized('disposable-cup', 'summary', {}),
    steps: steps('disposable-cup', 3),
    commonMistake: localized('disposable-cup', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'vinyl',
    category: 'recyclable',
    name: localized('vinyl', 'name', { ko: '비닐' }),
    aliases: aliases(['비닐봉투', '비닐봉지', '봉지']),
    summary: localized('vinyl', 'summary', {}),
    steps: steps('vinyl', 3),
    commonMistake: localized('vinyl', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'can',
    category: 'recyclable',
    name: localized('can', 'name', { ko: '캔' }),
    aliases: aliases(['알루미늄캔', '음료캔', '통조림']),
    summary: localized('can', 'summary', {}),
    steps: steps('can', 3),
    commonMistake: localized('can', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'glass-bottle',
    category: 'recyclable',
    name: localized('glass-bottle', 'name', { ko: '유리병' }),
    aliases: aliases(['병', '소주병', '맥주병']),
    summary: localized('glass-bottle', 'summary', {}),
    steps: steps('glass-bottle', 4),
    commonMistake: localized('glass-bottle', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'paper-box',
    category: 'recyclable',
    name: localized('paper-box', 'name', { ko: '종이·상자' }),
    aliases: aliases(['박스', '택배상자', '종이']),
    summary: localized('paper-box', 'summary', {}),
    steps: steps('paper-box', 3),
    commonMistake: localized('paper-box', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
  {
    id: 'food-waste',
    category: 'food',
    name: localized('food-waste', 'name', { ko: '음식물' }),
    aliases: aliases(['음식물쓰레기', '잔반']),
    summary: localized('food-waste', 'summary', {}),
    steps: steps('food-waste', 3),
    commonMistake: localized('food-waste', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-food-waste'],
  },
  {
    id: 'bones-shells',
    category: 'general',
    name: localized('bones-shells', 'name', { ko: '뼈·껍데기' }),
    aliases: aliases(['뼈', '껍데기', '조개껍데기']),
    summary: localized('bones-shells', 'summary', {}),
    steps: steps('bones-shells', 3),
    commonMistake: localized('bones-shells', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-general-waste', 'me-food-waste'],
  },
  {
    id: 'battery',
    category: 'special',
    name: localized('battery', 'name', { ko: '폐건전지' }),
    aliases: aliases(['건전지', '배터리']),
    summary: localized('battery', 'summary', {}),
    steps: steps('battery', 3),
    commonMistake: localized('battery', 'commonMistake', {}),
    needsLocalCheck: true,
    sourceIds: ['keco-special-waste', 'local-government'],
  },
  {
    id: 'broken-glass',
    category: 'general',
    name: localized('broken-glass', 'name', { ko: '깨진 유리' }),
    aliases: aliases(['유리조각', '깨진유리']),
    summary: localized('broken-glass', 'summary', {}),
    steps: steps('broken-glass', 3),
    commonMistake: localized('broken-glass', 'commonMistake', {}),
    needsLocalCheck: true,
    sourceIds: ['me-general-waste', 'local-government'],
  },
  {
    id: 'clothing',
    category: 'special',
    name: localized('clothing', 'name', { ko: '의류' }),
    aliases: aliases(['옷', '헌옷']),
    summary: localized('clothing', 'summary', {}),
    steps: steps('clothing', 3),
    commonMistake: localized('clothing', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['keco-special-waste'],
  },
  {
    id: 'small-electronics',
    category: 'special',
    name: localized('small-electronics', 'name', { ko: '소형가전' }),
    aliases: aliases(['소형 가전', '드라이기', '전자제품']),
    summary: localized('small-electronics', 'summary', {}),
    steps: steps('small-electronics', 3),
    commonMistake: localized('small-electronics', 'commonMistake', {}),
    needsLocalCheck: true,
    sourceIds: ['keco-special-waste', 'local-government'],
  },
  {
    id: 'fluorescent-lamp',
    category: 'special',
    name: localized('fluorescent-lamp', 'name', { ko: '형광등' }),
    aliases: aliases(['형광등', '전구']),
    summary: localized('fluorescent-lamp', 'summary', {}),
    steps: steps('fluorescent-lamp', 3),
    commonMistake: localized('fluorescent-lamp', 'commonMistake', {}),
    needsLocalCheck: true,
    sourceIds: ['keco-special-waste', 'local-government'],
  },
  {
    id: 'styrofoam',
    category: 'recyclable',
    name: localized('styrofoam', 'name', { ko: '스티로폼' }),
    aliases: aliases(['스티로폼', '아이스박스', '포장재']),
    summary: localized('styrofoam', 'summary', {}),
    steps: steps('styrofoam', 3),
    commonMistake: localized('styrofoam', 'commonMistake', {}),
    needsLocalCheck: false,
    sourceIds: ['me-recyclable'],
  },
];
