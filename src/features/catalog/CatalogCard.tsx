import { useLocale } from '@/app/useLocale';
import { ItemImage } from '@/components/ItemImage';
import { ui } from '@/i18n/strings';
import type { CatalogItem } from '@shared/types';

/** 도감 카드 하나. 누르면 상세를 연다. */
export function CatalogCard({
  item,
  onOpen,
}: {
  item: CatalogItem;
  onOpen: (item: CatalogItem, trigger: HTMLButtonElement) => void;
}) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      className="catalog-card"
      onClick={(event) => onOpen(item, event.currentTarget)}
    >
      <ItemImage item={item} className="catalog-card__image" />
      <span className="catalog-card__name">{t(item.name)}</span>
      <span className={`catalog-card__category catalog-card__category--${item.category}`}>
        {t(ui.category[item.category])}
      </span>
    </button>
  );
}
