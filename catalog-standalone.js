/* A resilient catalogue: show the saved range first, then refresh safe public data from admin. */
(() => {
  const root = document.querySelector('#liveCatalog');
  const filters = document.querySelector('#catalogFilters');
  if (!root || !filters) return;

  const slug = value => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const escapeHtml = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const formatPrice = value => Number(value) > 0 ? `₹${Number(value).toLocaleString('en-IN')}` : 'View details';
  let activeCategory = new URLSearchParams(location.search).get('type') || 'All';
  let catalogue = Array.isArray(window.GOB_LIVE_CATALOG) ? [...window.GOB_LIVE_CATALOG] : [];

  const productId = product => product.id || slug(product.n || product.name);
  const productName = product => product.n || product.name || 'Game of Bones treat';
  const productPath = product => `/products/${encodeURIComponent(slug(productName(product)))}`;
  const productImage = product => product.i || product.image_url || product.images?.[0] || 'assets/gob-logo.png';
  // A product's first pack is the sellable base option.  Some older admin
  // records still have a stale top-level price, so always prefer the first
  // pack price when it is available.
  const productPrice = product => product.sizes?.[0]?.price ?? product.p ?? product.price ?? 0;
  const productComparePrice = product => product.sizes?.[0]?.compare_price ?? product.cp ?? product.compare_price ?? 0;
  const productWeight = product => product.w || (Number(product.sizes?.[0]?.weight_grams) ? `${product.sizes[0].weight_grams} g` : 'Pack');
  const productCategory = product => product.c || 'Treats';
  const isBogoProduct = product => ['chicken feet', 'chicken neck'].includes(String(productName(product)).trim().toLowerCase());
  // Top sellers from real orders (last 60 days). Shown first with a badge so
  // visitors arriving from ads see the treats other dog parents buy most.
  const BESTSELLERS = ['goat-trotter', 'goat-trachea', 'sardines', 'chicken-wings', 'chicken-jerky'];
  // "Cat" is a cross-category filter: every fish treat except Whole Mackerel,
  // plus the two small chicken treats cats take well to.
  const CAT_FILTER = 'Cat';
  const CAT_EXTRA = new Set(['chicken-bites', 'chicken-heart-and-liver']);
  const CAT_EXCLUDE = new Set(['whole-mackerel']);
  const isCatFriendly = product => {
    const key = slug(productName(product));
    if (CAT_EXCLUDE.has(key)) return false;
    return CAT_EXTRA.has(key) || productCategory(product) === 'Fish treats';
  };
  // Newly launched treats get a "New" badge on their card.
  const NEW_PRODUCTS = new Set(['white-sardines', 'chicken-wing-tips']);
  const isNewProduct = product => NEW_PRODUCTS.has(slug(productName(product)));
  const bestsellerRank = product => { const rank = BESTSELLERS.indexOf(slug(productName(product))); return rank === -1 ? 99 : rank; };

  function render() {
    const items = catalogue.filter(product => activeCategory === 'All' || (activeCategory === CAT_FILTER ? isCatFriendly(product) : productCategory(product) === activeCategory))
      .map((product, order) => ({ product, order })).sort((a, b) => (bestsellerRank(a.product) - bestsellerRank(b.product)) || (a.order - b.order)).map(entry => entry.product);
    root.innerHTML = items.map((product, index) => {
      const id = productId(product), name = productName(product), image = productImage(product);
      const shade = index % 3 === 0 ? 'cream' : index % 3 === 1 ? 'sage' : 'brown';
      const path = productPath(product);
      const currentPrice = productPrice(product), comparePrice = productComparePrice(product);
      const isSale = Number(comparePrice) > Number(currentPrice) && Number(currentPrice) > 0;
      const displayedPrice = isSale
        ? `<span class="catalog-price"><s>${formatPrice(comparePrice)}</s><strong>${formatPrice(currentPrice)}</strong></span>`
        : formatPrice(currentPrice);
      const notify = product.low_stock ? `<button class="restock-notify-button" type="button" data-restock-product="${encodeURIComponent(String(product.inventory_id || product.id || id))}" data-restock-name="${encodeURIComponent(name)}">Notify me</button>` : '';
      const bogoBadge = isBogoProduct(product) ? '<span data-bogo-card style="display:inline-block;margin:0 0 8px;padding:5px 8px;border-radius:4px;background:#a84312;color:#fff;font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase">Buy 1 Get 1</span>' : '';
      return `<article class="product-card"><a href="${path}" aria-label="View ${escapeHtml(name)}">${isSale ? '<span class="sale-badge">Sale</span>' : ''}${isNewProduct(product) ? `<span class="sale-badge" style="background:#bd812a;${isSale ? 'left:auto;right:12px;' : ''}">New</span>` : ''}<div class="product-image ${shade}"><img src="${escapeHtml(image)}" alt="${escapeHtml(name)} natural dog treat" width="600" height="600" loading="lazy" decoding="async"></div></a><div class="card-copy">${bogoBadge}<p class="tag">${bestsellerRank(product) < 99 ? '<span class="bestseller-tag">★ Bestseller</span> ' : ''}${escapeHtml(productCategory(product))}</p><h3><a href="${path}">${escapeHtml(name)}</a></h3><p class="catalog-desc">${escapeHtml(product.d || product.description || 'Single-ingredient dog treat.')}</p><div class="card-bottom"><span>${escapeHtml(productWeight(product))} · ${displayedPrice}</span><button class="quick-add" type="button" data-product="${escapeHtml(id)}" aria-label="Add ${escapeHtml(name)} to bag">Add +</button>${notify}</div></div></article>`;
    }).join('');
    // "Create your own trial pack" listing, shown in All and Cat views.
    if (activeCategory === 'All' || activeCategory === CAT_FILTER) {
      const trialCard = '<article class="product-card trial-builder-card"><a href="/trial-packs" aria-label="Create your own trial pack"><span class="sale-badge">New</span><div class="product-image sage"><img src="assets/catalogue-v3/small-treat-box.webp" alt="Create your own trial pack" width="600" height="600" loading="lazy" decoding="async"></div></a><div class="card-copy"><p class="tag">Trial packs</p><h3><a href="/trial-packs">Create your own trial pack</a></h3><p class="catalog-desc">Pick 30 g trial packs of the treats you want to try, then check out once.</p><div class="card-bottom"><span>30 g packs · from ₹60</span><a href="/trial-packs" aria-label="Build your trial pack" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;height:42px;padding:0 18px;border-radius:999px;background:var(--ink);color:#fff;font-size:13px;font-weight:800;line-height:1;text-decoration:none;white-space:nowrap">Build yours →</a></div></div></article>';
      root.insertAdjacentHTML('afterbegin', trialCard);
    }
    root.querySelectorAll('img').forEach(image => image.addEventListener('error', () => { image.src = 'assets/gob-logo.png'; image.alt = 'Game of Bones'; }, { once: true }));
    root.querySelectorAll('[data-product]').forEach(button => button.addEventListener('click', () => {
      const product = catalogue.find(item => productId(item) === button.dataset.product);
      if (!product) return;
      const id = productId(product);
      window.GOB_PRODUCTS ||= {};
      window.GOB_PRODUCTS[id] = { name: productName(product), price: Number(productPrice(product)) || 0, comparePrice: Number(productComparePrice(product)) || 0, image: productImage(product), tag: productCategory(product), catalog_slug: slug(productName(product)) };
      if (typeof window.addToCart === 'function') window.addToCart(id);
    }));
  }

  function renderFilters() {
    const categories = ['All', ...(catalogue.some(isCatFriendly) ? [CAT_FILTER] : []), ...new Set(catalogue.map(productCategory))];
    if (!categories.includes(activeCategory)) activeCategory = 'All';
    filters.innerHTML = categories.map(category => `<button class="filter ${category === activeCategory ? 'selected' : ''}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
    filters.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => { activeCategory = button.dataset.category; renderFilters(); render(); }));
  }

  function refresh() { renderFilters(); render(); }
  refresh();

  fetch('/api/public-products', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('Catalogue unavailable')))
    .then(payload => {
      const remote = Array.isArray(payload.products) ? payload.products.filter(product => product.is_active) : [];
      if (!remote.length) return;
      const byName = new Map(remote.map(product => [slug(product.name), product]));
      const merged = catalogue.map(product => {
        const source = byName.get(slug(productName(product)));
        // Once the live feed has loaded, it is the source of truth for
        // availability. Do not leave an inactive static card visible with an
        // old, non-sale price alongside the active sale range.
        if (!source) return null;
        const referencePacks = window.GOB_CATALOGUE_REFERENCE?.packs?.(productName(product));
        const liveSalePacks = Array.isArray(source.sizes) && source.sizes.some(pack => Number(pack?.compare_price) > Number(pack?.price) && Number(pack?.price) > 0);
        const sellablePacks = liveSalePacks ? source.sizes : (Array.isArray(referencePacks) && referencePacks.length ? referencePacks : source.sizes);
        const firstPack = sellablePacks?.[0];
        return {
          ...product,
          p: firstPack?.price ?? (productPrice(source) || productPrice(product)),
          cp: firstPack?.compare_price ?? source.compare_price ?? productComparePrice(product),
          w: firstPack?.weight || (Number(firstPack?.weight_grams) ? `${firstPack.weight_grams} g` : '') || productWeight(source) || productWeight(product),
          // The approved storefront photo is canonical for existing products.
          // Admin sync may refresh availability and prices, but must not replace
          // it with an unrelated uploaded image after initial render.
          i: productImage(product) || productImage(source),
          id: productId(product),
          sizes: sellablePacks,
          images: source.images,
          videos: source.videos,
          low_stock: Boolean(source.low_stock),
          inventory_id: source.id,
        };
      }).filter(Boolean);
      remote.forEach(product => {
        if (merged.some(item => slug(productName(item)) === slug(product.name))) return;
        const referencePacks = window.GOB_CATALOGUE_REFERENCE?.packs?.(product.name);
        const liveSalePacks = Array.isArray(product.sizes) && product.sizes.some(pack => Number(pack?.compare_price) > Number(pack?.price) && Number(pack?.price) > 0);
        const sellablePacks = liveSalePacks ? product.sizes : (Array.isArray(referencePacks) && referencePacks.length ? referencePacks : product.sizes);
        const firstPack = sellablePacks?.[0];
        merged.push({ n: product.name, c: 'Treats', p: firstPack?.price ?? productPrice(product), cp: firstPack?.compare_price ?? product.compare_price ?? 0, w: firstPack?.weight || (Number(firstPack?.weight_grams) ? `${firstPack.weight_grams} g` : '') || productWeight(product), i: productImage(product), d: 'Single-ingredient dog treat.', id: slug(product.name), sizes: sellablePacks, images: product.images, videos: product.videos, low_stock: Boolean(product.low_stock), inventory_id: product.id });
      });
      catalogue = merged;
      window.GOB_LIVE_CATALOG = merged;
      refresh();
    })
    .catch(() => { /* Saved catalogue remains visible offline or if the API is busy. */ });
})();
