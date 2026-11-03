/* One complete navigation source for every customer-facing page. */
(() => {
  const navigation = [
    ['/products', 'Shop'],
    ['/dog-chews', 'Dog chews'],
    ['/dog-training-treats', 'Training treats'],
    ['/cat-treats', 'Cat treats'],
    ['/our-story', 'Our story'],
  ];
  const tickerCopy = 'Free delivery on full packs · ₹30 off when you pay online';

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

  // Accepted payment methods (Razorpay + cash on delivery): footer on every page, and under "Add to treat jar" on product pages.
  const PAY = [['upi','UPI'],['googlepay','Google Pay'],['phonepe','PhonePe'],['paytm','Paytm'],['visa','Visa'],['mastercard','Mastercard'],['rupay','RuPay'],['maestro','Maestro']];
  const EXTRA = [['Net banking','<path d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18M12 3l9 5H3z"/>'],['Wallets','<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h5M3 9h14"/>'],['Cash on delivery','<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>']];
  const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#bd812a"/></svg>';
  const payRow = extra => `<div class="gob-pay${extra ? ' ' + extra : ''}" aria-label="Payment methods we accept"><p class="gob-pay-t">${LOCK}<span>Secure payments by Razorpay</span></p><ul class="gob-pay-logos">${PAY.map(([k, n]) => `<li class="gob-pay-${k}"><img src="/assets/pay/${k}.svg" alt="${n}" width="54" height="34" loading="lazy" decoding="async"></li>`).join('')}</ul><ul class="gob-pay-more">${EXTRA.map(([n, d]) => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>${n}</li>`).join('')}</ul></div>`;
  window.GOB_payRow = payRow;
  const addPayments = () => {
    const bottom = document.querySelector('footer .footer-bottom');
    if (bottom && !document.querySelector('footer .gob-pay')) bottom.insertAdjacentHTML('beforebegin', payRow('gob-pay-footer'));
    const ship = document.getElementById('v2Ship');
    if (ship && !ship.querySelector('.gob-pay')) ship.insertAdjacentHTML('beforeend', payRow('gob-pay-product'));
  };
  [300, 1500, 4000].forEach(ms => window.setTimeout(addPayments, ms));
  if (!document.querySelector('script[data-gob-trust]')) {
    const tl = document.createElement('link'); tl.rel = 'stylesheet'; tl.href = '/trust.css?v=2'; document.head.append(tl);
    const ts = document.createElement('script'); ts.src = '/trust.js?v=2'; ts.defer = true; ts.dataset.gobTrust = '1'; document.head.append(ts);
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
