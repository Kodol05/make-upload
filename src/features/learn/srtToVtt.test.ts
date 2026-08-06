import { srtToVtt, needsConversion } from './srtToVtt';

const SRT = `1
00:00:00,000 --> 00:00:08,000
한국에서 생활하다 보면, 쓰레기통 앞에서
한 번쯤 망설이게 됩니다.

2
00:00:08,000 --> 00:00:14,500
K-SORT가 도와드립니다.
`;

describe('srtToVtt', () => {
  it('puts the WEBVTT header on top', () => {
    expect(srtToVtt(SRT).startsWith('WEBVTT\n\n')).toBe(true);
  });

  /** SRT는 쉼표, WebVTT는 마침표를 쓴다. 이걸 안 바꾸면 자막이 통째로 무시된다. */
  it('turns the comma in timecodes into a dot', () => {
    const out = srtToVtt(SRT);
    expect(out).toContain('00:00:00.000 --> 00:00:08.000');
    expect(out).not.toContain(',000 -->');
  });

  /** 번호 줄은 WebVTT에서 쓰지 않는다. 남겨 두면 자막 본문으로 읽힌다. */
  it('drops the cue numbers', () => {
    const lines = srtToVtt(SRT).split('\n');
    expect(lines).not.toContain('1');
    expect(lines).not.toContain('2');
  });

  it('keeps the text as it was, line breaks and all', () => {
    const out = srtToVtt(SRT);
    expect(out).toContain('한국에서 생활하다 보면, 쓰레기통 앞에서\n한 번쯤 망설이게 됩니다.');
  });

  /** 윈도우에서 만든 파일은 줄 끝이 CRLF다. 그대로 두면 시간줄을 못 알아본다. */
  it('handles Windows line endings', () => {
    const out = srtToVtt(SRT.replace(/\n/g, '\r\n'));
    expect(out).toContain('00:00:00.000 --> 00:00:08.000');
    expect(out).not.toContain('\r');
  });

  /** 편집기가 붙이는 BOM이 남으면 WEBVTT 머리글이 깨진다. */
  it('strips a byte order mark', () => {
    expect(srtToVtt('\uFEFF' + SRT).startsWith('WEBVTT')).toBe(true);
  });

  it('leaves a file that is already WebVTT alone', () => {
    const vtt = 'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n안녕하세요\n';
    expect(srtToVtt(vtt)).toBe(vtt);
  });

  it('survives an empty file', () => {
    expect(srtToVtt('')).toBe('WEBVTT\n\n');
  });
});

describe('needsConversion', () => {
  it('says yes for SRT', () => {
    expect(needsConversion(SRT)).toBe(true);
  });

  it('says no for WebVTT', () => {
    expect(needsConversion('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n안녕\n')).toBe(false);
  });

  /**
   * 확장자가 아니라 내용으로 판정한다. `.vtt`라는 이름으로 SRT가 들어오는 일이
   * 실제로 있었기 때문이다.
   */
  it('goes by the contents, not the file name', () => {
    expect(needsConversion('\uFEFFWEBVTT\n\n')).toBe(false);
  });
});
