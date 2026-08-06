import { assetUrl } from '@/lib/assetUrl';

/**
 * K-SORT 로고.
 *
 * 받은 원본이 흰 바탕으로 채워져 있어 배경을 빼냈다. 소개 화면은 뒤에 그림이
 * 깔려 있어서 그대로 두면 흰 네모가 그대로 보인다. 가장자리는 부드럽게 남겨
 * 글자 테두리가 톱니처럼 되지 않게 했다.
 *
 * 헤더에서는 작게, 소개 화면에서는 크게 쓴다. 크기만 다르고 파일은 하나다.
 */
export function Wordmark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <img
      className={`wordmark wordmark--${size}`}
      src={assetUrl('/images/logo.webp')}
      alt="K-SORT"
      // 크기가 정해져 있어 자리를 미리 잡아 둔다. 뜨면서 화면이 밀리지 않는다.
      width={388}
      height={102}
    />
  );
}
