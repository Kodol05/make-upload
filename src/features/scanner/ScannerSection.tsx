import { useRef, useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { ItemImage } from '@/components/ItemImage';
import { createSessionId } from '@/features/chat/chatApi';
import { ui } from '@/i18n/strings';
import { ApiError } from '@/lib/api';
import { catalogItems } from '@shared/catalog';
import type { Box } from '@shared/geometry';
import type { ItemId, Locale, LocalizedText, ScanObject, ScanResponse } from '@shared/types';
import { toCssBox } from './boxGeometry';
import { compressImage, type CompressedImage } from './compressImage';
import { scanImage as defaultScanImage } from './scannerApi';

type Phase =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'done'; preview: string; objects: ScanObject[] }
  | { kind: 'failed'; message: LocalizedText };

/** 확실성이 낮거나 품목을 모르면 사용자가 직접 고르게 한다. */
function needsConfirmation(object: ScanObject): boolean {
  return object.itemId === 'unknown' || object.certainty !== 'high';
}

function certaintyText(certainty: ScanObject['certainty']): LocalizedText {
  if (certainty === 'high') return ui.scanner.certaintyHigh;
  if (certainty === 'medium') return ui.scanner.certaintyMedium;
  return ui.scanner.certaintyLow;
}

function errorText(code: string): LocalizedText {
  if (code === 'rate_limited') return ui.error.rateLimited;
  if (code === 'timeout') return ui.error.timeout;
  if (code === 'network') return ui.error.network;
  if (code === 'image_too_large') return ui.scanner.imageTooLarge;
  if (code === 'unsupported_type') return ui.scanner.unsupportedType;
  return ui.error.unavailable;
}

/**
 * AI Sort Scan.
 *
 * 두 가지로 쓴다. 무엇인지 모르면 사진을 찍어 AI에게 묻고, 이미 아는 품목이면
 * 아래 목록에서 골라 도감으로 바로 들어간다. 두 번째 길은 AI를 부르지 않는다.
 */
export function ScannerSection({
  scanImage = defaultScanImage,
  prepareImage = compressImage,
  onOpenItem,
}: {
  scanImage?: (
    image: CompressedImage,
    locale: Locale,
    sessionId: string,
  ) => Promise<ScanResponse>;
  prepareImage?: (file: File) => Promise<CompressedImage | null>;
  onOpenItem: (itemId: ItemId) => void;
}) {
  const { locale, t } = useLocale();
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const sessionId = useRef(createSessionId());

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setPhase({ kind: 'working' });

    try {
      const prepared = await prepareImage(file);
      if (!prepared) {
        setPhase({ kind: 'failed', message: ui.scanner.imageTooLarge });
        return;
      }

      const result = await scanImage(prepared, locale, sessionId.current);
      setPhase({
        kind: 'done',
        preview: `data:${prepared.mimeType};base64,${prepared.data}`,
        objects: result.objects,
      });
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unavailable';
      setPhase({ kind: 'failed', message: errorText(code) });
    }
  }

  return (
    <section id="scan" className="scanner" aria-labelledby="scan-title">
      <h2 id="scan-title">{t(ui.scanner.title)}</h2>
      <p className="scanner__intro">{t(ui.scanner.intro)}</p>

      <label className="scanner__pick">
        <span>{t(ui.scanner.choosePhoto)}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </label>

      <p className="scanner__privacy">{t(ui.scanner.privacyNotice)}</p>

      {phase.kind === 'working' && <p className="scanner__working">{t(ui.scanner.analyzing)}</p>}

      {phase.kind === 'failed' && (
        <div className="scanner__error">
          <p>{t(phase.message)}</p>
          <a href="#catalog">{t(ui.common.openCatalog)}</a>
        </div>
      )}

      {phase.kind === 'done' && (
        <ScanResult objects={phase.objects} preview={phase.preview} onOpenItem={onOpenItem} />
      )}

      <h3 id="scan-shortcuts">{t(ui.scanner.pickFromList)}</h3>
      <ul className="scanner__shortcuts" aria-labelledby="scan-shortcuts">
        {catalogItems.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => onOpenItem(item.id)}>
              <ItemImage item={item} className="scanner__shortcut-image" />
              <span>{t(item.name)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 사진 위의 박스와 같은 순서의 목록. 화면 낭독기는 목록만 읽어도 충분하다. */
function ScanResult({
  objects,
  preview,
  onOpenItem,
}: {
  objects: ScanObject[];
  preview: string;
  onOpenItem: (itemId: ItemId) => void;
}) {
  const { t } = useLocale();

  if (objects.length === 0) {
    return (
      <div className="scanner__error">
        <p>{t(ui.scanner.noObjects)}</p>
        <a href="#catalog">{t(ui.common.openCatalog)}</a>
      </div>
    );
  }

  return (
    <div className="scanner__result" data-testid="scan-result">
      <div className="scanner__canvas">
        <img src={preview} alt="" />
        {objects.map((object, index) => (
          <span
            key={index}
            data-testid={`scan-box-${index}`}
            className="scanner__box"
            style={toCssBox(object.box as Box)}
            aria-hidden
          >
            {index + 1}
          </span>
        ))}
      </div>

      <h4>{t(ui.scanner.resultTitle)}</h4>
      <ol className="scanner__objects">
        {objects.map((object, index) => (
          <li key={index}>
            <p className="scanner__object-label">
              {object.itemId === 'unknown' ? t(ui.scanner.unknownLabel) : object.label}
              <span className={`scanner__certainty scanner__certainty--${object.certainty}`}>
                {t(certaintyText(object.certainty))}
              </span>
            </p>
            <p className="scanner__object-reason">{object.reason}</p>

            {needsConfirmation(object) ? (
              <ConfirmChoice onOpenItem={onOpenItem} />
            ) : (
              <button
                type="button"
                className="scanner__open"
                // 눈에는 짧게 보이되 낭독기에는 어느 품목인지 함께 읽힌다.
                aria-label={`${object.label} ${t(ui.common.openCatalog)}`}
                onClick={() => onOpenItem(object.itemId as ItemId)}
              >
                {t(ui.common.openCatalog)}
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** AI가 확신하지 못하면 정답으로 확정하지 않고 사용자가 고르게 한다. */
function ConfirmChoice({ onOpenItem }: { onOpenItem: (itemId: ItemId) => void }) {
  const { locale, t } = useLocale();

  return (
    <div className="scanner__confirm">
      <p>{t(ui.scanner.confirmPrompt)}</p>
      <select
        aria-label={t(ui.scanner.confirmPrompt)}
        defaultValue=""
        onChange={(event) => {
          if (event.target.value) onOpenItem(event.target.value as ItemId);
        }}
      >
        <option value="" disabled>
          {t(ui.catalog.searchPlaceholder)}
        </option>
        {catalogItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}
