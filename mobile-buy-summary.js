/* Mobile product page: ad visitors decide in seconds, so on phones the
   product name, rating and sale price sit above the photo, the gallery is
   tighter, and the sticky purchase bar shows the saving.
   The original elements are moved (not copied), so the single <h1> and every
   id that other scripts update (#productName, #productPrice, ...) stay intact.
   On wider screens they are put back exactly where they came from. */
(() => {
  const mq = window.matchMedia('(max-width: 760px)');

  const style = document.createElement('style');
  style.textContent = `
@media (max-width: 760px) {
  .mobile-buy-head { margin: 0 0 12px; }
  .mobile-buy-head .eyebrow { margin: 0 0 4px; }
  .mobile-buy-head h1 { margin: 0 0 4px; font-size: clamp(32px, 9vw, 40px); line-height: 1.02; }
  .mobile-buy-head .rating { margin: 0 0 8px; }
  .mobile-buy-head .sale-price-presentation, .mobile-buy-head .price { margin: 0; }
  .main-product-image { aspect-ratio: 4 / 3 !important; }
  .gallery .media-count, .gallery .gallery-notes { display: none !important; }
  .gob-back-compact { margin: 0 0 8px !important; }
  .gob-back-compact a { display: inline-block; padding: 6px 0; border: 0 !important; background: none !important; box-shadow: none !important; font-size: 12px; }
  .mobile-purchase-bar .sticky-compare { display: flex; gap: 6px; align-items: baseline; font-size: 12px; line-height: 1.2; }
  .mobile-purchase-bar .sticky-compare s { opacity: .65; }
  .mobile-purchase-bar .sticky-compare b { color: var(--gold, #a8681c); font-weight: 800; }
}`;
  document.head.append(style);

  const head = document.createElement('div');
  head.className = 'mobile-buy-head';
  const moved = new Map();

  function headNodes() {
    const info = document.querySelector('.product-info');
    if (!info) return [];
    return [
      document.querySelector('#productTag'),
      document.querySelector('#productName'),
      info.querySelector(':scope > .rating'),
      document.querySelector('#productPrice'),
      document.querySelector('#salePricePresentation'),
    ].filter(node => node && !moved.has(node));
  }

  function backRow() {
    const link = [...document.querySelectorAll('a[href="/products"]')].find(a => /back to all/i.test(a.textContent));
    return link && link.parentElement !== document.body ? link.parentElement : null;
  }

  function place() {
    const gallery = document.querySelector('.detail > .gallery');
    if (!gallery) return;
    if (mq.matches) {
      if (!head.isConnected) gallery.before(head);
      headNodes().forEach(node => {
        const marker = document.createComment('mobile-buy-head');
        node.before(marker);
        moved.set(node, marker);
        head.append(node);
      });
      backRow()?.classList.add('gob-back-compact');
    } else {
      moved.forEach((marker, node) => { if (marker.isConnected) marker.replaceWith(node); });
      moved.clear();
      head.remove();
      backRow()?.classList.remove('gob-back-compact');
    }
  }

  const rupees = text => Number(String(text || '').replace(/[^\d.]/g, '')) || 0;
  const format = value => `₹${Math.round(value).toLocaleString('en-IN')}`;

  function updateStickyCompare() {
    const price = document.querySelector('#stickyPrice');
    if (!price) return;
    let compare = document.querySelector('.mobile-purchase-bar .sticky-compare');
    const option = document.querySelector('#packOptions .option.selected');
    const was = rupees(option?.querySelector('s')?.textContent);
    const now = rupees(option?.querySelector('strong')?.textContent);
    const shown = rupees(price.textContent);
    if (!was || !now || was <= now || !shown) { compare?.remove(); return; }
    const percent = Math.round((1 - now / was) * 100);
    if (!compare) {
      compare = document.createElement('span');
      compare.className = 'sticky-compare';
      price.after(compare);
    }
    const strike = format(was * shown / now);
    const html = `<s aria-label="Was ${strike}">${strike}</s><b>${percent}% off</b>`;
    if (compare.innerHTML !== html) compare.innerHTML = html;
  }

  function init() {
    place();
    updateStickyCompare();
    const info = document.querySelector('.product-info');
    // Sale pricing and catalogue sync can add or replace these elements later.
    if (info) new MutationObserver(() => { if (mq.matches) place(); }).observe(info, { childList: true });
    if (head) new MutationObserver(updateStickyCompare).observe(head, { childList: true, subtree: true, characterData: true });
    const bar = document.querySelector('.mobile-purchase-bar');
    if (bar) new MutationObserver(updateStickyCompare).observe(bar.querySelector('#stickyPrice') || bar, { childList: true, subtree: true, characterData: true });
    const packs = document.querySelector('#packOptions');
    if (packs) new MutationObserver(updateStickyCompare).observe(packs, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  mq.addEventListener?.('change', place);
  document.addEventListener('gob:product-ready', () => { place(); updateStickyCompare(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
