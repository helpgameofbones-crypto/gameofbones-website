(function () {
  'use strict';

  var offers = [
    'WELCOME15: 15% off your first order',
    'Pay online and get ₹30 off',
    'Buy 3+ treats, save 5% automatically',
    'MEGA20: 20% off orders above ₹2,199',
    'Free shipping on every order'
  ];

  function loadStyles() {
    if (document.querySelector('link[href="/components/storefront-shell.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = '/components/storefront-shell.css';
    document.head.appendChild(link);
  }

  function createOfferBar(nav) {
    var bar = document.getElementById('gobOfferBar');
    if (bar) return;
    bar = document.createElement('section');
    bar.id = 'gobOfferBar'; bar.setAttribute('aria-label', 'Current offers');
    bar.innerHTML = '<a class="gob-offer-copy" href="/shop"></a><button class="gob-offer-pause" type="button" aria-label="Pause offer rotation" aria-pressed="false">Ⅱ</button>';
    nav.parentNode.insertBefore(bar, nav);

    var index = 0, paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches, timer;
    var message = bar.querySelector('.gob-offer-copy'), pause = bar.querySelector('button');
    function paint(instant) {
      if (!instant) message.classList.add('is-changing');
      window.setTimeout(function () { message.textContent = offers[index]; message.classList.remove('is-changing'); }, instant ? 0 : 180);
    }
    function schedule() { window.clearInterval(timer); if (!paused) timer = window.setInterval(function () { index = (index + 1) % offers.length; paint(false); }, 4300); }
    paint(true); schedule();
    pause.addEventListener('click', function () { paused = !paused; pause.textContent = paused ? '▶' : 'Ⅱ'; pause.setAttribute('aria-pressed', String(paused)); pause.setAttribute('aria-label', paused ? 'Play offer rotation' : 'Pause offer rotation'); schedule(); });
  }

  function tidyNavigation(nav) {
    nav.classList.add('gob-modern-shell');
    var links = nav.querySelector('.nav-links');
    if (links) {
      links.classList.add('compact-nav');
      var labels = { 'nav-home': 'Home', 'nav-shop': 'Products', 'nav-about': 'Our Story', 'nav-blog': 'Learn', 'nav-track': 'Track', 'nav-rewards': 'Rewards' };
      Object.keys(labels).forEach(function (id) { var link = document.getElementById(id); if (link) link.textContent = labels[id]; });
      var feeders = document.getElementById('nav-feeders'); if (feeders) feeders.parentElement.setAttribute('data-shell-secondary', 'true');
    }

    var login = document.getElementById('loginNavBtn');
    if (login) { login.classList.add('login-trigger'); login.setAttribute('aria-label', 'Log in or view account'); if (login.textContent.trim() === '👤') login.textContent = 'Log in'; }
    var cart = document.getElementById('cartCount');
    if (cart && cart.parentElement) {
      var trigger = cart.parentElement;
      trigger.classList.add('jar-trigger'); trigger.setAttribute('aria-label', 'Open Treat Jar');
      trigger.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 26"><path d="M6 5h12M5 8h14l-1 14H6L5 8Zm3-5h8v2H8V3Zm1 9h6m-6 4h6"/></svg><span class="cart-badge" id="cartCount">' + cart.textContent + '</span><span class="sr-only">Treat Jar</span>';
    }
  }

  function initialise() {
    loadStyles();
    var nav = document.getElementById('mainNav'); if (!nav) return;
    var legacyPromo = document.getElementById('promoBannerStrip'); if (legacyPromo) legacyPromo.setAttribute('data-shell-legacy-promo', 'true');
    tidyNavigation(nav); createOfferBar(nav);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise); else initialise();
}());
