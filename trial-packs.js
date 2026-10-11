/* "Create your own trial pack": every product that has a "Trial" size in the
   admin catalogue, on one page, so shoppers can add the small packs they want.
   Prices come from the live catalogue; checkout re-prices everything on the
   server, so nothing here can change what is charged. */
(() => {
  const root = document.querySelector('#trialGrid');
  const bar = document.querySelector('#trialBar');
  if (!root) return;

  const slug = value => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rupees = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const isTrial = label => /^trial\b/i.test(String(label || '').trim());
  const ORDER = ['Fish treats', 'Organ treats', 'Chews & bones', 'Jerky', 'Whole prey'];

  // Approved storefront photos and categories from the saved catalogue.
  const saved = new Map((Array.isArray(window.GOB_LIVE_CATALOG) ? window.GOB_LIVE_CATALOG : []).map(item => [slug(item.n || item.name), item]));
  let trials = [];

  function cartLines() { try { return JSON.parse(localStorage.getItem('gob-preview-cart') || '[]'); } catch (_) { return []; } }

  function updateBar() {
    if (!bar) return;
    const ids = new Set(trials.map(t => t.cartId));
    const lines = cartLines().filter(line => ids.has(line.id));
    const count = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
    const total = lines.reduce((sum, line) => sum + (Number(line.product?.price) || 0) * (Number(line.quantity) || 0), 0);
    bar.hidden = count === 0;
    bar.querySelector('[data-trial-count]').textContent = `${count} trial ${count === 1 ? 'pack' : 'packs'}`;
    bar.querySelector('[data-trial-total]').textContent = rupees(total);
  }

  function render() {
    root.innerHTML = trials.map((t, index) => {
      const sale = t.compare > t.price;
      const shade = ['cream', 'sage', 'brown'][index % 3];
      return `<article class="product-card trial-card">
        <a href="/products/${encodeURIComponent(t.key)}" aria-label="View ${esc(t.name)}"><div class="product-image ${shade}"><img src="${esc(t.image)}" alt="${esc(t.name)} trial pack" width="600" height="600" loading="lazy" decoding="async"></div></a>
        <div class="card-copy">
          <p class="tag">Trial pack · ${esc(t.category)}</p>
          <h3><a href="/products/${encodeURIComponent(t.key)}">${esc(t.name)}</a></h3>
          <p class="catalog-desc">${esc(t.label.replace(/^trial\s*·\s*/i, ''))} — just enough to see if they love it.</p>
          <div class="card-bottom"><span>${sale ? `<span class="catalog-price"><s>${rupees(t.compare)}</s><strong>${rupees(t.price)}</strong></span>` : rupees(t.price)}</span><button class="quick-add" type="button" data-trial="${index}" aria-label="Add ${esc(t.name)} trial pack to bag">Add +</button></div>
        </div>
      </article>`;
    }).join('');
    root.querySelectorAll('img').forEach(image => image.addEventListener('error', () => { image.src = 'assets/gob-logo.png'; }, { once: true }));
    root.querySelectorAll('[data-trial]').forEach(button => button.addEventListener('click', () => {
      const t = trials[Number(button.dataset.trial)];
      if (!t || button.disabled) return;
      window.GOB_PRODUCTS ||= {};
      window.GOB_PRODUCTS[t.cartId] = { name: `${t.name} — ${t.label}`, price: t.price, comparePrice: t.compare, image: t.image, tag: `Trial pack · ${t.label}`, packLabel: t.label, catalog_slug: t.key };
      if (typeof window.addToCart === 'function') window.addToCart(t.cartId, 1);
      setTimeout(updateBar, 50);
    }));
    updateBar();
  }

  fetch('/api/public-products', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('Catalogue unavailable')))
    .then(payload => {
      const products = Array.isArray(payload.products) ? payload.products.filter(p => p.is_active) : [];
      trials = products.flatMap(product => {
        const sizes = Array.isArray(product.sizes) ? product.sizes : [];
        const index = sizes.findIndex(size => isTrial(size?.label));
        if (index < 0) return [];
        const size = sizes[index];
        const key = slug(product.name);
        const static_ = saved.get(key);
        return [{
          key, name: product.name, label: String(size.label).trim(),
          price: Number(size.price) || 0, compare: Number(size.compare_price) || 0,
          image: static_?.i || product.image_url || product.images?.[0] || 'assets/gob-logo.png',
          category: static_?.c || 'Treats',
          cartId: `${key}-pack-${index + 1}`,
        }];
      }).filter(t => t.price > 0)
        .sort((a, b) => (ORDER.indexOf(a.category) + 99) % 99 - (ORDER.indexOf(b.category) + 99) % 99 || a.name.localeCompare(b.name));
      if (!trials.length) { root.innerHTML = '<p class="empty">Trial packs are being restocked. Please check back soon.</p>'; return; }
      render();
    })
    .catch(() => { root.innerHTML = '<p class="empty">We could not load trial packs right now. Please refresh the page.</p>'; });

  window.addEventListener('storage', updateBar);
  document.addEventListener('click', () => setTimeout(updateBar, 80));
})();
