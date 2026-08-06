import { useEffect, useState } from 'react';

/** window.location.hash에서 앞의 # 을 떼어낸다. 비어 있으면 홈 경로로 본다. */
function readRoute(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

/**
 * 현재 해시 경로를 반환하고 해시가 바뀌면 다시 렌더링한다.
 *
 * 라우트가 넷(`#/`, `#/learn`, `#/catalog`, `#/game`)뿐이라 라우팅 라이브러리를
 * 쓰지 않는다. 링크는 `<a href="#/learn">`을 그대로 쓰면 된다.
 *
 * 페이지마다 주소가 있으면 새로고침해도 그 자리로 돌아오고, 시연 중 무언가
 * 꼬여도 주소창으로 바로 건너뛸 수 있다.
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
