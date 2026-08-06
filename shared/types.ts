export const locales = ['ko', 'en', 'zh', 'vi'] as const;
export type Locale = (typeof locales)[number];

/** 사용자에게 보이는 모든 문자열은 네 언어 값을 갖는다. */
export type LocalizedText = Record<Locale, string>;

export const categories = ['recyclable', 'food', 'general', 'special'] as const;
export type Category = (typeof categories)[number];

/** 도감 품목 16종. 설계 문서에서 고정했으며 임의로 늘리지 않는다. */
export const itemIds = [
  'clear-pet',
  'delivery-container',
  'cup-noodle',
  'disposable-cup',
  'vinyl',
  'can',
  'glass-bottle',
  'paper-box',
  'food-waste',
  'bones-shells',
  'battery',
  'broken-glass',
  'clothing',
  'small-electronics',
  'fluorescent-lamp',
  'styrofoam',
] as const;
export type ItemId = (typeof itemIds)[number];

export interface CatalogStep {
  id: string;
  text: LocalizedText;
}

export interface CatalogItem {
  id: ItemId;
  category: Category;
  name: LocalizedText;
  /** 검색용 별칭. 언어별로 비어 있어도 된다. */
  aliases: Record<Locale, string[]>;
  summary: LocalizedText;
  /**
   * `/images/items/<itemId>.webp`. 품목당 한 장이며 도감과 스캔 선택 목록이 함께 쓴다.
   * 파일이 없어도 화면은 온전히 동작해야 한다.
   */
  image: string;
  imageAlt: LocalizedText;
  steps: CatalogStep[];
  commonMistake: LocalizedText;
  /** 지역마다 배출 방식이 달라질 수 있으면 true. 화면에 확인 안내를 띄운다. */
  needsLocalCheck: boolean;
  sourceIds: string[];
}

export interface Faq {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  relatedItemIds: ItemId[];
  sourceIds: string[];
}

export interface Source {
  title: LocalizedText;
  /** 박재웅이 직접 열어 확인한 주소만 채운다. 미확인 상태는 빈 문자열로 둔다. */
  url: string;
}

export interface GameResult {
  score: number;
  learnedItemIds: ItemId[];
}

export interface ChatRequest {
  locale: Locale;
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  contextItemId?: ItemId;
  sessionId: string;
}

export interface ChatResponse {
  answer: string;
  matchedItemIds: ItemId[];
  sourceIds: string[];
  status: 'answered' | 'needs_local_check' | 'out_of_scope';
}

export interface ScanObject {
  /** [yMin, xMin, yMax, xMax], 0~1000으로 정규화된 좌표. */
  box: [number, number, number, number];
  itemId: ItemId | 'unknown';
  label: string;
  certainty: 'high' | 'medium' | 'low';
  reason: string;
}

export interface ScanResponse {
  objects: ScanObject[];
}
