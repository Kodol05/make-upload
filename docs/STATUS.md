# STATUS — 지금 진실

> 이 파일은 **덮어쓰기**로 유지된다. 세션 종료 시 갱신.
> 현재는 김현민 개발 진행 상황만 추적한다.

**마지막 갱신**: 2026-08-06 · 현민

## 현재 단계

- **큰 마일스톤**: Task 8 완료. 학습 여정의 다섯 화면 중 게임을 뺀 넷이 동작한다.
- **배포 URL**: <https://kodol05.github.io/make-upload/> (프런트만. Worker는 아직 미배포)
- **진행 중 Task**: 없음 (Task 9 대기)
- **Blocker**: 없음. 다만 **Gemini API 키가 있어야 실제 호출을 확인할 수 있다.**

## 지금 · 다음

| 지금 | 다음 |
|------|------|
| Task 8 완료 (AI Sort Scan) | Task 9: 게임 연결 계약과 게임 통합 |

Task 9의 게임 내부 설계는 김현민의 별도 기획을 따른다. 현재 정해 둔 방향은
학습 도구 성격이고 시간 압박을 두지 않으며, 추가 처리가 필요한 품목은 퀴즈를
통과해야 배출할 수 있게 하는 것이다.

## 키를 받으면 바로 할 일

Task 6의 마지막 단계를 미뤄 두었다. 키가 생기면 이것부터 확인한다.

```powershell
npm run worker:dev
```

`toGeminiSchema`가 만든 스키마를 Gemini가 받는지 실제 호출로 본다.
`400 INVALID_ARGUMENT`가 나오면 오류 메시지에 적힌 키 이름을 `worker/src/gemini.ts`의
`UNSUPPORTED_KEYS`에 추가한다. 지금까지 확인한 문제는 세 가지다.

- `$schema`와 `additionalProperties`가 들어간다
- 튜플이 `prefixItems`로 나온다. 스캔 응답의 `box`가 여기 해당한다

## 준비할 것

- Google AI Studio에서 Gemini API 키 발급
- 로컬 `.dev.vars`에 `GEMINI_API_KEY` 저장 (커밋하지 않는다)
- Cloudflare 계정 로그인

### 🔴 무료 한도는 모델마다 다르고 생각보다 훨씬 빡빡하다

AI Studio에서 실제로 확인한 값이다. 조사 단계에서 적었던 1,500 RPD는 틀렸다.

| 모델 | 한도 | 용도 |
|------|------|------|
| `gemini-3.5-flash-lite` | 15 RPM · **500 RPD** | 챗봇·스캔 |
| `gemini-3.6-flash` | 5 RPM · **20 RPD** | 쓰지 않음 |

**한도는 모델마다 따로 잡히므로 나눠 쓰면 총량이 늘어난다.** 다만 3.6-flash의 하루 20회는
리허설 세 번이면 바닥나고, 실제로 호출해 보니 Lite도 이미지 입력을 받는다. 그래서 둘 다
Lite에 두고 500회를 함께 쓴다. 나누는 것보다 총량은 적지만 한쪽이 먼저 죽는 것보다 안전하다.

**남은 확인**: `gemini-3.5-flash`의 무료 한도가 넉넉하면 챗봇을 그쪽으로 옮겨 버킷을 다시
나눈다. `worker/src/gemini.ts`의 `CHAT_MODEL` 한 줄만 바꾸면 된다.

Workers는 100,000 req/day라 문제되지 않는다. 다만 **무료 등급은 Google이 제출 이미지를
서비스 개선에 쓸 수 있어** 스캔 화면에 그 사실을 고지한다(`ui.scanner.privacyNotice`).

Workers 무료는 요청당 CPU 10ms다. 1.5MB 이미지를 base64로 바꾸는 데 이 시간을 넘을 수
있으므로 Task 8에서 실측하고, 넘으면 브라우저에서 인코딩해 보내는 방식으로 바꾼다.

## 콘텐츠 대기 상황

에셋이 없어도 화면은 온전히 동작한다. 파일이 도착하면 코드 수정 없이 붙는다.

```
public/media/k-sort-guide.mp4    public/media/poster.webp
public/subtitles/{ko,en,zh,vi}.vtt
public/images/items/<itemId>.webp   # 16장
```

요청 내용과 전달 형식은 [콘텐츠 요청서](CONTENT_REQUEST.md)에 정리했다.

## 콘텐츠 진행률

```
자리 표시 620개 남음 · 출처 URL 0/5개 확인됨
```

이미지를 품목당 한 장으로 바꾸면서 단계 대체 텍스트 200개가 사라지고 품목 대체 텍스트
64개가 생겨 756개에서 620개로 줄었다. 화면 UI 문자열 268칸은 여기에 포함되지 않는다.

`npm run test:run -- shared/content-progress.test.ts`를 돌리면 현재 수치가 나온다.
남은 항목은 `git grep "__TODO__" -- shared`로 확인한다.

| 묶음 | 남은 개수 |
|------|---:|
| 품목 이름·요약·흔한 실수 | 176 |
| 품목 대표 이미지 대체 텍스트 | 64 |
| 처리 단계 설명 | 200 |
| FAQ 질문·답변 | 160 |
| 출처 제목 | 20 |

그 외에 출처 URL 5개와 FAQ 20개의 `sourceIds`가 비어 있고, 화면 UI 문자열 88개의
번역 264칸과 4대 원칙 설명 4개가 남아 있다.

## 확정된 환경

```
node 24.16.0 · npm 11.13.0
react 19.2.8 · vite 8.2.0 · typescript 6.0.3 · zod 4.4.3
vitest 4.1.10 · eslint 10.8.0 · wrangler 4.119.0
```

`npm run check` (lint + test + build) 통과 상태. main에 병합하면 Pages로 자동 배포된다.

## 인터페이스 계약 (병렬 작업용)

**확정됨.** 아래 이름과 형태는 Task 3 이후가 의존하므로 바꿀 때 여기를 먼저 고친다.

```ts
// shared/types.ts
locales / itemIds / categories        // as const 배열. 순회와 Zod enum에 함께 쓴다
Locale = 'ko' | 'en' | 'zh' | 'vi'
LocalizedText = Record<Locale, string>
Category = 'recyclable' | 'food' | 'general' | 'special'
ItemId = 16종 고정 유니온
CatalogStep  { id, image, text, alt }
CatalogItem  { id, category, name, aliases, summary, steps, commonMistake, needsLocalCheck, sourceIds }
Faq          { id, question, answer, relatedItemIds, sourceIds }
Source       { title, url }           // url이 빈 문자열이면 UI가 링크를 만들지 않는다
GameResult   { score, learnedItemIds }
ChatRequest / ChatResponse / ScanObject / ScanResponse

// shared/placeholder.ts
todo(itemId, field, locale)        → '__TODO__:clear-pet.summary.vi'
localized(itemId, field, values)   → LocalizedText   // 빠진 언어를 자리 표시로 메움
isTodo(value) / findTodos(value) / countTodos(value)

// shared/schemas.ts  ← Worker만 import한다. 프런트가 가져오면 Zod가 번들에 들어간다
chatRequestSchema / chatResponseSchema / scanResponseSchema
localeSchema / itemIdSchema
```

```ts
// src/app  ← Task 3에서 확정
useLocale()      → { locale, setLocale, t }   // t(LocalizedText) → string
useHashRoute()   → string                     // '/' 또는 '/game'
LocaleProvider   // localStorage 키는 'k-sort-locale'
                 // context는 localeContext.ts에 따로 둔다 (Fast Refresh)

// src/i18n/strings.ts  ← 화면 문자열은 전부 여기에 더한다
ui.nav.{learn,scan,catalog,chat,game}
ui.common.{language,close,retry,skipToContent}
ui.home.intro / ui.game.{title,backToHome}
```

Task 5의 도감 검색은 `aliases`를 쓴다. 현재 한국어 별칭만 채워져 있고
영어·중국어·베트남어 배열은 비어 있으므로, 그 언어의 별칭 검색 테스트는
번역이 도착한 뒤에 켠다.

`HomeRoute`와 `GameRoute`는 `src/app/App.tsx` 안의 최소 구현이다.
Task 4가 영상 섹션을, Task 9가 실제 게임을 각각 여기에 붙인다.

## 다음 액션 (우선순위)

1. Task 4: 영상과 4대 원칙 (에셋 없이 대체 UI부터)
2. Task 5: 16종 도감 검색·필터·상세

## 최근 결정 · 변경

- 2026-08-06 · Task 3 완료. 언어 전환·해시 라우팅·UI 문자열 사전 (PR #9)
- 2026-08-06 · Task 2 완료. 자리 표시로 콘텐츠 대기 없이 개발 가능 (PR #7)
- 2026-08-06 · Task 1 완료. Pages 배포까지 확인 (PR #5)
- 2026-08-06 · 스택 결정을 구현 계획·설계에 반영 (PR #4)
- 2026-08-06 · 기술 스택 확정: TypeScript 6 고정, generateContent, 해시 라우팅 직접 구현 (PR #3)
- 2026-08-06 · CLAUDE.md/STATUS.md/worklog.md 3종 세트 도입 (PR #2)
- 2026-08-06 · AI Sort Scan을 선택적 진입점, 도감을 K-SORT 정보 창으로 성격 재정의 (PR #1)

## Task 1에서 실제로 막혔던 것

다음 사람이 같은 곳에서 시간을 쓰지 않도록 남긴다.

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| eslint가 설정을 거부 | `reactHooks.configs['recommended-latest']`는 eslintrc 형식 | flat config는 `configs.flat['recommended-latest']` |
| `TS5101 baseUrl deprecated` | TypeScript 6가 `baseUrl` 폐기 예고 | `baseUrl` 제거 + `paths`를 `./` 상대 경로로 |
| React 타입을 못 찾음 | 설치 명령에 타입 패키지 누락 | `@types/react` `@types/react-dom` `@types/node` 추가 |
