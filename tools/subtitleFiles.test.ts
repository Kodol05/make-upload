// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { locales } from '../shared/types.js';
import { needsConversion, srtToVtt } from '../src/features/learn/srtToVtt.js';

const DIR = 'public/subtitles';

/**
 * 실제로 들어 있는 자막 파일을 검사한다.
 *
 * 변환기 자체는 `srtToVtt.test.ts`가 본다. 여기서는 **재웅이 준 진짜 파일**이
 * 네 언어를 다 덮는지, 변환한 결과가 브라우저가 읽을 수 있는 모양인지 확인한다.
 * 자막은 재생해 보기 전에는 틀린 줄 모르고, 시연 중에는 오류도 안 뜬다.
 */
function fileFor(locale: string): string | null {
  const names = readdirSync(DIR);
  return (
    names.find((name: string) => name === `${locale}.vtt`) ??
    names.find((name: string) => name === `${locale}.srt`) ??
    null
  );
}

describe('배포에 들어 있는 자막 파일', () => {
  it('covers every language the app offers', () => {
    for (const locale of locales) {
      expect(fileFor(locale), `${locale} 자막 없음`).not.toBeNull();
    }
  });

  it('turns into WebVTT the browser can actually read', () => {
    for (const locale of locales) {
      const name = fileFor(locale);
      if (!name) continue;

      const raw = readFileSync(`${DIR}/${name}`, 'utf8');
      const vtt = needsConversion(raw) ? srtToVtt(raw) : raw;

      expect(vtt.startsWith('WEBVTT'), `${name} 머리글`).toBe(true);
      // 쉼표가 남아 있으면 그 자막 줄은 통째로 무시된다.
      expect(/\d,\d{3}\s*-->/.test(vtt), `${name} 쉼표 잔존`).toBe(false);
      // 시간줄이 하나도 없으면 자막이 비어 있다는 뜻이다.
      expect((vtt.match(/-->/g) ?? []).length, `${name} 자막 줄 수`).toBeGreaterThan(0);
    }
  });

  it('leaves no cue numbers behind', () => {
    for (const locale of locales) {
      const name = fileFor(locale);
      if (!name || !name.endsWith('.srt')) continue;

      const vtt = srtToVtt(readFileSync(`${DIR}/${name}`, 'utf8'));
      const lines = vtt.split('\n');
      for (let i = 0; i < lines.length; i += 1) {
        if (!lines[i].includes('-->')) continue;
        // 시간줄 바로 앞에 번호만 있는 줄이 남아 있으면 화면에 숫자가 찍힌다.
        expect(/^\d+$/.test((lines[i - 1] ?? '').trim()), `${name} ${i}행`).toBe(false);
      }
    }
  });
});
