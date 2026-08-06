# K-SORT

> Learn it. Scan it. Sort it right in Korea.

명지전문대 유학생이 한국의 분리배출을 영상으로 배우고, AI로 쓰레기를 인식하고, 16종 과정형 도감·챗봇·게임으로 복습하는 다국어 교육 웹앱입니다.

`Made for international students at Myongji College`

팀 메이크 업로드 (Make Upload)

## 핵심 사용자 여정

`배우기 → AI Sort Scan → 과정형 도감 → AI 챗봇 → 게임`

- 한국어·영어·중국어·베트남어 전역 언어 전환
- Seedance 영상, Typecast 한국어 내레이션, Suno BGM, WebVTT 자막
- 16개 생활 쓰레기의 GPT Image 과정형 가이드
- Gemini 기반 다중 물체 AI Sort Scan
- 공식 자료 범위에서 답하는 근거 기반 챗봇
- AI게임소프트웨어과의 특성을 살린 게임 복습

## 현재 진행 상태

현재는 **설계와 개발 인수인계가 완료되고 구현을 시작하는 단계**입니다. 구현 담당자는 아래 문서의 Task 1부터 진행합니다.

1. [제품 설계](docs/superpowers/specs/2026-08-06-k-sort-design.md)
2. [구현 계획](docs/superpowers/plans/2026-08-06-k-sort-implementation.md)
3. [작업 인수인계](docs/HANDOFF.md)
4. [AI 제작 과정과 프롬프트](docs/AI_PROCESS_AND_PROMPTS.md)
5. [콘텐츠·에셋 체크리스트](docs/CONTENT_CHECKLIST.md)
6. [보고서·PPT 인수인계](docs/REPORT_AND_PPT_HANDOFF.md)

## 다른 컴퓨터에서 이어서 작업하기

```powershell
git clone https://github.com/Kodol05/make-upload.git
Set-Location make-upload
git status
git log --oneline -5
```

김현민 개발자는 [작업 인수인계](docs/HANDOFF.md)의 개발 체크리스트를 확인하고 `feat/k-sort-mvp` 브랜치에서 구현 계획을 Task별로 진행합니다. 박재웅은 AI 영상·다국어 콘텐츠·보고서·PPT 작업을 병렬로 진행합니다.

## 팀원

| 이름 | 역할 | 학과 |
| --- | --- | --- |
| 박재웅 | 팀장, 기획, 발표, AI 영상 제작 | AI게임소프트웨어학과 |
| 김현민 | 웹앱 개발, AI 에셋 제작, 게임 | AI게임소프트웨어학과 |

## 기술 방향

- Frontend: React + Vite + TypeScript
- Hosting: GitHub Pages
- API: Cloudflare Worker
- AI: Gemini `gemini-3.6-flash`
- Content AI: Seedance, Typecast, Suno, GPT Image
- Quality: Vitest, Testing Library, ESLint, GitHub Actions

## 보안 원칙

Gemini API 키와 Cloudflare token은 저장소에 커밋하지 않습니다. 실제 키는 로컬 `.dev.vars` 또는 Cloudflare secret에만 저장하며, 사용자 사진과 대화 원문은 K-SORT 서버에 저장하지 않습니다.
