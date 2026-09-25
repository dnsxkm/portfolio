'use strict';

/* ==========================================================
   0. 설정값 — README에 명시하는 기준값
   ========================================================== */
const GITHUB_USERNAME      = 'dnsxkm';
const FEATURED_REPOS       = ['Brokoin', 'coin-backend'];  // Featured에서 이미 소개 → 중복 제외
const API_URL              = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;
const NAV_SCROLL_THRESHOLD = 60;
const TOP_BTN_THRESHOLD    = 300;
const REVEAL_THRESHOLD     = 0.2;
const THEME_KEY            = 'portfolio-theme';

/* ==========================================================
   1. DOM 참조 — 한 번만 찾아 재사용
   ========================================================== */
const root         = document.documentElement;
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

const fieldEls = {
  name:    { input: document.querySelector('#name'),    error: document.querySelector('#name-error') },
  email:   { input: document.querySelector('#email'),   error: document.querySelector('#email-error') },
  message: { input: document.querySelector('#message'), error: document.querySelector('#message-error') },
};

/* ==========================================================
   2. STATE — 애플리케이션의 단일 진실 원천(Single Source of Truth)
   화면에 영향을 주는 모든 값을 이 객체 하나에 모은다.

   규칙 2가지 (이걸 지키는 게 이 구조의 전부):
     ① 상태는 오직 setState() 로만 바꾼다
     ② DOM은 오직 render() 에서만 건드린다
   ========================================================== */
const STATE = {
  theme:        root.getAttribute('data-theme') || 'light',  // 'light' | 'dark'
  isMenuOpen:   false,
  isScrolled:   false,
  isTopVisible: false,

  projects: {
    status: 'idle',   // 'idle' | 'loading' | 'success' | 'empty' | 'error'
    data:   [],
    error:  null,
  },

  form: {
    errors:  { name: '', email: '', message: '' },
    success: '',
  },
};

/* ==========================================================
   3. setState + render — 상태와 화면을 잇는 단 하나의 통로
   ========================================================== */

/* 상태를 바꾸고, 바뀐 상태로 화면을 다시 맞춘다.
   "상태를 바꿨는데 화면 갱신을 깜빡하는" 버그가 구조적으로 불가능해진다. */
const setState = (patch) => {
  Object.assign(STATE, patch);
  render();
};

const render = () => {
  renderTheme();
  renderMenu();
  renderScroll();
  renderProjects();
  renderForm();
};

/* --- 3-1. 테마 --- */
const renderTheme = () => {
  root.setAttribute('data-theme', STATE.theme);      // CSS 변수가 통째로 교체됨
  themeToggle.textContent = STATE.theme === 'dark' ? 'light mode' : 'dark mode';
  themeToggle.setAttribute(
    'aria-label',
    STATE.theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
  );
};

/* --- 3-2. 햄버거 메뉴 --- */
const renderMenu = () => {
  navMenu.classList.toggle('active', STATE.isMenuOpen);
  navToggle.setAttribute('aria-expanded', String(STATE.isMenuOpen));
  navToggle.setAttribute('aria-label', STATE.isMenuOpen ? '메뉴 닫기' : '메뉴 열기');
};

/* --- 3-3. 스크롤 위치에 따른 UI --- */
const renderScroll = () => {
  header.classList.toggle('scrolled', STATE.isScrolled);
  toTopBtn.classList.toggle('show', STATE.isTopVisible);
};

/* --- 3-4. 프로젝트 목록 (4가지 상태) --- */

// XSS 방어: 외부에서 온 문자열을 innerHTML에 넣기 전 HTML 특수문자를 무력화
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));

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

/* 같은 상태로 두 번 그리는 낭비를 막는다.
   React가 가상 DOM 비교로 하는 일을, 여기서는 문자열 키 비교로 단순하게 흉내낸다. */
let projectsRenderKey = '';

const renderProjects = () => {
  const { status, data, error } = STATE.projects;
  const key = `${status}|${data.length}|${error || ''}`;
  if (key === projectsRenderKey) return;
  projectsRenderKey = key;

  if (status === 'idle') return;

  if (status === 'loading') {
    projectsList.innerHTML = `
      <div class="state-box">
        <div class="spinner"></div>
        <p>프로젝트를 불러오는 중...</p>
      </div>`;
    return;
  }

  if (status === 'empty') {
    projectsList.innerHTML = `
      <div class="state-box">
        <p>표시할 프로젝트가 없습니다.</p>
      </div>`;
    return;
  }

  if (status === 'error') {
    projectsList.innerHTML = `
      <div class="state-box">
        <p>프로젝트를 불러올 수 없습니다.</p>
        <p>${escapeHtml(error)}</p>
        <button type="button" class="btn btn-primary" id="retry-btn">다시 시도</button>
      </div>`;
    return;
  }

  // status === 'success'
  projectsList.innerHTML = data.map(createCard).join('');
};

/* --- 3-5. 폼 --- */
const renderForm = () => {
  Object.keys(fieldEls).forEach((key) => {
    const message = STATE.form.errors[key];
    fieldEls[key].error.textContent = message;
    fieldEls[key].input.classList.toggle('invalid', message !== '');
  });
  formSuccess.textContent = STATE.form.success;
};

/* ==========================================================
   4. 이벤트 → setState (DOM을 직접 건드리지 않는다)
   ========================================================== */

/* --- 4-1. 테마 토글 --- */
themeToggle.addEventListener('click', () => {
  const next = STATE.theme === 'dark' ? 'light' : 'dark';
  setState({ theme: next });
  localStorage.setItem(THEME_KEY, next);   // 새로고침 후에도 유지
});

/* --- 4-2. 햄버거 --- */
navToggle.addEventListener('click', () => {
  setState({ isMenuOpen: !STATE.isMenuOpen });
});

/* --- 4-3. 부드러운 스크롤 + 메뉴 닫기 --- */
navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    event.preventDefault();                          // 기본 점프 차단
    target.scrollIntoView({ behavior: 'smooth' });
    setState({ isMenuOpen: false });
  });
});

/* --- 4-4. 스크롤 --- */
const handleScroll = () => {
  const y = window.scrollY;
  const isScrolled   = y > NAV_SCROLL_THRESHOLD;
  const isTopVisible = y > TOP_BTN_THRESHOLD;

  // 값이 실제로 바뀐 경우에만 setState → 불필요한 render 방지
  if (isScrolled !== STATE.isScrolled || isTopVisible !== STATE.isTopVisible) {
    setState({ isScrolled, isTopVisible });
  }
};
window.addEventListener('scroll', handleScroll, { passive: true });

/* --- 4-5. 맨 위로 --- */
toTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* --- 4-6. 재시도 버튼 (이벤트 위임)
   이 버튼은 에러 상태일 때 JS가 만들어내므로, 지금 리스너를 걸 대상이 없다.
   그래서 항상 존재하는 부모에 걸고, 클릭된 것이 무엇인지 확인한다. --- */
projectsList.addEventListener('click', (event) => {
  if (event.target.closest('#retry-btn')) loadProjects();
});

/* --- 4-7. 폼 --- */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATORS = {
  name:    (v) => (v.trim() === '' ? '이름을 입력해 주세요.' : ''),
  email:   (v) => {
    if (v.trim() === '') return '이메일을 입력해 주세요.';
    if (!EMAIL_PATTERN.test(v.trim())) return '이메일 형식이 올바르지 않습니다.';
    return '';
  },
  message: (v) => (v.trim() === '' ? '메시지를 입력해 주세요.' : ''),
};

// 이미 에러인 필드만 실시간 재검사 (처음 타이핑부터 빨간 글씨가 뜨면 불쾌하므로)
Object.keys(fieldEls).forEach((key) => {
  fieldEls[key].input.addEventListener('input', () => {
    if (STATE.form.errors[key] === '' && STATE.form.success === '') return;

    setState({
      form: {
        errors:  { ...STATE.form.errors, [key]: VALIDATORS[key](fieldEls[key].input.value) },
        success: '',
      },
    });
  });
});

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();                   // 페이지 새로고침 차단

  // 전부 검사한다. 중간에 끊으면 뒤 필드의 에러가 안 뜬다.
  const errors = {};
  Object.keys(VALIDATORS).forEach((key) => {
    errors[key] = VALIDATORS[key](fieldEls[key].input.value);
  });

  const isValid = Object.values(errors).every((message) => message === '');

  setState({
    form: {
      errors,
      success: isValid ? '메시지가 정상적으로 접수되었습니다. 감사합니다!' : '',
    },
  });

  if (!isValid) {
    const firstInvalid = Object.keys(errors).find((key) => errors[key] !== '');
    fieldEls[firstInvalid].input.focus();   // 첫 에러 필드로 커서 이동
    return;
  }

  contactForm.reset();
});

/* ==========================================================
   5. GitHub API — 상태를 4단계로 전이시킨다
      loading → (success | empty | error)
   ========================================================== */
const loadProjects = async () => {
  setState({ projects: { status: 'loading', data: [], error: null } });

  try {
    const response = await fetch(API_URL);

    // fetch는 403·404에서도 reject하지 않는다. 직접 확인해야 한다.
    if (response.status === 403) {
      throw new Error('GitHub API 요청 한도(시간당 60회)를 초과했습니다. 잠시 후 다시 시도해 주세요.');
    }
    if (!response.ok) {
      throw new Error(`서버 응답 오류 (HTTP ${response.status})`);
    }

    const data  = await response.json();
    const repos = data.filter((repo) => !repo.fork && !FEATURED_REPOS.includes(repo.name));

    setState({
      projects: {
        status: repos.length === 0 ? 'empty' : 'success',
        data:   repos,
        error:  null,
      },
    });

  } catch (error) {
    console.error('[Projects]', error);
    setState({ projects: { status: 'error', data: [], error: error.message } });
  }
};

/* ==========================================================
   6. 스크롤 등장 애니메이션 — Intersection Observer
   ========================================================== */
sections.forEach((section) => section.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);   // 한 번 나타나면 감시 해제
      }
    });
  },
  { threshold: REVEAL_THRESHOLD }
);

sections.forEach((section) => observer.observe(section));

/* ==========================================================
   7. 초기화 — 초기 상태를 화면에 한 번 반영하고 시작
   ========================================================== */
handleScroll();   // 새로고침 시 이미 중간 위치일 수 있으므로
render();         // STATE 초기값을 화면에 반영
loadProjects();