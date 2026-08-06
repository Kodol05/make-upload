# CLAUDE.md — K-SORT 개발 규칙

이 저장소에서 Claude Code가 코드 작업할 때 지킬 규칙. 담당 개발자: 김현민.
콘텐츠 AI(Seedance/Typecast/Suno/GPT Image/Gemini)의 프롬프트와 관행은
`docs/AI_PROCESS_AND_PROMPTS.md`를 따른다.

## 1. 세션 시작·종료

- **시작**: `docs/STATUS.md`를 먼저 읽어 지금 진실을 파악한다.
- **종료**: `docs/STATUS.md`를 갱신하고 `docs/worklog.md`에 1줄 기록한다.
- 특수한 오류·특수한 기능·AI가 잡아낸 개선점은 별도로 하이라이트해 보고서 자료로 남긴다.

## 2. 기술 스택 (변경 시 spec부터 수정)

- Frontend: React + Vite + TypeScript, HashRouter, GitHub Pages (base `/make-upload/`)
- API: Cloudflare Worker
- LLM: Gemini `gemini-3.6-flash`
- Validation: Zod
- Test: Vitest + Testing Library
- Lint: ESLint
- Style: 일반 CSS + `src/styles/tokens.css`
- Node 22+, npm 10+

기술 스택 변경이 필요하면 코드보다 먼저
`docs/superpowers/specs/2026-08-06-k-sort-design.md`와
`docs/superpowers/plans/2026-08-06-k-sort-implementation.md`를 수정한다.

## 3. 커밋

- 형식: `type: 요약` (영어 subject, 명령형 현재시제, 짧게)
- type 목록: `feat` `fix` `docs` `chore` `ci` `refactor` `test` `style`
- body는 한국어 허용. "왜 바꿨는지"를 중심으로.
- 심사에 그대로 노출된다는 전제로 작성한다. `asdf`, `wip`, 한 방 커밋 금지.
- 작게 자주. 관련 없는 파일을 함께 스테이지하지 않는다.

## 4. 브랜치 · PR

- 브랜치 prefix 고정: `feat/*` `fix/*` `docs/*` `chore/*` `ci/*`
- **코드 변경은 반드시 브랜치 + PR** (main 직접 push 금지)
- 문서 오탈자·링크 수정 같은 소소한 건 main 직접 허용
- PR body는 한국어로 "무엇을·왜·어디를" 서술한다
- 스펙 변경을 동반하는 PR은 `docs/superpowers/specs/*`를 먼저 수정한 뒤 코드 작업으로 이어간다

## 5. 테스트

- Task 단위로 **실패 테스트 → 최소 구현 → 통과** 순서를 유지한다 (구현 계획의 Global Constraints)
- 예외: 시급한 상황에서는 후테스트를 허용하되, 같은 PR 안에서 마무리한다
- 커밋 전 `npm run check` (lint + test + build) 통과를 확인한다

## 6. 보안 · 개인정보

- API 키를 코드·문서·커밋·스크린샷·shell history에 남기지 않는다
- `.env`, `.dev.vars`는 `.gitignore`에 포함되며 실제 값을 커밋하지 않는다
- 사용자 사진과 대화 원문은 Worker 로그와 K-SORT 서버에 저장하지 않는다
- 커밋 전 `git status`로 의도치 않은 파일이 포함되지 않았는지 확인한다

## 7. 병렬 작업

담당 분담:
- **현민**: 웹앱·게임·에셋. 주 파일 경로 = `src/`, `worker/`, `shared/`, `public/images/`, 설정 파일
- **재웅**: 콘텐츠·번역·영상·발표. 주 파일 경로 = `docs/CONTENT_CHECKLIST.md`, `public/media/`, `public/subtitles/`, 도감·FAQ 원문 승인

공유 데이터(`shared/catalog.ts` 등) 변경은
**인터페이스 계약을 `docs/STATUS.md`에 먼저 명시**한 뒤 코드를 수정한다.

## 8. 데모 경로

발표 시연 시나리오는 `docs/REPORT_AND_PPT_HANDOFF.md` §11 참조.
데모 경로에 영향을 주는 변경은 마지막 리허설 이후 금지한다.

## 9. 문서 참조

작업 시작 전 반드시 확인:
1. [설계](docs/superpowers/specs/2026-08-06-k-sort-design.md)
2. [구현 계획](docs/superpowers/plans/2026-08-06-k-sort-implementation.md)
3. [현재 진실](docs/STATUS.md)
4. [작업 이력](docs/worklog.md)
5. [콘텐츠·에셋 체크리스트](docs/CONTENT_CHECKLIST.md)

콘텐츠 AI 프롬프트는 [AI 제작 과정과 프롬프트](docs/AI_PROCESS_AND_PROMPTS.md)를 참조한다.
