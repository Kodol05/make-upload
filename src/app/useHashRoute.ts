import { useEffect, useState } from 'react';

/** window.location.hash에서 앞의 # 을 떼어낸다. 비어 있으면 홈 경로로 본다. */
function readRoute(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

/**
 * 현재 해시 경로를 반환하고 해시가 바뀌면 다시 렌더링한다.
 *
 * 라우트가 홈 `#/`와 게임 `#/game` 둘뿐이라 라우팅 라이브러리를 쓰지 않는다.
 * 링크는 `<a href="#/game">`을 그대로 쓰면 된다.
 */
export function useHashRoute(): string {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
