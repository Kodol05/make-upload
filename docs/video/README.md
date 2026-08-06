# K-SORT 2분 영상 프리프로덕션 패키지

상태: **Seedance 생성 준비 완료 — 유료 호출 미실행**

## 빠른 시작

1. [제작 바이블](PRODUCTION_BIBLE.md)에서 캐릭터·색·카메라 잠금을 확인한다.
2. [스토리보드](STORYBOARD.md)와 [120초 샷 매니페스트](shot-manifest.json)를 확인한다.
3. [Seedance 프롬프트](prompts/seedance-shot-prompts.md)와 [생성 매니페스트](seedance-generation-manifest.json)를 함께 연다.
4. 노출된 fal.ai 키를 폐기하고 새 `FAL_KEY`를 설정한다.
5. [생성 실행서](GENERATION_RUNBOOK.md)의 순서대로 한 클립씩 생성·검수한다.

## 문서 산출물

| 파일 | 역할 |
| --- | --- |
| `PRODUCTION_BIBLE.md` | 아트·캐릭터·공간·카메라 단일 기준 |
| `STORYBOARD.md` | 14개 샷의 사람용 화면 설계 |
| `shot-manifest.json` | 정확히 120초인 편집 타임라인 |
| `NARRATION_KO.md` | 장면별 한국어 내레이션과 발음 디렉션 |
| `public/subtitles/ko.vtt` | 14개 큐 한국어 자막 |
| `audio/elevenlabs-fal-request.json` | 14개 장면별 fal.ai ElevenLabs 요청 명세 |
| `audio/TTS_DIRECTION.md` | 보이스·발음·후처리 지침 |
| `audio/SUNO_PROMPT.md` | 2분 무보컬 Suno Custom Mode 프롬프트 |
| `audio/MIX_CUES.md` | 내레이션·BGM·효과음 믹싱 큐 |
| `prompts/character-sheet-prompts.md` | 캐릭터 시트 원문 프롬프트 |
| `prompts/background-sheet-prompts.md` | 배경 시트 원문 프롬프트 |
| `prompts/storyboard-prompts.md` | 스토리보드 시트 원문 프롬프트 |
| `prompts/keyframe-prompts.md` | 14개 독립 시작 프레임 원문 프롬프트 |
| `prompts/seedance-shot-prompts.md` | 18개 생성 클립의 모션 프롬프트 |
| `seedance-generation-manifest.json` | 모델·비용·입력·출력·재시도 정책 |
| `GENERATION_RUNBOOK.md` | 실제 유료 생성 순서와 중단 조건 |
| `QUALITY_CHECKLIST.md` | 프리프로덕션과 생성 결과 합격 기준 |

## 이미지 산출물

### 캐릭터

- [미나 캐릭터 시트](../../public/media/preproduction/character-sheet-mina.png)
- [보조 출연자 시트](../../public/media/preproduction/character-sheet-supporting-cast.png)

### 배경

- [기숙사 주방](../../public/media/preproduction/background-dorm-kitchen.png)
- [캠퍼스 분리배출장](../../public/media/preproduction/background-recycling-station.png)
- [특수폐기물 수거 지점](../../public/media/preproduction/background-special-collection.png)
- [캠퍼스 허브](../../public/media/preproduction/background-campus-hub.png)

### 스토리보드

- [S01–S05](../../public/media/preproduction/storyboard-01-05.png)
- [S06–S10](../../public/media/preproduction/storyboard-06-10.png)
- [S11–S14](../../public/media/preproduction/storyboard-11-14.png)

### Seedance 시작 프레임

`public/media/preproduction/keyframes/S01.png`부터 `S14.png`까지 14장이다. 모두 1672×941, 16:9 원본이며 각 파일은 연락처 시트가 아닌 독립 프레임이다.

## 의도적인 미완료 항목

- Seedance MP4: 비용 발생 전 단계에서 정지
- ElevenLabs WAV: 회전된 fal.ai 키와 보이스 미리 듣기가 필요
- Suno BGM: Suno 계정에서 세 버전을 생성한 뒤 한 버전 선택 필요
- 영어·중국어·베트남어 자막: 한국어 음성 길이가 고정된 다음 번역·큐 복제
- 최종 `public/media/k-sort-guide.mp4`: 영상·음성·음악 생성 후 편집

## 공식 사실 근거

생활폐기물 분리배출 누리집: <https://www.xn--oy2b29bd3a601b.kr/front/search/searchDispose.do>

무색 페트병, 음식물류폐기물, 닭뼈, 조개껍데기, 건전지, 형광등 안내를 확인했으며 영상은 지역별 세부 차이를 명시한다.
