// content.js

/* ============================================================
   КОНФИГ ОБЛАКА МЫСЛЕЙ
   ============================================================ */
const THOUGHTS_CONFIG = {
    typeSpeed: 45,     // мс на напечатанную букву
    eraseSpeed: 22,     // мс на стирание буквы
    pauseMs: 900000,   // пауза после напечатанной мысли
    startDelay: 600     // пауза перед первой мыслью
};

/* ============================================================
   УТИЛИТЫ
   ============================================================ */

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/`/g, '&#96;');
}

/* ============================================================
   UI-СТРОКИ
   ============================================================ */
const UI_STRINGS = {
    ru: {
        outOf: 'из',
        competencies: ['компетенция', 'компетенции', 'компетенций']
    },
    en: {
        outOf: 'of',
        competencies: ['competency', 'competencies', 'competencies']
    }
};

function t(key) {
    const dict = UI_STRINGS[currentLang] || UI_STRINGS.ru;
    return dict[key];
}

function pluralize(n, forms) {
    const [one, few, many] = forms;
    if (currentLang === 'en') return `${n} ${n === 1 ? one : many}`;

    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ${few}`;
    return `${n} ${many}`;
}

/* ============================================================
   КОНТЕНТ ПО КЛЮЧАМ
   ============================================================ */

function applyContent(map) {
    document.querySelectorAll('[data-content], [data-content-html]').forEach(el => {
        const key = el.getAttribute('data-content') || el.getAttribute('data-content-html');
        if (!key || !(key in map)) return;

        const value = map[key];
        const useHtml = el.hasAttribute('data-content-html');

        if (useHtml) el.innerHTML = value;
        else el.textContent = value;

        if (el.hasAttribute('data-text')) {
            el.setAttribute('data-text', el.textContent);
        }
        el.querySelectorAll('em[data-text]').forEach(em => {
            em.setAttribute('data-text', em.textContent);
        });
    });

    document.querySelectorAll('[data-href-key]').forEach(el => {
        const key = el.getAttribute('data-href-key');
        if (!(key in map)) return;
        const prefix = el.getAttribute('data-href-prefix') || '';
        el.setAttribute('href', prefix + map[key]);
    });
}

/* ============================================================
   ИКОНКИ КОНТАКТОВ
   ============================================================ */

const CONTACT_ICON_MAP = {
    telegram: 'mdi:telegram',
    itch: 'simple-icons:itchdotio',
    linkedin: 'mdi:linkedin',
    github: 'mdi:github',
    download: 'mdi:download',
    link: 'mdi:link-variant'
};

/* ============================================================
   КОНТАКТЫ
   ============================================================ */

function renderContacts(containerSelector, contacts) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    if (!contacts.length) { container.innerHTML = ''; return; }

    container.innerHTML = contacts.map(c => {
        const arrow = c.arrow || '↗';
        const isDownload = c.icon === 'download';
        const iconName = CONTACT_ICON_MAP[c.icon] || CONTACT_ICON_MAP.link;

        return `
        <a class="cb"
           data-id="${c.id}"
           href="${escapeAttr(c.href)}"
           ${isDownload ? 'download' : 'target="_blank" rel="noopener"'}>
          <span class="cb__icon"><iconify-icon icon="${escapeAttr(iconName)}"></iconify-icon></span>
          <span class="cb__name">${escapeHtml(c.name)}</span>
          <span class="cb__meta">
            ${c.meta ? `<span>${escapeHtml(c.meta)}</span>` : '<span></span>'}
            <span class="cb__ar">${escapeHtml(arrow)}</span>
          </span>
        </a>
      `;
    }).join('');
}

function updateContactsInDOM(contacts) {
    const map = new Map(contacts.map(c => [String(c.id), c]));

    document.querySelectorAll('.cb[data-id]').forEach(el => {
        const c = map.get(el.dataset.id);
        if (!c) return;

        const nameEl = el.querySelector('.cb__name');
        const metaEl = el.querySelector('.cb__meta span:first-child');
        if (nameEl) nameEl.textContent = c.name;
        if (metaEl) metaEl.textContent = c.meta || '';
    });
}

/* ============================================================
   ИНВЕНТАРЬ
   ============================================================ */

function renderSkills(containerSelector, skills) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    if (!skills.length) { container.innerHTML = ''; return; }

    container.innerHTML = skills.map(s => `
      <li class="skill${s.is_featured ? ' skill--featured' : ''}" data-id="${s.id}">
        <span class="skill__mark" aria-hidden="true"></span>
        <span class="skill__text">
          <span class="skill__name">${escapeHtml(s.name)}</span>
          ${s.description ? `<span class="skill__desc">${escapeHtml(s.description)}</span>` : ''}
        </span>
        ${s.is_featured ? '<span class="skill__badge" aria-hidden="true"></span>' : ''}
      </li>
    `).join('');

    updateSkillsMeta(skills.length);
}

function updateSkillsMeta(n) {
    const meta = document.querySelector('.ps-skills__head span');
    if (meta) meta.textContent = pluralize(n, t('competencies'));
}

function updateSkillsInDOM(skills) {
    const map = new Map(skills.map(s => [String(s.id), s]));

    document.querySelectorAll('.skill[data-id]').forEach(el => {
        const s = map.get(el.dataset.id);
        if (!s) return;

        const nameEl = el.querySelector('.skill__name');
        const descEl = el.querySelector('.skill__desc');

        if (nameEl) nameEl.textContent = s.name;

        if (descEl) {
            if (s.description) {
                descEl.textContent = s.description;
                descEl.style.display = '';
            } else {
                descEl.style.display = 'none';
            }
        }

        el.classList.toggle('skill--featured', !!s.is_featured);

        let badge = el.querySelector('.skill__badge');
        if (s.is_featured && !badge) {
            badge = document.createElement('span');
            badge.className = 'skill__badge';
            badge.setAttribute('aria-hidden', 'true');
            el.appendChild(badge);
        } else if (!s.is_featured && badge) {
            badge.remove();
        }
    });

    updateSkillsMeta(skills.length);
}

/* ============================================================
   ХРОНИКА
   ============================================================ */

function renderPath(containerSelector, nodes) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    if (!nodes.length) { container.innerHTML = ''; return; }

    const lastIndex = nodes.length - 1;

    container.style.gridTemplateColumns = `repeat(${nodes.length}, 1fr)`;

    container.innerHTML = nodes.map((n, i) => {
        const position = n.position === 'top' ? 'top' : 'bottom';
        const isLast = i === lastIndex;

        return `
        <div class="path-node path-node--${position}${isLast ? ' path-node--active' : ''}"
             data-id="${n.id}"
             style="--i:${i}">
          <div class="path-node__dot-wrap"><div class="path-node__dot"></div></div>
          <span class="path-node__connector"></span>
          <div class="path-node__label">
            <span class="path-node__year">${escapeHtml(n.year)}</span>
            <span class="path-node__title">${escapeHtml(n.title)}</span>
            ${n.subtitle ? `<span class="path-node__sub">${escapeHtml(n.subtitle)}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
}

function updatePathInDOM(nodes) {
    const map = new Map(nodes.map(n => [String(n.id), n]));

    document.querySelectorAll('.path-node[data-id]').forEach(el => {
        const n = map.get(el.dataset.id);
        if (!n) return;

        const yearEl = el.querySelector('.path-node__year');
        const titleEl = el.querySelector('.path-node__title');
        const subEl = el.querySelector('.path-node__sub');

        if (yearEl) yearEl.textContent = n.year;
        if (titleEl) titleEl.textContent = n.title;

        if (subEl) {
            if (n.subtitle) {
                subEl.textContent = n.subtitle;
                subEl.style.display = '';
            } else {
                subEl.style.display = 'none';
            }
        }
    });
}

/* ============================================================
   ОБЛАКО МЫСЛЕЙ
   ============================================================ */

let __thoughtsTimer = null;
let __thoughtsList = [];
let __thoughtsIndex = -1;

function renderThoughts(selector, thoughts, opts = {}) {
    const container = document.querySelector(selector);
    if (!container) return;

    if (__thoughtsTimer) {
        clearTimeout(__thoughtsTimer);
        __thoughtsTimer = null;
    }

    __thoughtsList = thoughts;
    __thoughtsIndex = -1;

    if (!thoughts.length) {
        container.innerHTML = '';
        return;
    }

    // opts может переопределить отдельные параметры конфига
    const cfg = Object.assign({}, THOUGHTS_CONFIG, opts);
    const typeSpeed = cfg.typeSpeed;
    const eraseSpeed = cfg.eraseSpeed;
    const pauseMs = cfg.pauseMs;
    const startDelay = cfg.startDelay;

    container.innerHTML = `
      <span class="thoughts__label" data-content="intro.thoughts.label">// мысль</span>
      <p class="thoughts__text">
        <span class="thoughts__value" id="thoughtsValue"></span><span class="thoughts__cursor" aria-hidden="true"></span>
      </p>
    `;

    const valueEl = container.querySelector('#thoughtsValue');
    const textEl = container.querySelector('.thoughts__text');

    function pickNext() {
        if (__thoughtsList.length === 1) return 0;
        let next;
        do {
            next = Math.floor(Math.random() * __thoughtsList.length);
        } while (next === __thoughtsIndex);
        return next;
    }

    function typeText(fullText, done) {
        let i = 0;
        valueEl.textContent = '';
        textEl.classList.add('is-typing');

        (function tick() {
            if (i <= fullText.length) {
                valueEl.textContent = fullText.slice(0, i);
                i++;
                __thoughtsTimer = setTimeout(tick, typeSpeed);
            } else {
                textEl.classList.remove('is-typing');
                done();
            }
        })();
    }

    function eraseText(done) {
        textEl.classList.add('is-erasing');

        (function tick() {
            const current = valueEl.textContent;
            if (current.length > 0) {
                valueEl.textContent = current.slice(0, -1);
                __thoughtsTimer = setTimeout(tick, eraseSpeed);
            } else {
                textEl.classList.remove('is-erasing');
                done();
            }
        })();
    }

    function loop() {
        const nextIndex = pickNext();
        __thoughtsIndex = nextIndex;
        const fullText = __thoughtsList[nextIndex].text;

        typeText(fullText, () => {
            __thoughtsTimer = setTimeout(() => {
                eraseText(() => {
                    __thoughtsTimer = setTimeout(loop, 200);
                });
            }, pauseMs);
        });
    }

    __thoughtsTimer = setTimeout(loop, startDelay);
}