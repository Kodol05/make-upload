# Worklog — 1줄 이력

> 세션 종료 시 한 줄씩 append. **지우지 않는다.**
> 형식: `YYYY-MM-DD (담당) [type] 요약 → 산출물/커밋/PR`

## 로그

- 2026-08-06 (현민) [docs] AI Sort Scan·도감 성격 재정의 → PR #1
- 2026-08-06 (현민) [chore] CLAUDE.md · STATUS.md · worklog.md 3종 세트 도입 → PR #2
- 2026-08-06 (현민) [docs] 스택 검증 — TypeScript 7이 lint를 깨는 문제 사전 발견, 6.0.3 고정 → PR #3
- 2026-08-06 (현민) [docs] 스택 결정을 구현 계획·설계·콘텐츠 체크리스트에 반영 → PR #4
- 2026-08-06 (현민) [chore] Task 1: React/Vite/TS 기반 + Pages 배포. https://kodol05.github.io/make-upload/ 동작 확인 → PR #5
- 2026-08-06 (현민) [feat] Task 2: 공용 타입·16종 골격·자리 표시 헬퍼. 자리 표시 756개로 콘텐츠 대기 없이 진행 가능 → PR #7
- 2026-08-06 (현민) [feat] Task 3: 전역 언어 전환·해시 라우팅(라이브러리 없이)·UI 문자열 사전·헤더/푸터 → PR #9
- 2026-08-06 (현민) [feat] Task 4: 교육 영상 섹션. assetUrl로 배포 base 경로 문제 해결, 영상 없어도 4대 원칙 표시 → PR #11
- 2026-08-06 (현민) [feat] 검수 전 문안을 (임시값)으로 표시. 데이터는 그대로 두고 화면만 바꿈 → PR #12
- 2026-08-06 (현민) [docs] 재웅 콘텐츠 요청서. UI 문자열 88개 선제 작성, 이미지 50→16장, 작업 단위를 품목으로 → PR #13
- 2026-08-06 (현민) [feat] Task 5: 도감 검색·필터·상세 모달. 이미지 품목당 1장으로 모델 변경 → PR #14
- 2026-08-06 (현민) [feat] Task 6: Worker 보안·Gemini 공통 호출. toGeminiSchema로 Zod→Gemini 스키마 비호환(prefixItems 등) 해결, worker/ 타입 검사 누락 수정 → PR #16
- 2026-08-06 (현민) [feat] Task 7: 근거 기반 챗봇. 자리 표시가 남은 문안은 지식에서 제외, 쓸 지식 없으면 모델 호출 안 함 → PR #18
- 2026-08-06 (현민) [feat] Task 8: AI Sort Scan 두 경로. Workers CPU 10ms 때문에 multipart 대신 base64 JSON으로 변경 → PR #19
- 2026-08-06 (현민) [feat] Task 9: 게임 → PR #20
- 2026-08-06 (현민) [feat] Task 10: 기능별 오류 경계와 모달 포커스 가둠 → PR #24
- 2026-08-06 (현민) [fix] 챗봇·스캔 모두 gemini-3.5-flash-lite로. 3.6-flash 무료 한도가 하루 20회뿐이었음
- 2026-08-06 (현민) [feat] Task 11: API를 Cloudflare에서 Vercel로 이전. Gemini가 Cloudflare 출구 IP를 지역 차단 → PR #25
- 2026-08-06 (현민) [ci] Pages 배포 6연속 실패. 코드가 아니라 deploy-pages 기본 타임아웃 10분 < 실제 큐 대기 3~9분이 원인 → PR #27
- 2026-08-06 (현민) [docs] Vercel 이전을 STATUS·CLAUDE·설계 문서에 반영
- 2026-08-07 (현민) [ci] Pages 배포 실패 원인 확정. deploy-pages 타임아웃 10분이 하드 상한인데 큐 대기가 그보다 길었음. 코드 문제 아님
- 2026-08-07 (현민) [feat] 도감·FAQ·UI를 4개 언어로 전부 작성. 자리 표시 620→0, 출처 5/5, 릴리스 게이트 3개 활성화 → PR #28
- 2026-08-07 (현민) [fix] 검색이 한국어를 항상 함께 찾도록 수정. 번역이 채워지자 베트남어에서 '캔'이 안 잡히는 게 드러남
- 2026-08-07 (현민) [docs] 개발 중간 점검. AI가 잡아낸 것과 사람이 되돌린 것을 사례로 정리 → docs/AI_DEV_EVIDENCE.md
- 2026-08-07 (현민) [docs] 추가 기능 다섯 개 계획. 앞의 넷은 이미 있는 것들이 안 이어져 생긴 막다른 길 → docs/FEATURE_PLAN.md
- 2026-08-07 (현민) [docs] 핵심 강점 정리. 사진과 대화가 서로의 출구로 이어진다 → docs/CORE_STRENGTH.md
- 2026-08-07 (현민) [docs] 소감 작성 → docs/RETROSPECTIVE.md
