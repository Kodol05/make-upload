import { useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { ui } from '@/i18n/strings';
import { assetUrl } from '@/lib/assetUrl';
import type { Locale } from '@shared/types';

const VIDEO_SRC = assetUrl('/media/k-sort-guide.mp4');
const POSTER_SRC = assetUrl('/media/poster.webp');

/** 자막은 언어별 WebVTT 파일 하나씩을 쓴다. */
function subtitleSrc(locale: Locale): string {
  return assetUrl(`/subtitles/${locale}.vtt`);
}

/**
 * 영상이 없거나 재생할 수 없을 때 보여 줄 대체 화면.
 * 포스터마저 없으면 안내 문구와 요약만 남긴다.
 */
function VideoFallback() {
  const { t } = useLocale();
  const [posterFailed, setPosterFailed] = useState(false);

  return (
    <div className="lesson__fallback">
      {!posterFailed && (
        <img
          className="lesson__poster"
          src={POSTER_SRC}
          alt={t(ui.learn.title)}
          onError={() => setPosterFailed(true)}
        />
      )}
      <p className="lesson__fallback-title">{t(ui.learn.videoUnavailable)}</p>
      <p className="lesson__fallback-summary">{t(ui.learn.videoSummary)}</p>
    </div>
  );
}

/** 분리배출 4대 원칙 카드. 영상이 없어도 항상 보인다. */
function PrincipleCards() {
  const { t } = useLocale();

  return (
    <>
      <h3 className="lesson__principles-title">{t(ui.learn.principlesTitle)}</h3>
      <ul className="lesson__principles">
        {Object.entries(ui.learn.principles).map(([key, principle]) => (
          <li key={key} className="lesson__principle">
            <strong>{t(principle.label)}</strong>
            <span>{t(principle.description)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * 2분 교육 영상과 4대 원칙.
 *
 * 언어를 바꿔도 video 요소 자체는 그대로 두고 track만 교체한다. video를 다시
 * 만들면 재생 위치가 처음으로 돌아가기 때문이다. track에 `key`를 주는 이유는
 * src만 바꾸면 브라우저가 이전 자막 큐를 그대로 들고 있는 경우가 있어서다.
 */
export function LearnSection() {
  const { locale, t } = useLocale();
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section id="learn" className="lesson" aria-labelledby="learn-title">
      <h2 id="learn-title">{t(ui.learn.title)}</h2>

      {videoFailed ? (
        <VideoFallback />
      ) : (
        <video
          data-testid="lesson-video"
          className="lesson__video"
          controls
          preload="metadata"
          poster={POSTER_SRC}
          onError={() => setVideoFailed(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
          <track
            key={locale}
            kind="subtitles"
            src={subtitleSrc(locale)}
            srcLang={locale}
            label={t(ui.learn.subtitleLabel)}
            default
          />
        </video>
      )}

      <PrincipleCards />
    </section>
  );
}
