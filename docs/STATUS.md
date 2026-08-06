# STATUS — 지금 진실

> 이 파일은 **덮어쓰기**로 유지된다. 세션 종료 시 갱신.
> 현재는 김현민 개발 진행 상황만 추적한다.

**마지막 갱신**: 2026-08-06 · 현민

## 현재 단계

- **큰 마일스톤**: Task 10까지 완료. 다섯 화면이 모두 동작한다. **API가 실제 Gemini를 부른다.**
- **웹앱**: <https://kodol05.github.io/make-upload/>
- **API**: <https://make-upload.vercel.app> — `POST /api/chat`, `POST /api/scan`
- **진행 중 Task**: Task 11 (배포와 운영 연결) 마무리 단계
- **Blocker**: 없음. Pages 배포가 6번 연속 실패했으나 원인을 찾아 고쳤다(PR #27, 아래 참조).

## 지금 · 다음

| 지금 | 다음 |
|------|------|
| Task 11: Pages 재배포로 API 주소 주입 | Task 12: 최종 검증·증거 수집·발표 동결 |

## 🔴 API는 Cloudflare가 아니라 Vercel에 있다

Cloudflare Worker로 배포했더니 Gemini가 이렇게 거부했다.

```
User location is not supported for the API use.
```

한국에서 보내는데도 막힌 이유는 Google이 보는 것이 사용자 위치가 아니라 **Worker의
출구 IP**이기 때문이다. Cloudflare 대역이 미지원 지역으로 판정된다. smart placement로
지역을 옮겨도, AI Gateway를 경유해도 똑같이 실패했다.

그래서 API를 **Vercel Functions(`iad1`)** 로 옮겼다. Worker 코드가 표준 `Request`/
`Response`만 쓰고 있어서 거의 그대로 옮겨갔고, Cloudflare 전용 바인딩이던 rate limiter만
`worker/src/rateLimit.ts`의 메모리 구현으로 갈아 끼웠다.

| | 값 |
|---|---|
| 고정 주소 | `https://make-upload.vercel.app` |
| 진입점 | `api/[...path].ts` → `worker/src/index.ts` |
| 설정 | `vercel.json` |
| 프로젝트 | `koya5/make-upload` |

**배포마다 생기는 `make-upload-xxxx-koya5.vercel.app` 주소는 쓰지 않는다.** 매번 바뀐다.
고정 별칭만 `VITE_API_BASE_URL`에 넣는다.

`wrangler.jsonc`와 Cloudflare Worker(`k-sort-api.momomomkiop3.workers.dev`)는 남아 있지만
쓰지 않는다.

### ⚠️ Vercel은 TypeScript를 번들하지 않는다

트랜스파일만 해서 출력이 순수 ESM이 된다. ESM은 확장자 생략을 허용하지 않으므로
**`api/`와 `worker/`의 상대 임포트에는 `.js`를 붙인다.** 소스는 `.ts`인데 임포트는 `.js`로
쓰는 것이 맞다. 빠뜨리면 배포 후 런타임에 `ERR_MODULE_NOT_FOUND`가 난다.

```ts
import worker from '../worker/src/index.js';   // ← .js
```

### 운영 설정

```powershell
npx vercel env add GEMINI_API_KEY production   # 키는 여기에만 둔다
npx vercel project protection disable --sso    # 공개 API라 SSO 보호를 끈다
gh variable set VITE_API_BASE_URL --body "https://make-upload.vercel.app"
```

`VITE_API_BASE_URL`은 **빌드 시점에 박힌다.** 값을 바꾸면 Pages를 다시 배포해야 반영된다.

## 준비할 것

- Google AI Studio에서 Gemini API 키 발급
- 로컬 `.dev.vars`에 `GEMINI_API_KEY` 저장 (커밋하지 않는다)
- Vercel 계정 로그인 (`npx vercel login`)

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

**무료 등급은 Google이 제출 이미지를 서비스 개선에 쓸 수 있어** 스캔 화면에 그 사실을
고지한다(`ui.scanner.privacyNotice`).

Vercel 무료는 함수 실행 시간이 넉넉해서 Workers의 요청당 CPU 10ms 제약이 사라졌다. 다만
Task 8에서 이미 브라우저가 base64로 인코딩해 보내도록 바꿔 두었으므로 그대로 둔다.

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
vitest 4.1.10 · eslint 10.8.0
```

테스트 235 passed / 3 skipped(릴리스 게이트). `npm run check` (lint + test + build) 통과 상태.
main에 병합하면 웹앱은 Pages로, API는 Vercel로 각각 자동 배포된다.

## 인터페이스 계약 (병렬 작업용)

**확정됨.** 아래 이름과 형태는 Task 3 이후가 의존하므로 바꿀 때 여기를 먼저 고친다.

```ts
// shared/types.ts
locales / itemIds / categories        // as const 배열. 순회와 Zod enum에 함께 쓴다
Locale = 'ko' | 'en' | 'zh' | 'vi'
LocalizedText = Record<Locale, string>
Category = 'recyclable' | 'food' | 'general' | 'special'
ItemId = 16종 고정 유니온
CatalogStep  { id, text }             // 이미지는 품목당 한 장으로 바꾸면서 단계에서 뺐다
CatalogItem  { id, category, name, aliases, summary, image, steps, commonMistake, needsLocalCheck, sourceIds }
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

## ⚠️ Pages 배포가 느리다 — 타임아웃을 건드리지 말 것

이 저장소의 Pages 배포는 큐에서 **3~9분**을 기다린다. `actions/deploy-pages`의 기본
타임아웃이 정확히 10분이라 계속 아슬아슬했고, 2026-08-06 11:29부터 그 선을 넘어
6번 연속 실패했다. 액션은 시간이 지나면 포기하는 게 아니라 **배포를 직접 취소한다.**

```
##[error]Timeout reached, aborting!
Canceling Pages deployment...
```

그래서 workflow에 두 가지를 박아 두었다(PR #27). 되돌리지 않는다.

- `timeout: 1800000` — 30분. 큐가 느려도 기다린다
- `cancel-in-progress: false` — 배포가 몇 분씩 걸리는데 그 사이 다음 커밋이 들어와
  취소해 버리면 어느 것도 끝나지 못한다. 그날 취소된 실행이 6건이었다

**교훈**: 배포가 실패하면 코드부터 의심하지 말고 **어느 job에서 죽었는지, 첫 실패
커밋이 무엇을 바꿨는지** 먼저 본다. 여기서는 첫 실패가 문서만 바꾼 커밋이었고
빌드는 6번 모두 성공했다. 코드가 아니라는 증거가 로그에 이미 있었다.

## 다음 액션 (우선순위)

1. 배포본에서 챗봇·스캔이 실제로 도는지 확인 (번들에 `make-upload.vercel.app`이 있는지)
2. Task 12: 릴리스 게이트 `.skip` 해제, 스크린샷, 리허설 3회, secret 검색, 태그

## 최근 결정 · 변경

- 2026-08-06 · **API를 Cloudflare에서 Vercel로 이전.** Gemini가 Cloudflare 출구 IP를 지역 차단 (PR #25)
- 2026-08-06 · 챗봇·스캔 모두 `gemini-3.5-flash-lite`로. 3.6-flash는 하루 20회뿐
- 2026-08-06 · Task 10 완료. 기능별 오류 경계와 모달 포커스 가둠 (PR #24)
- 2026-08-06 · Task 9 완료. 게임 (PR #20)
- 2026-08-06 · Task 8 완료. AI Sort Scan 두 경로 (PR #19)
- 2026-08-06 · Task 7 완료. 근거 기반 챗봇 (PR #18)
- 2026-08-06 · Task 6 완료. Worker 기반과 `toGeminiSchema` (PR #16)
- 2026-08-06 · Task 5 완료. 16종 도감 (PR #14)
- 2026-08-06 · Task 4 완료. 영상과 4대 원칙 (PR #11)
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
