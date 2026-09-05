/* The catalogue stays usable even while the live feed is refreshing. */
(() => {
  const slug = value => String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const price = value => Number(value) > 0 ? `₹${Number(value).toLocaleString('en-IN')}` : 'View details';

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('#liveCatalog');
    const filters = document.querySelector('#catalogFilters');
    if (!root || !filters) return;

    let category = 'All';
    const catalogue = () => Array.isArray(window.GOB_LIVE_CATALOG) ? window.GOB_LIVE_CATALOG : [];

    const add = product => {
      const id = product.id || slug(product.n);
      if (typeof window.addToCart === 'function') window.addToCart(id);
    };

    const render = () => {
      const items = catalogue().filter(product => category === 'All' || product.c === category);
      root.innerHTML = items.map((product, index) => {
        const id = product.id || slug(product.n);
        const image = product.i || 'assets/gob-logo.png';
        const tone = index % 3 === 0 ? 'cream' : index % 3 === 1 ? 'sage' : 'brown';
        return `<article class="product-card" data-product-id="${escapeHtml(id)}">
          <a href="product.html?catalog=${encodeURIComponent(id)}" aria-label="View ${escapeHtml(product.n)}">
            <div class="product-image ${tone}"><img src="${escapeHtml(image)}" alt="${escapeHtml(product.n)}" loading="lazy"></div>
          </a>
          <div class="card-copy">
            <p class="tag">${escapeHtml(product.c || 'Natural treat')}</p>
            <h3><a href="product.html?catalog=${encodeURIComponent(id)}">${escapeHtml(product.n)}</a></h3>
            <p class="catalog-desc">${escapeHtml(product.d || 'Single-ingredient dog treat.')}</p>
            <div class="card-bottom"><span>${escapeHtml(product.w || 'Pack')} · ${price(product.p)}</span>
              <button class="quick-add" type="button" data-product-id="${escapeHtml(id)}" aria-label="Add ${escapeHtml(product.n)} to bag">+</button>
            </div>
          </div>
        </article>`;
      }).join('');

      root.querySelectorAll('img').forEach(image => image.addEventListener('error', () => {
        image.src = 'assets/gob-logo.png';
        image.alt = 'Game of Bones';
      }, { once: true }));
      root.querySelectorAll('.quick-add').forEach(button => button.addEventListener('click', () => {
        const product = catalogue().find(item => (item.id || slug(item.n)) === button.dataset.productId);
        if (product) add(product);
      }));
    };

    const renderFilters = () => {
      const categories = ['All', ...new Set(catalogue().map(product => product.c).filter(Boolean))];
      if (!categories.includes(category)) category = 'All';
      filters.innerHTML = categories.map(item => `<button class="filter ${item === category ? 'selected' : ''}" type="button" data-filter="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join('');
      filters.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
        category = button.dataset.filter;
        renderFilters();
        render();
      }));
    };

    const refresh = () => {
      renderFilters();
      render();
    };
    refresh();
    document.addEventListener('gob:catalog-sync', refresh);
  });
})();
