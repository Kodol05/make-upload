import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * 움직임을 줄여 달라는 설정인지 본다.
 *
 * 소개 화면의 영상은 스스로 재생되고 끝없이 돈다. 어지럼증이나 전정 장애가 있는
 * 사람에게는 그 자체가 문제가 되므로, 설정이 켜져 있으면 첫 장면만 보여 주고
 * 재생은 사용자가 시작하게 둔다. CSS로는 재생을 막을 수 없어 여기서 읽는다.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches === true,
  );

  useEffect(() => {
    const media = window.matchMedia?.(QUERY);
    if (!media) return;

    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}
