# K-SORT Video Preproduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce every reviewed asset and execution manifest needed immediately before paid Seedance generation of the K-SORT two-minute recycling tutorial.

**Architecture:** A single visual bible controls character, environment, storyboard, audio, and video prompts. The 120-second timeline is represented once in a machine-readable shot manifest and mirrored in human-readable production documents; generated stills are references, not final video frames.

**Tech Stack:** Markdown, JSON, WebVTT, built-in image generation, fal.ai Seedance 1.5 Pro image-to-video, fal.ai ElevenLabs TTS, Suno Custom Mode, FFmpeg-compatible edit specifications.

## Execution Result

Completed in the current workspace. Tasks 1 through 8 produced 23 reviewed images, a 14-shot/120-second editorial timeline, an 18-clip/120-second Seedance manifest, 14 timed TTS requests, Korean WebVTT subtitles, Suno and mix directions, and a generation runbook. Paid Seedance, ElevenLabs, and Suno calls remain intentionally unexecuted at the user's requested boundary.

## Global Constraints

- Friendly, non-childish stylized 3D public-information animation in 16:9.
- Final delivery target is 1280×720 H.264, approximately 120 seconds.
- Generated visuals contain no readable text, numbers, logos, brands, flags, or watermarks.
- Mina's teal left-side hair clip, cream hoodie, forest-green jacket, navy pants, and white sneakers remain constant.
- One principal action and one camera behavior per generated shot.
- Paid generation is excluded; the exposed fal.ai key must never be used or stored.
- Disposal claims follow the official Korean household-waste separation portal and defer to local-government rules where applicable.

---

### Task 1: Lock the production bible

**Files:**
- Create: `docs/video/PRODUCTION_BIBLE.md`
- Create: `docs/video/QUALITY_CHECKLIST.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-08-06-k-sort-video-preproduction-design.md`
- Produces: canonical identity, style, camera, safety, and review rules used by every later task

- [ ] **Step 1: Write the production bible with exact visual tokens and negative constraints**
- [ ] **Step 2: Write a pass/fail checklist covering identity, action clarity, text, hands, facts, duration, and API-key safety**
- [ ] **Step 3: Verify that neither file contains unresolved-marker language, unresolved alternatives, or credentials**

Run: `rg -n "T[B]D|T[O]DO|FAL_KEY\\s*[:=]\\s*[^$]" docs/video`

Expected: no matches.

### Task 2: Generate character references

**Files:**
- Create: `docs/video/prompts/character-sheet-prompts.md`
- Create: `public/media/preproduction/character-sheet-mina.png`
- Create: `public/media/preproduction/character-sheet-supporting-cast.png`

**Interfaces:**
- Consumes: production bible identity tokens
- Produces: reference images for storyboard and Seedance starting frames

- [ ] **Step 1: Write one prompt for Mina's turnaround, expressions, hand poses, and prop scale**
- [ ] **Step 2: Generate and inspect Mina's sheet**
- [ ] **Step 3: Write one prompt for a diverse three-person supporting lineup**
- [ ] **Step 4: Generate and inspect the supporting-cast sheet**
- [ ] **Step 5: Record visible identity features and any residual limitations in the prompt document**

### Task 3: Generate environment references

**Files:**
- Create: `docs/video/prompts/background-sheet-prompts.md`
- Create: `public/media/preproduction/background-dorm-kitchen.png`
- Create: `public/media/preproduction/background-recycling-station.png`
- Create: `public/media/preproduction/background-special-collection.png`
- Create: `public/media/preproduction/background-campus-hub.png`

**Interfaces:**
- Consumes: production bible palette, lighting, and layout rules
- Produces: reference environments for storyboard panels and video shots

- [ ] **Step 1: Write four environment prompts with matching materials and daylight**
- [ ] **Step 2: Generate each environment as a separate image**
- [ ] **Step 3: Inspect perspective, forbidden text, container shapes, and palette continuity**
- [ ] **Step 4: Record which image maps to each storyboard shot**

### Task 4: Author the exact 120-second narrative package

**Files:**
- Create: `docs/video/NARRATION_KO.md`
- Create: `public/subtitles/ko.vtt`
- Create: `docs/video/STORYBOARD.md`
- Create: `docs/video/shot-manifest.json`

**Interfaces:**
- Consumes: official disposal facts and production bible
- Produces: fourteen shot records whose durations sum to 120 seconds

- [ ] **Step 1: Write the final Korean narration divided by shot**
- [ ] **Step 2: Define fourteen shots with exact in/out times, frame, action, transition, audio, and overlay copy**
- [ ] **Step 3: Mirror narration timing in valid WebVTT cues**
- [ ] **Step 4: Validate the JSON and compute duration sum**

Run: `node -e "const s=require('./docs/video/shot-manifest.json'); const total=s.shots.reduce((n,x)=>n+x.durationSeconds,0); if(total!==120) process.exit(1); console.log(total)"`

Expected: `120`.

### Task 5: Generate storyboard sheets

**Files:**
- Create: `docs/video/prompts/storyboard-prompts.md`
- Create: `public/media/preproduction/storyboard-01-05.png`
- Create: `public/media/preproduction/storyboard-06-10.png`
- Create: `public/media/preproduction/storyboard-11-14.png`

**Interfaces:**
- Consumes: character references, environment references, and shot manifest
- Produces: three readable storyboard sheets covering all fourteen shots

- [ ] **Step 1: Write three contact-sheet prompts with numbered layout described outside the generated artwork**
- [ ] **Step 2: Generate sheets for shots 1–5, 6–10, and 11–14**
- [ ] **Step 3: Inspect each panel against the shot manifest and document deviations**
- [ ] **Step 4: Keep generated panels text-free; panel numbers and captions live in `STORYBOARD.md`**

### Task 6: Package ElevenLabs TTS and Suno music

**Files:**
- Create: `docs/video/audio/elevenlabs-fal-request.json`
- Create: `docs/video/audio/TTS_DIRECTION.md`
- Create: `docs/video/audio/SUNO_PROMPT.md`
- Create: `docs/video/audio/MIX_CUES.md`

**Interfaces:**
- Consumes: final narration and exact timeline
- Produces: credential-free generation requests and mix instructions

- [ ] **Step 1: Prepare a fal.ai ElevenLabs request with Korean multilingual voice settings and no secret values**
- [ ] **Step 2: Add pronunciation and delivery notes for K-SORT, RFID, and foreign-student-friendly pacing**
- [ ] **Step 3: Write a Suno Custom Mode instrumental prompt with a 120-second dynamic arc**
- [ ] **Step 4: Define narration, BGM, and effect priorities for every timeline section**

### Task 6A: Generate shot-specific Seedance start frames

**Files:**
- Create: `docs/video/prompts/keyframe-prompts.md`
- Create: `public/media/preproduction/keyframes/S01.png` through `public/media/preproduction/keyframes/S14.png`

**Interfaces:**
- Consumes: character sheets, background sheets, storyboard sheets, and shot manifest
- Produces: one independent 16:9 `image_url` source file for each Seedance image-to-video request

- [ ] **Step 1: Write one start-frame prompt per shot with no in-progress motion blur**
- [ ] **Step 2: Generate each frame as a separate image using the minimum relevant references**
- [ ] **Step 3: Inspect identity, hands, object count, blank surfaces, and safe staging**
- [ ] **Step 4: Record any video-only motion that must not be baked into the still frame**

### Task 7: Package Seedance generation

**Files:**
- Create: `docs/video/prompts/seedance-shot-prompts.md`
- Create: `docs/video/seedance-generation-manifest.json`
- Create: `docs/video/GENERATION_RUNBOOK.md`

**Interfaces:**
- Consumes: character sheets, background sheets, storyboard sheets, and shot manifest
- Produces: one reviewed image-to-video request per shot with expected first and last frames

- [ ] **Step 1: Write concise English prompts for all fourteen shots**
- [ ] **Step 2: Map each shot to Seedance 1.5 Pro, reference assets, duration, resolution, and audio-disabled settings**
- [ ] **Step 3: Mark only the two highest-risk shots as eligible for a second candidate**
- [ ] **Step 4: Add stop conditions for identity drift, extra fingers, unsafe waste handling, spontaneous text, and object disappearance**
- [ ] **Step 5: Verify that generation commands read credentials only from `FAL_KEY` and do not execute them**

### Task 8: Final preflight

**Files:**
- Modify: `docs/video/QUALITY_CHECKLIST.md`
- Modify: `docs/video/GENERATION_RUNBOOK.md`

**Interfaces:**
- Consumes: every preproduction artifact
- Produces: a signed-off, generation-ready package with explicit remaining external actions

- [ ] **Step 1: Confirm all required files exist and all image files open**
- [ ] **Step 2: Validate both JSON manifests and the exact 120-second total**
- [ ] **Step 3: Scan the workspace changes for leaked keys and unresolved placeholder language**
- [ ] **Step 4: Record that the next paid action is Seedance generation and that a rotated fal.ai key is required**

Run: `rg -n "T[B]D|T[O]DO|FAL_KEY\\s*[:=]\\s*[^$]" docs/video public/media/preproduction public/subtitles`

Expected: no matches.
