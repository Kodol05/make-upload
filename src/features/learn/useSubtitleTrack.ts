import { useEffect, useState } from 'react';
import { assetUrl } from '@/lib/assetUrl';
import type { Locale } from '@shared/types';
import { needsConversion, srtToVtt } from './srtToVtt';

/**
 * 자막 파일을 찾아 `<track>`이 읽을 수 있는 주소로 돌려준다.
 *
 * 언어마다 `.vtt`를 먼저 찾고 없으면 `.srt`를 찾는다. 가져온 내용이 SRT면
 * WebVTT로 바꿔 blob 주소를 만든다. 자막을 만드는 쪽이 어느 형식을 주든
 * 앱이 받아 주게 하려는 것이다.
 *
 * 파일이 아예 없으면 `null`을 돌려준다. 그때는 `<track>`을 만들지 않는다.
 * 빈 주소를 주면 브라우저가 오류를 뱉고 자막 메뉴에 빈 항목이 남는다.
 */
export function useSubtitleTrack(locale: Locale): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function load() {
      for (const extension of ['vtt', 'srt']) {
        const url = assetUrl(`/subtitles/${locale}.${extension}`);
        try {
          const response = await fetch(url);
          if (!response.ok) continue;

          const text = await response.text();
          if (cancelled) return;

          if (!needsConversion(text)) {
            setSrc(url);
            return;
          }

          objectUrl = URL.createObjectURL(
            new Blob([srtToVtt(text)], { type: 'text/vtt' }),
          );
          setSrc(objectUrl);
          return;
        } catch {
          // 다음 확장자를 시도한다. 둘 다 없으면 자막 없이 재생한다.
        }
      }
      if (!cancelled) setSrc(null);
    }

    void load();

    return () => {
      cancelled = true;
      // 만들어 둔 blob은 반드시 돌려준다. 안 그러면 언어를 바꿀 때마다 쌓인다.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [locale]);

  return src;
}
