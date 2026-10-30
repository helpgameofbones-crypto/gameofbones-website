/* One complete navigation source for every customer-facing page. */
(() => {
  const navigation = [
    ['/products', 'Shop'],
    ['/dog-chews', 'Dog chews'],
    ['/dog-training-treats', 'Training treats'],
    ['/cat-treats', 'Cat treats'],
    ['/our-story', 'Our story'],
  ];
  const tickerCopy = 'Free delivery across India · ₹30 off when you pay online';

  const installLiveTicker = () => {
    const notice = document.querySelector('.notice');
    if (!notice || notice.querySelector('.gob-live-ticker')) return;
    notice.dataset.gobLiveTickerReady = 'true';
    notice.innerHTML = '<div class="gob-live-ticker"><span></span></div>';
    const label = notice.querySelector('.gob-live-ticker span');
    const paint = () => {
      label.textContent = tickerCopy;
      requestAnimationFrame(() => document.documentElement.style.setProperty('--gob-notice-height', `${notice.offsetHeight}px`));
    };
    paint();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installLiveTicker, { once: true });
  else installLiveTicker();
  window.setTimeout(installLiveTicker, 120);
  if (!document.querySelector('link[data-gob-header-navigation]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'header-navigation.css?v=live-ticker-7';
    stylesheet.dataset.gobHeaderNavigation = 'true';
    document.head.append(stylesheet);
  }
  // Bone Run lives in the footer now (the floating launcher is hidden). It still opens once per visit on its own.
  const addPlayLink = () => {
    const shop = [...document.querySelectorAll('footer h4')].find(h => /shop/i.test(h.textContent))?.parentElement;
    if (!shop || shop.querySelector('[data-play-bonerun]')) return;
    shop.insertAdjacentHTML('beforeend', '<a href="#" data-play-bonerun>Play &amp; win a treat</a>');
    shop.querySelector('[data-play-bonerun]').addEventListener('click', event => {
      event.preventDefault();
      if (typeof window.GOB_openSpinWheel === 'function') window.GOB_openSpinWheel();
      else document.addEventListener('gob:wheel-ready', () => window.GOB_openSpinWheel?.(), { once: true });
    });
  };
  [400, 1500, 4000].forEach(ms => window.setTimeout(addPlayLink, ms));

  const nav = document.querySelector('.nav');
  if (!nav || nav.dataset.minimalHeader === 'true') return;
  const pathname = location.pathname.toLowerCase();
  const activeHref = pathname.endsWith('product.html') || pathname === '/product' ? '/products' : navigation.find(([href]) => href === '/' ? pathname === '/' || pathname.endsWith('/index.html') : pathname === href || pathname.endsWith(href + '.html'))?.[0];
  const links = nav.querySelector('.nav-links') || document.createElement('div');
  links.className = 'nav-links compact-nav';
  links.setAttribute('aria-label', 'Site sections');
  links.innerHTML = navigation.map(([href, label]) => `<a${href === activeHref ? ' class="active"' : ''} href="${href}">${label}</a>`).join('');
  if (!links.parentElement) nav.insertBefore(links, nav.querySelector('.nav-actions'));
})();
