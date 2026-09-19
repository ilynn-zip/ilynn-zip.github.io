(function () {
  'use strict';

  /* ============================================================
     ПРЕЛОАДЕР
     ============================================================ */
  var preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(function () {
      preloader.classList.add('is-done');
      setTimeout(function () { preloader.style.display = 'none'; }, 500);
    }, 800);
  }

  /* ============================================================
     ТЕМА
     ============================================================ */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) { }
  if (saved === 'light' || saved === 'dark') { root.setAttribute('data-theme', saved); }
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { }
    });
  }

  /* ============================================================
     ЧАСЫ (только главная)
     ============================================================ */
  function tickClock() {
    var el = document.getElementById('localClock');
    if (!el) return;
    var now = new Date();
    var msk = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 3 * 3600000);
    el.innerHTML = String(msk.getHours()).padStart(2, '0') + ':' + String(msk.getMinutes()).padStart(2, '0') + '<span>MSK</span>';
  }
  tickClock();
  setInterval(tickClock, 30000);

  /* ============================================================
     ВОДЯНЫЕ ЗНАКИ (только главная)
     ============================================================ */
  var wms = document.querySelectorAll('[data-wm]');
  function fitWatermarks() {
    if (!wms.length) return;
    var isMob = window.matchMedia('(max-width: 900px)').matches;
    var targetRatio = isMob ? 0.8 : 0.72;
    wms.forEach(function (wm) {
      var panel = wm.parentElement;
      if (!panel) return;
      var panelW = panel.clientWidth;
      var targetW = panelW * targetRatio;
      wm.style.fontSize = '100px';
      var w = wm.getBoundingClientRect().width;
      if (w < 1) return;
      var size = 100 * (targetW / w);
      var maxSize = isMob ? 160 : 260;
      if (size > maxSize) size = maxSize;
      wm.style.fontSize = size.toFixed(2) + 'px';
    });
  }
  if (wms.length) {
    fitWatermarks();
    setTimeout(fitWatermarks, 60);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fitWatermarks); }
    window.addEventListener('resize', function () {
      clearTimeout(window.__wmTimer);
      window.__wmTimer = setTimeout(fitWatermarks, 80);
    });
  }

  /* ============================================================
     РОМБЫ — только #web (главная)
     ============================================================ */
  var web = document.getElementById('web');
  if (web) { initDiamonds(web); }

  function initDiamonds(web) {
    var webSvg = document.getElementById('webSvg');
    if (!webSvg) return;
    var nodes = Array.prototype.slice.call(web.querySelectorAll('.node'));

    var connections = [
      [0, 1], [0, 3],
      [1, 2], [1, 3], [1, 4],
      [2, 4], [2, 7],
      [3, 4], [3, 5],
      [4, 6], [4, 7],
      [5, 6],
      [6, 7]
    ];

    var W = 0, H = 0;
    var isDesktop = window.matchMedia('(min-width: 901px)').matches;

    var data = nodes.map(function (node) {
      return {
        x: parseFloat(node.getAttribute('data-x')) || 50,
        y: parseFloat(node.getAttribute('data-y')) || 50,
        px: 0, py: 0,
        el: node
      };
    });

    var lineEls = connections.map(function (c) {
      var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('class', 'web__line');
      webSvg.appendChild(l);
      return { a: c[0], b: c[1], el: l };
    });

    function layout() {
      W = web.clientWidth;
      H = web.clientHeight;
      webSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      webSvg.setAttribute('preserveAspectRatio', 'none');

      data.forEach(function (d) {
        if (d.px === 0 && d.py === 0) {
          d.px = W * d.x / 100;
          d.py = H * d.y / 100;
        }
        d.el.style.left = d.px + 'px';
        d.el.style.top = d.py + 'px';
      });

      drawLines();
    }

    function drawLines() {
      lineEls.forEach(function (L) {
        var a = data[L.a], b = data[L.b];
        L.el.setAttribute('x1', a.px.toFixed(1));
        L.el.setAttribute('y1', a.py.toFixed(1));
        L.el.setAttribute('x2', b.px.toFixed(1));
        L.el.setAttribute('y2', b.py.toFixed(1));
      });
    }

    if (isDesktop) {
      layout();
      window.addEventListener('resize', layout);

      data.forEach(function (d, i) {
        var el = d.el;
        var offsetX = 0, offsetY = 0;
        var dragging = false;

        el.addEventListener('pointerdown', function (e) {
          if (e.button !== 0 && e.pointerType === 'mouse') return;
          e.preventDefault();

          var rect = web.getBoundingClientRect();
          offsetX = e.clientX - rect.left - d.px;
          offsetY = e.clientY - rect.top - d.py;

          dragging = true;
          el.classList.add('is-dragging');
          el.setPointerCapture(e.pointerId);
        });

        el.addEventListener('pointermove', function (e) {
          if (!dragging) return;

          var rect = web.getBoundingClientRect();
          var nx = e.clientX - rect.left - offsetX;
          var ny = e.clientY - rect.top - offsetY;

          var pad = 30;
          var w2 = el.offsetWidth / 2;
          var h2 = el.offsetHeight / 2;
          nx = Math.max(pad + w2, Math.min(W - pad - w2, nx));
          ny = Math.max(pad + h2, Math.min(H - pad - h2, ny));

          d.px = nx;
          d.py = ny;
          el.style.left = nx + 'px';
          el.style.top = ny + 'px';

          lineEls.forEach(function (L) {
            if (L.a === i || L.b === i) {
              var a = data[L.a], b = data[L.b];
              L.el.setAttribute('x1', a.px.toFixed(1));
              L.el.setAttribute('y1', a.py.toFixed(1));
              L.el.setAttribute('x2', b.px.toFixed(1));
              L.el.setAttribute('y2', b.py.toFixed(1));
            }
          });
        });

        function endDrag(e) {
          if (!dragging) return;
          dragging = false;
          el.classList.remove('is-dragging');
          try { el.releasePointerCapture(e.pointerId); } catch (err) { }
        }
        el.addEventListener('pointerup', endDrag);
        el.addEventListener('pointercancel', endDrag);
      });
    }
  }

  /* ============================================================
     НАВИГАЦИЯ — только #track (главная)
     ============================================================ */
  var track = document.getElementById('track');
  if (track) { initTrack(track); }

  function initTrack(track) {
    var panels = Array.prototype.slice.call(track.querySelectorAll('.panel'));
    var navItemsEl = document.getElementById('navItems');
    var railFill = document.getElementById('railFill');
    var progressFill = document.getElementById('progressFill');

    if (!panels.length || !navItemsEl) return;

    var isMobile = window.matchMedia('(max-width: 900px)').matches;
    var current = 0;
    var animating = false;

    panels.forEach(function (p, i) {
      var btn = document.createElement('button');
      btn.className = 'nav-item';
      btn.type = 'button';

      var fallback = p.getAttribute('data-nav') || ('0' + (i + 1));
      var navKey = p.getAttribute('data-nav-key') || '';

      btn.setAttribute('aria-label', fallback);

      btn.innerHTML =
        '<span class="nav-item__label"' +
        (navKey ? ' data-content="' + navKey + '"' : '') +
        '>' + fallback + '</span>' +
        '<span class="nav-item__node"></span>';

      btn.addEventListener('click', function () { goTo(i); });
      navItemsEl.appendChild(btn);
    });

    var navItems = Array.prototype.slice.call(navItemsEl.children);

    function goTo(n) {
      n = Math.max(0, Math.min(panels.length - 1, n));
      if (n === current) return;
      current = n;
      animating = true;
      var target = isMobile ? panels[n].offsetTop : panels[n].offsetLeft;
      if (isMobile) window.scrollTo({ top: target, behavior: 'smooth' });
      else track.scrollTo({ left: target, behavior: 'smooth' });
      updateUI();
      setTimeout(function () { animating = false; }, 750);
    }

    function updateUI() {
      var p = panels.length > 1 ? current / (panels.length - 1) : 0;
      if (progressFill) progressFill.style.width = (p * 100) + '%';
      var railWidth = navItemsEl.clientWidth;
      if (railFill) railFill.style.width = (p * railWidth) + 'px';
      navItems.forEach(function (item, i) {
        item.classList.toggle('is-active', i === current);
      });
    }

    function syncFromScroll() {
      var pos, size;
      if (isMobile) { pos = window.scrollY; size = window.innerHeight; }
      else { pos = track.scrollLeft; size = track.clientWidth; }
      var idx = Math.round(pos / size);
      idx = Math.max(0, Math.min(panels.length - 1, idx));
      if (idx !== current) { current = idx; updateUI(); }
    }

    track.addEventListener('scroll', function () {
      if (!isMobile && !animating) syncFromScroll();
    }, { passive: true });

    document.querySelectorAll('[data-go]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        goTo(parseInt(a.getAttribute('data-go'), 10));
      });
    });

    var lastWheel = 0;
    track.addEventListener('wheel', function (e) {
      if (isMobile) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      var now = Date.now();
      if (now - lastWheel < 620) return;
      lastWheel = now;
      goTo(current + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(current + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(current - 1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(panels.length - 1); }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        isMobile = window.matchMedia('(max-width: 900px)').matches;
        var target = isMobile ? panels[current].offsetTop : panels[current].offsetLeft;
        if (isMobile) window.scrollTo({ top: target, behavior: 'auto' });
        else track.scrollTo({ left: target, behavior: 'auto' });
        updateUI();
        if (wms.length) fitWatermarks();
      }, 120);
    });


    current = 0;
    updateUI();
  }

  if (typeof initLangToggle === 'function') initLangToggle();

})();