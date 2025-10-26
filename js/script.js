//document.addEventListener("DOMContentLoaded", () => {
//    initTabsAndTheme();
// });

document.addEventListener("contentLoaded", () => {
    initTabsAndTheme();
});

function initTabsAndTheme() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    const themeToggle = document.getElementById("theme-toggle");

    let activeTab = "about";
    let currentLang = localStorage.getItem("lang") || "ru";

    const wrapper = document.querySelector(".tab-wrapper");
    if (!wrapper) return;
    wrapper.style.height = document.getElementById(activeTab).offsetHeight + "px";

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.tab;
            if (targetId === activeTab) return;

            const currentTab = document.getElementById(activeTab);
            const nextTab = document.getElementById(targetId);

            currentTab.style.opacity = 0;

            setTimeout(() => {
                currentTab.classList.remove("active");
                nextTab.classList.add("active");
                nextTab.style.opacity = 0;

                wrapper.style.transition = "height 0.4s ease";
                wrapper.style.height = nextTab.offsetHeight + "px";

                setTimeout(() => {
                    nextTab.style.opacity = 1;
                    activeTab = targetId;
                }, 100);
            }, 30);

            tabButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    function updateThemeIcon() {
        const icon = themeToggle.querySelector("img");
        if (document.body.classList.contains("dark")) {
            icon.src = "img/icon/sun.svg";
        } else {
            icon.src = "img/icon/moon.svg";
        }
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        updateThemeIcon();
    });

    updateThemeIcon();
}

function updateTabHeight() {
  const activeTab = document.querySelector('.tab-content.active');
  const wrapper = document.querySelector(".tab-wrapper");
  if (activeTab) {
      const newHeight = activeTab.offsetHeight; 
      wrapper.style.transition = "height 0.4s ease";
      wrapper.style.height = `${newHeight}px`;
  }
}

window.addEventListener('resize', updateTabHeight);