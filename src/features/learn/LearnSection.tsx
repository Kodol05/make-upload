import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/app/useLocale';
import { ui } from '@/i18n/strings';
import { assetUrl } from '@/lib/assetUrl';
import { showSubtitles, useSubtitleTrack } from './useSubtitleTrack';

const VIDEO_SRC = assetUrl('/media/k-sort-guide.mp4');
const POSTER_SRC = assetUrl('/media/poster.webp');

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

/**
 * 분리배출 4대 원칙. 영상이 없어도 항상 보인다.
 *
 * 그림 안에 이미 원칙 이름이 적혀 있어 글자를 겹쳐 두지 않는다. 다만 이름과
 * 설명은 화면에서만 감추고 낭독기에는 남긴다. 그림을 못 보는 사람에게는 그것이
 * 전부이고, 번역해 둔 네 언어도 그대로 쓰인다.
 */
function PrincipleCards() {
  const { t } = useLocale();

  return (
    <>
      <h3 className="lesson__principles-title">{t(ui.learn.principlesTitle)}</h3>
      <ul className="lesson__principles">
        {Object.entries(ui.learn.principles).map(([key, principle]) => (
          <li key={key} className="lesson__principle">
            <img
              className="lesson__principle-image"
              src={assetUrl(`/images/principles/${key}.webp`)}
              alt={t(principle.label)}
              loading="lazy"
            />
            <span className="lesson__principle-note">
              <strong>{t(principle.label)}</strong> {t(principle.description)}
            </span>
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
  const subtitleSrc = useSubtitleTrack(locale);
  const trackRef = useRef<HTMLTrackElement>(null);
  const restarting = useRef(false);

  /**
   * 새로 붙은 자막을 켠다.
   *
   * `default`는 재생기가 처음 뜰 때 한 번만 먹는다. 언어를 바꾸면 track이 새로
   * 붙는데 그때는 꺼진 채로 들어와서, 켜 주지 않으면 자막이 사라진 것처럼 보인다.
   */
  useEffect(() => {
    showSubtitles(trackRef.current);
  }, [subtitleSrc]);

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
            {/**
             * 자막 파일이 있을 때만 track을 만든다. 빈 주소를 주면 브라우저가
             * 오류를 뱉고 자막 메뉴에 고를 수 없는 항목이 남는다.
             *
             * `key`를 주는 이유는 src만 바꾸면 브라우저가 이전 자막 큐를 그대로
             * 들고 있는 경우가 있어서다.
             */}
            {subtitleSrc && (
              <track
                key={subtitleSrc}
                ref={trackRef}
                kind="subtitles"
                src={subtitleSrc}
                srcLang={locale}
                label={t(ui.learn.subtitleLabel)}
                default
              />
            )}
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
