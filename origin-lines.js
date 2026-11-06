/* Origin line under each treat's name on product cards: what it is and where it is made.
   Ingredients are copied from the product table in product-v2.js (first part of each ident);
   "slow-dried in Kalyan" is stated site-wide for every treat. Boxes are mixes, so they get none.
   If a treat's ingredient changes in product-v2.js, change it here too. */
(() => {
  const INGREDIENT = {
  "chicken-jerky": "100% chicken breast",
  "chicken-bites": "100% chicken",
  "buff-jerky": "100% water buffalo meat",
  "chicken-feet": "100% chicken feet",
  "chicken-neck": "100% chicken neck",
  "chicken-wings": "100% chicken wing",
  "chicken-wing-tips": "100% chicken wing tips",
  "chicken-bones": "100% chicken bones",
  "goat-trotter": "100% goat lower leg",
  "goat-trachea": "100% goat windpipe",
  "goat-ear": "100% goat ear",
  "chicken-gizzards": "100% chicken gizzard",
  "chicken-heart-liver": "Chicken heart & liver",
  "goat-liver": "100% goat liver",
  "goat-lungs": "100% goat lung",
  "goat-heart-kidney-mix": "Goat heart & kidney",
  "goat-spleen": "100% goat spleen",
  "anchovies": "100% anchovies",
  "sardines": "100% sardines",
  "white-sardines": "100% white sardines",
  "bombay-duck": "100% Bombay duck (bombil) fish",
  "tuna": "100% tuna",
  "mackerel-fillet": "100% mackerel fillet",
  "whole-mackerel": "100% mackerel",
  "prawns": "100% prawns",
  "whole-quail": "100% quail"
};
  const slug = s => String(s || '').toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const ALIAS = { 'chicken-heart-and-liver': 'chicken-heart-liver', 'goat-heart-and-kidney-mix': 'goat-heart-kidney-mix', 'trachea-chew': 'goat-trachea' };
  const keyFor = card => {
    const href = (card.matches('a[href]') ? card : card.querySelector('a[href*="/products/"]'))?.getAttribute('href') || '';
    const fromHref = href.match(/\/products\/([^/?#]+)/)?.[1];
    const fromName = slug(card.querySelector('h3')?.textContent);
    for (const k of [fromHref, fromName]) { if (!k) continue; const key = ALIAS[k] || k; if (INGREDIENT[key]) return key; }
    return null;
  };
  const apply = () => {
    document.querySelectorAll('a.card, .product-card').forEach(card => {
      const h3 = card.querySelector('h3'); if (!h3 || card.querySelector('.origin-line')) return;
      const key = keyFor(card); if (!key) return;
      const p = document.createElement('p'); p.className = 'origin-line';
      p.textContent = `${INGREDIENT[key]}, slow-dried in Kalyan`;
      h3.insertAdjacentElement('afterend', p);
    });
  };
  let queued = false;
  const queue = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; apply(); }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true });
})();
