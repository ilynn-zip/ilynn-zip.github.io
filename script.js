(function () {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const backTapes = document.querySelectorAll('#tapeBack .crime-tape');
    const frontTapes = document.querySelectorAll('#tapeFront .crime-tape');
    const allTapes = [...backTapes, ...frontTapes];

    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    const factor = 0.05;
    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;

    function updateTapes() {
        targetX += (mouseX - targetX) * 0.08;
        targetY += (mouseY - targetY) * 0.08;

        const offsetX = targetX * factor;
        const offsetY = targetY * factor;

        allTapes.forEach((tape, index) => {
            const mult = 0.4 + (index % 4) * 0.2;
            const tx = offsetX * mult;
            const ty = offsetY * mult;
            tape.style.translate = `${tx}px ${ty}px`;
        });
    }

    function onMouseMove(e) {
        mouseX = e.clientX - centerX;
        mouseY = e.clientY - centerY;
    }

    function animate() {
        updateTapes();
        requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', onMouseMove);
    animate();

    window.addEventListener('resize', () => {
        centerX = window.innerWidth / 2;
        centerY = window.innerHeight / 2;
    });

    const card = document.querySelector('.glass-card');
    if (card) {
        card.addEventListener('click', function () {
            allTapes.forEach(t => t.classList.add('highlight'));
            setTimeout(() => {
                allTapes.forEach(t => t.classList.remove('highlight'));
            }, 600);
        });
    }
})();