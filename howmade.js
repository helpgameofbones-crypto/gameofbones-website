/* Scroll-driven "How it's made": the photo and progress follow whichever step is in the middle of the screen. */
(() => {
  const root = document.querySelector('[data-howmade]'); if (!root) return;
  const steps = [...root.querySelectorAll('.hm-step')], imgs = [...root.querySelectorAll('.hm-img')];
  const cap = root.querySelector('.hm-cap b'), count = root.querySelector('.hm-count'), bar = root.querySelector('.hm-bar i'), line = root.querySelector('.hm-line'), list = root.querySelector('.hm-steps');
  let cur = -1, ticking = false;
  function set(i) {
    if (i === cur) return; cur = i;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
    cap.textContent = steps[i].querySelector('h3').textContent;
    count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0');
    bar.style.width = ((i + 1) / steps.length * 100) + '%';
    const s = steps[i], top = s.offsetTop + 26; line.style.height = Math.max(0, top - 10) + 'px';
  }
  // keep the photo just below the sticky header, whatever its height
  function headerGap(){ const h=document.querySelector('.site-header,header,.nav'); const b=h?h.getBoundingClientRect().bottom:64; root.style.setProperty('--hm-top', Math.max(56, Math.round(b+12))+'px'); }
  function update() {
    ticking = false;
    const mid = window.innerHeight * (window.innerWidth < 880 ? 0.72 : 0.55);
    let best = 0;
    steps.forEach((s, k) => { if (s.getBoundingClientRect().top < mid) best = k; });
    set(best);
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', () => { headerGap(); update(); });
  headerGap(); update(); setTimeout(headerGap, 1200);
})();
