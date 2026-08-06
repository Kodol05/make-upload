/**
 * SRT 자막을 WebVTT로 바꾼다.
 *
 * `<track>`은 WebVTT만 읽는다. SRT를 그대로 넘기면 브라우저가 조용히 무시해서
 * 자막이 아예 안 뜨고, 오류도 남지 않는다. 시연 중에 알아채기 가장 나쁜 종류다.
 *
 * 미리 변환해 두지 않고 실행 중에 바꾸는 이유는, 자막을 만드는 쪽과 쓰는 쪽이
 * 다르기 때문이다. 자막이 갱신될 때마다 형식을 맞춰 달라고 부탁하는 대신
 * 어느 쪽이 와도 앱이 받아 준다.
 */

/** 편집기가 붙이는 BOM과 윈도우 줄 끝을 걷어낸다. 둘 다 형식 판정을 방해한다. */
function normalise(text: string): string {
  return text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

/**
 * 이 글이 변환이 필요한지 본다.
 *
 * 확장자가 아니라 **내용**으로 판정한다. `.vtt`라는 이름으로 SRT가 들어오는 일이
 * 실제로 있어서, 이름을 믿으면 같은 실수를 다시 겪는다.
 */
export function needsConversion(text: string): boolean {
  return !normalise(text).startsWith('WEBVTT');
}

const TIMECODE = /^(\d{2}:\d{2}:\d{2})[,.](\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2})[,.](\d{3})(.*)$/;

export function srtToVtt(text: string): string {
  const source = normalise(text);
  if (source.startsWith('WEBVTT')) return text;

  const lines = source.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const timecode = TIMECODE.exec(line.trim());

    if (timecode) {
      // 바로 앞이 번호 줄이었으면 지운다. WebVTT에서는 쓰지 않는 줄이다.
      if (out.length > 0 && /^\d+$/.test(out[out.length - 1].trim())) out.pop();
      const [, start, startMs, end, endMs, rest] = timecode;
      out.push(`${start}.${startMs} --> ${end}.${endMs}${rest}`);
      continue;
    }

    out.push(line);
  }

  return `WEBVTT\n\n${out.join('\n').replace(/^\n+/, '')}`;
}
