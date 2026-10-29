/* ============================================================
   UNDER CONSTRUCTION — main.js
   ============================================================ */

   (() => {
    'use strict';
  
    /**
     * 1. Sync glitch `data-text` with the visible text of <em>.
     *    Keeps pseudo-elements ::before / ::after in sync with content,
     *    so you never have to update two places when editing the headline.
     */
    const glitchEm = document.querySelector('.glitch-title em');
    if (glitchEm) {
      const text = glitchEm.textContent.trim();
      if (text && glitchEm.getAttribute('data-text') !== text) {
        glitchEm.setAttribute('data-text', text);
      }
    }
  
    /**
     * 2. Console easter egg.
     *    A tiny "under construction" note for anyone opening devtools.
     */
    const style = [
      'color: #FFB84C',
      'font-family: monospace',
      'font-size: 13px',
      'padding: 6px 10px',
      'border: 1px solid #FFB84C',
      'background: #1B1D23',
    ].join(';');
  
    console.log('%c⚠ UNDER CONSTRUCTION', style);
    console.log(
      '%c  Site is temporarily closed — coming back soon.\n  Meanwhile: https://github.com/ilynn-zip',
      'color: #8D8D9A; font-family: monospace; font-size: 12px'
    );
  
    /**
     * 3. Pause all heavy animations when the tab is hidden.
     *    Saves CPU / battery while the page sits in a background tab.
     */
    const animatedSelectors = [
      '.tape__track',
      '.dot',
      '.mascot',
      '.glitch-title em',
      '.glitch-title em::before',
      '.glitch-title em::after',
    ];
  
    const pause = () => {
      document.querySelectorAll('.tape__track, .dot, .mascot, .glitch-title em')
        .forEach((el) => {
          el.style.animationPlayState = 'paused';
        });
      document.documentElement.classList.add('tab-hidden');
    };
  
    const resume = () => {
      document.querySelectorAll('.tape__track, .dot, .mascot, .glitch-title em')
        .forEach((el) => {
          el.style.animationPlayState = 'running';
        });
      document.documentElement.classList.remove('tab-hidden');
    };
  
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause();
      else resume();
    });
  
    // expose for debugging
    window.__uc = { animatedSelectors };
  })();