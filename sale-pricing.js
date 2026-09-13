/* Sale presentation is driven by the admin MRP (compare price). The actual
   checkout rule is also enforced by the server; this file keeps the product
   page and its cart snapshot clear and consistent. */
(() => {
  const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const product = () => window.GOB_CURRENT_PRODUCT || null;
  const packsFor = item => Array.isArray(item?.packs) && item.packs.length
    ? item.packs
    : [{ label: '1 pouch', price: Number(item?.p) || 0, compare_price: Number(item?.cp) || 0 }];
  const selectedPack = item => {
    const buttons = [...document.querySelectorAll('#packOptions .option')];
    const index = Math.max(0, buttons.findIndex(button => button.classList.contains('selected')));
    return packsFor(item)[index] || packsFor(item)[0];
  };
  const isSale = pack => Number(pack?.compare_price) > Number(pack?.price);

  function render() {
    const item = product();
    const price = document.querySelector('#productPrice');
    if (!item || !price) return;
    const pack = selectedPack(item), sale = isSale(pack);
    document.querySelector('#salePricePresentation')?.remove();
    if (!sale) { price.hidden = false; return; }
    price.hidden = true;
    const presentation = document.createElement('div');
    presentation.id = 'salePricePresentation';
    presentation.className = 'sale-price-presentation';
    presentation.innerHTML = `<span class="sale-badge">Sale</span><s>${money(pack.compare_price)}</s><strong>${money(pack.price)}</strong>`;
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
      if (event.target.closest('#packOptions .option')) setTimeout(render, 0);
      if (event.target.closest('#addProduct')) saveSelectedSnapshot();
    }, true);
    render();
  }

  document.addEventListener('DOMContentLoaded', bind);
  document.addEventListener('gob:product-ready', () => setTimeout(render, 0));
})();
