import { SortMark } from './SortMark';

/**
 * K-SORT 워드마크.
 *
 * 표시와 글자를 하나로 묶는다. 개성은 서체가 아니라 **구성**에서 낸다.
 * 로고용으로 웹폰트를 받지 않는 이유는 두 가지다. 발표 중 네트워크가 끊기면
 * 로고부터 깨지고, 네 언어를 덮으려면 폰트를 여러 개 받아야 해서 무겁다.
 *
 * 하이픈만 표기 색으로 둔다. 섹션 제목 앞에 세운 짧은 선과 같은 장치라
 * 화면 전체가 한 손에서 나온 것처럼 묶인다.
 */
export function Wordmark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <span className={`wordmark wordmark--${size}`}>
      <SortMark tone="brand" size={size === 'lg' ? 'xl' : 'sm'} />
      <span className="wordmark__text">
        K<span className="wordmark__joint">-</span>SORT
      </span>
    </span>
  );
}
