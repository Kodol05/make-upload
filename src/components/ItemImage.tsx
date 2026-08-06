import { useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { assetUrl } from '@/lib/assetUrl';
import type { CatalogItem } from '@shared/types';

/**
 * 품목 대표 이미지.
 *
 * 파일이 아직 없거나 로드에 실패하면 이미지를 지우고 분류 색 바탕에 품목 이름만 남긴다.
 * 이미지는 있으면 더 좋은 것이지 없으면 화면이 깨지는 것이 아니다.
 */
export function ItemImage({
  item,
  className,
  hideOnError = false,
}: {
  item: CatalogItem;
  className?: string;
  /** 품목 이름이 이미 옆에 있는 자리에서는 대체 배지 대신 자리를 비운다. */
  hideOnError?: boolean;
}) {
  const { t } = useLocale();
  const [failed, setFailed] = useState(false);

  if (failed) {
    if (hideOnError) return null;
    return (
      <div className={`item-image item-image--fallback ${className ?? ''}`} aria-hidden>
        <span className={`item-image__badge item-image__badge--${item.category}`}>
          {t(item.name)}
        </span>
      </div>
    );
  }

  return (
    <img
      className={`item-image ${className ?? ''}`}
      src={assetUrl(item.image)}
      alt={t(item.imageAlt)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
