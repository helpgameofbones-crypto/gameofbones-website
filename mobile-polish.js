/* Mobile-first polish (phones up to 760px). Loaded on every page by site.js.
   - Offer bar: shows every offer, one at a time, on a single line.
   - Header: keeps the sticky header flush under the offer bar.
   - Product cards: bold price, clear sold-out state.
   - Floating buttons: hidden on bag/checkout and while scrolling down.
   Pure presentation: no prices, stock or cart data are changed here. */
(() => {
  if (window.__gobMobilePolish) return;
  window.__gobMobilePolish = true;
  const mq = window.matchMedia('(max-width: 760px)');

  if (!document.querySelector('link[data-gob-mobile-polish]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/mobile-polish.css?v=2';
    css.dataset.gobMobilePolish = 'true';
    document.head.append(css);
  }

  // 1. Rotating one-line offer bar (reads whatever offers the ticker shows).
  let tickerTimer = null;
  function buildTicker() {
    const host = document.querySelector('.notice .gob-live-ticker');
    const source = host?.querySelector(':scope > span:not(.mp-ticker)');
    if (!host || !source) return;
    const offers = source.textContent.split('•').map(text => text.trim()).filter(Boolean);
    if (!offers.length) return;
    const key = offers.join('|');
    let ticker = host.querySelector('.mp-ticker');
    if (ticker && ticker.dataset.key === key) return;
    ticker?.remove();
    ticker = document.createElement('span');
    ticker.className = 'mp-ticker';
    ticker.dataset.key = key;
    ticker.setAttribute('aria-hidden', 'true'); // the full text stays in the original span for screen readers
    ticker.innerHTML = offers.map(text => `<b>${text.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</b>`).join('');
    host.append(ticker);
    const items = [...ticker.children];
    let index = 0;
    items[0].classList.add('is-on');
    clearInterval(tickerTimer);
    if (items.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tickerTimer = setInterval(() => {
        if (document.hidden) return;
        items[index].classList.remove('is-on');
        index = (index + 1) % items.length;
        items[index].classList.add('is-on');
      }, 3200);
    }
  }

  // 2. Keep the header flush under the offer bar at every width.
  function syncHeaderOffset() {
    const notice = document.querySelector('.notice');
    if (!notice) return;
    const height = notice.getBoundingClientRect().height;
    if (height) document.documentElement.style.setProperty('--gob-notice-height', `${Math.round(height)}px`);
  }

  // Log in moves into the Menu on phones (the header link is hidden there).
  function addLoginToMenu() {
    const menu = document.querySelector('.nav .compact-nav, .nav .nav-links');
    const login = document.querySelector('.nav .login-trigger, .nav .nav-actions > a[href*="login"]');
    if (!menu || !login || menu.querySelector('.mp-login-link')) return;
    const link = document.createElement('a');
    link.className = 'mp-login-link';
    link.href = login.getAttribute('href') || '#';
    link.textContent = (login.textContent || 'Log in').trim();
    if (login.classList.contains('login-trigger')) link.addEventListener('click', event => { event.preventDefault(); login.click(); });
    menu.append(link);
  }

  // 3. Product cards: split "60 g · ₹400" into a muted size and a bold price.
  function polishCards(root = document) {
    root.querySelectorAll('.products .product-card:not([data-home-product])').forEach(card => {
      const add = card.querySelector('.quick-add');
      card.classList.toggle('mp-sold-out', Boolean(add && add.disabled));
      const label = card.querySelector('.card-bottom > span:first-child');
      if (!label || label.querySelector('.mp-price')) return;
      const text = label.textContent.trim();
      const match = text.match(/^(.*?)\s*·\s*((?:from\s+)?₹[\d,]+(?:\.\d+)?)$/i);
      if (!match || /₹/.test(match[1])) return;
      label.innerHTML = '';
      const price = document.createElement('b'); price.className = 'mp-price'; price.textContent = match[2];
      const weight = document.createElement('small'); weight.className = 'mp-weight'; weight.textContent = match[1];
      label.append(price, weight);
    });
  }

  // 5. Floating buttons: hide on bag/checkout/thank-you and while scrolling down.
  function floaters() {
    // Product pages have their own sticky Add-to-bag bar, which must stay clear.
    const quiet = /^\/(cart|checkout|thank-you|trial-packs)(\.html)?\/?$/i.test(location.pathname) || /^\/products\/[^/]+\/?$/i.test(location.pathname) || /^\/product(\.html)?$/i.test(location.pathname);
    document.body.classList.toggle('mp-hide-floaters', quiet);
  }
  let lastY = window.scrollY, ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking || !mq.matches) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 12) { document.body.classList.toggle('mp-scrolling-down', y > lastY && y > 300); lastY = y; }
      ticking = false;
    });
  }, { passive: true });

  function run() {
    buildTicker(); syncHeaderOffset(); addLoginToMenu(); polishCards(); floaters();
  }
  const start = () => {
    run();
    setTimeout(run, 400);
    setTimeout(run, 1500);
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; buildTicker(); polishCards(); addLoginToMenu(); });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled'] });
    if ('ResizeObserver' in window) {
      const notice = document.querySelector('.notice');
      if (notice) new ResizeObserver(syncHeaderOffset).observe(notice);
    }
    window.addEventListener('resize', syncHeaderOffset);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
