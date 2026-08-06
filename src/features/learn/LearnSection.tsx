import { useRef, useState } from 'react';
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
  const [ended, setEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const restarting = useRef(false);

  /**
   * 다시 보기. 멈춘 뒤 처음으로 되돌리고 한 번만 재생한다.
   *
   * 되감는 동안 브라우저가 `ended`를 한 번 더 흘리는 경우가 있어, 되감기가
   * 끝날 때까지(`seeked`) 온 신호는 무시한다. 그대로 두면 덮개가 곧바로 다시
   * 떠서 되풀이되는 것처럼 보인다.
   */
  function replay() {
    const video = videoRef.current;
    if (!video) return;

    restarting.current = true;
    setEnded(false);
    video.pause();
    video.currentTime = 0;
    void video.play();
  }

  /** 정말 끝까지 재생됐을 때만 묻는다. 되감는 도중의 신호는 버린다. */
  function handleEnded() {
    if (restarting.current) return;
    setEnded(true);
  }

  return (
    <section id="learn" className="lesson" aria-labelledby="learn-title">
      <h2 id="learn-title">{t(ui.learn.title)}</h2>

      {videoFailed ? (
        <VideoFallback />
      ) : (
        <div className="lesson__stage">
          <video
            ref={videoRef}
            data-testid="lesson-video"
            className="lesson__video"
            controls
            preload="metadata"
            poster={POSTER_SRC}
            onError={() => setVideoFailed(true)}
            onEnded={handleEnded}
            onPlay={() => setEnded(false)}
            onSeeking={() => setEnded(false)}
            // 되감기가 끝나면 그 뒤의 `ended`는 진짜다.
            onSeeked={() => {
              restarting.current = false;
            }}
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

          {/**
           * 영상이 끝나면 다음에 무엇을 할지 묻는다. 아무것도 없으면 마지막
           * 화면에서 멈춰 서고, 다시 보고 싶은 사람은 재생줄을 되감아야 한다.
           */}
          {ended && (
            <div className="lesson__ended" role="group" aria-label={t(ui.learn.endedTitle)}>
              <p className="lesson__ended-title">{t(ui.learn.endedTitle)}</p>
              <div className="lesson__ended-actions">
                <button type="button" className="lesson__replay" onClick={replay}>
                  {t(ui.learn.watchAgain)}
                </button>
                <a className="lesson__go-catalog" href="#/catalog">
                  {t(ui.journey.toCatalog)}
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      <PrincipleCards />
    </section>
  );
}
