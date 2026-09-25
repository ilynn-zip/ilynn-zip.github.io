// projects-render.js

/* ============================================================
   УТИЛИТЫ
   ============================================================ */

function yearsRange(projects) {
    if (!projects || projects.length === 0) return '';
    const firstYear = parseInt(projects[projects.length - 1].year, 10);
    const lastYear = parseInt(projects[0].year, 10);
    if (Number.isNaN(firstYear) || Number.isNaN(lastYear)) return '';
    return firstYear === lastYear ? `${firstYear}` : `${firstYear}—${lastYear}`;
}

/* ============================================================
   РЕНДЕР КАРТОЧЕК ПРОЕКТОВ
   ============================================================ */

function projectCardHTML(p, index, total) {
    const num = String(total - index).padStart(2, '0');
    const subtitle = p.subtitle ? ` <em>${escapeHtml(p.subtitle)}</em>` : '';
    const tags = (p.tags || []).map(t => `<li>${escapeHtml(t)}</li>`).join('');

    const cover = p.cover_url
        ? `<img src="${escapeAttr(p.cover_url)}" alt="${escapeAttr(p.title)}" loading="lazy" decoding="async">`
        : `<div class="pcard__thumb--empty"><span class="pcard__thumb--badge">—</span></div>`;

    const inner = `
      <span class="pcard__num">${num}</span>
      <span class="pcard__year">${escapeHtml(p.year)}</span>
      <div class="pcard__thumb">${cover}</div>
      <div class="pcard__body">
        <h3 class="pcard__title">${escapeHtml(p.title)}${subtitle}</h3>
        <p class="pcard__desc">${escapeHtml(p.description)}</p>
        <ul class="pcard__tags">${tags}</ul>
      </div>
    `;

    if (p.link) {
        return `
        <a class="pcard pcard--link"
           data-id="${p.id}"
           href="${escapeAttr(p.link)}"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="${escapeAttr(p.title)}">${inner}</a>
      `;
    }
    return `<article class="pcard" data-id="${p.id}">${inner}</article>`;
}

function renderProjects(containerSelector, projects, opts = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const limit = opts.limit || projects.length;
    const list = projects.slice(0, limit);
    const total = projects.length;

    container.innerHTML = list
        .map((p, i) => projectCardHTML(p, i, total))
        .join('');

    if (opts.appendTileAll) {
        const labelAll = currentLang === 'en' ? 'All<br>projects' : 'Все<br>проекты';
        const ariaAll = currentLang === 'en' ? 'All projects' : 'Все проекты';

        container.insertAdjacentHTML('beforeend', `
        <a class="tile-all" href="projects" aria-label="${escapeAttr(ariaAll)}">
          <span class="tile-all__ar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 17L17 7M7 7h10v10"/>
            </svg>
          </span>
          <span class="tile-all__body">
            <span class="tile-all__label">${labelAll}</span>
            <span class="tile-all__count">${total} →</span>
          </span>
        </a>
      `);
    }
}

/* ============================================================
   ОБНОВЛЕНИЕ КАРТОЧЕК
   ============================================================ */

function updateProjectsInDOM(projects) {
    const map = new Map(projects.map(p => [String(p.id), p]));

    document.querySelectorAll('.pcard[data-id]').forEach(card => {
        const p = map.get(card.dataset.id);
        if (!p) return;

        const titleEl = card.querySelector('.pcard__title');
        if (titleEl) {
            const sub = p.subtitle ? ` <em>${escapeHtml(p.subtitle)}</em>` : '';
            titleEl.innerHTML = `${escapeHtml(p.title)}${sub}`;
        }

        const descEl = card.querySelector('.pcard__desc');
        if (descEl) descEl.textContent = p.description;

        if (p.link) card.setAttribute('aria-label', p.title);
    });

    // счётчик в тайле "Все проекты"
    const tileCount = document.querySelector('.tile-all__count');
    if (tileCount) tileCount.textContent = `${projects.length} →`;

    // подпись и aria-label тайла
    const tileLabel = document.querySelector('.tile-all__label');
    if (tileLabel) {
        tileLabel.innerHTML = currentLang === 'en' ? 'All<br>projects' : 'Все<br>проекты';
    }
    const tileAll = document.querySelector('.tile-all');
    if (tileAll) {
        tileAll.setAttribute('aria-label', currentLang === 'en' ? 'All projects' : 'Все проекты');
    }
}

/* ============================================================
   СЧЁТЧИКИ
   ============================================================ */

function updateHomeCounters(projects, shown) {
    const total = projects.length;
    const range = yearsRange(projects);

    const counterEl = document.getElementById('workCounter');
    if (counterEl) {
        counterEl.innerHTML =
            `<span class="accent">${String(shown).padStart(2, '0')}</span> ${t('outOf')} ${total}` +
            (range ? ` · ${range}` : '');
    }
}

function updateProjectsPageCounters(projects) {
    const total = projects.length;
    const range = yearsRange(projects);

    const statusEl = document.getElementById('projectsTotalTop');
    if (statusEl) statusEl.textContent = String(total);

    const heroMeta = document.getElementById('catalogMetaRight');
    if (heroMeta) {
        heroMeta.innerHTML =
            `<span class="accent">${total}</span> <span class="slash">/</span> ${total}` +
            (range ? ` · ${range}` : '');
    }

    document.title = currentLang === 'en'
        ? `All projects (${total})`
        : `Все проекты (${total})`;
}

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================================ */

async function initHomePage() {
    const [content, projects, skills, contacts, pathNodes, thoughts] = await Promise.all([
        fetchContent(),
        fetchProjects(),
        fetchSkills(),
        fetchContacts(),
        fetchPathNodes(),
        fetchThoughts()
    ]);

    applyContent(content);

    const shown = Math.min(3, projects.length);
    renderProjects('.project-grid', projects, { limit: 3, appendTileAll: true });
    updateHomeCounters(projects, shown);
    renderSkills('#skillsGrid', skills);
    renderContacts('#contactsGrid', contacts);
    renderPath('.path-nodes', pathNodes);
    renderThoughts('#thoughts', thoughts);

    applyContent(content);

    const elapsed = Date.now() - startedAt;
    const minShow = 800;
    const wait = Math.max(0, minShow - elapsed);
    setTimeout(function () {
        if (typeof hidePreloader === 'function') hidePreloader();
    }, wait);
}

async function initProjectsPage() {
    const [content, projects] = await Promise.all([
        fetchContent(),
        fetchProjects()
    ]);

    applyContent(content);

    renderProjects('.projects-grid', projects);
    updateProjectsPageCounters(projects);

    applyContent(content);

    const elapsed = Date.now() - startedAt;
    const minShow = 800;
    const wait = Math.max(0, minShow - elapsed);
    setTimeout(function () {
        if (typeof hidePreloader === 'function') hidePreloader();
    }, wait);
}

/* ============================================================
   СМЕНА ЯЗЫКА — инкрементально, без пересборки DOM
   ============================================================ */

async function refreshTexts() {
    const [content, projects, skills, contacts, pathNodes, thoughts] = await Promise.all([
        fetchContent(),
        fetchProjects(),
        fetchSkills(),
        fetchContacts(),
        fetchPathNodes(),
        fetchThoughts()
    ]);

    applyContent(content);

    updateProjectsInDOM(projects);
    updateSkillsInDOM(skills);
    updateContactsInDOM(contacts);
    updatePathInDOM(pathNodes);

    if (document.querySelector('.project-grid')) {
        updateHomeCounters(projects, Math.min(3, projects.length));
    }
    if (document.querySelector('.projects-grid')) {
        updateProjectsPageCounters(projects);
    }

    renderThoughts('#thoughts', thoughts);

    applyContent(content);

    document.querySelectorAll('.nav-item').forEach((btn, i) => {
        const panel = document.querySelectorAll('.panel')[i];
        if (!panel) return;
        const key = panel.getAttribute('data-nav-key');
        if (key && key in content) {
            btn.setAttribute('aria-label', content[key]);
        }
    });
}

function updateLangButtons(activeLang) {
    document.querySelectorAll('.lang-toggle__btn').forEach(btn => {
        const active = btn.dataset.lang === activeLang;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
}

async function switchLang(newLang) {
    if (newLang === currentLang) return;
    setCurrentLang(newLang);
    updateLangButtons(newLang);
    await refreshTexts();
}

function initLangToggle() {
    updateLangButtons(currentLang);
    document.querySelectorAll('.lang-toggle__btn').forEach(btn => {
        btn.addEventListener('click', () => switchLang(btn.dataset.lang));
    });
}