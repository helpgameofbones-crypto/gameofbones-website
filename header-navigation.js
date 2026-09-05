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
  const nav = document.querySelector('.nav');
  if (!nav || nav.dataset.minimalHeader === 'true') return;
  if (!document.querySelector('link[data-gob-header-navigation]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'header-navigation.css?v=1';
    stylesheet.dataset.gobHeaderNavigation = 'true';
    document.head.append(stylesheet);
  }
  const pathname = location.pathname.toLowerCase();
  const activeHref = pathname.endsWith('product.html') ? 'products.html' : navigation.find(([href]) => pathname.endsWith(href))?.[0];
  const links = nav.querySelector('.nav-links') || document.createElement('div');
  links.className = 'nav-links compact-nav';
  links.setAttribute('aria-label', 'Site sections');
  links.innerHTML = navigation.map(([href, label]) => `<a${href === activeHref ? ' class="active"' : ''} href="${href}">${label}</a>`).join('');
  if (!links.parentElement) nav.insertBefore(links, nav.querySelector('.nav-actions'));
})();
