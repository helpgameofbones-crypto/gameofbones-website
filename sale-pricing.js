/* Sale presentation is driven by the admin MRP (compare price). The actual
   checkout rule is also enforced by the server; this file keeps the product
   page and its cart snapshot clear and consistent. */
(() => {
  const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const product = () => window.GOB_CURRENT_PRODUCT || null;
  const productSlug = item => String(item?.id || item?.n || item?.name || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const saleRate = item => productSlug(item) === 'whole-mackerel' ? .15 : .10;
  const withSalePrice = (pack, item) => {
    const price = Number(pack?.price || 0), compare = Number(pack?.compare_price || pack?.comparePrice || 0);
    if (!price) return { ...pack, price, compare_price: compare };
    // Some boxes had an older bundle saving in `price` plus a higher MRP in
    // `compare_price`. During a sitewide sale the MRP is the only consistent
    // base: otherwise a card could claim 10% while showing 12% (or another
    // percentage). Recalculate every visible sale from that original price.
    const originalPrice = compare > price ? compare : price;
    return { ...pack, price: Math.round(originalPrice * (1 - saleRate(item))), compare_price: originalPrice };
  };
  const packsFor = item => {
    const original = Array.isArray(item?.packs) && item.packs.length
      ? item.packs
      : [{ label: '1 pouch', price: Number(item?.p) || 0, compare_price: Number(item?.cp) || 0 }];
    return original.map(pack => withSalePrice(pack, item));
  };
  const selectedPack = item => {
    const buttons = [...document.querySelectorAll('#packOptions .option')];
    const index = Math.max(0, buttons.findIndex(button => button.classList.contains('selected')));
    return packsFor(item)[index] || packsFor(item)[0];
  };
  const isSale = pack => Number(pack?.compare_price) > Number(pack?.price);

  function applyToProduct(item) {
    if (!item || item.__gobSaleApplied) return;
    const packs = packsFor(item);
    if (!packs.length) return;
    item.packs = packs;
    item.p = Number(packs[0].price) || 0;
    item.cp = Number(packs[0].compare_price) || 0;
    item.__gobSaleApplied = true;
  }

  function render() {
    const item = product();
    const price = document.querySelector('#productPrice');
    if (!item || !price) return;
    applyToProduct(item);
    const pack = selectedPack(item), sale = isSale(pack);
    document.querySelector('#salePricePresentation')?.remove();
    if (!sale) { price.hidden = false; return; }
    price.hidden = true;
    const presentation = document.createElement('div');
    presentation.id = 'salePricePresentation';
    presentation.className = 'sale-price-presentation';
    presentation.innerHTML = `<span class="sale-badge">Sale</span><s>${money(pack.compare_price)}</s><strong>${money(pack.price)}</strong><small>${productSlug(item) === 'whole-mackerel' ? '15% off' : '10% off'}</small>`;
    price.insertAdjacentElement('afterend', presentation);
  }

  function saveSelectedSnapshot() {
    const item = product();
    if (!item) return;
    const pack = selectedPack(item), packs = packsFor(item), index = packs.indexOf(pack);
    const id = item.id || new URLSearchParams(location.search).get('catalog') || 'jerky';
    const cartId = index === 0 ? id : `${id}-pack-${index + 1}`;
    window.GOB_PRODUCTS ||= {};
    window.GOB_PRODUCTS[cartId] = { name: `${item.n} — ${pack.label || '1 pouch'}`, price: Number(pack.price) || 0, comparePrice: Number(pack.compare_price) || 0, image: item.i, tag: `${item.c} · ${pack.weight || 'Pack'}`, packLabel: pack.label || '' };
  }

  function bind() {
    document.addEventListener('click', event => {
      if (event.target.closest('#packOptions .option')) setTimeout(() => { applyToProduct(product()); render(); }, 0);
      if (event.target.closest('#addProduct')) saveSelectedSnapshot();
    }, true);
    applyToProduct(product()); render();
  }

  document.addEventListener('DOMContentLoaded', bind);
  document.addEventListener('gob:product-ready', () => setTimeout(() => { applyToProduct(product()); render(); }, 0));
})();
