# K-SORT Seedance 생성 실행서

## 현재 상태

프리프로덕션은 완료됐고 이 문서의 다음 단계부터 비용이 발생한다. 현재 작업에서는 API를 호출하지 않았다.

## 실행 전 필수 조건

1. 대화에 노출됐던 fal.ai 키를 fal 대시보드에서 폐기한다.
2. 새 키를 로컬 환경변수 `FAL_KEY`로만 설정한다.
3. `public/media/preproduction/keyframes/S01.png`부터 `S14.png`가 모두 열리는지 확인한다.
4. `docs/video/seedance-generation-manifest.json`의 18개 클립 길이 합계가 120초인지 확인한다.
5. fal.ai 공식 모델 페이지에서 가격과 입력 스키마가 바뀌지 않았는지 마지막으로 확인한다.

키 관리: <https://fal.ai/dashboard/keys>

모델 문서: <https://fal.ai/models/fal-ai/bytedance/seedance/v1.5/pro/image-to-video/api>

## 비용 상한

fal.ai 공식 페이지의 현재 기준은 오디오 없이 백만 비디오 토큰당 1.2달러이며, 토큰 공식은 `(높이 × 너비 × FPS × 초) / 1024`다.

- 720p, 24fps, 120초 1차 생성 예상: 약 3.11달러
- S06 7초와 S12b 4초의 두 번째 후보까지 생성할 때 추가 예상: 약 0.29달러
- 계획된 최대 예상: 약 3.40달러

실제 청구는 모델 페이지와 플랫폼 계산 결과를 우선한다. 2.0으로 자동 승격하지 않는다.

## 생성 순서

아래 순서를 바꾸지 않는다. 앞 클립의 마지막 프레임이 필요한 두 체인이 있기 때문이다.

1. 저위험 확인: S01, S02, S03
2. 네 원칙: S04, S05, S06, S07
3. 페트병 체인: S08a 생성 → 마지막 프레임 추출 → S08b
4. 오염 용기 체인: S09a 생성 → 마지막 프레임 추출 → S09b
5. 음식물: S10, S11
6. 특수폐기물: S12a, S12b, S12c
7. 결말: S13, S14

한 클립을 생성한 즉시 검수하고 통과한 뒤 다음으로 이동한다. 마지막에 한꺼번에 검수하지 않는다.

## API 구현 형태

아래 구조로 `@fal-ai/client`를 사용한다. 코드는 설명용이며 현재 실행하지 않는다.

```js
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

async function uploadPng(path) {
  const bytes = await readFile(path);
  const file = new File([bytes], basename(path), { type: "image/png" });
  return fal.storage.upload(file);
}

async function generateClip(manifest, clip, imageUrl) {
  const prompt = [
    manifest.promptPrefix,
    clip.motionPrompt,
    manifest.negativeSuffix,
  ].join(" ");

  return fal.subscribe(manifest.endpoint, {
    input: {
      ...manifest.sharedInput,
      image_url: imageUrl,
      prompt,
      duration: String(clip.duration),
      camera_fixed: clip.camera_fixed,
      seed: clip.seed,
    },
    logs: true,
  });
}
```

`derivedFinalFrame` 입력은 직전 MP4의 마지막 안정 프레임을 PNG로 추출해 업로드한다.

```powershell
ffmpeg -sseof -0.20 -i public/media/generated/S08a.mp4 -frames:v 1 public/media/preproduction/keyframes/S08b-derived.png
ffmpeg -sseof -0.20 -i public/media/generated/S09a.mp4 -frames:v 1 public/media/preproduction/keyframes/S09b-derived.png
```

## 클립별 합격 기준

공통:

- 시작 프레임과 첫 영상 프레임의 인물·물체가 일치한다.
- 물체 수가 늘거나 줄지 않는다.
- 손가락이 합쳐지거나 추가되지 않는다.
- 생성형 글자와 로고가 없다.
- 종료 8프레임 이상이 안정적이라 다음 컷과 연결할 수 있다.
- 오디오 트랙이 생성되지 않는다.

고위험:

- S06: 라벨이 한 장이며 병과 손에 녹아들지 않는다.
- S08a: 병만 압착되고 뚜껑과 라벨은 고정된다.
- S09a: 물이 싱크 밖으로 넘치지 않는다.
- S10: 음식물의 종류와 양이 갑자기 바뀌지 않는다.
- S12b: 형광등이 온전하고 수평이며 양손 지지가 유지된다.
- S14: 네 명이 끝까지 같은 인물·의상을 유지한다.

## 즉시 중단 조건

다음 중 하나라도 발생하면 해당 결과를 저장하지 않고 프롬프트 또는 시작 프레임을 수정한다.

- 얼굴, 헤어클립, 재킷 또는 출연자 수가 변함
- 손가락·팔이 추가되거나 물체와 융합됨
- 건전지, 병, 라벨, 형광등이 사라지거나 복제됨
- 형광등이 깨지거나 휘어짐
- 화면에 글자, 로고, 표지판, 워터마크가 나타남
- 모델이 장면을 임의 전환하거나 카메라를 과격하게 움직임
- `generate_audio:false`인데 오디오가 포함됨

## 2.0 승격 규칙

같은 시작 프레임과 수정된 프롬프트로 Seedance 1.5 Pro를 두 번 시도해도 실패한 클립만 2.0 후보가 된다. 자동 승격하지 않고 예상 가격을 다시 계산한 뒤 사용한다. 우선 후보는 S06과 S12b뿐이다.

## 생성 후 편집 입력

- 비디오: `public/media/generated/*.mp4`
- 내레이션: `public/media/audio/vo-S01.wav`부터 `vo-S14.wav`
- 음악: 선택한 Suno 무보컬 파일
- 자막: `public/subtitles/ko.vtt`
- 정확한 순서와 오버레이: `docs/video/shot-manifest.json`
- 믹스 기준: `docs/video/audio/MIX_CUES.md`

최종 납품 파일은 `public/media/k-sort-guide.mp4`, 1280×720 H.264, 약 120초다.
