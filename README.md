# 김동석 포트폴리오

순수 **HTML · CSS · JavaScript** 만으로 제작한 반응형 개인 포트폴리오 웹사이트입니다.
React, Vue, jQuery, Bootstrap, Tailwind 등 외부 라이브러리를 전혀 사용하지 않았습니다.

**배포 URL** — https://dnsxkm.github.io/portfolio/

---

## 사용 기술

| 구분 | 기술 |
|---|---|
| 마크업 | HTML5 시맨틱 태그 (`header` / `nav` / `main` / `section` / `article` / `footer`) |
| 스타일 | CSS3 — 커스텀 속성(CSS 변수), Flexbox, Grid, 미디어 쿼리 |
| 스크립트 | Vanilla JavaScript (ES6+) — `const`/`let`, 화살표 함수, 구조분해 할당, 템플릿 리터럴, `map`/`filter`/`forEach` |
| 비동기 | `fetch` + `async/await` + `try/catch` |
| 브라우저 API | Intersection Observer, localStorage |
| 외부 데이터 | GitHub REST API (`/users/{username}/repos`) |
| 배포 | GitHub Pages |

---

## 폴더 구조

```
portfolio/
├── index.html          # 메인 페이지 (전체 마크업)
├── css/
│   └── style.css       # 전체 스타일 (디자인 토큰 · 레이아웃 · 반응형)
├── js/
│   └── main.js         # 인터랙션 · API 연동 · 폼 검증
├── images/
│   └── profile.jpg     # 프로필 사진
└── README.md
```

---

## 주요 기능

### 1. 반응형 레이아웃 (모바일 퍼스트)

기본 스타일을 모바일 기준으로 작성하고, `min-width` 미디어 쿼리로 넓은 화면을 향해 확장했습니다.

| 브레이크포인트 | 변화 |
|---|---|
| 기본 (~767px) | 세로 1단, 내비게이션은 햄버거 드롭다운 |
| 768px 이상 | 내비게이션 가로 배치, About 사진·글 2단, Featured 기능 목록 2열 |
| 1024px 이상 | 프로필 이미지 확대, Hero 높이 증가 |

- **내비게이션**: Flexbox — 로고를 왼쪽, `margin-right: auto` 로 나머지를 오른쪽으로 밀어냄
- **프로젝트 카드**: Grid `repeat(auto-fit, minmax(280px, 1fr))` — 미디어 쿼리 없이 열 개수가 화면 폭에 따라 자동 조절

### 2. 인터랙티브 UI

| 기능 | 동작 |
|---|---|
| 햄버거 메뉴 | 클릭 시 `.nav-menu` 에 `active` 클래스 토글, `aria-expanded` 동기화 |
| 부드러운 스크롤 | `preventDefault()` 후 `scrollIntoView({ behavior: 'smooth' })` |
| 스크롤 탑 버튼 | 스크롤 **300px** 초과 시 등장 |
| 네비게이션 배경 변경 | 스크롤 **60px** 초과 시 배경색·그림자 적용 |
| 스크롤 등장 애니메이션 | Intersection Observer, **threshold 0.2** (요소의 20% 노출 시 실행) |
| 다크 모드 | 토글 시 `<html data-theme>` 변경 + localStorage 저장 |

> **기준값 요약** — 스크롤 탑 버튼 300px · 네비게이션 배경 60px · Observer threshold 0.2
> (`js/main.js` 상단 상수에서 변경 가능)

### 3. 대표 프로젝트 — 코인 레벨 (iOS)

직접 개발해 App Store에 출시한 암호화폐 시장 관측 앱을 Projects 위 **Featured 섹션**에 별도로 소개합니다.
GitHub API가 자동으로 불러오는 목록과 달리, 이 섹션은 직접 작성한 마크업입니다.

- App Store: https://apps.apple.com/kr/app/코인-레벨/id6805023348
- 소스 코드: 비공개 저장소

바이낸스 무기한 선물 시장 데이터를 실시간으로 받아 캔들 차트 · 지지/저항 · 고래 흐름 · 강제 청산 ·
시장 전체 지표를 보여줍니다. 로그인 · 인앱 결제 · 광고가 없습니다.

앱 스크린샷 5장(홈 · 차트 · 고래 흐름 · 강제 청산 · 알림)을 `figure`/`figcaption` 으로 설명과 함께 배치했습니다.

> `js/main.js` 의 `FEATURED_REPOS` 배열에 등록한 저장소는 아래 자동 목록에서 `filter` 로 제외합니다.

### 4. GitHub API 연동

`https://api.github.com/users/dnsxkm/repos` 를 호출해 Projects 섹션을 동적으로 렌더링합니다.

| 상태 | 화면 |
|---|---|
| 로딩 | 회전 스피너 + "프로젝트를 불러오는 중..." |
| 성공 | 저장소 카드 목록 (이름 · 설명 · 언어 · 스타 · 포크) |
| 에러 | "프로젝트를 불러올 수 없습니다" + **다시 시도** 버튼 |
| 빈 데이터 | "표시할 프로젝트가 없습니다" |

- `filter` 로 fork 저장소 제외, `map` 으로 데이터 → 카드 HTML 변환
- **레이트 리밋**: 인증 없이 호출 시 시간당 60회 제한. 초과(HTTP 403) 시 안내 문구가 포함된 에러 상태를 표시합니다.
- 저장소 이름·설명은 `innerHTML` 로 삽입하기 전에 HTML 특수문자를 이스케이프하여 XSS를 방지합니다.

### 5. 폼 유효성 검사

- 이름 · 이메일 · 메시지 **필수값** 검증
- 이메일 **형식** 검증 (정규식)
- 에러 메시지를 각 입력 필드 바로 아래에 표시하고, 해당 입력칸 테두리를 빨간색으로 변경
- 제출 시 `preventDefault()` 로 기본 동작을 막고 성공 메시지 표시
- 이미 에러 상태인 필드만 입력 중(`input` 이벤트) 실시간 재검증

### 6. 상태 유지

다크 모드 설정을 `localStorage` (키: `portfolio-theme`) 에 저장하여 새로고침 후에도 유지됩니다.
`<head>` 의 인라인 스크립트가 CSS 적용 전에 테마를 먼저 씌워 **화면 깜빡임(FOUC)** 을 방지합니다.

---

## "이벤트 → 상태 → 렌더링" 흐름

이 프로젝트의 모든 기능은 아래 한 문장으로 설명됩니다.

> **JavaScript는 클래스와 속성만 바꾼다. 어떻게 보일지는 CSS가 전담한다.**

| # | 이벤트 | 상태 변경 | 화면 변화 |
|---|---|---|---|
| 1 | 테마 버튼 클릭 | `<html data-theme>` 변경 | CSS 변수가 통째로 교체되어 전체 화면 색상 반전 |
| 2 | 페이지 진입 / 재시도 클릭 | 로딩 → 성공 / 에러 / 빈 상태 | Projects 섹션이 스피너 ↔ 카드 목록 ↔ 에러 박스로 교체 |
| 3 | 폼 입력 · 제출 | 각 필드의 유효/무효 상태 | 에러 문구 표시·숨김, 입력칸에 `.invalid` 부착 |
| 4 | 스크롤 | 위치가 임계값을 넘었는지 | `header.scrolled`, `.to-top.show` 부착/제거 |
| 5 | 요소가 화면에 진입 | 노출 여부 | `.reveal` → `.reveal.visible` 로 페이드 인 |

React의 컴포넌트·상태·이벤트 개념은 이 구조를 추상화한 것입니다.

---

## 접근성

- 모든 이미지에 의미 있는 `alt` 속성
- 모든 폼 요소에 `for` ↔ `id` 로 연결된 `<label>`
- 아이콘 버튼에 `aria-label`, 햄버거 메뉴에 `aria-expanded` 상태 동기화
- `prefers-reduced-motion` 미디어 쿼리로 애니메이션 최소화 설정 존중
- 시맨틱 랜드마크(`header`/`nav`/`main`/`footer`)로 스크린리더 탐색 지원

---

## 코드 규칙

- `var` 미사용 — `const` / `let` 만 사용
- HTML에 `onclick` 등 인라인 이벤트 속성 미사용 — 전부 `addEventListener`
- 인라인 스타일(`style="..."`) 미사용
- 외부 CSS · JS 파일로 분리, 스크립트는 `defer` 로 연결

---

## 로컬 실행 방법

```bash
git clone https://github.com/dnsxkm/portfolio.git
cd portfolio
```

VS Code에서 폴더를 열고 `index.html` 우클릭 → **Open with Live Server**

> `file://` 로 직접 열면 GitHub API 호출이 CORS 정책으로 차단됩니다. 반드시 로컬 서버로 실행하세요.

---

## 스크린샷

| 데스크톱 | 모바일 | 다크 모드 |
|---|---|---|
| ![데스크톱](images/screenshot-desktop.png) | ![모바일](images/screenshot-mobile.png) | ![다크모드](images/screenshot-dark.png) |
