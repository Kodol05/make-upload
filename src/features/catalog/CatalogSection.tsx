import { useCallback, useMemo, useRef, useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { ui } from '@/i18n/strings';
import { categories, type CatalogItem } from '@shared/types';
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
export function CatalogSection() {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [openItem, setOpenItem] = useState<CatalogItem | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const items = useMemo(
    () => findCatalogItems(query, filter, locale),
    [query, filter, locale],
  );

  const openDetail = useCallback((item: CatalogItem, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setOpenItem(item);
  }, []);

  const closeDetail = useCallback(() => {
    setOpenItem(null);
    triggerRef.current?.focus();
  }, []);

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
