/* One complete navigation source for every customer-facing page. */
(() => {
  const navigation = [
    ['/', 'Home'],
    ['/products', 'Products'],
    ['/our-story', 'Our story'],
    ['/bundles', 'Bundles'],
    ['/blog', 'Blog'],
    ['/contact', 'Contact us'],
    ['/rewards', 'Rewards'],
    ['/track', 'Track'],
    ['/learn', 'Learn'],
  ];
  const tickerMessages = [
    'WELCOME15: 15% off your first order',
    'Earn reward points with every treat order',
    'Naturally dehydrated treats • no preservatives, grains or fillers',
    'Free shipping on every order • Pay online & get ₹30 off',
    'MEGA20: 20% off orders ₹2,199+',
  ];

  const installLiveTicker = () => {
    const notice = document.querySelector('.notice');
    if (!notice || notice.querySelector('.gob-live-ticker')) return;
    notice.dataset.gobLiveTickerReady = 'true';
    notice.innerHTML = '<div class="gob-live-ticker"><span></span></div>';
    const label = notice.querySelector('.gob-live-ticker span');
    let tickerIndex = 0;
    const paint = () => {
      label.textContent = tickerMessages[tickerIndex];
      requestAnimationFrame(() => document.documentElement.style.setProperty('--gob-notice-height', `${notice.offsetHeight}px`));
    };
    paint();
    window.setInterval(() => { tickerIndex = (tickerIndex + 1) % tickerMessages.length; paint(); }, 5000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installLiveTicker, { once: true });
  else installLiveTicker();
  window.setTimeout(installLiveTicker, 120);
  if (!document.querySelector('link[data-gob-header-navigation]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'header-navigation.css?v=live-ticker-6';
    stylesheet.dataset.gobHeaderNavigation = 'true';
    document.head.append(stylesheet);
  }
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
