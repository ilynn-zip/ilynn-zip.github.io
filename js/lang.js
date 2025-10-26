document.addEventListener("DOMContentLoaded", () => {
    const langToggle = document.querySelector(".lang-toggle");
    const langMenu = document.querySelector(".lang-menu");

    langToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        langMenu.classList.toggle("show");
    });

    langMenu.querySelectorAll("li").forEach(li => {
        li.addEventListener("click", () => {
            const selectedLang = li.dataset.lang;
            currentLang = selectedLang;
            localStorage.setItem("lang", currentLang);
            switchLang(currentLang);
            switchBubble(currentLang)

            //langToggle.querySelector("img").src =
            //    selectedLang === "ru" ? "img/icon/ru.svg" : "img/icon/en.svg";

            langMenu.classList.remove("show");
        });
    });

    document.addEventListener("click", () => langMenu.classList.remove("show"));

});


function switchLang(lang) {
    fetch('/data/content.json')
        .then(res => res.json())
        .then(data => {
            const d = data[lang];

            document.getElementById("copyright").innerHTML = `${d.copyright}`;

            d.tabs.forEach(tab => {
                const span = document.querySelector(`[data-l10n="tab-${tab.id}-title"]`);
                if (span) span.textContent = tab.title;
            });

            document.querySelector('[data-l10n="bubble"]').textContent = d.about.buble;

            d.about.socials.forEach(s => {
                const linkEl = document.querySelector(`[data-social="${s.name.toLowerCase()}"]`);
                if (!linkEl) return;

                if (s.disabled) {
                    linkEl.classList.add('disabled');
                    //s.setAttribute('disabled', true);
                    linkEl.setAttribute('title', s.tooltip);
                }
                else {
                    linkEl.classList.remove('disabled');
                    //s.removeAttribute('disabled');
                    linkEl.removeAttribute('title')
                }
            });

            document.querySelector('[data-l10n="about-title"]').textContent = d.about.title;
            document.querySelector('[data-l10n="about-text"]').textContent = d.about.text;
            document.querySelector('[data-l10n="find-text"]').textContent = d.about.find;
            document.querySelector('[data-l10n="featured-title"]').textContent = d.about.featuredTitle;
            d.about.featured.forEach(f => {
                const spanTitle = document.querySelector(`[data-l10n="featured-${f.id}-title"]`);
                if (spanTitle) spanTitle.textContent = f.title;
                const spanDesc = document.querySelector(`[data-l10n="featured-${f.id}-desc"]`);
                if (spanDesc) spanDesc.textContent = f.desc;
            });

            document.querySelector('[data-l10n="projects-title"]').textContent = d.projectsTitle;
            updateProjects(lang);
            document.querySelectorAll('[data-l10n="project-link"]').forEach(el => {
                el.textContent = d.projectLink;
            });

            d.projectLink.forEach(pl => {
                const spanL = document.querySelectorAll(`[data-l10n="project-link-${pl.nid}"]`);
                spanL.forEach(el => {
                    el.textContent = pl.name;
                });
            });
        });
}

function updateProjects(lang) {
    fetch('/data/project.json')
        .then(res => res.json())
        .then(data => {
            const pdata = data.project[lang];

            pdata.forEach(p => {
                const spanTitle = document.querySelector(`[data-l10n="project-${p.id}-title"]`);
                if (spanTitle) spanTitle.textContent = p.title;
                const spanDesc = document.querySelector(`[data-l10n="project-${p.id}-desc"]`);
                if (spanDesc) spanDesc.textContent = p.desc;
            });

        });
}

function updateThoughtBubble(langData) {
    const thoughts = langData.thoughts;
    const bubble = document.getElementById("thought-bubble");

    if (!bubble || !thoughts || thoughts.length === 0) return;

    const randomIndex = Math.floor(Math.random() * thoughts.length);
    bubble.textContent = thoughts[randomIndex];
}

function switchBubble(lang) {
    fetch(`/data/bubble.json`)
        .then(res => res.json())
        .then(data => {
            const d = data[lang];

            updateThoughtBubble(d);
        });

}
