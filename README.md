# 칼바람.gg — 칼바람 나락 전적검색

리그 오브 레전드 **칼바람 나락(ARAM)** 전용 전적 검색 사이트. Next.js 14 (App Router) + Tailwind CSS.

## 디자인 컨셉 — "얼어붙은 나락 (Howling Abyss)"

- 깊은 남색 `abyss` 배경 위에 서리색 `frost` 포인트, 보조로 오로라(보라/청록) 그라데이션
- 눈송이 캔버스, 노이즈 텍스처, 유리질 패널(`.panel`)로 얼어붙은 다리 분위기
- 로딩: 육각 얼음 결정 로더(`FrostLoader`) + 시머 스켈레톤
- 전환: 상단 오로라 진행바 + "나락으로 내려가는 중" 오버레이(`NavigationProvider`), 카드 스태거 등장 애니메이션

## 기능

- 소환사 검색 (서버 선택, `#태그` 로 서버 자동 추측, `/` 단축키, 최근 검색 / 즐겨찾기)
- 소환사 페이지: 프로필(랭크, 레벨, 연승/연패), 전적 갱신 · 즐겨찾기 · 링크 복사
- **나락 점수**: KDA · 딜 비중 · 킬 관여 · 탱킹 · 치유/보호막 · CC 를 가중 합산한 0~10점 기여도, 팀별 MVP / ACE
- 매치 카드: 스펠 · 룬 · 아이템(툴팁), 멀티킬 배지, 펼치면 팀 비교 바 + 지표별 막대(피해/받은 피해/치유/골드/CC)
- 필터(승/패, 큐, 챔피언 검색) + 무한 스크롤
- 챔피언 탭: 정렬 가능한 챔피언별 성적표
- 분석 탭: 피해 유형 분포, 게임 길이별 승률, 멀티킬, 최고 기록
- 멀티서치(`/multi`): 로비 채팅을 붙여넣어 최대 5명의 최근 폼 비교

## 실행

```bash
cp .env.local.example .env.local   # RIOT_API_KEY 입력
npm install
npm run dev
```

Riot API 키 없이 UI 만 확인하려면 `.env.local` 에 `MOCK_RIOT_API=1` 을 넣으면 데모 데이터로 동작합니다.

## 구조

```
src/app            페이지 (홈, [region]/[summoner], multi, api/matches, api/health)
src/components     UI 컴포넌트 (MatchCard, MatchDetail, StatsPanel, SummonerTabs ...)
src/lib/riot-api   Riot API 클라이언트 (응답 슬림화, 목 모드)
src/lib/ddragon    Data Dragon 버전/아이템/챔피언/룬 메타 (필요한 항목만 번들)
src/lib/utils      나락 점수 · 종합 통계 계산
```
