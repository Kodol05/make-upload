#!/usr/bin/env node
/**
 * Credential-safe production helper for the K-SORT media package.
 * Generation is deliberately opt-in: `--dry-run` never imports or calls fal.ai.
 */
import { execFile } from 'node:child_process';
import { File } from 'node:buffer';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const CURRENT_FILE = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(CURRENT_FILE), '..');
const VIDEO_MANIFEST = join(ROOT, 'docs/video/seedance-generation-manifest.json');
const TTS_MANIFEST = join(ROOT, 'docs/video/audio/elevenlabs-fal-request.json');
const SHOT_MANIFEST = join(ROOT, 'docs/video/shot-manifest.json');
const RECORD_DIR = join(ROOT, 'public/media/generation-records');
const CLEAN_MASTER = join(ROOT, 'public/media/k-sort-guide-clean.mp4');
const CAPTIONED_MASTER = join(ROOT, 'public/media/k-sort-guide.mp4');

export function parseArgs(argv) {
  const [mode, ...flags] = argv;
  if (!['tts', 'video', 'all', 'assemble', 'validate'].includes(mode)) {
    throw new Error('Usage: k-sort-media.mjs <tts|video|all|assemble|validate> [--clip S01,S02] [--force] [--dry-run] [--bgm path]');
  }
  const options = { mode, clipIds: [], force: false, dryRun: false, bgm: undefined };
  for (let index = 0; index < flags.length; index += 1) {
    const flag = flags[index];
    if (flag === '--force') options.force = true;
    else if (flag === '--dry-run') options.dryRun = true;
    else if (flag === '--clip' || flag === '--shot') {
      const value = flags[++index];
      if (!value) throw new Error(`${flag} requires a comma-separated value`);
      options.clipIds.push(...value.split(',').map((item) => item.trim()).filter(Boolean));
    } else if (flag === '--bgm') {
      options.bgm = flags[++index];
      if (!options.bgm) throw new Error('--bgm requires a file path');
    } else throw new Error(`Unknown option: ${flag}`);
  }
  return options;
}

export function assertFalKey(key) {
  if (!key?.trim()) throw new Error('FAL_KEY is required before K-SORT generation can make any request.');
  return key;
}

export function clipOrder(clips, requestedIds = []) {
  if (!requestedIds.length) return [...clips];
  const requested = new Set(requestedIds);
  const selected = clips.filter((clip) => requested.has(clip.id) || requested.has(clip.editorialShot));
  const found = new Set(selected.flatMap((clip) => [clip.id, clip.editorialShot]));
  const missing = requestedIds.filter((id) => !found.has(id));
  if (missing.length) throw new Error(`Unknown clip or shot selection: ${missing.join(', ')}`);
  return selected;
}

export function buildVideoPrompt(manifest, clip) {
  return [manifest.promptPrefix, clip.motionPrompt, manifest.negativeSuffix].join(' ');
}

export function buildTtsFfmpegArgs(source, output) {
  return ['-y', '-f', 's16le', '-ar', '48000', '-ac', '1', '-i', source, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', output];
}

function durationIsClose(actual, expected) {
  return Math.abs(actual - expected) <= Math.max(0.5, expected * 0.12);
}

export function isValidVideo(probe, duration) {
  const video = probe?.video;
  return Boolean(video && video.width === 1280 && video.height === 720 && durationIsClose(video.duration, duration));
}

export function isValidTts(probe) {
  const audio = probe?.audio;
  return Boolean(audio && audio.codec === 'pcm_s16le' && audio.sampleRate === 48000 && audio.channels === 1);
}

export function isValidMaster(probe) {
  const video = probe?.video;
  const audio = probe?.audio;
  const exactDuration = (duration) => Math.abs(duration - 120) <= 0.05;
  return Boolean(video && audio
    && video.codec === 'h264' && video.width === 1280 && video.height === 720 && video.fps === 24 && exactDuration(video.duration)
    && audio.codec === 'aac' && audio.sampleRate === 48000 && exactDuration(audio.duration));
}

export function shouldSkip(exists, probe, duration, force) {
  return Boolean(exists && !force && isValidVideo(probe, duration));
}

async function exists(path) {
  try { await stat(path); return true; } catch { return false; }
}

async function run(command, args, { dryRun = false } = {}) {
  if (dryRun) return { stdout: '', stderr: '', command: [command, ...args] };
  return execFileAsync(command, args, { windowsHide: true });
}

export async function probeMedia(file, { dryRun = false } = {}) {
  if (dryRun) return { video: { width: 1280, height: 720, duration: 0 }, audio: undefined };
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]);
  const parsed = JSON.parse(stdout);
  const video = parsed.streams.find((stream) => stream.codec_type === 'video');
  const audio = parsed.streams.find((stream) => stream.codec_type === 'audio');
  const parseRate = (rate) => {
    const [numerator, denominator] = String(rate ?? '0/1').split('/').map(Number);
    return denominator ? numerator / denominator : 0;
  };
  return {
    video: video && { codec: video.codec_name, width: Number(video.width), height: Number(video.height), fps: parseRate(video.avg_frame_rate ?? video.r_frame_rate), duration: Number(video.duration ?? parsed.format.duration) },
    audio: audio && { codec: audio.codec_name, sampleRate: Number(audio.sample_rate), channels: Number(audio.channels), duration: Number(audio.duration ?? parsed.format.duration) },
  };
}

async function loadJson(path) { return JSON.parse(await readFile(path, 'utf8')); }

export async function loadManifests() {
  const [video, tts, shots] = await Promise.all([loadJson(VIDEO_MANIFEST), loadJson(TTS_MANIFEST), loadJson(SHOT_MANIFEST)]);
  return { video, tts, shots };
}

async function importFal(key) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: assertFalKey(key) });
  return fal;
}

function resultUrl(result, preferredKey) {
  const data = result?.data ?? result;
  const preferred = data?.[preferredKey]?.url;
  if (preferred) return preferred;
  const candidates = [data?.url, data?.video_url, data?.audio_url, data?.video?.url, data?.audio?.url];
  const value = candidates.find((candidate) => typeof candidate === 'string');
  if (!value) throw new Error(`fal.ai response did not contain a ${preferredKey} URL.`);
  return value;
}

async function download(url, output) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}) for ${url}`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, Buffer.from(await response.arrayBuffer()));
}

async function writeRecord(name, records) {
  await mkdir(RECORD_DIR, { recursive: true });
  const file = join(RECORD_DIR, `${name}.json`);
  let existing = [];
  try { existing = JSON.parse(await readFile(file, 'utf8')).records ?? []; } catch { /* first generation run */ }
  await writeFile(file, `${JSON.stringify({ generatedAt: new Date().toISOString(), records: mergeRecords(existing, records) }, null, 2)}\n`);
}

export function mergeRecords(existing, incoming) {
  const byOutput = new Map(existing.map((record) => [record.outputPath, record]));
  for (const record of incoming) byOutput.set(record.outputPath, { ...byOutput.get(record.outputPath), ...record });
  return [...byOutput.values()];
}

function resultRequestId(result) {
  const requestId = result?.requestId ?? result?.request_id ?? result?.data?.requestId ?? result?.data?.request_id;
  if (!requestId) throw new Error('fal.ai response did not contain a requestId.');
  return requestId;
}

async function uploadStartFrame(fal, clip, clips, dryRun) {
  const { startImage } = clip;
  if (startImage.type === 'local') {
    const source = resolve(ROOT, startImage.path);
    if (!await exists(source)) throw new Error(`Missing local start frame: ${startImage.path}`);
    if (dryRun) return `dry-run://${basename(source)}`;
    const bytes = await readFile(source);
    return fal.storage.upload(new File([bytes], basename(source), { type: 'image/png' }));
  }
  const parent = clips.find((clip) => clip.id === startImage.clipId);
  if (!parent) throw new Error(`Derived frame source clip is not in the manifest: ${startImage.clipId}`);
  const input = resolve(ROOT, parent.outputFile);
  if (!await exists(input)) throw new Error(`Generate ${startImage.clipId} before dependent clip ${startImage.clipId}.`);
  const output = join(ROOT, 'public/media/preproduction/keyframes', `${clip.id}-derived.png`);
  await mkdir(dirname(output), { recursive: true });
  await run('ffmpeg', ['-y', '-sseof', '-0.20', '-i', input, '-frames:v', '1', output], { dryRun });
  if (dryRun) return `dry-run://${basename(output)}`;
  const bytes = await readFile(output);
  return fal.storage.upload(new File([bytes], basename(output), { type: 'image/png' }));
}

export async function generateTts({ clipIds = [], force = false, dryRun = false, key = process.env.FAL_KEY } = {}) {
  const { tts } = await loadManifests();
  const requests = clipOrder(tts.requests, clipIds);
  if (dryRun) return requests.map((request) => ({ id: request.id, outputPath: request.outputFile, action: 'would-generate' }));
  const fal = await importFal(assertFalKey(key));
  const temp = await mkdtemp(join(tmpdir(), 'k-sort-tts-'));
  const records = [];
  try {
    for (const request of requests) {
      const output = resolve(ROOT, request.outputFile);
      const valid = await exists(output) && isValidTts(await probeMedia(output));
      if (valid && !force) { records.push({ clipId: request.id, outputPath: request.outputFile, status: 'skipped' }); continue; }
      const result = await fal.subscribe(tts.endpoint, { input: { ...tts.sharedInput, text: request.text, previous_text: request.previous_text, next_text: request.next_text }, logs: true });
      const sourceUrl = resultUrl(result, 'audio');
      const source = join(temp, `${request.id}.pcm`);
      await download(sourceUrl, source);
      await mkdir(dirname(output), { recursive: true });
      await run('ffmpeg', buildTtsFfmpegArgs(source, output));
      records.push({ clipId: request.id, requestId: resultRequestId(result), outputPath: request.outputFile, sourceUrl });
    }
    await writeRecord('tts', records);
    return records;
  } finally { await rm(temp, { recursive: true, force: true }); }
}

export async function generateVideo({ clipIds = [], force = false, dryRun = false, key = process.env.FAL_KEY } = {}) {
  const { video } = await loadManifests();
  const clips = clipOrder(video.clips, clipIds);
  if (dryRun) return clips.map((clip) => ({ id: clip.id, outputPath: clip.outputFile, action: 'would-generate' }));
  const fal = await importFal(assertFalKey(key));
  const records = [];
  for (const clip of clips) {
    const output = resolve(ROOT, clip.outputFile);
    const valid = await exists(output) && isValidVideo(await probeMedia(output), clip.duration);
    if (valid && !force) { records.push({ clipId: clip.id, outputPath: clip.outputFile, status: 'skipped' }); continue; }
    const imageUrl = await uploadStartFrame(fal, clip, video.clips, dryRun);
    const result = await fal.subscribe(video.endpoint, {
      input: { ...video.sharedInput, image_url: imageUrl, prompt: buildVideoPrompt(video, clip), duration: String(clip.duration), camera_fixed: clip.camera_fixed, seed: clip.seed },
      logs: true,
    });
    const sourceUrl = resultUrl(result, 'video');
    await download(sourceUrl, output);
    if (!isValidVideo(await probeMedia(output), clip.duration)) throw new Error(`Generated ${clip.id} did not validate as 1280x720 with the declared duration.`);
    records.push({ clipId: clip.id, requestId: resultRequestId(result), outputPath: clip.outputFile, sourceUrl });
  }
  await writeRecord('video', records);
  return records;
}

function quoteConcat(path) { return `file '${resolve(ROOT, path).replaceAll("'", "'\\\\''")}'`; }

export function narrationFilter(shots, ttsRequests, bgm) {
  const inputFilters = shots.map((shot, index) => {
    const request = ttsRequests.find((item) => item.id === shot.id);
    if (!request) throw new Error(`No narration request for ${shot.id}`);
    const delay = Math.round(shot.startSeconds * 1000);
    return `[${index + 1}:a]aresample=48000,atrim=duration=${shot.durationSeconds},apad=whole_dur=${shot.durationSeconds},atrim=duration=${shot.durationSeconds},adelay=${delay}|${delay}[v${index}]`;
  });
  const labels = shots.map((_, index) => `[v${index}]`).join('');
  const narration = `${labels}amix=inputs=${shots.length}:normalize=0[narration]`;
  if (!bgm) return [...inputFilters, narration, '[narration]anull[aout]'].join(';');
  const totalDuration = shots.reduce((total, shot) => total + shot.durationSeconds, 0);
  return [...inputFilters, narration, `[${shots.length + 1}:a]atrim=duration=${totalDuration}[bgm]`, '[bgm][narration]sidechaincompress=threshold=0.03:ratio=8:attack=25:release=300[ducked]', '[ducked][narration]amix=inputs=2:normalize=0[aout]'].join(';');
}

export function buildAssemblyInputs(concatFile, narrationPaths, bgmPath) {
  return ['-f', 'concat', '-safe', '0', '-i', concatFile, ...narrationPaths.flatMap((path) => ['-i', path]), ...(bgmPath ? ['-stream_loop', '-1', '-i', bgmPath] : [])];
}

export function buildAssemblyCommands({ inputs, narrationFilter: filter, subtitleFile, fontFile }) {
  const videoFilter = '[0:v]fps=24,tpad=stop_mode=clone:stop_duration=120,trim=duration=120,setpts=PTS-STARTPTS[vout]';
  const clean = { args: ['-y', ...inputs, '-filter_complex', `${videoFilter};${filter}`, '-map', '[vout]', '-map', '[aout]', '-t', '120', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-movflags', '+faststart'], output: 'public/media/k-sort-guide-clean.mp4' };
  const fontDir = dirname(fontFile).replaceAll('\\', '/').replace(':', '\\:');
  const subtitle = subtitleFile.replaceAll('\\', '/').replace(':', '\\:');
  const captioned = { args: ['-y', '-i', CLEAN_MASTER, '-vf', `subtitles=${subtitle}:fontsdir=${fontDir}`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart'], output: 'public/media/k-sort-guide.mp4' };
  return { clean, captioned };
}

export async function assembleMaster({ bgm, dryRun = false } = {}) {
  const { video, tts, shots } = await loadManifests();
  const concatFile = join(ROOT, '.k-sort-concat.txt');
  const clipLines = video.clips.map((clip) => quoteConcat(clip.outputFile));
  if (!dryRun) await writeFile(concatFile, `${clipLines.join('\n')}\n`);
  const fontFile = process.platform === 'win32' ? 'C:/Windows/Fonts/malgun.ttf' : '/usr/share/fonts/truetype/nanum/NanumGothic.ttf';
  const filter = narrationFilter(shots.shots, tts.requests, bgm);
  const inputs = buildAssemblyInputs(concatFile, tts.requests.map((request) => resolve(ROOT, request.outputFile)), bgm && resolve(ROOT, bgm));
  const commands = buildAssemblyCommands({ inputs, narrationFilter: filter, subtitleFile: 'public/subtitles/ko.vtt', fontFile });
  try {
    await run('ffmpeg', [...commands.clean.args, CLEAN_MASTER], { dryRun });
    await run('ffmpeg', [...commands.captioned.args, CAPTIONED_MASTER], { dryRun });
  } finally { if (!dryRun) await rm(concatFile, { force: true }); }
  if (!dryRun && (!isValidMaster(await probeMedia(CLEAN_MASTER)) || !isValidMaster(await probeMedia(CAPTIONED_MASTER)))) {
    throw new Error('Assembly outputs failed exact 120-second H.264/AAC master validation.');
  }
  return { clean: CLEAN_MASTER, captioned: CAPTIONED_MASTER, commands };
}

export async function validateMedia({ dryRun = false } = {}) {
  const { video, tts } = await loadManifests();
  const videos = [];
  for (const clip of video.clips) {
    const file = resolve(ROOT, clip.outputFile);
    videos.push({ id: clip.id, file: clip.outputFile, valid: await exists(file) && isValidVideo(await probeMedia(file, { dryRun }), clip.duration) });
  }
  const audio = [];
  for (const request of tts.requests) {
    const file = resolve(ROOT, request.outputFile);
    const probe = await exists(file) ? await probeMedia(file, { dryRun }) : undefined;
    audio.push({ id: request.id, file: request.outputFile, valid: isValidTts(probe) });
  }
  const masters = [];
  for (const file of [CLEAN_MASTER, CAPTIONED_MASTER]) {
    masters.push({ file, valid: await exists(file) && isValidMaster(await probeMedia(file, { dryRun })) });
  }
  return { videos, audio, masters, valid: videos.every((item) => item.valid) && audio.every((item) => item.valid) && masters.every((item) => item.valid) };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let result;
  if (options.mode === 'tts') result = await generateTts(options);
  else if (options.mode === 'video') result = await generateVideo(options);
  else if (options.mode === 'all') result = { tts: await generateTts(options), video: await generateVideo(options) };
  else if (options.mode === 'assemble') result = await assembleMaster(options);
  else result = await validateMedia(options);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === CURRENT_FILE) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
