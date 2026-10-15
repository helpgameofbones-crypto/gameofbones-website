/* Adds low-stock alerts to the homepage catalogue after its cards are rendered. */
(() => {
  const encode = value => encodeURIComponent(String(value || ''));
  function addRestockButtons() {
    const catalogue = Array.isArray(window.GOB_LIVE_CATALOG) ? window.GOB_LIVE_CATALOG : [];
    document.querySelectorAll('#liveCatalog .product-card').forEach(card => {
      if (card.querySelector('[data-restock-product]')) return;
      const name = card.querySelector('h3')?.textContent?.trim();
      const product = catalogue.find(item => item.n === name);
      if (!product?.low_stock) return;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'restock-notify-button';
      button.dataset.restockProduct = encode(product.inventory_id || product.id);
      button.dataset.restockName = encode(product.n);
      button.textContent = 'Notify me';
      card.querySelector('.card-bottom')?.insertAdjacentElement('afterend', button);
    });
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(addRestockButtons, 0));
  document.addEventListener('gob:catalog-sync', () => setTimeout(addRestockButtons, 0));
})();
