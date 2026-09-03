(function () {
  window.filterBySize = function (size) {
    activeShopSize = size;
    document.querySelectorAll('.sz-btn').forEach(function (button) { button.classList.toggle('active', button.dataset.size === size); });
    window.applyShopFilters();
  };

  window.applyShopFilters = function () {
    var base = activeShopFilter === 'all' ? products : products.filter(function (product) { return product.filter === activeShopFilter; });
    if (activeShopSize !== 'all') base = base.filter(function (product) {
      return (product.sizes ? product.sizes.map(function (size) { return size.label; }) : ['all']).indexOf(activeShopSize) > -1;
    });
    var searchValue = (document.getElementById('shopSearch') || {}).value || '';
    var query = searchValue.trim().toLowerCase();
    if (query) base = base.filter(function (product) {
      return product.name.toLowerCase().includes(query) || product.cat.toLowerCase().includes(query) ||
        (product.tags && product.tags.some(function (tag) { return tag.toLowerCase().includes(query); })) ||
        (product.desc && product.desc.toLowerCase().includes(query)) || product.filter.toLowerCase().includes(query);
    });
    var sort = (document.getElementById('shopSort') || {}).value || 'default';
    if (sort === 'price-asc') base = base.slice().sort(function (a, b) { return a.sizes[0].price - b.sizes[0].price; });
    else if (sort === 'price-desc') base = base.slice().sort(function (a, b) { return b.sizes[0].price - a.sizes[0].price; });
    else if (sort === 'name-asc') base = base.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    else if (sort === 'rating') base = base.slice().sort(function (a, b) {
      var ratingA = getProductRating(a.name), ratingB = getProductRating(b.name);
      return (ratingB ? ratingB.avg : 0) - (ratingA ? ratingA.avg : 0);
    });
    var count = document.getElementById('shopResultCount');
    if (count) count.textContent = base.length ? base.length + ' treat' + (base.length === 1 ? '' : 's') + ' found' : '';
    var grid = document.getElementById('shopProd');
    if (!base.length && grid) {
      grid.innerHTML = '<div style="text-align:center;padding:48px 0;font-size:14px;color:var(--muted)">No treats match this combination.<br><button onclick="filterBySize(\'all\');showShopCategory(\'all\')" style="margin-top:12px;background:var(--dark);color:var(--white);border:none;padding:9px 20px;font-family:\'Jost\',sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer">Clear Filters</button></div>';
    } else if (base.length) { renderProducts(base, 'shopProd'); restoreViewCartBtns(); }
  };

  window.doShopSearch = function (value) {
    var query = value.trim();
    var clear = document.getElementById('searchClearBtn'), icon = document.getElementById('searchIconGlass');
    if (clear) clear.style.display = query ? 'block' : 'none';
    if (icon) icon.style.display = query ? 'none' : 'block';
    window.applyShopFilters();
  };
  window.clearShopSearch = function () { var input = document.getElementById('shopSearch'); if (input) input.value = ''; window.doShopSearch(''); };

  window.showShopCategory = function (filter) {
    document.querySelectorAll('.page').forEach(function (page) { page.classList.remove('active'); page.style.display = ''; });
    document.querySelectorAll('.nav-links a[id]').forEach(function (link) { link.classList.remove('active'); });
    var page = document.getElementById('page-shop'), nav = document.getElementById('nav-shop');
    if (page) page.classList.add('active'); if (nav) nav.classList.add('active');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); activeShopFilter = filter;
    setTimeout(function () {
      var input = document.getElementById('shopSearch'), clear = document.getElementById('searchClearBtn'), icon = document.getElementById('searchIconGlass'), empty = document.getElementById('searchEmpty');
      if (input) input.value = ''; if (clear) clear.style.display = 'none'; if (icon) icon.style.display = 'block'; if (empty) empty.style.display = 'none';
      document.querySelectorAll('.f-btn').forEach(function (button) { button.classList.remove('active'); });
      var target = document.querySelector('.f-btn[data-filter="' + filter + '"]'); if (target) target.classList.add('active');
      window.applyShopFilters(); var grid = document.getElementById('shopProd'); if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };
}());
