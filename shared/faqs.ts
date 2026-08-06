import { localized } from './placeholder.js';
import type { Faq, ItemId } from './types.js';

/**
 * FAQ 20개의 주제와 연결 품목.
 *
 * 유학생이 실제로 헷갈리는 지점을 16종 도감이 모두 한 번 이상 다뤄지도록 배치했다.
 * 질문과 답변 문안은 실제 배출 방법이므로 박재웅의 검수 뒤에 채운다.
 * 답변을 뒷받침하는 출처는 문안이 확정될 때 함께 지정한다.
 */
const topics: Array<{ id: string; relatedItemIds: ItemId[] }> = [
  { id: 'faq-plastic-cap', relatedItemIds: ['clear-pet', 'glass-bottle'] },
  { id: 'faq-pet-label', relatedItemIds: ['clear-pet'] },
  { id: 'faq-oily-paper', relatedItemIds: ['paper-box'] },
  { id: 'faq-dirty-delivery-container', relatedItemIds: ['delivery-container'] },
  { id: 'faq-cup-noodle-soup', relatedItemIds: ['cup-noodle'] },
  { id: 'faq-paper-cup', relatedItemIds: ['disposable-cup'] },
  { id: 'faq-straw', relatedItemIds: ['disposable-cup'] },
  { id: 'faq-dirty-vinyl', relatedItemIds: ['vinyl'] },
  { id: 'faq-can-crush', relatedItemIds: ['can'] },
  { id: 'faq-glass-bottle-cap', relatedItemIds: ['glass-bottle'] },
  { id: 'faq-box-tape', relatedItemIds: ['paper-box'] },
  { id: 'faq-food-or-general', relatedItemIds: ['food-waste', 'bones-shells'] },
  { id: 'faq-bones', relatedItemIds: ['bones-shells'] },
  { id: 'faq-eggshell', relatedItemIds: ['bones-shells', 'food-waste'] },
  { id: 'faq-dirty-styrofoam', relatedItemIds: ['styrofoam'] },
  { id: 'faq-battery-where', relatedItemIds: ['battery'] },
  { id: 'faq-broken-glass-safety', relatedItemIds: ['broken-glass'] },
  { id: 'faq-clothing-bin', relatedItemIds: ['clothing'] },
  { id: 'faq-small-appliance-where', relatedItemIds: ['small-electronics'] },
  { id: 'faq-lamp-where', relatedItemIds: ['fluorescent-lamp'] },
];

export const faqs: Faq[] = topics.map(({ id, relatedItemIds }) => ({
  id,
  question: localized(id, 'question', {}),
  answer: localized(id, 'answer', {}),
  relatedItemIds,
  sourceIds: [],
}));
