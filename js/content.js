let currentLang = localStorage.getItem("lang") || detectLang();

document.addEventListener("DOMContentLoaded", () => {
  loadContent(currentLang);

  //const langBtn = document.getElementById("lang-toggle");
  //langBtn.addEventListener("click", () => {
  //currentLang = currentLang === "ru" ? "en" : "ru";
  //localStorage.setItem("lang", currentLang);
  //loadContent(currentLang);
  //langBtn.querySelector("img").src =
  //  currentLang === "ru" ? "img/icon/ru.svg" : "img/icon/en.svg";
  //});
});

function detectLang() {
  const lang = navigator.language || navigator.userLanguage;
  return lang.startsWith("ru") ? "ru" : "en";
}

function loadContent(lang) {
  fetch("/data/content.json")
    .then((res) => res.json())
    .then((data) => {
      const d = data[lang];

      document.getElementById("copyright").innerHTML = `${d.copyright}`;

      // === TABS ===
      const tabs = document.getElementById("tabs");
      tabs.innerHTML = d.tabs
        .map((t, i) => {
          const disabledClass = t.disabled ? "disabled" : "";
          const titleAttr = t.disabled && t.tooltip ? `title="${t.tooltip}"` : "";
          const activeClass = i === 0 ? "active" : "";
          return `
      <button class="tab-btn ${activeClass} ${disabledClass}" data-tab="${t.id}" ${titleAttr}>
        <img src="${t.icon}" alt="${t.title}">
        <span data-l10n="tab-${t.id}-title">${t.title}</span>
      </button>`;
        })
        .join("");

      const wrapper = document.getElementById("tab-wrapper");
      wrapper.innerHTML = `
        <section id="about" class="tab-content active"></section>
        <section id="projects" class="tab-content"></section>
      `;

      // === ABOUT ===
      const about = d.about;
      document.getElementById("about").innerHTML = `
        <div class="about-section">
          <div class="profile-container">
            <img src="${about.photo}" alt="Profile" class="profile-photo">
          <div id="thought-bubble" data-l10n="bubble" class="thought-bubble">${switchBubble(lang)}</div>
          </div>
          <div class="about-text">
            <h1 data-l10n="about-title">${about.title}</h1>
            <p data-l10n="about-text">${about.text}</p>
            <h3 data-l10n="find-text">${about.find}</h3>
            <div class="socials">
              ${about.socials
          .map(
            (s) => {
              const disabledClass = s.disabled ? "disabled" : "";
              //const pointerEvents = s.disabled ? "pointer-events: none;" : "";
              const titleAttr = s.disabled && s.tooltip ? `title="${s.tooltip}"` : "";
              return `
            <a href="${s.link}" target="_blank" data-social="${s.name.toLowerCase()}" class="social-btn ${disabledClass}" ${titleAttr}>
              <img src="${s.icon}" alt="${s.name}"> ${s.name}
            </a>`}
          )
          .join("")}
            </div>
          </div>
        </div>

        <div class="highlight-projects">
        <h3 data-l10n="featured-title">${d.about.featuredTitle || "Featured Projects"}</h3>
          <div class="mini-projects">
            ${about.featured.reverse()
          .map(
            (f) => `
                <div class="mini-project" data-project-id="${f.id}">
                  <img src="${f.image}" alt="${f.title}">
                  <div class="mini-info">
                    <h4 data-l10n="featured-${f.id}-title">${f.title}</h4>
                    <p data-l10n="featured-${f.id}-desc">${f.desc}</p>
                  </div>
                </div>`
          )
          .join("")}
          </div>
        </div>`;

      addOpenProjectFromMini();


      // === PROJECTS ===
      const projects = d.projects;
      loadProjects(lang, d);

      // === CONTACT ===
      //document.getElementById("contact").innerHTML = `
      //  <h2>${lang === "ru" ? "Контакты" : "Contact"}</h2>
      //  <p>Email: <a href="mailto:${d.contact.email}">${d.contact.email}</a></p>`;

      //const wrapper = document.querySelector(".tab-wrapper");
      const activeTab = document.querySelector(".tab-content.active");

      if (wrapper && activeTab) {
        const images = activeTab.querySelectorAll("img");
        let loaded = 0;

        if (images.length === 0) {
          setWrapperHeight();
        } else {
          images.forEach((img) => {
            if (img.complete) {
              loaded++;
              if (loaded === images.length) setWrapperHeight();
            } else {
              img.addEventListener("load", () => {
                loaded++;
                if (loaded === images.length) setWrapperHeight();
              });
              img.addEventListener("error", () => {
                loaded++;
                if (loaded === images.length) setWrapperHeight();
              });
            }
          });
        }

        function setWrapperHeight() {
          wrapper.style.transition = "height 0.4s ease";
          wrapper.style.height = activeTab.offsetHeight + "px";

          const preloader = document.getElementById("preloader");
          if (preloader) {
            preloader.style.opacity = 0;
            preloader.style.transition = "opacity 0.5s ease";
            setTimeout(() => preloader.remove(), 500);
          }

          document.dispatchEvent(new Event("contentLoaded"));
        }
      }
    })
    .catch((err) => console.error("Content Error:", err));
}

function loadProjects(lang, d) {
  fetch("/data/project.json")
    .then(res => res.json())
    .then(projectData => {
      const projects = projectData.project[lang] || [];
      const linkico = projectData.playico;
      const container = document.getElementById("projects");

      container.innerHTML = `
        <h2 data-l10n="projects-title">${d.projectsTitle || "Projects"}</h2>
        <div class="project-grid">
          ${projects.reverse().map(p => `
            <div class="project-card" data-project-id="${p.id}">
              <img src="${p.image}" alt="${p.title}">
              <div class="project-info">
                <h3 data-l10n="project-${p.id}-title">${p.title}</h3>
                <p data-l10n="project-${p.id}-desc">${p.desc}</p>
                <div class="button-row">
                ${d.projectLink
          .map(pl => {
            const disabledClass = pl.disabled ? "disabled" : "";
            //const pointerEvents = pl.disabled ? "pointer-events: none;" : "";
            const titleAttr = pl.disabled && pl.tooltip ? `title="${pl.tooltip}"` : "";
            return `
                    <a href="${p.link}" target="_blank" pid="${p.id}" dlink="${pl.nid.toLowerCase()}" class="social-btn project-btn ${disabledClass}" ${titleAttr}>
                      <img src="${pl.icon}" alt="${pl.nid}"><span data-l10n="project-link-${pl.nid}">${pl.name}</span>
                    </a>`}
          )
          .join("")}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `;

      projects.forEach(p => {
        const buttons = document.querySelectorAll(`[pid="${p.id}"]`);
        const links = p.projectLink;

        buttons.forEach(btn => {
          const dlink = btn.getAttribute("dlink");
          const linkData = links.find(l => l.nid.toLowerCase() === dlink);

          if (linkData) {
            btn.href = linkData.link;

            if (linkData.hidden) {
              btn.classList.add("hidden");
            } else {
              btn.classList.remove("hidden");
            }

            if (linkData.disabled) {
              btn.classList.add("disabled");
              if (linkData.tooltip) {
                btn.setAttribute("title", linkData.tooltip);
              } else {
                btn.setAttribute("title", "");
              }
            } else {
              btn.classList.remove("disabled");
              btn.removeAttribute("title");
            }
          }
        });
      });

    })
    .catch(err => console.error("Projects Error:", err));
}

function addOpenProjectFromMini() {
  document.addEventListener('click', (e) => {
    const mini = e.target.closest('.mini-project');
    if (!mini) return;

    const projectId = mini.dataset.projectId;
    if (!projectId) return;

    const projectsTabBtn = document.querySelector('.tab-btn[data-tab="projects"]');

    const scrollToProject = () => {
      const target = document.querySelector(`.project-card[data-project-id="${projectId}"]`);
      if (!target) return false;

      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('highlight');
      setTimeout(() => target.classList.remove('highlight'), 1400);
      return true;
    };

    if (projectsTabBtn) {
      projectsTabBtn.click();
    } else {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'projects'));
      document.querySelectorAll('.tab-content').forEach(t => {
        const isProjects = t.id === 'projects';
        t.classList.toggle('active', isProjects);
        t.style.display = isProjects ? 'block' : 'none';
        t.style.opacity = isProjects ? '1' : '0';
      });
    }

    if (scrollToProject()) return;

    const onContent = () => {
      if (scrollToProject()) {
        window.removeEventListener('contentLoaded', onContent);
        const wrapper = document.getElementById('tab-wrapper');
        const activeTab = document.querySelector('.tab-content.active');
        if (wrapper && activeTab) wrapper.style.height = activeTab.offsetHeight + 'px';
      }
    };

    window.addEventListener('contentLoaded', onContent);

    setTimeout(() => {
      onContent();
      window.removeEventListener('contentLoaded', onContent);
    }, 1000);
  });
}
