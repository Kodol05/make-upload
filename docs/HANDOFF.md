# K-SORT 작업 인수인계

> **이 문서는 구현을 시작하기 전에 쓴 것이다.** 지금은 앱이 다 만들어져 있어서, 아래
> 절차 가운데 초기 설치와 Task 순서 부분은 더 이상 밟을 일이 없다. 지금 상태를 알려면
> [README](../README.md)와 [STATUS](STATUS.md)를 먼저 보라.
>
> 문서는 남겨 둔다. 무엇을 어떤 순서로 하기로 하고 시작했는지가 그대로 남아 있어서
> 보고서에 쓸 수 있다. 다만 **지금과 어긋나는 사실은 아래에서 바로잡아 두었다.**

이 문서는 김현민 개발자와 박재웅 기획·발표 담당자가 다른 컴퓨터에서 바로 작업을 이어가기 위한 시작점이다.

## 1. 현재 상태

- 원격 저장소: <https://github.com/Kodol05/make-upload>
- 기본 브랜치: `main`
- 배포: <https://kodol05.github.io/make-upload/> (화면) · Vercel Functions (API)
- 현재 단계: **구현 완료.** 도감 16종·FAQ 20개가 네 언어로 채워졌고 검수 대기 문안은 0개
- 제품명: `K-SORT`
- 팀명: `메이크 업로드 (Make Upload)`
- 대상: 명지전문대 유학생
- 발표 시간: 약 5분
- 구현 목표: 24시간 MVP

저장소에는 설계·구현 계획·AI 프롬프트·보고서 자료와 함께 **완성된 React 앱, Vercel
Functions API, 영상·이미지 에셋이 모두 들어 있다.**

## 2. 다른 컴퓨터에서 시작하기

PowerShell 기준:

```powershell
git clone https://github.com/Kodol05/make-upload.git
Set-Location make-upload
git status
git log --oneline -5
```

문서는 다음 순서로 읽는다.

1. [제품 설계](superpowers/specs/2026-08-06-k-sort-design.md)
2. [구현 계획](superpowers/plans/2026-08-06-k-sort-implementation.md)
3. [AI 제작 과정과 프롬프트](AI_PROCESS_AND_PROMPTS.md)
4. [콘텐츠·에셋 체크리스트](CONTENT_CHECKLIST.md)
5. [보고서·PPT 인수인계](REPORT_AND_PPT_HANDOFF.md)
6. 이 문서의 계정·보안·작업 규칙

## 3. 개발자 시작 체크리스트

> 처음 쓸 때는 "빈 저장소에서 앱을 만들기 시작하는 절차"였다. 지금은 앱이 있으므로
> **이어받는 절차**로 바꿔 적는다.

- [ ] Node.js 22 이상과 npm 10 이상 설치
- [ ] Git 설치 및 본인 GitHub 계정으로 인증
- [ ] Google AI Studio에서 Gemini API 키 발급 여부 확인
- [ ] 저장소 clone 후 `main`이 최신인지 확인
- [ ] `npm install` → `npm run check`가 통과하는지 확인
- [ ] AI 기능까지 쓰려면 `.dev.vars`에 키를 넣고 `npm run worker:dev`를 함께 띄운다
- [ ] 코드 변경은 기능 브랜치에서 하고 PR로 올린다
- [ ] API 키는 `.dev.vars`와 Vercel 환경 변수에만 저장

```powershell
npm install
npm run dev          # 화면
npm run worker:dev   # AI 기능까지 쓰려면 함께
npm run check        # 커밋 전에 반드시
```

라이브러리 구성은 [README](../README.md)의 기술 표를 보라. 라우터는 쓰지 않고 해시 라우팅을
직접 만들었으므로 `react-router-dom`은 필요 없다.

## 4. 박재웅 기획·영상·발표 시작 체크리스트

- [ ] 16개 품목의 한국어 처리법을 환경부·공공기관 자료로 검수
- [ ] 각 품목의 `needsLocalCheck` 여부와 공식 URL 확정
- [ ] 한국어 문안 확정 후 영어·중국어·베트남어 번역 및 역번역 검수
- [ ] Seedance 영상 8개 장면 제작 및 2분 내외로 편집
- [ ] Typecast 한국어 내레이션과 Suno BGM 제작
- [ ] 네 언어 WebVTT 자막 제작
- [ ] 발표용 문제 정의, 공익성, AI 제작 파이프라인 슬라이드 초안 작성
- [ ] 김현민에게 최종 콘텐츠와 에셋 파일명 전달

에셋 파일명은 구현 계획의 `public/` 규칙을 따른다. 원본 대용량 영상과 이미지 생성 파일은 별도 Drive 등에 보관하고, GitHub에는 웹 최적화본만 올린다.

## 5. 계정과 비밀 정보

필요한 외부 서비스:

| 서비스 | 용도 | 저장소에 기록 가능한 정보 |
| --- | --- | --- |
| GitHub | 코드·문서·Pages | 저장소 URL, 배포 URL |
| Vercel | API (Functions) | 배포 URL만 가능 |
| Google AI Studio | Gemini API | 모델명만 가능 |
| Seedance | 메인 영상 | 프롬프트와 결과물 설명 가능 |
| Typecast | 한국어 내레이션 | 대본과 음성 설정 설명 가능 |
| Suno | BGM | 음악 프롬프트 설명 가능 |
| 나노바나나 | 품목 이미지 | 프롬프트와 최적화본 가능 |

다음 값은 절대로 GitHub, 보고서, PPT, 채팅 캡처에 넣지 않는다.

- Gemini API 키
- Vercel 토큰
- 개인 이메일 비밀번호 또는 세션 쿠키
- `.env`, `.dev.vars`의 실제 값
- 사용자 업로드 사진이나 대화 원문

로컬 Worker 개발용 파일 예시:

```dotenv
# .dev.vars — Git에 커밋하지 않는다.
GEMINI_API_KEY="실제 키를 여기에만 입력"
```

배포용 키는 Vercel 프로젝트의 환경 변수에 넣는다. 배포는 `npx vercel deploy --prod`.

> `wrangler.jsonc`와 `worker/` 폴더 이름은 Cloudflare 시절의 흔적이다. 지금 실행되는 것은
> `api/[...path].ts`이고, `worker/src/`의 파일들은 그 안에서 그대로 쓰인다.

## 6. Git 작업 규칙

기능 브랜치 예시:

- `feat/k-sort-mvp`: 김현민의 전체 MVP 작업
- `content/multilingual-copy`: 박재웅의 콘텐츠·자막 작업
- `docs/report-evidence`: 보고서와 발표 증거 업데이트

작업 전:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/k-sort-mvp
```

작업 중:

```powershell
git status
npm run check
git add <이번 Task에서 변경한 파일만>
git commit -m "feat: 구체적인 변경 내용"
```

공유 전:

```powershell
git push -u origin feat/k-sort-mvp
```

API 키나 대용량 원본이 포함됐는지 반드시 확인한 뒤 push한다. `git reset --hard`나 다른 팀원의 변경을 덮어쓰는 명령은 사용하지 않는다.

## 7. 작업 우선순위

현민 개발 순서:

1. 프로젝트·테스트 기반
2. 공용 다국어 데이터 계약
3. 전역 언어 UI와 도감
4. 영상·자막
5. Worker 기반과 챗봇
6. AI Sort Scan
7. 게임 연결
8. 접근성·오류 격리
9. 배포·리허설

재웅 콘텐츠 순서:

1. 16종 한국어 사실 검수
2. 영상 콘티와 한국어 대본
3. 네 언어 번역·자막
4. 영상·음성·BGM 완성
5. 보고서와 PPT 초안
6. 운영 화면 캡처와 발표 리허설 기록

## 8. 현재 확정된 기술 계약

- 프런트: React + Vite + TypeScript, 직접 만든 해시 라우팅, GitHub Pages
- API: **Vercel Functions**, Gemini `gemini-3.5-flash-lite`
  (Cloudflare는 Gemini가 그 출구 IP를 지역 차단해 옮겼고, `3.6-flash`는 무료 한도가
  하루 20회뿐이라 내렸다)
- 전역 언어: `ko | en | zh | vi`
- 채팅: `POST /api/chat`, 500자, 최근 6개, 분당 10회
- 스캔: `POST /api/scan`, 1.5MB, 최대 5개 물체, 분당 5회
- 콘텐츠: 16종 도감, 품목당 대표 이미지 1장, FAQ 20개
  (과정 이미지 3~4장은 24시간 안에 64장을 만들 수 없어 품목당 1장으로 줄였다)
- 실패 전략: AI 기능이 실패해도 영상·도감·게임은 독립적으로 사용 가능

계약을 변경해야 한다면 코드보다 먼저 설계 문서와 구현 계획을 수정하고 팀원에게 변경 이유를 공유한다.

## 9. 다른 AI 코딩 세션에 붙여 넣을 시작 프롬프트

```text
K-SORT 저장소 개발을 이어서 진행해줘.

저장소를 먼저 탐색하고 아래 문서를 순서대로 전부 읽어:
1. README.md
2. docs/STATUS.md          (지금 진실)
3. CLAUDE.md               (지켜야 할 규칙)
4. docs/CORE_STRENGTH.md   (이 앱의 핵심)
5. docs/superpowers/specs/2026-08-06-k-sort-design.md  (당시 설계)

구현은 끝났다. 새로 만들기 시작하지 말고 지금 있는 것을 이어서 손봐. 무엇을 고치든
실패 테스트 → 최소 구현 → 전체 관련 테스트 → 커밋 순서를 지키고, 범위를 임의로 넓히지 마.
실제 API 키를 코드, 로그, 문서에 쓰지 마. 이미 존재하는 팀원 변경은 보존하고, 시작 전에
git status와 최근 커밋을 확인해.

현재 담당 개발자는 김현민이고 게임 내부 설계는 김현민의 별도 기획을 따른다. 필요한 콘텐츠나 에셋이 아직 없다면 코드 계약과 검증을 먼저 완성하고, 박재웅에게 필요한 파일명과 형식을 명확히 요청해.
```

## 10. 완료 인수인계 기준

- 저장소 clone 후 문서 링크가 모두 열린다.
- 개발자가 구현 Task와 첫 실행 명령을 추가 질문 없이 찾을 수 있다.
- 보고서 담당자가 사용 AI 도구, 프롬프트, 의사결정, 역할, 검증 증거를 찾을 수 있다.
- 실제 API 키나 개인정보가 Git 기록에 없다.
- 배포 URL과 API 위치가 README에 기록된다.
