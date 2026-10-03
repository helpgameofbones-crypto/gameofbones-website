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
  const saleDeadline = () => {
    // Treat the following Monday 00:00 in India as "Sunday midnight".
    // Using a fixed IST offset keeps the offer correct for visitors abroad.
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const now = new Date(Date.now() + IST_OFFSET);
    const day = now.getUTCDay();
    const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday, 0, 0, 0) - IST_OFFSET;
  };

  const saleCopy = () => {
    const remaining = Math.max(0, saleDeadline() - Date.now());
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const timer = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return remaining > 0
      ? `SALE ENDS SUNDAY MIDNIGHT IST · ${timer} LEFT · 10% OFF SITEWIDE · 15% OFF WHOLE MACKEREL · ₹30 OFF PREPAID`
      : 'SALE HAS ENDED · SHOP THE CURRENT LIVE PRICES · FREE SHIPPING ACROSS INDIA';
  };

  const installLiveTicker = () => {
    const notice = document.querySelector('.notice');
    if (!notice || notice.querySelector('.gob-live-ticker')) return;
    notice.dataset.gobLiveTickerReady = 'true';
    notice.innerHTML = '<div class="gob-live-ticker"><span></span></div>';
    const label = notice.querySelector('.gob-live-ticker span');
    const paint = () => {
      label.textContent = saleCopy();
      requestAnimationFrame(() => document.documentElement.style.setProperty('--gob-notice-height', `${notice.offsetHeight}px`));
    };
    paint();
    window.setInterval(paint, 1000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installLiveTicker, { once: true });
  else installLiveTicker();
  window.setTimeout(installLiveTicker, 120);
  if (!document.querySelector('link[data-gob-header-navigation]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'header-navigation.css?v=live-ticker-4';
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
