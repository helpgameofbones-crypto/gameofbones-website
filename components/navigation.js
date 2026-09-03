(function () {
  var routeByNavId = {
    'nav-home': '/', 'nav-shop': '/shop', 'nav-about': '/about',
    'nav-blog': '/blog', 'nav-track': '/track', 'nav-rewards': '/rewards'
  };

  function initialiseNavigation() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    nav.setAttribute('aria-label', 'Primary navigation');

    Object.keys(routeByNavId).forEach(function (id) {
      var link = document.getElementById(id);
      if (!link) return;
      link.setAttribute('href', routeByNavId[id]);
    });

    var cart = nav.querySelector('.nav-actions .nav-icon:not(#loginNavBtn)');
    if (cart) cart.setAttribute('aria-label', 'Open cart');
    var menu = nav.querySelector('.hamburger-btn');
    if (menu) {
      menu.setAttribute('aria-label', 'Open navigation menu');
      menu.setAttribute('aria-controls', 'mobileNavMenu');
      menu.setAttribute('aria-expanded', 'false');
      menu.addEventListener('click', function () {
        window.setTimeout(function () {
          var panel = document.getElementById('mobileNavMenu');
          menu.setAttribute('aria-expanded', panel && panel.classList.contains('mobile-open') ? 'true' : 'false');
        }, 0);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseNavigation);
  else initialiseNavigation();
}());
