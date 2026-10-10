/* Stock guard: stops shoppers adding more than is on the shelf and shows
   "Only N left" when a treat drops to 10 or fewer pouches.
   Stock is counted in base pouches. A "-pack-N" cart line (2nd, 3rd, 4th
   pack option) uses N pouches. The server re-checks stock at checkout, so
   this file only improves the experience; it is not the security boundary. */
(() => {
  const LOW_STOCK = 10;
  const CACHE_KEY = 'gob-stock-v1';
  const CACHE_MS = 60_000;
  const legacy = { jerky: 'chicken-jerky', 'jerky-pack-2': 'chicken-jerky-pack-2', trachea: 'goat-trachea', trotter: 'goat-trotter' };
  const slug = value => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  // slug -> { inStock: boolean, left: number|null }  (left is null when more than 10 remain)
  let stock = null;

  const readCart = () => { try { return JSON.parse(localStorage.getItem('gob-preview-cart') || '[]'); } catch (_) { return []; } };
  const writeCart = lines => { localStorage.setItem('gob-preview-cart', JSON.stringify(lines)); window.GOB_CART_TRACKING?.queue?.(); };
  const toast = message => { if (typeof window.notice === 'function') window.notice(message); else console.info(message); };

  function lineInfo(rawId, snapshot) {
    const id = legacy[String(rawId || '')] || String(rawId || '');
    const match = id.match(/-pack-(\d+)$/);
    const base = match ? id.slice(0, match.index) : id;
    const product = snapshot || window.GOB_PRODUCTS?.[id] || window.GOB_PRODUCTS?.[base];
    const name = String(product?.name || '').replace(/\s+—\s+.+$/, '');
    const key = slug(product?.catalog_slug || name || base);
    return { key, units: match ? Math.max(1, Number(match[1]) || 1) : 1, name: name || 'This treat' };
  }
  const infoFor = key => stock ? stock[key] : undefined;
  const unitsInCart = (key, lines = readCart(), skipId) => lines.reduce((total, line) => {
    if (skipId && line.id === skipId) return total;
    const info = lineInfo(line.id, line.product);
    return info.key === key ? total + info.units * (Number(line.quantity) || 1) : total;
  }, 0);
  // How many more pouches can be added; Infinity when plenty remain.
  const roomFor = (key, lines, skipId) => {
    const info = infoFor(key);
    if (!info) return Infinity;
    if (!info.inStock) return 0;
    if (info.left == null) return Infinity;
    return Math.max(0, info.left - unitsInCart(key, lines, skipId));
  };

  function wrapAddToCart() {
    const original = window.addToCart;
    if (typeof original !== 'function' || original.__stockGuard) return;
    const guarded = function (id, quantity = 1) {
      const info = lineInfo(id);
      const room = roomFor(info.key);
      const wanted = Math.max(1, Number(quantity) || 1);
      if (room === Infinity) return original.call(this, id, wanted);
      const stockInfo = infoFor(info.key);
      if (!stockInfo?.inStock) { toast(`Sorry, ${info.name} is out of stock.`); return; }
      const maxQty = Math.floor(room / info.units);
      if (maxQty < 1) {
        toast(`Only ${stockInfo.left} left of ${info.name}, and they're already in your bag.`);
        return;
      }
      const allowed = Math.min(wanted, maxQty);
      const result = original.call(this, id, allowed);
      if (allowed < wanted) setTimeout(() => toast(`Only ${stockInfo.left} left of ${info.name}. We added as many as we could.`), 50);
      return result;
    };
    guarded.__stockGuard = true;
    window.addToCart = guarded;
  }

  // Bag "+" buttons (cart page and any drawer that uses data-change).
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-change]');
    if (!button || !stock || Number(button.dataset.amount) <= 0) return;
    const line = readCart().find(item => item.id === button.dataset.change);
    if (!line) return;
    const info = lineInfo(line.id, line.product);
    if (roomFor(info.key) >= info.units) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const stockInfo = infoFor(info.key);
    toast(stockInfo?.inStock ? `Only ${stockInfo.left} left of ${info.name}.` : `Sorry, ${info.name} is out of stock.`);
  }, true);

  // Trim a saved bag that now holds more than is available.
  function reconcileCart() {
    if (!stock) return;
    const lines = readCart();
    if (!lines.length) return;
    let changed = false;
    const messages = [];
    const kept = [];
    lines.forEach(line => {
      const info = lineInfo(line.id, line.product);
      const stockInfo = infoFor(info.key);
      if (stockInfo && !stockInfo.inStock) { changed = true; messages.push(`${info.name} sold out and was removed from your bag.`); return; }
      const room = roomFor(info.key, kept);
      if (room !== Infinity) {
        const maxQty = Math.floor(room / info.units);
        if (maxQty < 1) { changed = true; messages.push(`Only ${stockInfo.left} left of ${info.name}; your bag was updated.`); return; }
        if (line.quantity > maxQty) { line.quantity = maxQty; changed = true; messages.push(`Only ${stockInfo.left} left of ${info.name}; your bag was updated.`); }
      }
      kept.push(line);
    });
    if (!changed) return;
    writeCart(kept);
    if (typeof window.updateCart === 'function') window.updateCart();
    if (typeof window.renderCommerceCart === 'function') window.renderCommerceCart();
    toast([...new Set(messages)].join(' '));
  }

  // Badges on product cards and the product page.
  const badgeText = info => !info.inStock ? 'Out of stock' : info.left != null && info.left <= LOW_STOCK ? `Only ${info.left} left in stock` : '';
  function decorateCards(root = document) {
    if (!stock) return;
    root.querySelectorAll?.('.product-card').forEach(card => {
      const link = card.querySelector('a[href*="/products/"]');
      const key = slug(decodeURIComponent((link?.getAttribute('href') || '').split('/products/')[1]?.split(/[?#/]/)[0] || ''));
      const info = infoFor(key);
      card.querySelector('.stock-note')?.remove();
      if (!info) return;
      const text = badgeText(info);
      const button = card.querySelector('.quick-add, [data-add], [data-product]');
      if (button) {
        button.disabled = !info.inStock;
        if (!info.inStock) { button.textContent = 'Sold out'; button.setAttribute('aria-label', 'Sold out'); }
      }
      if (text) card.querySelector('.card-copy, .card-bottom')?.insertAdjacentHTML('beforeend', `<p class="stock-note${info.inStock ? '' : ' is-out'}">${text}</p>`);
    });
  }
  function decorateProductPage() {
    if (!stock) return;
    const routeSlug = location.pathname.match(/^\/products\/([^/]+)\/?$/)?.[1];
    const params = new URLSearchParams(location.search);
    const key = slug(decodeURIComponent(routeSlug || params.get('catalog') || params.get('product') || ''));
    const info = infoFor(legacy[key] || key);
    const add = document.querySelector('#addProduct');
    if (!info || !add) return;
    document.querySelectorAll('.stock-note-product').forEach(node => node.remove());
    const text = badgeText(info);
    if (text) add.insertAdjacentHTML('beforebegin', `<p class="stock-note stock-note-product${info.inStock ? '' : ' is-out'}">${text}</p>`);
    const sticky = document.querySelector('#stickyAdd');
    [add, sticky].forEach(button => {
      if (!button) return;
      button.disabled = !info.inStock;
      if (!info.inStock) button.textContent = 'Sold out';
    });
    const assurance = document.querySelector('.buy-assurance b');
    if (assurance) assurance.textContent = info.inStock ? 'In stock' : 'Out of stock';
  }

  function injectStyles() {
    if (document.querySelector('#gob-stock-style')) return;
    const style = document.createElement('style');
    style.id = 'gob-stock-style';
    style.textContent = '.stock-note{margin:.5rem 0 0;font-size:.8rem;font-weight:700;color:#a4441c;letter-spacing:.01em}.stock-note.is-out{color:#8a1f1f}.stock-note-product{margin:0 0 .6rem;font-size:.92rem}.quick-add:disabled,#addProduct:disabled,#stickyAdd:disabled{opacity:.5;cursor:not-allowed}';
    document.head.append(style);
  }

  function apply() {
    injectStyles();
    wrapAddToCart();
    reconcileCart();
    decorateCards();
    decorateProductPage();
  }

  async function load() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.at < CACHE_MS) { stock = cached.stock; apply(); return; }
    } catch (_) { /* ignore */ }
    try {
      const response = await fetch('/api/public-products', { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json();
      const map = {};
      (payload.products || []).forEach(product => {
        if (typeof product.in_stock !== 'boolean') return; // older API: no stock data yet
        const left = Number.isFinite(Number(product.stock_left)) && product.stock_left !== null ? Number(product.stock_left) : null;
        map[slug(product.name)] = { inStock: product.in_stock && product.is_active !== false, left };
      });
      if (!Object.keys(map).length) return;
      stock = map;
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), stock })); } catch (_) { /* ignore */ }
      apply();
    } catch (_) { /* Stock badges are optional; the server still checks at checkout. */ }
  }

  const start = () => {
    wrapAddToCart();
    load();
    new MutationObserver(records => {
      if (!stock) return;
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.matches?.('.product-card') || node.querySelector?.('.product-card')) decorateCards(node.parentElement || node);
      }));
    }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener('gob:product-ready', () => setTimeout(decorateProductPage, 0));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
