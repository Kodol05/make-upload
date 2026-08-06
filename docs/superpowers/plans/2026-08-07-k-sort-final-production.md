# K-SORT Final Production Plan

**Goal:** Generate the approved K-SORT picture, Korean narration, Suno instrumental, subtitles, and final 1280×720 two-minute deliverable.

**Source of truth:** `docs/video/shot-manifest.json`, `docs/video/seedance-generation-manifest.json`, `docs/video/audio/elevenlabs-fal-request.json`, and `docs/video/audio/MIX_CUES.md`.

## Global constraints

- Use only the rotated `FAL_KEY` environment variable; never print or persist credentials.
- Use Seedance 1.5 Pro at 720p, 16:9, without generated audio.
- Generate the 18 clips sequentially and derive S08b/S09b from the prior clip's final stable frame.
- Keep the approved 14-shot editorial timing at exactly 120 seconds.
- Generate Korean narration through fal.ai ElevenLabs Multilingual v2 and fit each line inside its assigned shot without speeding above natural speech.
- Generate one instrumental Suno candidate suitable for commercial hackathon presentation, with no vocals or spoken content.
- Burn readable Korean subtitles into the final video and also retain the standalone WebVTT file.
- Deliver H.264/AAC at 1280×720, 24 fps, exactly 120 seconds.

### Task 1: Production tooling

- Add the fal client dependency and a credential-safe generation script.
- Support resumable TTS and video generation, final-frame extraction, downloads, and machine-readable generation records.
- Add deterministic assembly and validation scripts.

### Task 2: Narration generation

- Generate all 14 Korean voice clips.
- Convert outputs to WAV, fit each clip to its timeline slot, and verify duration and audio integrity.

### Task 3: Seedance generation

- Generate the 18 approved clips in manifest order.
- Inspect technical integrity after every clip and extract the two chained start frames.
- Retry only S06 or S12b when a first result is unusable.

### Task 4: Suno music

- Use the signed-in Suno account or official Suno API.
- Generate an instrumental from `docs/video/audio/SUNO_PROMPT.md`, choose one candidate, and download it locally.

### Task 5: Final edit and verification

- Assemble the 14 editorial scenes, narration, music, overlays, and Korean subtitles.
- Normalize the mix, export `public/media/k-sort-guide.mp4`, and retain a clean-caption master when practical.
- Verify streams, resolution, frame rate, duration, silence/peak conditions, subtitle coverage, and project tests.

