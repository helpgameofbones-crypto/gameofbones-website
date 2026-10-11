/* Trial box builder. Lists every product with a "Trial" size from the live
   catalogue, lets shoppers set a quantity for each, and keeps a running box
   summary. The bag (localStorage) is the single source of truth, and checkout
   re-prices everything on the server. */
(() => {
  const grid = document.querySelector('#trialGrid');
  const filtersRoot = document.querySelector('#tbFilters');
  const box = document.querySelector('#trialBox');
  if (!grid) return;

  const CART_KEY = 'gob-preview-cart';
  const slug = v => String(v || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rupees = v => `₹${Math.round(Number(v) || 0).toLocaleString('en-IN')}`;
  const isTrial = label => /^trial\b/i.test(String(label || '').trim());

  const CAT_FRIENDLY = new Set(['anchovies', 'bombay-duck', 'mackerel-fillet', 'sardines', 'tuna', 'prawns', 'chicken-bites', 'chicken-heart-and-liver']);
  const TRAITS = {
    'Fish treats': ['Omega-3 rich', 'Strong aroma'],
    'Organ treats': ['Nutrient-dense', 'Soft bite'],
    'Chews & bones': ['Natural chew', 'Supervise chewing'],
    'Jerky': ['Training size', 'High protein'],
    'Whole prey': ['Whole food'],
  };
  const FILTERS = [
    { id: 'all', label: 'All', test: () => true },
    { id: 'fish', label: 'Fish', test: t => t.category === 'Fish treats' },
    { id: 'chicken', label: 'Chicken', test: t => /^chicken/.test(t.key) },
    { id: 'goat', label: 'Goat', test: t => /^goat/.test(t.key) },
    { id: 'chews', label: 'Chews', test: t => t.category === 'Chews & bones' },
    { id: 'cat', label: 'For cats', test: t => t.cat },
  ];
  const FREE_MIN = 300, DELIVERY = 50;
  const ORDER = ['Fish treats', 'Jerky', 'Organ treats', 'Chews & bones', 'Whole prey'];

  const saved = new Map((Array.isArray(window.GOB_LIVE_CATALOG) ? window.GOB_LIVE_CATALOG : []).map(item => [slug(item.n || item.name), item]));
  let trials = [];
  let active = 'all';

  const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (_) { return []; } };
  const writeCart = lines => {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
    window.GOB_CART_TRACKING?.queue?.();
    if (typeof window.updateCart === 'function') window.updateCart();
  };
  const qtyOf = cartId => readCart().filter(line => line.id === cartId).reduce((s, l) => s + (Number(l.quantity) || 0), 0);

  function snapshot(t) {
    window.GOB_PRODUCTS ||= {};
    window.GOB_PRODUCTS[t.cartId] = { name: `${t.name} — ${t.label}`, price: t.price, comparePrice: t.compare, image: t.image, tag: `Trial pack · ${t.size}`, packLabel: t.label, catalog_slug: t.key };
  }
  function add(t) {
    if (!t.inStock) return;
    snapshot(t);
    if (typeof window.addToCart === 'function') window.addToCart(t.cartId, 1);
    refresh();
  }
  function remove(t) {
    const lines = readCart();
    const line = lines.find(l => l.id === t.cartId);
    if (!line) return;
    line.quantity = (Number(line.quantity) || 1) - 1;
    writeCart(line.quantity > 0 ? lines : lines.filter(l => l.id !== t.cartId));
    refresh();
  }

  function buyControls(t) {
    if (!t.inStock) return '<button class="tb-add" type="button" disabled>Sold out</button>';
    const q = qtyOf(t.cartId);
    if (!q) return `<button class="tb-add" type="button" data-add-trial="${esc(t.cartId)}" aria-label="Add ${esc(t.name)} trial pack">Add</button>`;
    return `<div class="tb-qty" role="group" aria-label="${esc(t.name)} quantity"><button type="button" data-minus="${esc(t.cartId)}" aria-label="Remove one ${esc(t.name)}">−</button><output aria-live="polite">${q}</output><button type="button" data-plus="${esc(t.cartId)}" aria-label="Add one more ${esc(t.name)}">+</button></div>`;
  }

  function card(t) {
    const off = t.compare > t.price ? Math.round((t.compare - t.price) / t.compare * 100) : 0;
    const traits = (TRAITS[t.category] || []).map(x => `<li>${esc(x)}</li>`).join('');
    const stock = !t.inStock ? '<p class="stock-note is-out">Out of stock</p>' : (t.left != null ? `<p class="stock-note">Only ${t.left} left in stock</p>` : '');
    return `<article class="tb-card${qtyOf(t.cartId) ? ' is-picked' : ''}" data-card="${esc(t.cartId)}">
      <a class="tb-card-media" href="/products/${encodeURIComponent(t.key)}" aria-label="About ${esc(t.name)}">
        <img src="${esc(t.image)}" alt="${esc(t.name)}" width="600" height="450" loading="lazy" decoding="async">
        <span class="tb-badges">${off ? `<span class="tb-badge off">${off}% off</span>` : ''}${t.cat ? '<span class="tb-badge cat">Cat friendly</span>' : ''}</span>
      </a>
      <div class="tb-card-body">
        <div class="tb-card-top"><h3><a href="/products/${encodeURIComponent(t.key)}">${esc(t.name)}</a></h3><span class="tb-size">${esc(t.size)}</span></div>
        <p class="tb-desc">${esc(t.desc)}</p>
        <ul class="tb-traits">${traits}</ul>
        ${stock}
        <div class="tb-buy"><span class="tb-price"><strong>${rupees(t.price)}</strong>${off ? `<s>${rupees(t.compare)}</s>` : ''}</span><span data-buy>${buyControls(t)}</span></div>
      </div>
    </article>`;
  }

  function renderFilters() {
    if (!filtersRoot) return;
    const available = FILTERS.filter(f => f.id === 'all' || trials.some(f.test));
    filtersRoot.innerHTML = available.map(f => `<button type="button" role="tab" aria-selected="${f.id === active}" data-filter="${f.id}">${esc(f.label)} <span>${trials.filter(f.test).length}</span></button>`).join('');
  }

  function renderGrid() {
    const filter = FILTERS.find(f => f.id === active) || FILTERS[0];
    const list = trials.filter(filter.test);
    grid.innerHTML = list.length ? list.map(card).join('') : '<p class="tb-empty">No trial packs in this group yet.</p>';
    grid.querySelectorAll('img').forEach(img => img.addEventListener('error', () => { img.src = 'assets/gob-logo.png'; }, { once: true }));
  }

  function renderBox() {
    if (!box) return;
    const byId = new Map(trials.map(t => [t.cartId, t]));
    const lines = readCart().filter(l => byId.has(l.id) && Number(l.quantity) > 0);
    const count = lines.reduce((s, l) => s + Number(l.quantity), 0);
    const total = lines.reduce((s, l) => s + byId.get(l.id).price * Number(l.quantity), 0);
    const save = lines.reduce((s, l) => { const t = byId.get(l.id); return s + Math.max(0, t.compare - t.price) * Number(l.quantity); }, 0);
    box.classList.toggle('is-empty', count === 0);
    box.querySelectorAll('[data-box-count]').forEach(el => { el.textContent = el.closest('dl') ? String(count) : `${count} ${count === 1 ? 'pack' : 'packs'}`; });
    // Trial boxes under ₹300 pay ₹50 delivery (the whole bag counts towards ₹300).
    const bagSubtotal = readCart().reduce((s, l) => s + (Number(l.product?.price) || 0) * (Number(l.quantity) || 0), 0);
    const delivery = count && bagSubtotal < FREE_MIN ? DELIVERY : 0;
    box.querySelectorAll('[data-box-total]').forEach(el => { el.textContent = rupees(total + delivery); });
    const deliveryEl = box.querySelector('[data-box-delivery]');
    if (deliveryEl) deliveryEl.textContent = delivery ? rupees(delivery) : 'Free';
    const fill = box.querySelector('[data-box-ship-fill]');
    if (fill) fill.style.width = `${Math.min(100, Math.round(bagSubtotal / FREE_MIN * 100))}%`;
    const shipText = box.querySelector('[data-box-ship-text]');
    if (shipText) shipText.innerHTML = bagSubtotal >= FREE_MIN ? '<strong>Free delivery unlocked.</strong>' : `Add <strong>${rupees(FREE_MIN - bagSubtotal)}</strong> more for free delivery (₹${DELIVERY} below ₹${FREE_MIN}).`;
    const saveRow = box.querySelector('[data-box-save-row]');
    if (saveRow) { saveRow.hidden = save <= 0; saveRow.querySelector('[data-box-save]').textContent = rupees(save); }
    const checkout = box.querySelector('[data-box-checkout]');
    if (checkout) checkout.setAttribute('aria-disabled', count ? 'false' : 'true');
    const list = box.querySelector('[data-box-list]');
    if (list) list.innerHTML = count ? lines.map(l => { const t = byId.get(l.id); return `<li><img src="${esc(t.image)}" alt=""><div><strong>${esc(t.name)}</strong><small>${esc(t.size)} · ${rupees(t.price)} each</small></div><div class="tb-qty" role="group" aria-label="${esc(t.name)} quantity"><button type="button" data-minus="${esc(t.cartId)}" aria-label="Remove one ${esc(t.name)}">−</button><output>${l.quantity}</output><button type="button" data-plus="${esc(t.cartId)}" aria-label="Add one more ${esc(t.name)}">+</button></div></li>`; }).join('') : '<li class="tb-box-empty">Your box is empty. Add a few treats to start.</li>';
  }

  function refresh() {
    grid.querySelectorAll('[data-card]').forEach(el => {
      const t = trials.find(x => x.cartId === el.dataset.card);
      if (!t) return;
      el.classList.toggle('is-picked', qtyOf(t.cartId) > 0);
      const slot = el.querySelector('[data-buy]');
      if (slot) slot.innerHTML = buyControls(t);
    });
    renderBox();
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-add-trial],[data-plus],[data-minus],[data-filter],.tb-box-toggle');
    if (!target) return;
    if (target.matches('.tb-box-toggle')) { const open = !box.classList.contains('is-open'); box.classList.toggle('is-open', open); target.setAttribute('aria-expanded', String(open)); return; }
    if (target.dataset.filter) { active = target.dataset.filter; renderFilters(); renderGrid(); return; }
    const id = target.dataset.addTrial || target.dataset.plus || target.dataset.minus;
    const t = trials.find(x => x.cartId === id);
    if (!t) return;
    if (target.dataset.minus) remove(t); else add(t);
  });
  window.addEventListener('storage', refresh);
  // The cart drawer can remove lines too; keep the box in step with it.
  document.addEventListener('click', event => { if (event.target.closest('[data-remove],[data-close-cart]')) setTimeout(refresh, 60); });

  fetch('/api/public-products', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(new Error('Catalogue unavailable')))
    .then(payload => {
      const products = Array.isArray(payload.products) ? payload.products.filter(p => p.is_active) : [];
      trials = products.flatMap(product => {
        const sizes = Array.isArray(product.sizes) ? product.sizes : [];
        const index = sizes.findIndex(s => isTrial(s?.label));
        if (index < 0) return [];
        const s = sizes[index], key = slug(product.name), base = saved.get(key);
        const label = String(s.label).trim();
        return [{
          key, name: product.name, label, size: label.replace(/^trial\s*·\s*/i, ''),
          price: Number(s.price) || 0, compare: Number(s.compare_price) || 0,
          image: base?.i || product.image_url || product.images?.[0] || 'assets/gob-logo.png',
          category: base?.c || 'Treats', desc: base?.d || 'Single-ingredient, slow-dehydrated treat.',
          cat: CAT_FRIENDLY.has(key), cartId: `${key}-pack-${index + 1}`,
          inStock: product.in_stock !== false, left: Number.isFinite(Number(product.stock_left)) && product.stock_left !== null ? Number(product.stock_left) : null,
        }];
      }).filter(t => t.price > 0)
        .sort((a, b) => (Number(b.inStock) - Number(a.inStock)) || ((ORDER.indexOf(a.category) + 99) % 99) - ((ORDER.indexOf(b.category) + 99) % 99) || a.name.localeCompare(b.name));
      if (!trials.length) { grid.innerHTML = '<p class="tb-empty">Trial packs are being restocked. Please check back soon.</p>'; return; }
      const fromParam = new URLSearchParams(location.search).get('filter');
      if (FILTERS.some(f => f.id === fromParam)) active = fromParam;
      renderFilters(); renderGrid(); renderBox();
    })
    .catch(() => { grid.innerHTML = '<p class="tb-empty">We could not load trial packs right now. Please refresh the page.</p>'; });
})();
