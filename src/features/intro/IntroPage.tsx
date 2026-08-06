import { useRef, useState } from 'react';
import { journey } from '@/app/journey';
import { useLocale } from '@/app/useLocale';
import { usePrefersReducedMotion } from '@/app/usePrefersReducedMotion';
import { ui } from '@/i18n/strings';
import { assetUrl } from '@/lib/assetUrl';

/** 번갈아 트는 배경 영상. 하나가 끝나면 다음이 이어받고, 마지막 다음은 처음이다. */
const CLIPS = ['/media/intro-loop.mp4', '/media/intro-loop-2.mp4'];

/**
 * 소개 화면.
 *
 * 스타일은 `src/styles/intro.css`에만 있고 클래스는 전부 `intro-`로 시작한다.
 * 기존 소개(`.masthead`)의 규칙과 한 글자도 겹치지 않게 떼어 둔 것이다. 예전에
 * 같은 파일 안에서 소개 규칙을 여러 번 갈아 끼웠다가, 어느 것이 이기는지 알 수
 * 없게 되면서 다른 화면까지 어긋났다.
 *
 * 언어 선택은 다음 단계에서 얹는다.
 */
export function IntroPage() {
  const { t } = useLocale();
  const calm = usePrefersReducedMotion();
  const first = journey[0];

  /**
   * 영상 둘을 겹쳐 두고 보이는 쪽만 바꾼다.
   *
   * 한 태그의 `src`만 갈아 끼우면 바뀌는 동안 검은 화면이 한 번 스친다. 둘을
   * 미리 얹어 두면 넘어갈 때 화면이 끊기지 않는다.
   */
  const firstVideo = useRef<HTMLVideoElement>(null);
  const secondVideo = useRef<HTMLVideoElement>(null);
  const videos = [firstVideo, secondVideo];
  const [playing, setPlaying] = useState(0);

  /** 한 편이 끝나면 다음 편을 처음부터 틀고 그쪽을 보여 준다. */
  function playNext(finished: number) {
    const next = (finished + 1) % CLIPS.length;
    const element = videos[next].current;
    if (element) {
      element.currentTime = 0;
      // 자동 재생이 막힌 상황에서도 화면이 멈추기만 할 뿐 오류로 번지지 않게 둔다.
      void element.play().catch(() => undefined);
    }
    setPlaying(next);
  }

  return (
    <section className="intro">
      {/**
       * 배경 영상. 소리도 뜻도 없는 장식이라 보조 기술에는 숨긴다.
       *
       * 움직임을 줄여 달라는 설정이면 스스로 재생하지 않는다. 어지럼증이 있는
       * 사람에게 끝없이 도는 영상은 그 자체가 문제가 된다. 그때는 첫 편의 표지
       * 한 장만 남고 넘어가지도 않는다.
       */}
      {CLIPS.map((clip, index) => (
        <video
          key={clip}
          ref={videos[index]}
          className={
            index === playing ? 'intro__video intro__video--on' : 'intro__video'
          }
          poster={index === 0 ? assetUrl('/images/intro-poster.webp') : undefined}
          src={assetUrl(clip)}
          autoPlay={!calm && index === 0}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onEnded={() => playNext(index)}
        />
      ))}

      <div className="intro__body">
        <h2 className="intro__title">{t(ui.home.title)}</h2>
        {/* 화살표는 방향만 거드는 그림이라 읽어 주지 않는다. 글이 이미 "가기"를 말한다. */}
        <a className="intro__button" href={`#${first.nextRoute}`}>
          {t(first.nextLabel)}
          <span className="intro__arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </section>
  );
}
