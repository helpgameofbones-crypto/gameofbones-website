/* One complete navigation source for every customer-facing page. */
(() => {
  const navigation = [
    ['index.html', 'Home'],
    ['products.html', 'Products'],
    ['our-story.html', 'Our story'],
    ['bundles.html', 'Bundles'],
    ['blog.html', 'Blog'],
    ['contact.html', 'Contact us'],
    ['rewards.html', 'Rewards'],
    ['track.html', 'Track'],
    ['learn.html', 'Learn'],
  ];
  const installLiveTicker = () => {
    const notice = document.querySelector('.notice');
    if (!notice || notice.querySelector('.gob-live-ticker')) return;
    notice.dataset.gobLiveTickerReady = 'true';
    const message = '🎉 FREE SHIPPING ON ALL ORDERS   •   🎁 NEW HERE? USE WELCOME15 FOR 15% OFF YOUR FIRST ORDER   •   💰 PAY ONLINE & GET ₹30 OFF   •   📦 MEGA20: 20% OFF ORDERS ₹2,199+   •   🚚 PAN-INDIA DELIVERY VIA DELHIVERY   •   🌿 100% NATURAL, SINGLE INGREDIENT   •   🐾 REFER A FRIEND, EARN 300 POINTS   •   ';
    notice.innerHTML = `<div class="gob-live-ticker"><span>${message}</span><span aria-hidden="true">${message}</span></div>`;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installLiveTicker, { once: true });
  else installLiveTicker();
  window.setTimeout(installLiveTicker, 120);
  if (!document.querySelector('link[data-gob-header-navigation]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'header-navigation.css?v=live-ticker-2';
    stylesheet.dataset.gobHeaderNavigation = 'true';
    document.head.append(stylesheet);
  }
  const nav = document.querySelector('.nav');
  if (!nav || nav.dataset.minimalHeader === 'true') return;
  const pathname = location.pathname.toLowerCase();
  const activeHref = pathname.endsWith('product.html') ? 'products.html' : navigation.find(([href]) => pathname.endsWith(href))?.[0];
  const links = nav.querySelector('.nav-links') || document.createElement('div');
  links.className = 'nav-links compact-nav';
  links.setAttribute('aria-label', 'Site sections');
  links.innerHTML = navigation.map(([href, label]) => `<a${href === activeHref ? ' class="active"' : ''} href="${href}">${label}</a>`).join('');
  if (!links.parentElement) nav.insertBefore(links, nav.querySelector('.nav-actions'));
})();
