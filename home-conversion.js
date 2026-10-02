(() => {
  const format = amount => `₹${Math.round(Number(amount) || 0)}`;
  const productBySlug = slug => Object.entries(window.GOB_PRODUCTS || {}).map(([id, product]) => ({ id, product })).find(({ id, product }) => (product.catalog_slug || id) === slug || id === slug)?.product;
  function syncFeaturedSalePrices() {
    document.querySelectorAll('[data-home-product]').forEach(card => {
      const slug = card.dataset.homeProduct;
      const product = productBySlug(slug);
      if (!product) return;
      const price = card.querySelector('.card-bottom > span');
      if (!price) return;
      const compare = Number(product.comparePrice), current = Number(product.price);
      const prefix = String(price.textContent || '').split('·')[0].trim();
      if (compare > current) price.innerHTML = `${prefix} · <span class="home-sale-price"><s>${format(compare)}</s><strong>${format(current)}</strong></span><b class="home-sale-badge">Sale</b>`;
      else price.textContent = `${prefix} · ${format(current)}`;
    });
  }
  function addTreatFinder() {
    const collection = document.querySelector('#collection');
    if (!collection || document.querySelector('.treat-finder')) return;
    collection.insertAdjacentHTML('afterend', `<section class="treat-finder" aria-labelledby="treatFinderTitle"><div class="treat-finder-shell"><div class="treat-finder-copy"><p class="eyebrow">A simple starting point</p><h2 id="treatFinderTitle">Which treat fits your dog?</h2><p>Choose the moment, then start with a straightforward single-ingredient option. Always supervise chews and pick an appropriate size.</p></div><div class="treat-finder-options"><button class="treat-finder-option" type="button" data-treat-choice="training"><strong>Small reward moments</strong><span>For short, repeatable training rewards.</span></button><button class="treat-finder-option" type="button" data-treat-choice="chew"><strong>Settled chew time</strong><span>For an occasional supervised chew.</span></button><button class="treat-finder-option" type="button" data-treat-choice="new"><strong>New to Game of Bones</strong><span>Start with a familiar, simple treat.</span></button><p class="treat-finder-result" aria-live="polite">Pick a moment to see a starting point.</p></div></div></section>`);
    const options = { training: { label: 'Chicken Bites', slug: 'chicken-bites', text: 'Small, simple pieces for training moments.' }, chew: { label: 'Goat Trachea', slug: 'goat-trachea', text: 'A natural chew for calm, supervised chew time.' }, new: { label: 'Chicken Jerky', slug: 'chicken-jerky', text: 'An easy first pick with one familiar ingredient.' } };
    const result = document.querySelector('.treat-finder-result');
    document.querySelectorAll('[data-treat-choice]').forEach(button => button.addEventListener('click', () => {
      const choice = options[button.dataset.treatChoice];
      document.querySelectorAll('[data-treat-choice]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      result.innerHTML = `${choice.text} <a href="/products/${choice.slug}">Explore ${choice.label} →</a>`;
    }));
  }
  document.addEventListener('DOMContentLoaded', () => { addTreatFinder(); syncFeaturedSalePrices(); });
  document.addEventListener('gob:catalog-sync', syncFeaturedSalePrices);
})();
