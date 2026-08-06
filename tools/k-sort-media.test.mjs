// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  assertFalKey,
  buildAssemblyCommands,
  buildTtsFfmpegArgs,
  buildVideoPrompt,
  clipOrder,
  loadManifests,
  parseArgs,
  shouldSkip,
} from './k-sort-media.mjs';

describe('K-SORT media tooling', () => {
  it('parses generation mode, selection, force, and dry-run flags', () => {
    expect(parseArgs(['video', '--clip', 'S08a,S08b', '--force', '--dry-run'])).toEqual({
      mode: 'video', clipIds: ['S08a', 'S08b'], force: true, dryRun: true, bgm: undefined,
    });
  });

  it('rejects a paid generation mode before any request when FAL_KEY is absent', () => {
    expect(() => assertFalKey(undefined)).toThrow(/FAL_KEY/);
  });

  it('keeps the video manifest order and totals 120 seconds', () => {
    const clips = clipOrder([
      { id: 'S01', duration: 8 },
      { id: 'S02', duration: 8 },
      { id: 'S03', duration: 8 },
    ], ['S03', 'S01', 'S02']);
    expect(clips.map((clip) => clip.id)).toEqual(['S01', 'S02', 'S03']);
    expect(clips.reduce((total, clip) => total + clip.duration, 0)).toBe(24);
  });

  it('reads all 18 manifest clips in the planned 120-second order', async () => {
    const { video } = await loadManifests();
    expect(video.clips).toHaveLength(18);
    expect(video.clips.map((clip) => clip.id)).toEqual([
      'S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08a', 'S08b',
      'S09a', 'S09b', 'S10', 'S11', 'S12a', 'S12b', 'S12c', 'S13', 'S14',
    ]);
    expect(video.clips.reduce((total, clip) => total + clip.duration, 0)).toBe(120);
  });

  it('skips a valid output unless force is supplied', () => {
    const validProbe = { video: { width: 1280, height: 720, duration: 8.04 } };
    expect(shouldSkip(true, validProbe, 8, false)).toBe(true);
    expect(shouldSkip(true, validProbe, 8, true)).toBe(false);
    expect(shouldSkip(true, { video: { width: 1, height: 1, duration: 8 } }, 8, false)).toBe(false);
  });

  it('builds the required stable Seedance prompt and deterministic tts ffmpeg command', () => {
    expect(buildVideoPrompt({ promptPrefix: 'prefix', negativeSuffix: 'suffix' }, { motionPrompt: 'motion' }))
      .toBe('prefix motion suffix');
    expect(buildTtsFfmpegArgs('source.wav', 'public/media/audio/vo-S01.wav')).toEqual([
      '-y', '-f', 's16le', '-ar', '48000', '-ac', '1', '-i', 'source.wav', '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', 'public/media/audio/vo-S01.wav',
    ]);
  });

  it('constructs clean and captioned assembly outputs deterministically', () => {
    const commands = buildAssemblyCommands({
      concatFile: 'temp/concat.txt', narrationFilter: 'amix=inputs=14', bgm: undefined,
      subtitleFile: 'public/subtitles/ko.vtt', fontFile: 'C:/Windows/Fonts/malgun.ttf',
    });
    expect(commands.clean.output).toBe('public/media/k-sort-guide-clean.mp4');
    expect(commands.captioned.args).toContain('subtitles=public/subtitles/ko.vtt:fontsdir=C\\:/Windows/Fonts');
    expect(commands.captioned.output).toBe('public/media/k-sort-guide.mp4');
  });
});
