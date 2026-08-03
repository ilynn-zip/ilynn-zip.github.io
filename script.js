(function() {
    const loader = document.getElementById('loader');
    let timeout = null;

    document.addEventListener('click', function() {
        loader.classList.add('transparent');

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            loader.classList.remove('transparent');
            timeout = null;
        }, 1000);
    });
})();