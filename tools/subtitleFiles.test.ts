// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { locales } from '../shared/types.js';
import { needsConversion, srtToVtt } from '../src/features/learn/srtToVtt.js';

const DIR = 'public/subtitles';

/**
 * 시간줄을 읽는다.
 *
 * WebVTT는 시(hour)를 생략할 수 있어 `00:00.000`과 `00:00:00.000`이 모두 옳다.
 * 한쪽만 받으면 멀쩡한 파일을 비어 있다고 잘못 읽는다. 실제로 그렇게 착각해서
 * 자막 셋이 비어 있는 줄 알았던 적이 있다.
 */
const STAMP = '(?:(\\d{2,}):)?(\\d{2}):(\\d{2})[.,](\\d{3})';

function cuesOf(vtt: string): Array<{ start: number; end: number }> {
  const line = new RegExp(`${STAMP}\\s*-->\\s*${STAMP}`, 'g');
  const seconds = (h: string | undefined, m: string, s: string, ms: string) =>
    Number(h ?? 0) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;

  const cues: Array<{ start: number; end: number }> = [];
  for (const m of vtt.matchAll(line)) {
    cues.push({
      start: seconds(m[1], m[2], m[3], m[4]),
      end: seconds(m[5], m[6], m[7], m[8]),
    });
  }
  return cues;
}

/**
 * 실제로 들어 있는 자막 파일을 검사한다.
 *
 * 변환기 자체는 `srtToVtt.test.ts`가 본다. 여기서는 **배포에 들어가는 진짜 파일**이
 * 네 언어를 다 덮는지, 브라우저가 읽을 수 있는 모양인지 확인한다. 자막은 재생해
 * 보기 전에는 틀린 줄 모르고, 틀려도 오류가 남지 않는다.
 */
function fileFor(locale: string): string | null {
  const names: string[] = readdirSync(DIR);
  return (
    names.find((name) => name === `${locale}.vtt`) ??
    names.find((name) => name === `${locale}.srt`) ??
    null
  );
}

function readAsVtt(name: string): string {
  const raw = readFileSync(`${DIR}/${name}`, 'utf8');
  return needsConversion(raw) ? srtToVtt(raw) : raw;
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
      const vtt = readAsVtt(name);

      expect(vtt.startsWith('WEBVTT'), `${name} 머리글`).toBe(true);
      // 쉼표가 남아 있으면 그 자막 줄은 통째로 무시된다.
      expect(/\d,\d{3}\s*-->/.test(vtt), `${name} 쉼표 잔존`).toBe(false);
      expect(cuesOf(vtt).length, `${name} 자막 줄 수`).toBeGreaterThan(0);
    }
  });

  /**
   * 네 언어가 같은 영상에 붙는다. 줄 수나 끝나는 시각이 어긋나면 어느 한 언어에서
   * 자막이 먼저 끊기거나 화면과 어긋난다.
   */
  it('lines the four languages up with each other', () => {
    const seen = locales
      .map((locale) => fileFor(locale))
      .filter((name): name is string => name !== null)
      .map((name) => {
        const cues = cuesOf(readAsVtt(name));
        return { name, count: cues.length, end: cues[cues.length - 1]?.end ?? 0 };
      });

    const first = seen[0];
    for (const one of seen) {
      expect(one.count, `${one.name} 줄 수`).toBe(first.count);
      expect(Math.abs(one.end - first.end), `${one.name} 끝나는 시각`).toBeLessThan(0.5);
    }
  });

  /** 시작이 끝보다 뒤이거나 앞 줄과 겹치면 화면에서 자막이 튄다. */
  it('keeps the cues in order', () => {
    for (const locale of locales) {
      const name = fileFor(locale);
      if (!name) continue;

      const cues = cuesOf(readAsVtt(name));
      let previousEnd = 0;
      for (const [index, cue] of cues.entries()) {
        expect(cue.end, `${name} ${index + 1}번째 줄`).toBeGreaterThan(cue.start);
        expect(cue.start, `${name} ${index + 1}번째 줄 시작`).toBeGreaterThanOrEqual(
          previousEnd - 0.001,
        );
        previousEnd = cue.end;
      }
    }
  });

  it('leaves no cue numbers behind', () => {
    for (const locale of locales) {
      const name = fileFor(locale);
      if (!name || !name.endsWith('.srt')) continue;

      const lines = srtToVtt(readFileSync(`${DIR}/${name}`, 'utf8')).split('\n');
      for (let i = 0; i < lines.length; i += 1) {
        if (!lines[i].includes('-->')) continue;
        // 시간줄 바로 앞에 번호만 있는 줄이 남아 있으면 화면에 숫자가 찍힌다.
        expect(/^\d+$/.test((lines[i - 1] ?? '').trim()), `${name} ${i}행`).toBe(false);
      }
    }
  });
});
