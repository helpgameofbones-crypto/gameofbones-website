/* A resilient catalogue: show the saved range first, then refresh safe public data from admin. */
(() => {
  const root = document.querySelector('#liveCatalog');
  const filters = document.querySelector('#catalogFilters');
  if (!root || !filters) return;

  const slug = value => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const escapeHtml = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const formatPrice = value => Number(value) > 0 ? `₹${Number(value).toLocaleString('en-IN')}` : 'View details';
  let activeCategory = 'All';
  let catalogue = Array.isArray(window.GOB_LIVE_CATALOG) ? [...window.GOB_LIVE_CATALOG] : [];

  const productId = product => product.id || slug(product.n || product.name);
  const productName = product => product.n || product.name || 'Game of Bones treat';
  const productPath = product => `/products/${encodeURIComponent(slug(productName(product)))}`;
  const productImage = product => product.i || product.image_url || product.images?.[0] || 'assets/gob-logo.png';
  // A product's first pack is the sellable base option.  Some older admin
  // records still have a stale top-level price, so always prefer the first
  // pack price when it is available.
  const productPrice = product => product.sizes?.[0]?.price ?? product.p ?? product.price ?? 0;
  const productWeight = product => product.w || (Number(product.sizes?.[0]?.weight_grams) ? `${product.sizes[0].weight_grams} g` : 'Pack');
  const productCategory = product => product.c || 'Treats';

  function render() {
    const items = catalogue.filter(product => activeCategory === 'All' || productCategory(product) === activeCategory);
    root.innerHTML = items.map((product, index) => {
      const id = productId(product), name = productName(product), image = productImage(product);
      const shade = index % 3 === 0 ? 'cream' : index % 3 === 1 ? 'sage' : 'brown';
      const path = productPath(product);
      return `<article class="product-card"><a href="${path}" aria-label="View ${escapeHtml(name)}"><div class="product-image ${shade}"><img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy"></div></a><div class="card-copy"><p class="tag">${escapeHtml(productCategory(product))}</p><h3><a href="${path}">${escapeHtml(name)}</a></h3><p class="catalog-desc">${escapeHtml(product.d || product.description || 'Single-ingredient dog treat.')}</p><div class="card-bottom"><span>${escapeHtml(productWeight(product))} · ${formatPrice(productPrice(product))}</span><button class="quick-add" type="button" data-product="${escapeHtml(id)}" aria-label="Add ${escapeHtml(name)} to bag">+</button></div></div></article>`;
    }).join('');
    root.querySelectorAll('img').forEach(image => image.addEventListener('error', () => { image.src = 'assets/gob-logo.png'; image.alt = 'Game of Bones'; }, { once: true }));
    root.querySelectorAll('[data-product]').forEach(button => button.addEventListener('click', () => {
      const product = catalogue.find(item => productId(item) === button.dataset.product);
      if (!product) return;
      const id = productId(product);
      window.GOB_PRODUCTS ||= {};
      window.GOB_PRODUCTS[id] = { name: productName(product), price: Number(productPrice(product)) || 0, image: productImage(product), tag: productCategory(product) };
      if (typeof window.addToCart === 'function') window.addToCart(id);
    }));
  }

  function renderFilters() {
    const categories = ['All', ...new Set(catalogue.map(productCategory))];
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
        if (!source) return product;
        const referencePacks = window.GOB_CATALOGUE_REFERENCE?.packs?.(productName(product));
        const sellablePacks = Array.isArray(referencePacks) && referencePacks.length ? referencePacks : source.sizes;
        const firstPack = sellablePacks?.[0];
        return {
          ...product,
          p: firstPack?.price ?? (productPrice(source) || productPrice(product)),
          w: firstPack?.weight || (Number(firstPack?.weight_grams) ? `${firstPack.weight_grams} g` : '') || productWeight(source) || productWeight(product),
          i: productImage(source) || productImage(product),
          id: productId(product),
          sizes: sellablePacks,
          images: source.images,
          videos: source.videos,
        };
      });
      remote.forEach(product => {
        if (merged.some(item => slug(productName(item)) === slug(product.name))) return;
        const referencePacks = window.GOB_CATALOGUE_REFERENCE?.packs?.(product.name);
        const sellablePacks = Array.isArray(referencePacks) && referencePacks.length ? referencePacks : product.sizes;
        const firstPack = sellablePacks?.[0];
        merged.push({ n: product.name, c: 'Treats', p: firstPack?.price ?? productPrice(product), w: firstPack?.weight || (Number(firstPack?.weight_grams) ? `${firstPack.weight_grams} g` : '') || productWeight(product), i: productImage(product), d: 'Single-ingredient dog treat.', id: slug(product.name), sizes: sellablePacks, images: product.images, videos: product.videos });
      });
      catalogue = merged;
      window.GOB_LIVE_CATALOG = merged;
      refresh();
    })
    .catch(() => { /* Saved catalogue remains visible offline or if the API is busy. */ });
})();
