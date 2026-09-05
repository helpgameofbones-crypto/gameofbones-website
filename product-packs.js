/* Product purchase controls. Kept in an external file so Vercel's security
   policy can run it consistently on every product page. */
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('catalog') || params.get('product') || 'jerky';
    const fallback = {
      jerky: { n: 'Chicken Jerky', c: 'Jerky', w: '70 g', p: 329, i: 'assets/chicken-jerky-pouch.png', id: 'jerky', packs: [{ label: '1 pouch', weight: '70 g', price: 329 }, { label: '2 pouches', weight: '140 g', price: 658 }, { label: '3 pouches', weight: '210 g', price: 987 }, { label: '4 pouches', weight: '280 g', price: 1316 }] },
      trachea: { n: 'Goat Trachea', c: 'Chews & bones', w: '60 g', p: 100, i: 'assets/goat-trachea-pouch.png', id: 'trachea' },
      trotter: { n: 'Goat Trotter', c: 'Chews & bones', w: '60 g', p: 250, i: 'assets/goat-trotter-plate.png', id: 'trotter' },
    }[productId];
    const packOptions = document.querySelector('#packOptions');
    const addButton = document.querySelector('#addProduct');
    if (!packOptions || !addButton) return;

    let quantity = 1;
    let selectedPack = 0;
    const format = value => Number(value || 0).toLocaleString('en-IN');
    const packsFor = product => Array.isArray(product?.packs) && product.packs.length ? product.packs : [{ label: '1 pouch', weight: product?.w || '', price: Number(product?.p) || 0 }];

    function render(product) {
      if (!product) return;
      const packs = packsFor(product);
      selectedPack = Math.min(selectedPack, packs.length - 1);
      packOptions.innerHTML = packs.map((pack, index) => `<button class="option${index === selectedPack ? ' selected' : ''}" type="button">${pack.label}<small>${pack.weight || 'Pack'} · ₹${format(pack.price)}</small></button>`).join('');

      const choose = index => {
        selectedPack = index;
        const pack = packs[index];
        packOptions.querySelectorAll('.option').forEach((button, buttonIndex) => button.classList.toggle('selected', buttonIndex === index));
        addButton.textContent = `Add to treat jar · ₹${format(pack.price)}`;
        const stickyPrice = document.querySelector('#stickyPrice');
        const stickyLabel = document.querySelector('#stickyPackLabel');
        if (stickyPrice) stickyPrice.textContent = `₹${format(pack.price)}`;
        if (stickyLabel) stickyLabel.textContent = `${pack.label} · ${pack.weight || 'Pack'}`;
      };

      packOptions.querySelectorAll('.option').forEach((button, index) => button.addEventListener('click', () => choose(index)));
      choose(selectedPack);
      addButton.onclick = () => {
        const pack = packs[selectedPack];
        const id = product.id || productId;
        const cartId = selectedPack === 0 ? id : `${id}-pack-${selectedPack + 1}`;
        GOB_PRODUCTS[cartId] = { name: `${product.n} — ${pack.label}`, price: Number(pack.price) || 0, image: product.i, tag: `${product.c} · ${pack.weight || 'Pack'}` };
        addToCart(cartId, quantity);
      };
    }

    document.querySelector('#minus')?.addEventListener('click', () => {
      quantity = Math.max(1, quantity - 1);
      document.querySelector('#quantity').textContent = String(quantity);
    });
    document.querySelector('#plus')?.addEventListener('click', () => {
      quantity += 1;
      document.querySelector('#quantity').textContent = String(quantity);
    });
    document.querySelector('#stickyAdd')?.addEventListener('click', () => addButton.click());

    render(window.GOB_CURRENT_PRODUCT || fallback);
    document.addEventListener('gob:product-ready', event => render(event.detail.product));
  });
})();
