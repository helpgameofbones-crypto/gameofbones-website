(function () {
  function slugFor(title) {
    return String(title || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 60);
  }
  window.GobBlogRoute = Object.freeze({
    slugFor: slugFor,
    indexForSlug: function (slug) {
      for (var index = 0; index < articles.length; index++) if (slugFor(articles[index].title) === slug) return index;
      return -1;
    }
  });
  window.createBlogSlug = slugFor;
  window.getBlogIndexFromSlug = function (slug) { return window.GobBlogRoute.indexForSlug(slug); };
}());
