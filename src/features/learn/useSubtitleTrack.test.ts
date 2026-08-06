import { showSubtitles } from './useSubtitleTrack';

/**
 * jsdom은 `HTMLTrackElement.track`을 만들지 않아 화면 테스트로는 자막을 켜는
 * 동작을 볼 수 없다. 그래서 이 부분만 떼어 직접 검사한다.
 */
describe('showSubtitles', () => {
  it('turns the track on', () => {
    const element = { track: { mode: 'disabled' } as TextTrack };

    expect(showSubtitles(element)).toBe(true);
    expect(element.track.mode).toBe('showing');
  });

  it('turns it on again after it was hidden', () => {
    const element = { track: { mode: 'hidden' } as TextTrack };

    showSubtitles(element);

    expect(element.track.mode).toBe('showing');
  });

  it('does nothing when the browser has not made a track yet', () => {
    expect(showSubtitles({ track: null as unknown as TextTrack })).toBe(false);
    expect(showSubtitles(null)).toBe(false);
  });
});
