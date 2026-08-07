# K-SORT

> Learn it. Scan it. Sort it right in Korea.

명지전문대 유학생을 위한 한국 분리배출 교육 웹앱입니다. 영상으로 배우고, 사진으로 찾고,
16종 도감에서 확인하고, 게임으로 복습합니다. 화면과 콘텐츠 전부가 **한국어·영어·중국어·
베트남어** 네 언어로 동작합니다.

`Made for international students at Myongji College` — 팀 메이크 업로드 (Make Upload)

## 무엇을 하는 앱인가

네 화면이 한 줄로 이어지고, 어느 화면에서든 챗봇을 열 수 있습니다.

```
소개 ─→ 영상으로 배우기 ─→ 도감(+사진으로 찾기) ─→ 게임
                              ↕                    │
                            챗봇 ←──────────────────┘
```

**이 앱의 핵심은 사진과 대화가 서로의 출구라는 점입니다.** 사진으로 찾았는데 도감에 없으면
챗봇으로, 검색이 0건이면 챗봇으로, 게임에서 틀리면 그 품목 도감으로 넘어갑니다. 어느
화면에서도 막다른 길이 없습니다. → [핵심 강점](docs/CORE_STRENGTH.md)

- **영상으로 배우기** — 2분짜리 안내 영상에 네 언어 자막. SRT로 들어와도 실행 중에 변환합니다
- **도감** — 16종의 처리 순서·흔한 실수·공식 출처. 검색은 고른 언어와 한국어를 함께 봅니다
- **사진으로 찾기** — 사진 한 장에서 물건을 최대 다섯 개까지 찾아 도감으로 잇습니다
- **챗봇** — 도감이 다루는 것은 출처를 붙여 답하고, 도감 밖은 출처 없이 답하며 그 사실을
  답변에 적습니다. 추천 질문 20개는 모델을 부르지 않고 바로 답합니다
- **게임** — 열 문제를 풀고, 틀린 품목은 눌러서 도감으로 돌아갑니다

## 지금 상태

**구현이 끝난 상태입니다.** 도감 16종과 FAQ 20개가 네 언어로 채워져 있고, 공식 출처 다섯
개는 실제 주소를 확인했습니다. 검수 대기 문안(`__TODO__`)은 0개입니다.

⚠️ 네 언어 번역은 **실제 유학생의 검토를 받지 못했습니다.**

## 실행

```powershell
npm install
npm run dev          # 개발 서버
npm run check        # lint + test + build. 커밋 전에 실행합니다
```

AI 기능(챗봇·사진으로 찾기)까지 로컬에서 쓰려면 `.dev.vars`에 Gemini 키를 두고
`npm run worker:dev`를 함께 띄웁니다. 자세한 건 [STATUS](docs/STATUS.md)를 보세요.

```powershell
npm run test:run     # 테스트 1회
npm run worker:dev   # API 로컬 실행
npx vercel deploy --prod   # API 배포
```

## 기술

라이브러리를 고를 때 기준은 하나였습니다. **24시간 안에 끝내야 하니, 배우는 데 시간이 드는
것은 쓰지 않는다.** 상태 관리 라이브러리도, 라우터도, CSS 프레임워크도 넣지 않았습니다.

| 자리 | 쓴 것 | 왜 |
| --- | --- | --- |
| 화면 | React 19 + Vite 8 | 빌드가 빠르고 설정이 적다 |
| 언어 | TypeScript **6.0.3 고정** | 7.x는 typescript-eslint가 아직 지원하지 않아 lint가 깨진다 |
| 검증 | Zod 4 | 브라우저·서버·모델 응답 검증에 같은 스키마를 쓴다 |
| 테스트 | Vitest 4 + Testing Library | 빌드 도구와 같은 설정을 쓴다 |
| 스타일 | 일반 CSS + 토큰 파일 | 색·간격·글자 크기를 한 곳에 모았다 |
| 라우팅 | 직접 만든 해시 라우팅 | 페이지 넷뿐이라 훅 하나로 끝난다 |
| API | **Vercel Functions** | Gemini가 Cloudflare 출구 IP를 지역 차단해 옮겼다 |
| 모델 | Gemini `gemini-3.5-flash-lite` | 상위 모델은 무료 한도가 하루 20회뿐이었다 |
| 배포 | GitHub Pages (`base: /make-upload/`) | 정적 호스팅. API만 Vercel에 따로 있다 |

콘텐츠 제작에는 Seedance(영상), Typecast(내레이션), Suno(BGM), 나노바나나(품목 이미지)를
썼습니다. → [AI 제작 과정과 프롬프트](docs/AI_PROCESS_AND_PROMPTS.md)

⚠️ `worker/` 폴더 이름은 Cloudflare 시절의 흔적입니다. 실제 실행은 `api/[...path].ts`가 합니다.

## 보안

- Gemini API 키는 로컬 `.dev.vars`와 Vercel 환경 변수에만 둡니다. 저장소에 커밋하지 않습니다
- 사용자 사진과 대화 원문을 서버에도 로그에도 저장하지 않습니다
- 무료 Gemini 등급은 제출 이미지가 학습에 쓰일 수 있어, 사진을 올리기 **전에** 알립니다
- 출처 URL은 실제로 열어 확인한 것만 링크가 됩니다. 미확인은 링크를 만들지 않습니다

## 문서

| 문서 | 무엇이 있나 |
| --- | --- |
| [CORE_STRENGTH](docs/CORE_STRENGTH.md) | 이 프로젝트의 강점과 시연 순서 |
| [AI_DEV_EVIDENCE](docs/AI_DEV_EVIDENCE.md) | 개발 과정에서 AI가 잡아낸 것과 사람이 되돌린 것 |
| [FEATURE_PLAN](docs/FEATURE_PLAN.md) | 뒤에 붙인 기능들의 계획과 결과 |
| [STATUS](docs/STATUS.md) | 지금 진실. 세션 시작 때 읽습니다 |
| [worklog](docs/worklog.md) | 한 줄 이력 |
| [AI_PROCESS_AND_PROMPTS](docs/AI_PROCESS_AND_PROMPTS.md) | 콘텐츠를 만들 때 쓴 프롬프트 |
| [REPORT_AND_PPT_HANDOFF](docs/REPORT_AND_PPT_HANDOFF.md) | 보고서·PPT 인수인계 |
| [RETROSPECTIVE](docs/RETROSPECTIVE.md) | 팀원 소감 |
| [설계](docs/superpowers/specs/2026-08-06-k-sort-design.md) | 제품 설계 |
| [CLAUDE.md](CLAUDE.md) | AI 코딩 도구가 지킬 규칙 |

## 팀원

| 이름 | 역할 | 학과 |
| --- | --- | --- |
| 박재웅 | 팀장, 기획, 발표, AI 영상·콘텐츠 제작 | AI게임소프트웨어학과 |
| 김현민 | 웹앱·게임 개발, 에셋 | AI게임소프트웨어학과 |
