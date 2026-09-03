(function () {
  var pages = ['shop', 'cart', 'checkout', 'about', 'blog', 'contact', 'track', 'rewards', 'refer', 'reviews', 'faq', 'privacy', 'shipping', 'returns'];

  function pageFromPath(pathname) {
    var path = String(pathname || '').replace(/^\/+|\/+$/g, '');
    if (path.indexOf('products/') === 0) return 'product';
    return pages.indexOf(path) >= 0 ? path : '';
  }

  window.GobRoutes = Object.freeze({ pages: pages, pageFromPath: pageFromPath });
}());
