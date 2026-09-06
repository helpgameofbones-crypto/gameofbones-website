/* Keep the explanatory product-page copy aligned with the active catalogue item. */
(() => {
  const firstPack = product => Array.isArray(product?.packs) && product.packs.length
    ? product.packs[0]
    : { label: '1 pack', weight: product?.w || '', price: product?.p || 0 };

  const apply = product => {
    if (!product?.n) return;
    const pack = firstPack(product);
    const packText = [pack.label, pack.weight].filter(Boolean).join(' · ') || 'resealable pack';
    const journeyPack = document.querySelector('.product-journey .spec-grid .spec:nth-child(3) strong');
    const journeyUse = document.querySelector('.product-journey .spec-grid .spec:nth-child(4) strong');
    const labelCopy = document.querySelector('.label-test .label-copy > p:not(.eyebrow)');
    const serveCopy = document.querySelector('.serve-copy > p:not(.eyebrow)');
    if (journeyPack) journeyPack.textContent = `${packText} · vacuum-sealed`;
    if (journeyUse) journeyUse.textContent = /chew|bone|feet|neck|wing|trotter|trachea|ear/i.test(`${product.n} ${product.c}`) ? 'Supervised chew time' : 'Training rewards & everyday treats';
    if (labelCopy) labelCopy.textContent = `There is no long ingredient list to interpret. For ${product.n}, the named ingredient is the complete label. That is the visual and informational standard every product page follows.`;
    if (serveCopy) serveCopy.textContent = `Offer ${product.n} as a treat alongside a complete and balanced diet. Start with a small amount when introducing anything new, make fresh water available, and supervise every dog while treating.`;
  };

  document.addEventListener('gob:product-ready', event => apply(event.detail?.product));
  document.addEventListener('DOMContentLoaded', () => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      apply(window.GOB_CURRENT_PRODUCT);
      attempts += 1;
      if (window.GOB_CURRENT_PRODUCT || attempts >= 20) window.clearInterval(timer);
    }, 100);
  });
})();
