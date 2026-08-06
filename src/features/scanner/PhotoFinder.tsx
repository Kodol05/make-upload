import { useRef, useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { createSessionId } from '@/features/chat/chatApi';
import { useAskChat } from '@/features/chat/askChat';
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
 * 사진으로 품목 찾기.
 *
 * 도감 안에 들어가는 보조 수단이다. 이름을 모르는 물건일 때만 쓰고 결과는 도감
 * 상세로 이어진다. 별도 화면으로 빼지 않는 이유는, 이미 이름을 아는 사람에게는
 * 도감에서 바로 찾는 편이 훨씬 빠르고 스캔은 하루 한도가 있기 때문이다.
 *
 * **개인정보 고지는 이 화면을 열었을 때 보여 준다.** 늘 띄워 두면 읽지 않고,
 * 사진을 고른 뒤에 띄우면 이미 늦다. 보낼지 말지 정하는 시점에 있어야 한다.
 */
export function PhotoFinder({
  scanImage = defaultScanImage,
  prepareImage = compressImage,
  onOpenItem,
  onClose,
}: {
  scanImage?: (
    image: CompressedImage,
    locale: Locale,
    sessionId: string,
  ) => Promise<ScanResponse>;
  prepareImage?: (file: File) => Promise<CompressedImage | null>;
  onOpenItem: (itemId: ItemId) => void;
  onClose: () => void;
}) {
  const { locale, t } = useLocale();
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [dragging, setDragging] = useState(false);
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
    <section className="finder" aria-labelledby="finder-title">
      <div className="finder__bar">
        <h3 id="finder-title">{t(ui.scanner.title)}</h3>
        <button type="button" className="finder__close" onClick={onClose}>
          {t(ui.common.close)}
        </button>
      </div>

      {/**
       * 사진을 보내기 전에 무엇이 일어나는지 알린다. 무료 등급이라 Google이
       * 서비스 개선에 쓸 수 있다는 사실까지 적는다.
       */}
      <div className="finder__privacy">
        <strong>{t(ui.scanner.privacyTitle)}</strong>
        <p>{t(ui.scanner.privacyNotice)}</p>
      </div>

      <label
        className={`finder__drop${dragging ? ' finder__drop--over' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <span className="finder__drop-hint">{t(ui.scanner.dropHint)}</span>
        <span className="finder__drop-action">{t(ui.scanner.choosePhoto)}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          // 감싸는 label에 안내 문장이 두 줄이라, 이름은 여기서 직접 준다.
          aria-label={t(ui.scanner.choosePhoto)}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </label>

      {/** 진행과 결과를 낭독기에 알린다. 사진을 못 보는 사용자에게는 이것이 전부다. */}
      <p className="finder__status" role="status">
        {phase.kind === 'working' ? t(ui.scanner.analyzing) : ''}
      </p>

      {phase.kind === 'failed' && (
        <div className="finder__error">
          <p>{t(phase.message)}</p>
        </div>
      )}

      {phase.kind === 'done' && (
        <ScanResult objects={phase.objects} preview={phase.preview} onOpenItem={onOpenItem} />
      )}
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
      <div className="finder__error">
        <p>{t(ui.scanner.noObjects)}</p>
      </div>
    );
  }

  return (
    <div className="finder__result" data-testid="scan-result">
      <div className="finder__canvas">
        <img src={preview} alt="" />
        {objects.map((object, index) => (
          <span
            key={index}
            data-testid={`scan-box-${index}`}
            className="finder__box"
            style={toCssBox(object.box as Box)}
            aria-hidden
          >
            {index + 1}
          </span>
        ))}
      </div>

      <h4>{t(ui.scanner.resultTitle)}</h4>
      <ol className="finder__objects">
        {objects.map((object, index) => (
          <li key={index}>
            <p className="finder__object-label">
              {object.itemId === 'unknown' ? t(ui.scanner.unknownLabel) : object.label}
              <span className={`finder__certainty finder__certainty--${object.certainty}`}>
                {t(certaintyText(object.certainty))}
              </span>
            </p>
            <p className="finder__object-reason">{object.reason}</p>

            {needsConfirmation(object) ? (
              <div className="finder__next">
                <ConfirmChoice onOpenItem={onOpenItem} />
                {/**
                 * 도감에 없으면 여기서 길이 끊긴다. 모델은 사진에서 무엇인지
                 * 알아보고도 16종에 없으면 `unknown`이 되기 때문에, 화면에는
                 * "판단하지 못했습니다"로 보인다. 챗봇은 도감 밖도 답하므로
                 * 그쪽으로 이어 준다. 모델이 적어 둔 이름을 질문 자리에 넣어
                 * 준다 — 보고 나서 고칠 수 있게 보내지는 않는다.
                 */}
                {object.itemId === 'unknown' && <AskAi label={object.label} />}
              </div>
            ) : (
              <button
                type="button"
                className="finder__open"
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

/** 도감 밖의 물건을 챗봇으로 넘긴다. */
function AskAi({ label }: { label: string }) {
  const { t } = useLocale();
  const { ask } = useAskChat();

  return (
    <button
      type="button"
      className="finder__ask"
      onClick={() => ask({ question: label.trim() || undefined })}
    >
      {t(ui.scanner.askAi)}
    </button>
  );
}

/** AI가 확신하지 못하면 정답으로 확정하지 않고 사용자가 고르게 한다. */
function ConfirmChoice({ onOpenItem }: { onOpenItem: (itemId: ItemId) => void }) {
  const { locale, t } = useLocale();

  return (
    <div className="finder__confirm">
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
