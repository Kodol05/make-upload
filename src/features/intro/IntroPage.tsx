import { usePrefersReducedMotion } from '@/app/usePrefersReducedMotion';
import { assetUrl } from '@/lib/assetUrl';

/**
 * 소개 화면.
 *
 * 스타일은 `src/styles/intro.css`에만 있고 클래스는 전부 `intro-`로 시작한다.
 * 기존 소개(`.masthead`)의 규칙과 한 글자도 겹치지 않게 떼어 둔 것이다. 예전에
 * 같은 파일 안에서 소개 규칙을 여러 번 갈아 끼웠다가, 어느 것이 이기는지 알 수
 * 없게 되면서 다른 화면까지 어긋났다.
 *
 * 지금은 영상만 있다. 글과 언어 선택은 다음 단계에서 얹는다.
 */
export function IntroPage() {
  const calm = usePrefersReducedMotion();

  return (
    <section className="intro">
      {/**
       * 배경 영상. 소리도 뜻도 없는 장식이라 보조 기술에는 숨긴다.
       *
       * 움직임을 줄여 달라는 설정이면 스스로 재생하지 않는다. 어지럼증이 있는
       * 사람에게 끝없이 도는 영상은 그 자체가 문제가 된다. 대신 표지 한 장이
       * 남아 화면이 비지는 않는다.
       */}
      <video
        className="intro__video"
        poster={assetUrl('/images/intro-poster.webp')}
        src={assetUrl('/media/intro-loop.mp4')}
        autoPlay={!calm}
        loop
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      />
    </section>
  );
}
