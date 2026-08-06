import { useCallback, useMemo, useRef, useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { ui } from '@/i18n/strings';
import { catalogItems } from '@shared/catalog';
import { categories, type CatalogItem, type ItemId } from '@shared/types';
import { CatalogCard } from './CatalogCard';
import { CatalogDialog } from './CatalogDialog';
import { findCatalogItems, type CategoryFilter } from './catalogSearch';

const FILTERS: CategoryFilter[] = ['all', ...categories];

/**
 * 16종 도감.
 *
 * 스캔 결과와 챗봇 답변, 게임 결과가 모두 이 화면으로 모인다. 상세를 닫으면 열었던
 * 카드로 포커스를 돌려보내 키보드만으로도 목록을 이어서 훑을 수 있게 한다.
 */
export function CatalogSection({
  requestedItemId = null,
  onRequestHandled,
}: {
  /** 스캐너나 챗봇이 열어 달라고 요청한 품목. */
  requestedItemId?: ItemId | null;
  onRequestHandled?: () => void;
} = {}) {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [pickedId, setPickedId] = useState<ItemId | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const items = useMemo(
    () => findCatalogItems(query, filter, locale),
    [query, filter, locale],
  );

  /**
   * 열려 있는 품목은 저장하지 않고 계산한다.
   *
   * 다른 화면이 지정한 품목이 있으면 그것을, 없으면 여기서 고른 카드를 연다.
   * 요청을 상태로 옮겨 담으면 effect가 필요해지고 연쇄 렌더가 생긴다.
   */
  const openId = requestedItemId ?? pickedId;
  const openItem = openId
    ? (catalogItems.find((candidate) => candidate.id === openId) ?? null)
    : null;

  const openDetail = useCallback((item: CatalogItem, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setPickedId(item.id);
  }, []);

  const closeDetail = useCallback(() => {
    setPickedId(null);
    // 다른 화면에서 온 요청이면 그쪽도 비워야 다시 열 수 있다.
    onRequestHandled?.();
    triggerRef.current?.focus();
  }, [onRequestHandled]);

  return (
    <section id="catalog" className="catalog" aria-labelledby="catalog-title">
      <h2 id="catalog-title">{t(ui.catalog.title)}</h2>

      <label className="catalog__search">
        <span>{t(ui.catalog.searchLabel)}</span>
        <input
          type="search"
          value={query}
          placeholder={t(ui.catalog.searchPlaceholder)}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="catalog__filters" role="group" aria-label={t(ui.catalog.filterLabel)}>
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            className={`catalog__filter catalog__filter--${value}`}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {t(ui.category[value])}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="catalog__empty">
          <p className="catalog__empty-title">{t(ui.catalog.empty)}</p>
          <p className="catalog__empty-hint">{t(ui.catalog.emptyHint)}</p>
        </div>
      ) : (
        <div className="catalog__grid">
          {items.map((item) => (
            <CatalogCard key={item.id} item={item} onOpen={openDetail} />
          ))}
        </div>
      )}

      {openItem && <CatalogDialog item={openItem} onClose={closeDetail} />}
    </section>
  );
}
