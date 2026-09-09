'use strict';
/* 'use strict' = 엄격 모드. 선언 안 한 변수 사용 같은 실수를 에러로 잡아준다. */

/* ==========================================================
   0. 설정값 (README에 명시하는 기준값들)
   ========================================================== */
const GITHUB_USERNAME      = 'dnsxkm';
// Featured 섹션에서 이미 크게 소개한 저장소 → 아래 자동 목록에서는 제외해 중복을 막는다
const FEATURED_REPOS       = ['Brokoin', 'coin-backend'];
const API_URL              = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;
const NAV_SCROLL_THRESHOLD = 60;    // 헤더 배경이 바뀌는 스크롤 위치(px)
const TOP_BTN_THRESHOLD    = 300;   // 맨 위로 버튼이 나타나는 스크롤 위치(px)
const REVEAL_THRESHOLD     = 0.2;   // Intersection Observer 임계값
const THEME_KEY            = 'portfolio-theme';   // localStorage 키

/* ==========================================================
   1. DOM 요소 선택
   querySelector    = 조건에 맞는 '첫 번째' 요소 1개
   querySelectorAll = 맞는 것 '전부' (NodeList)
   ========================================================== */
const root         = document.documentElement;      // <html>
const header       = document.querySelector('body > header');
const navToggle    = document.querySelector('.nav-toggle');
const navMenu      = document.querySelector('.nav-menu');
const themeToggle  = document.querySelector('.theme-toggle');
const toTopBtn     = document.querySelector('.to-top');
const navLinks     = document.querySelectorAll('.nav-menu a');
const sections     = document.querySelectorAll('main > section');
const projectsList = document.querySelector('#projects-list');
const contactForm  = document.querySelector('#contact-form');
const formSuccess  = document.querySelector('#form-success');

/* ==========================================================
   2. 햄버거 메뉴 토글
   흐름: 클릭 → active 상태 뒤집기 → 메뉴 표시/숨김
   ========================================================== */
const closeMenu = () => {
  navMenu.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', '메뉴 열기');
};

navToggle.addEventListener('click', () => {
  // classList.toggle 은 붙였다 뗐다 하고, '지금 붙어있는지'를 true/false로 돌려준다
  const isOpen = navMenu.classList.toggle('active');

  // 화면 상태와 접근성 정보를 항상 같이 갱신한다.
  // 스크린리더는 aria-expanded 로 열림/닫힘을 판단한다.
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
});

/* ==========================================================
   3. 부드러운 스크롤 + 메뉴 클릭 시 닫기
   ========================================================== */
navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');       // 예: "#about"
    const target   = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();                           // 기본 동작(순간이동) 차단
    target.scrollIntoView({ behavior: 'smooth' });
    closeMenu();                                      // 모바일에서 메뉴 닫기
  });
});

/* ==========================================================
   4. 스크롤 이벤트 — 헤더 배경 + 맨 위로 버튼
   scroll은 1초에 수십 번 발생하므로 리스너 하나로 두 기능을 처리한다.
   ========================================================== */
const handleScroll = () => {
  const y = window.scrollY;

  // toggle(클래스, 조건) → 조건이 true면 붙이고 false면 뗀다
  header.classList.toggle('scrolled', y > NAV_SCROLL_THRESHOLD);
  toTopBtn.classList.toggle('show',   y > TOP_BTN_THRESHOLD);
};

// passive: true = "preventDefault를 쓰지 않겠다"는 약속 → 브라우저가 스크롤을 즉시 그림
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();   // 새로고침 시 이미 중간 위치일 수 있으므로 초기 1회 실행

/* ==========================================================
   5. 맨 위로 버튼
   ========================================================== */
toTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ==========================================================
   6. 다크 모드 — 상태 유지(localStorage)
   흐름: 클릭 → 테마 상태 변경 → data-theme 갱신 → CSS가 전체 화면을 다시 그림
                                            ↘ localStorage에 저장
   ========================================================== */
const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme);             // ① 상태를 DOM에 반영
  themeToggle.textContent = theme === 'dark' ? 'light mode' : 'dark mode';
  themeToggle.setAttribute(
    'aria-label',
    theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
  );
};

// head의 인라인 스크립트가 이미 씌워둔 값을 읽어 버튼 문구만 맞춘다
applyTheme(root.getAttribute('data-theme') || 'light');

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);              // ② 새로고침 후에도 유지
});

/* ==========================================================
   7. 스크롤 등장 애니메이션 — Intersection Observer
   "이 요소가 화면에 들어왔는가"를 브라우저가 대신 감시해 준다.
   scroll 이벤트로 매번 위치를 계산하는 것보다 훨씬 가볍다.
   ========================================================== */
sections.forEach((section) => section.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);   // 한 번 나타나면 감시 해제 (낭비 방지)
      }
    });
  },
  { threshold: REVEAL_THRESHOLD }           // 0.2 = 요소의 20%가 보이면 발동
);

sections.forEach((section) => observer.observe(section));

/* ==========================================================
   8. GitHub API 연동
   상태 4가지: 로딩 / 성공 / 에러 / 빈 데이터
   ========================================================== */

/* 8-1. XSS 방어
   저장소 이름·설명은 '남이 쓴 문자열'이다. innerHTML 로 넣기 전에
   HTML 특수문자를 무해한 문자로 바꿔야 스크립트 주입을 막을 수 있다. */
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));

/* 8-2. 상태별 렌더링 함수 */
const renderLoading = () => {
  projectsList.innerHTML = `
    <div class="state-box">
      <div class="spinner"></div>
      <p>프로젝트를 불러오는 중...</p>
    </div>`;
};

const renderEmpty = () => {
  projectsList.innerHTML = `
    <div class="state-box">
      <p>표시할 프로젝트가 없습니다.</p>
    </div>`;
};

const renderError = (message) => {
  projectsList.innerHTML = `
    <div class="state-box">
      <p>프로젝트를 불러올 수 없습니다.</p>
      <p>${escapeHtml(message)}</p>
      <button type="button" class="btn btn-primary" id="retry-btn">다시 시도</button>
    </div>`;
};

/* 8-3. 저장소 1개 → 카드 HTML 1개
   매개변수 자리에서 바로 구조분해 할당으로 필요한 값만 꺼낸다. */
const createCard = ({ name, description, html_url, language, stargazers_count, forks_count }) => `
  <article class="project-card">
    <h3>${escapeHtml(name)}</h3>
    <p>${description ? escapeHtml(description) : '설명이 없습니다.'}</p>
    <div class="project-meta">
      <span>${language ? escapeHtml(language) : '기타'}</span>
      <span>&#9733; ${stargazers_count}</span>
      <span>Fork ${forks_count}</span>
    </div>
    <a href="${escapeHtml(html_url)}" class="btn btn-outline"
       target="_blank" rel="noopener noreferrer">GitHub에서 보기</a>
  </article>`;

/* 8-4. 실제 호출 — fetch + async/await + try/catch */
const loadProjects = async () => {
  renderLoading();                                   // 상태 ①: 로딩

  try {
    const response = await fetch(API_URL);

    // fetch는 404·403 같은 HTTP 에러에서도 reject하지 않는다.
    // 반드시 response.ok 를 직접 확인해야 한다.
    if (response.status === 403) {
      throw new Error('GitHub API 요청 한도(시간당 60회)를 초과했습니다. 잠시 후 다시 시도해 주세요.');
    }
    if (!response.ok) {
      throw new Error(`서버 응답 오류 (HTTP ${response.status})`);
    }

    const data = await response.json();

    // filter: 다른 사람 저장소를 복제한 fork 는 제외
    // filter: fork 저장소와 Featured 섹션에 이미 소개한 저장소를 제외
    const repos = data.filter((repo) => !repo.fork && !FEATURED_REPOS.includes(repo.name));

    if (repos.length === 0) {
      renderEmpty();                                 // 상태 ④: 빈 데이터
      return;
    }

    // map: 데이터 배열 → HTML 문자열 배열 → join으로 하나로 합침
    projectsList.innerHTML = repos.map(createCard).join('');   // 상태 ②: 성공

  } catch (error) {
    console.error('[Projects]', error);
    renderError(error.message);                      // 상태 ③: 에러
  }
};

/* 8-5. 재시도 버튼 — 이벤트 위임
   재시도 버튼은 나중에 JS가 만들어내므로, 지금 addEventListener를 걸 대상이 없다.
   그래서 항상 존재하는 부모(projectsList)에 걸고, 클릭된 것이 무엇인지 확인한다. */
projectsList.addEventListener('click', (event) => {
  if (event.target.closest('#retry-btn')) {
    loadProjects();
  }
});

loadProjects();

/* ==========================================================
   9. Contact 폼 유효성 검사
   흐름: 입력/제출 → 유효성 상태 판정 → 에러 메시지 표시/숨김
   ========================================================== */

// 이메일 형식: @ 앞뒤에 공백 아닌 문자, 도메인에 점 1개 이상
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fields = [
  {
    input: document.querySelector('#name'),
    error: document.querySelector('#name-error'),
    validate: (value) => (value.trim() === '' ? '이름을 입력해 주세요.' : ''),
  },
  {
    input: document.querySelector('#email'),
    error: document.querySelector('#email-error'),
    validate: (value) => {
      if (value.trim() === '') return '이메일을 입력해 주세요.';
      if (!EMAIL_PATTERN.test(value.trim())) return '이메일 형식이 올바르지 않습니다.';
      return '';
    },
  },
  {
    input: document.querySelector('#message'),
    error: document.querySelector('#message-error'),
    validate: (value) => (value.trim() === '' ? '메시지를 입력해 주세요.' : ''),
  },
];

/* 필드 1개 검사 → 에러 문구와 테두리 색을 갱신하고, 통과 여부를 반환 */
const validateField = (field) => {
  const message = field.validate(field.input.value);

  field.error.textContent = message;                       // 상태 → 화면
  field.input.classList.toggle('invalid', message !== '');
  return message === '';
};

/* input 이벤트: 이미 에러인 필드만 실시간 재검사.
   처음부터 타이핑 중에 빨간 글씨를 띄우면 사용자가 불쾌하다. */
fields.forEach((field) => {
  field.input.addEventListener('input', () => {
    if (field.input.classList.contains('invalid')) {
      validateField(field);
    }
    formSuccess.textContent = '';
  });
});

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();          // 폼의 기본 동작(페이지 새로고침) 차단
  formSuccess.textContent = '';

  // map으로 '전부' 검사한다. some/every로 먼저 끊으면 뒤 필드 에러가 안 뜬다.
  const results = fields.map((field) => validateField(field));

  if (!results.every(Boolean)) {
    const firstInvalid = fields.find((field) => field.input.classList.contains('invalid'));
    if (firstInvalid) firstInvalid.input.focus();          // 첫 에러 필드로 커서 이동
    return;
  }

  // 백엔드가 없으므로 실제 전송은 하지 않고 성공 메시지만 표시한다.
  formSuccess.textContent = '메시지가 정상적으로 접수되었습니다. 감사합니다!';
  contactForm.reset();
});
