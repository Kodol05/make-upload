# K-SORT

명지전문대 유학생용 한국 분리배출 교육 웹앱. 4개 언어(ko/en/zh/vi)로
영상·도감·AI 스캔·챗봇·게임을 제공한다. 24시간 해커톤 MVP.

팀 메이크 업로드 — 박재웅(기획·영상·발표) / 김현민(웹앱·게임·에셋)
이 문서는 **김현민의 Claude Code**가 지킬 규칙이다.

## 🔴 항상 지킬 3가지

1. **코드 쓰기 전에 무엇을 어떤 순서로 만들지 먼저 말한다**
2. **한 번에 기능 하나만 만든다** — 여러 개를 동시에 건드리지 않는다
3. **확실하지 않으면 추측하지 말고 묻는다**

## 작업 방식

- 이미 동작하는 코드는 그대로 둔다. 고쳐야 하면 왜 고치는지 먼저 말하고 동의를 받는다.
- 새 파일을 만들기 전에 기존 파일에 들어갈 자리가 있는지 먼저 본다.
- 설계 문서와 어긋나는 상황이 생기면 임의로 정하지 말고, 어떤 선택지가 있는지 설명하고 묻는다.
- 콘텐츠(도감 문안·번역·자막)가 필요한데 없으면 `__TODO__` 자리 표시로 진행하고
  재웅에게 필요한 형식을 알린다.
- 한 Task를 끝내면 다음 Task로 자동으로 넘어가지 않고 멈춰서 결과를 보고한다.

## 기술 스택

React 19 · Vite 8 · TypeScript 6 · Zod 4 · Vitest 4 · ESLint 10 · Wrangler 4
Cloudflare Worker + Gemini `:generateContent`
챗봇은 `gemini-3.5-flash-lite`, 스캔은 `gemini-3.6-flash`를 쓴다. 무료 한도가 모델마다
따로 잡혀 나눠 써야 총량이 는다. 모델은 `worker/src/gemini.ts`에서 정한다.
GitHub Pages 배포, Vite base `/make-upload/`, 해시 라우팅(직접 구현)
스타일은 일반 CSS + `src/styles/tokens.css`

⚠️ **TypeScript는 6.0.x를 쓴다.** 7.x는 typescript-eslint가 아직 지원하지 않아 lint가 깨진다.

스택을 바꿔야 하면 코드보다 `docs/superpowers/specs/`의 설계 문서를 먼저 고친다.

## 명령어

```
npm run dev          개발 서버
npm run check        lint + test + build  ← 커밋 전에 실행
npm run test:run     테스트 1회
npm run worker:dev   Worker 로컬 실행
```

## 데이터 구조

핵심 타입은 `shared/types.ts`에 있다. 도감 16종은 `shared/catalog.ts`,
FAQ 20개는 `shared/faqs.ts`, 공식 출처 URL은 `shared/sources.ts`에만 둔다.

모든 사용자 노출 문자열은 `{ ko, en, zh, vi }` 네 값을 갖는다.
UI 문자열은 `src/i18n/strings.ts` 한 곳에 모은다.
아직 못 채운 값은 `__TODO__` 자리 표시를 쓴다 (`shared/placeholder.ts`).

자세한 스키마는 [설계 문서](docs/superpowers/specs/2026-08-06-k-sort-design.md) §3 참조.

## 코딩 규칙

- 함수·변수는 영어 camelCase로, 이름만 보고 무엇인지 알 수 있게 쓴다
- 컴포넌트는 PascalCase, 파일명을 컴포넌트명과 같게 한다
- 훅은 `use` 접두사를 붙인다 (`useLocale`, `useHashRoute`)
- 주요 함수 위에 한 줄 한글 주석으로 무엇을 하는지 적는다
- 함수 하나는 한 가지 일만 한다. 길어지면 나눈다
- 파일이 커지면 책임이 섞였다는 신호다. 기능 단위로 쪼갠다

들여쓰기·따옴표·세미콜론은 ESLint 설정이 처리하므로 신경 쓰지 않는다.

## 커밋 · 브랜치 · PR

- 기능 하나가 동작하면 바로 커밋한다. 작게 자주.
- 형식: `type: 한국어로 무엇을 했는지`
  type은 `feat` `fix` `docs` `chore` `ci` `refactor` `test` `style`
  예) `feat: 도감 검색과 카테고리 필터 구현`
- 이번 작업에서 바꾼 파일만 스테이지한다
- 커밋 로그는 심사에 그대로 노출되므로 무엇을 했는지 읽히게 쓴다
- 코드 변경은 브랜치(`feat/*` `fix/*` `docs/*` `chore/*` `ci/*`)에서 하고 PR로 올린다
- 문서 오탈자·링크 수정은 main에 바로 해도 된다
- PR 본문에는 무엇을·왜·어디를 바꿨는지 한국어로 적는다

## 테스트

Task마다 **실패하는 테스트 → 최소 구현 → 통과 → 커밋** 순서로 간다.
커밋 전에 `npm run check`가 통과하는지 확인한다.

## 🔴 보안

- API 키는 로컬 `.dev.vars`와 Cloudflare secret에만 둔다
- 커밋 전에 `git status`로 무엇이 올라가는지 눈으로 확인한다
- 사용자 사진과 대화 원문은 메모리에서만 다루고 로그·서버에 남기지 않는다

## 병렬 작업

현민은 `src/` `worker/` `shared/` `public/images/` 설정 파일을 맡는다.
재웅은 `public/media/` `public/subtitles/` 콘텐츠 문안·번역을 맡는다.
`shared/` 안의 공용 데이터를 바꿀 때는 `docs/STATUS.md`에 계약을 먼저 적는다.

## 세션

시작할 때 `docs/STATUS.md`를 읽고, 끝낼 때 갱신한다.
`docs/worklog.md`에 한 줄 남긴다.
특수한 오류·기능·AI가 잡아낸 개선점은 보고서 자료로 따로 기록한다.

발표 시연 경로는 [보고서·PPT 인수인계](docs/REPORT_AND_PPT_HANDOFF.md) §11에 있다.
마지막 리허설 뒤에는 시연 경로에 영향을 주는 변경을 하지 않는다.

## 🔴 다시 한 번

**계획을 먼저 말한다 · 한 번에 하나만 · 모르면 묻는다**
