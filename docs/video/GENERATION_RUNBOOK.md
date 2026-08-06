# K-SORT production runbook

This repository contains the paid-generation workflow, but no media is generated
until an operator runs one of the commands below. The helper never stores or
prints credentials. It reads only `FAL_KEY` from the process environment and
fails before importing the fal.ai client or issuing a request when the key is
missing.

## Preflight

1. Revoke any key that has appeared in chat, logs, or a screenshot. Create a
   replacement in the [fal.ai key dashboard](https://fal.ai/dashboard/keys).
2. Confirm the fal.ai model input schemas and current pricing before spending.
3. Install dependencies and verify the manifests and tooling:

```powershell
npm.cmd install
npm.cmd run test:run -- tools/k-sort-media.test.mjs
node tools/k-sort-media.mjs tts --dry-run
node tools/k-sort-media.mjs video --dry-run
node tools/k-sort-media.mjs assemble --dry-run
```

4. Set the replacement key in the current shell only (do not put it in a file):

```powershell
$env:FAL_KEY = 'replace-with-a-rotated-key'
```

## Generation

Generate narration first, or resume a single narration request:

```powershell
node tools/k-sort-media.mjs tts
node tools/k-sort-media.mjs tts --clip S08
```

Generate the 18 Seedance clips in the fixed manifest order:

```powershell
node tools/k-sort-media.mjs video
node tools/k-sort-media.mjs video --clip S06
```

`S08b` and `S09b` use their preceding generated clip's stable final frame. If
their source clip is unavailable, the helper stops before a paid request. Run
`S08a` before `S08b` and `S09a` before `S09b`. To regenerate an otherwise valid
file intentionally, use `--force`:

```powershell
node tools/k-sort-media.mjs video --clip S08a --force
```

`all` runs TTS and then video. It should only be used after the dry-run and
budget checks are approved:

```powershell
npm.cmd run media:generate
```

## Resume and records

The commands use FFprobe to skip valid existing video outputs (1280x720 and
declared duration) and valid mono 48 kHz narration WAVs. Re-run the same command
after an interruption; only missing or invalid outputs will be requested again.
Use `--force` only for a deliberate replacement.

Each successful or skipped run updates credential-free records in:

- `public/media/generation-records/tts.json`
- `public/media/generation-records/video.json`

Records contain request IDs, output paths, statuses, and source URLs only. They
never contain `FAL_KEY`.

## Validate and assemble

After all outputs exist, validate streams and produce an H.264 1280x720 24 fps
master. The clean-caption master has narration (and optional ducked BGM) without
burned captions; the delivery master burns `public/subtitles/ko.vtt` using the
Korean-capable system font directory.

```powershell
npm.cmd run media:assemble
npm.cmd run media:assemble -- --bgm public/media/audio/bgm.mp3
npm.cmd run media:validate
```

Outputs are `public/media/k-sort-guide-clean.mp4` and
`public/media/k-sort-guide.mp4`. Narration is delayed to each editorial shot's
start, trimmed or padded to that shot's slot, and cannot spill into the next
shot. The BGM input is looped, trimmed to 120 seconds, and ducked under narration.
