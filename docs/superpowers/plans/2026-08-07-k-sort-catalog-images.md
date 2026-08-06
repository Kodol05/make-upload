# K-SORT Catalog Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate, validate, optimize, and install three catalog images—clear PET bottle, aluminum can, and empty cup-noodle container—that match the K-SORT video art direction.

**Architecture:** Use the built-in image generator once per distinct asset, with the existing video keyframes as visual references and one shared art-direction block. Inspect each result before conversion, then install only approved WebP files under the catalog's existing path convention; no application code changes are required.

**Tech Stack:** Built-in image generation, local image inspection, bundled Python/Pillow or an available WebP encoder, Vite/React static assets, Git.

## Global Constraints

- Output canvas: exactly 1:1 square; generate at 1024×1024 or larger and preserve a square crop.
- Composition: one centered object, generous padding, no cropping.
- Style: friendly non-childish stylized 3D public-information animation matching `public/media/preproduction/keyframes/S01.png`, `S04.png`, and `S10.png`.
- Look: warm ivory `#F7F5EF` background, warm morning daylight, soft global illumination, gentle contact shadow, rounded readable form, believable everyday material.
- Accents: deep teal `#0F766E` and clean blue `#2563EB` only when naturally useful; do not force accent colors onto the object.
- Exclude readable text, letters, numbers, captions, labels, logos, brand marks, recycling symbols, watermarks, people, hands, and disposal bins.
- Final paths: `public/images/items/clear-pet.webp`, `public/images/items/can.webp`, and `public/images/items/cup-noodle.webp`.
- Target each optimized file at 200KB or less when this does not visibly damage the object silhouette or material.

---

### Task 1: Generate and install the clear PET bottle

**Files:**
- Reference: `public/media/preproduction/keyframes/S01.png`
- Reference: `public/media/preproduction/keyframes/S04.png`
- Create: `public/images/items/clear-pet.webp`

**Interfaces:**
- Consumes: the Global Constraints and the two listed video keyframes as style-only references.
- Produces: a static image already referenced by `shared/catalog.ts` as `/images/items/clear-pet.webp`.

- [ ] **Step 1: Generate one PET-bottle candidate**

Use the built-in image generator with this prompt:

```text
Use case: stylized-concept
Asset type: K-SORT web catalog item image
Input images: the supplied K-SORT video keyframes are style, lighting, palette, and material references only
Primary request: Create a single clean, empty, transparent PET water bottle with both label and cap removed.
Style/medium: friendly non-childish stylized 3D public-information animation; clean rounded form with believable PET texture; match the reference video's warm, softly rendered 3D finish.
Scene/backdrop: seamless warm ivory #F7F5EF studio background.
Composition/framing: exactly 1:1 square, one upright bottle centered, eye-level three-quarter product view, generous padding on every side.
Lighting/mood: warm morning daylight, soft global illumination, gentle contact shadow, calm optimistic mood.
Constraints: the bottle must read as thin transparent PET rather than glass; preserve subtle molded ribs and realistic refraction; no liquid.
Avoid: readable text, letters, numbers, labels, cap, logos, brand marks, recycling symbols, watermark, colored plastic, glass-like thickness, people, hands, bins, extra objects, dramatic lighting.
```

- [ ] **Step 2: Inspect the generated candidate**

Open the returned image at original detail and reject it if the bottle is cropped, opaque, glass-like, capped, labeled, filled, off-center, or contains any excluded element. If rejected, regenerate once with only the failed invariant emphasized.

- [ ] **Step 3: Convert and optimize the approved candidate**

Create `public/images/items/` if absent. Convert the approved square source to 800×800 WebP, initially at quality 88. If it exceeds 200KB, retry at quality 82; do not reduce below quality 80 without visually inspecting the result.

- [ ] **Step 4: Validate the installed asset**

Verify that the image dimensions are 800×800, format is WebP, file size is at most 200KB when visually acceptable, and the object remains recognizable when viewed near 160×160.

- [ ] **Step 5: Commit the PET asset**

```powershell
git add -- public/images/items/clear-pet.webp
git commit -m "assets: add clear PET catalog image"
```

### Task 2: Generate and install the aluminum can

**Files:**
- Reference: `public/media/preproduction/keyframes/S01.png`
- Reference: `public/media/preproduction/keyframes/S04.png`
- Create: `public/images/items/can.webp`

**Interfaces:**
- Consumes: the Global Constraints and Task 1's approved framing, background brightness, camera height, and shadow direction.
- Produces: a static image already referenced by `shared/catalog.ts` as `/images/items/can.webp`.

- [ ] **Step 1: Generate one aluminum-can candidate**

Use the built-in image generator with this prompt:

```text
Use case: stylized-concept
Asset type: K-SORT web catalog item image
Input images: the supplied K-SORT video keyframes are style, lighting, palette, and material references only
Primary request: Create a single clean, empty, uncrushed silver aluminum beverage can with a plain unprinted surface.
Style/medium: friendly non-childish stylized 3D public-information animation; clean rounded form with believable brushed-aluminum texture; match the reference video's warm, softly rendered 3D finish.
Scene/backdrop: seamless warm ivory #F7F5EF studio background.
Composition/framing: exactly 1:1 square, one upright can centered, eye-level three-quarter product view, generous padding on every side; match the PET image's object scale.
Lighting/mood: warm morning daylight, soft global illumination, gentle contact shadow, calm optimistic mood; match the PET image's shadow direction.
Constraints: intact cylindrical silhouette, recognizable pull-tab top, neutral silver metal, no liquid.
Avoid: readable text, letters, numbers, printed graphics, labels, logos, brand marks, recycling symbols, watermark, colored paint, crushed shape, people, hands, bins, extra objects, dramatic lighting.
```

- [ ] **Step 2: Inspect the generated candidate**

Open the returned image at original detail and reject it if the can is cropped, crushed, colored, printed, filled, off-center, toy-like, or contains any excluded element. If rejected, regenerate once with only the failed invariant emphasized.

- [ ] **Step 3: Convert and optimize the approved candidate**

Convert the approved square source to 800×800 WebP, initially at quality 88. If it exceeds 200KB, retry at quality 82; do not reduce below quality 80 without visually inspecting the result.

- [ ] **Step 4: Validate the installed asset**

Verify that the image dimensions are 800×800, format is WebP, file size is at most 200KB when visually acceptable, and its framing, background, and shadow align with `clear-pet.webp`.

- [ ] **Step 5: Commit the can asset**

```powershell
git add -- public/images/items/can.webp
git commit -m "assets: add aluminum can catalog image"
```

### Task 3: Generate and install the cup-noodle container

**Files:**
- Reference: `public/media/preproduction/keyframes/S01.png`
- Reference: `public/media/preproduction/keyframes/S10.png`
- Create: `public/images/items/cup-noodle.webp`

**Interfaces:**
- Consumes: the Global Constraints and Tasks 1–2's approved framing, background brightness, camera height, and shadow direction.
- Produces: a static image already referenced by `shared/catalog.ts` as `/images/items/cup-noodle.webp`.

- [ ] **Step 1: Generate one cup-noodle-container candidate**

Use the built-in image generator with this prompt:

```text
Use case: stylized-concept
Asset type: K-SORT web catalog item image
Input images: the supplied K-SORT video keyframes are style, lighting, palette, and material references only
Primary request: Create a single clean, empty, plain white Korean instant-noodle cup container with its lid completely removed.
Style/medium: friendly non-childish stylized 3D public-information animation; clean rounded form with believable lightweight paper or foam-container texture; match the reference video's warm, softly rendered 3D finish.
Scene/backdrop: seamless warm ivory #F7F5EF studio background.
Composition/framing: exactly 1:1 square, one container centered, slightly elevated three-quarter view so the empty interior is clearly visible, generous padding on every side; match the other catalog images' object scale.
Lighting/mood: warm morning daylight, soft global illumination, gentle contact shadow, calm optimistic mood; match the other images' shadow direction.
Constraints: empty clean interior, plain unprinted outer wall, no lid anywhere in the frame.
Avoid: readable text, letters, numbers, printed graphics, labels, logos, brand marks, recycling symbols, watermark, noodles, soup, food residue, stains, chopsticks, lid, people, hands, bins, extra objects, dramatic lighting.
```

- [ ] **Step 2: Inspect the generated candidate**

Open the returned image at original detail and reject it if the container is cropped, closed, printed, dirty, filled, off-center, toy-like, or contains any excluded element. If rejected, regenerate once with only the failed invariant emphasized.

- [ ] **Step 3: Convert and optimize the approved candidate**

Convert the approved square source to 800×800 WebP, initially at quality 88. If it exceeds 200KB, retry at quality 82; do not reduce below quality 80 without visually inspecting the result.

- [ ] **Step 4: Validate the installed asset**

Verify that the image dimensions are 800×800, format is WebP, file size is at most 200KB when visually acceptable, and its framing, background, and shadow align with the other two assets.

- [ ] **Step 5: Commit the cup-noodle asset**

```powershell
git add -- public/images/items/cup-noodle.webp
git commit -m "assets: add cup-noodle catalog image"
```

### Task 4: Verify the three-image catalog set

**Files:**
- Verify: `public/images/items/clear-pet.webp`
- Verify: `public/images/items/can.webp`
- Verify: `public/images/items/cup-noodle.webp`
- Verify: `shared/catalog.ts`

**Interfaces:**
- Consumes: the three installed WebP assets from Tasks 1–3 and the existing catalog path mapping.
- Produces: a visually consistent, application-ready three-image set with no code changes.

- [ ] **Step 1: Compare the three files side by side**

Confirm that background hue, apparent camera height, object scale, top and side padding, contact-shadow softness, and overall saturation look like one coherent set.

- [ ] **Step 2: Verify the static path contract**

Run:

```powershell
Test-Path public/images/items/clear-pet.webp
Test-Path public/images/items/can.webp
Test-Path public/images/items/cup-noodle.webp
rg -n "clear-pet|can|cup-noodle" shared/catalog.ts
```

Expected: all three `Test-Path` calls return `True`, and the three catalog IDs resolve through the existing `/images/items/{itemId}.webp` convention.

- [ ] **Step 3: Run the relevant application tests**

Run:

```powershell
npm run test:run -- src/features/catalog/CatalogSection.test.tsx src/components/ItemImage.test.tsx
```

If `src/components/ItemImage.test.tsx` does not exist, run only `src/features/catalog/CatalogSection.test.tsx`; the asset contract is covered by the file and path checks in Step 2.

Expected: all selected tests pass.

- [ ] **Step 4: Confirm the working tree contains no unintended edits from this task**

Run:

```powershell
git status --short
```

Expected: only unrelated pre-existing user changes may remain; the three image commits and the approved documentation commits are already recorded.
