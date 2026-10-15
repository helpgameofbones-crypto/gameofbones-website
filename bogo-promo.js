/* Buy 1 Get 1 is automatic for the two selected treats. The checkout service
   remains authoritative for the discount and exclusivity rules. */
(() => {
  const eligible = value => ['chicken feet', 'chicken neck'].includes(String(value || '').replace(/\s+—\s+.+$/, '').trim().toLowerCase());
  const cardOffer = card => {
    if (card.querySelector('[data-bogo-card]') || !eligible(card.querySelector('h3')?.textContent)) return;
    const badge = document.createElement('p'); badge.dataset.bogoCard = '';
    badge.style.cssText = 'margin:10px 0 0;color:#a84312;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase';
    badge.textContent = 'Buy 1 Get 1 · no code needed';
    card.querySelector('.card-bottom')?.insertAdjacentElement('afterend', badge);
  };
  const productOffer = product => {
    if (!eligible(product?.n || product?.name) || document.querySelector('[data-bogo-product]')) return;
    const note = document.createElement('aside'); note.dataset.bogoProduct = '';
    note.className = 'restock-notify-area';
    note.innerHTML = '<strong>Buy 1 Get 1 on this treat</strong><span>Add two of the same pack and one is free automatically at checkout. This offer cannot be combined with coupon codes or reward points.</span>';
    document.querySelector('#addProduct')?.insertAdjacentElement('afterend', note);
  };
  const decorate = () => document.querySelectorAll('.product-card').forEach(cardOffer);
  const observeCards = () => {
    const catalogue = document.querySelector('#liveCatalog');
    if (!catalogue || catalogue.dataset.bogoObserved) return;
    catalogue.dataset.bogoObserved = 'true';
    new MutationObserver(() => decorate()).observe(catalogue, { childList: true, subtree: true });
  };
  document.addEventListener('DOMContentLoaded', () => { decorate(); observeCards(); productOffer(window.GOB_CURRENT_PRODUCT); });
  document.addEventListener('gob:catalog-sync', () => setTimeout(decorate, 0));
  document.addEventListener('gob:product-ready', event => productOffer(event.detail?.product));
})();
