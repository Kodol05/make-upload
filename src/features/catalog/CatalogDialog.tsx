import { useEffect, useRef } from 'react';
import { useLocale } from '@/app/useLocale';
import { ItemImage } from '@/components/ItemImage';
import { useAskChat } from '@/features/chat/askChat';
import { ui } from '@/i18n/strings';
import { sources } from '@shared/sources';
import type { CatalogItem } from '@shared/types';

/**
 * 품목 상세.
 *
 * 이미지가 없어도 처리 순서·흔한 실수·지역 확인 안내·출처는 그대로 읽혀야 한다.
 * 출처는 확인된 주소가 있을 때만 링크로 만든다. 잘못된 주소는 없는 것보다 나쁘다.
 */
export function CatalogDialog({
  item,
  onClose,
}: {
  item: CatalogItem;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const { ask } = useAskChat();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      // 상세가 열려 있는 동안에는 포커스가 뒤 화면으로 새지 않게 가둔다.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button, select, input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="catalog-dialog__backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-dialog-title"
        className="catalog-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="catalog-dialog__bar">
          <h3 id="catalog-dialog-title">{t(item.name)}</h3>
          <button ref={closeRef} type="button" onClick={onClose}>
            {t(ui.common.close)}
          </button>
        </div>

        <p className={`catalog-dialog__category catalog-dialog__category--${item.category}`}>
          {t(ui.category[item.category])}
        </p>

        {/* 제목이 바로 위에 있으므로 이미지가 없으면 자리를 비운다. */}
        <ItemImage item={item} className="catalog-dialog__image" hideOnError />

        <p className="catalog-dialog__summary">{t(item.summary)}</p>

        <h4 id="catalog-dialog-steps">{t(ui.catalog.stepsTitle)}</h4>
        <ol className="catalog-dialog__steps" aria-labelledby="catalog-dialog-steps">
          {item.steps.map((step) => (
            <li key={step.id}>{t(step.text)}</li>
          ))}
        </ol>

        <h4>{t(ui.catalog.mistakeTitle)}</h4>
        <p className="catalog-dialog__mistake">{t(item.commonMistake)}</p>

        {/**
         * 도감은 정해진 16종의 정해진 답이고, 챗봇은 그 밖도 답한다. 여기서
         * 이어 주지 않으면 "이건 알겠는데 내 경우는?"에서 길이 끊긴다.
         *
         * 상세를 먼저 닫는다. 상세가 포커스를 가두고 있어서 열어 둔 채로 챗봇을
         * 띄우면 키보드가 챗봇에 닿지 못한다.
         */}
        <button
          type="button"
          className="catalog-dialog__ask"
          onClick={() => {
            onClose();
            ask({ itemId: item.id, question: t(item.name) });
          }}
        >
          {t(ui.catalog.askAboutThis)}
        </button>

        {item.needsLocalCheck && (
          <div className="catalog-dialog__local-check">
            <strong>{t(ui.catalog.localCheckTitle)}</strong>
            <p>{t(ui.catalog.localCheckBody)}</p>
          </div>
        )}

        <h4 id="catalog-dialog-sources">{t(ui.catalog.sourcesTitle)}</h4>
        <ul className="catalog-dialog__sources" aria-labelledby="catalog-dialog-sources">
          {item.sourceIds.map((sourceId) => {
            const source = sources[sourceId];
            if (!source) return null;
            return (
              <li key={sourceId}>
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noreferrer noopener">
                    {t(source.title)}
                  </a>
                ) : (
                  <span className="catalog-dialog__source-pending">
                    {t(ui.catalog.sourceUnverified)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
