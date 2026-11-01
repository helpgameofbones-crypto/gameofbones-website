/* Trust details: star ratings, homepage reviews, order-help promise, courier, cart/checkout reassurance, footer contact, contact page. */
(() => {
  const WA = 'https://wa.me/919082503295';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = v => String(v || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
  const stars = avg => { const full = Math.round(avg); return '<span class="gob-st" aria-hidden="true">' + '★★★★★'.slice(0, full) + '<i>' + '★★★★★'.slice(full) + '</i></span>'; };
  const ICON = {
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6" cy="17.5" r="1.8" stroke="#bd812a"/><circle cx="17" cy="17.5" r="1.8" stroke="#bd812a"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.4 2.4 4.6-4.8" stroke="#bd812a"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19l1.4-3.6A8 8 0 1 1 8.6 19z"/><path d="M9 10h6M9 13h4" stroke="#bd812a"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3" stroke="#bd812a"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6" stroke="#bd812a"/></svg>',
  };
  const PROMISE = `<div class="gob-promise">${ICON.shield}<p><b>Something wrong with your order?</b> Tell us within 48 hours of delivery, with a photo, and we’ll replace it or refund you. <a href="/policies#returns">Returns policy</a></p></div>`;
  const COURIER = `<p class="gob-courier">${ICON.truck}<span>Shipped &amp; tracked by <b>Delhivery</b> · dispatched in 1–2 working days · <a href="/track">Track an order</a></span></p>`;
  const HELP = `<a class="gob-help" href="${WA}" target="_blank" rel="noopener">${ICON.chat}<span><b>Questions before you order?</b> WhatsApp us on +91 90825 03295</span></a>`;

  // ---------- review data (cached for 10 minutes per tab)
  let summaryP;
  const summary = () => summaryP || (summaryP = (async () => {
    try { const c = JSON.parse(sessionStorage.getItem('gob-rev-sum') || 'null'); if (c && Date.now() - c.t < 600000) return c.d; } catch {}
    const d = await fetch('/api/public-product-reviews?summary=1', { headers: { Accept: 'application/json' } }).then(r => r.ok ? r.json() : null).catch(() => null);
    if (d) { try { sessionStorage.setItem('gob-rev-sum', JSON.stringify({ t: Date.now(), d })); } catch {} }
    return d;
  })());
  const lookup = (d, name) => { if (!d?.products) return null; const n = norm(name); for (const [k, v] of Object.entries(d.products)) if (norm(k) === n) return v; return null; };

  // ---------- 1. stars on product cards (shop, collections, homepage bestsellers)
  async function cardStars() {
    const d = await summary(); if (!d) return;
    document.querySelectorAll('.product-card h3, .hv2 .card h3, a.card h3').forEach(h => {
      const box = h.closest('.product-card, .card'); if (!box || box.querySelector('.gob-card-rating')) return;
      const r = lookup(d, h.textContent.trim()); if (!r || !r.count) return;
      h.insertAdjacentHTML('afterend', `<p class="gob-card-rating" aria-label="Rated ${r.average} out of 5 from ${r.count} review${r.count > 1 ? 's' : ''}">${stars(r.average)}<b>${r.average.toFixed(1)}</b><span>(${r.count})</span></p>`);
    });
  }
  // ---------- product page: stars under the name + promise + courier
  async function productPage() {
    const h1 = document.getElementById('productName'); if (!h1) return;
    const ship = document.getElementById('v2Ship');
    if (ship && !ship.querySelector('.gob-promise')) { const pay = ship.querySelector('.gob-pay'); (pay || ship.lastElementChild).insertAdjacentHTML(pay ? 'beforebegin' : 'afterend', COURIER + PROMISE); }
    if (document.querySelector('.gob-pdp-rating')) return;
    const d = await summary(); const r = lookup(d, h1.textContent.trim()); if (!r || !r.count) return;
    const target = document.getElementById('productReviewFeed') || document.querySelector('[id*="review" i]');
    h1.insertAdjacentHTML('afterend', `<a class="gob-pdp-rating" href="#${target?.id || ''}">${stars(r.average)}<b>${r.average.toFixed(1)}</b><span>${r.count} review${r.count > 1 ? 's' : ''}</span></a>`);
  }
  // ---------- 3. homepage reviews strip (before the FAQ)
  async function homeReviews() {
    const faq = document.querySelector('.hv2 section.faq'); if (!faq || document.getElementById('gobReviews')) return;
    const d = await summary(); if (!d?.latest?.length) return;
    const o = d.overall || {};
    // One review per person (their best), and leave out reviews that read like health claims.
    const CLAIM = /inflamm|sooth|cure|heal|skin|gut|medic|disease|allerg|immun|joint|digest/i;
    const best = new Map();
    for (const r of d.latest) { if (CLAIM.test(r.review)) continue; const k = r.name.split('·')[0].trim(); const b = best.get(k); if (!b || r.rating > b.rating || (r.rating === b.rating && r.review.length > b.review.length)) best.set(k, r); }
    const picks = [...best.values()].slice(0, 8); if (!picks.length) return;
    const cards = picks.map(r => `<figure class="gob-rv"><div class="gob-rv-top">${stars(r.rating)}<span class="gob-rv-p">${esc(r.product)}</span></div><blockquote>“${esc(r.review)}”</blockquote><figcaption>${esc(r.name)}</figcaption></figure>`).join('');
    faq.insertAdjacentHTML('beforebegin', `<section class="s" id="gobReviews" style="padding-top:0"><div class="wrap"><div class="row-head"><div><p class="eyebrow">Reviews</p><h2>What pet parents say</h2></div>${o.count ? `<p class="gob-rv-sum">${stars(o.average)} <b>${Number(o.average).toFixed(1)}</b> from ${o.count} reviews</p>` : ''}</div><div class="gob-rv-row">${cards}</div><p class="gob-rv-note">Every review is from a real customer and is checked before it appears.</p></div></section>`);
  }
  // ---------- 6. cart + checkout reassurance
  function cartCheckout() {
    const pay = typeof window.GOB_payRow === 'function' ? window.GOB_payRow('gob-pay-cart') : '';
    const cart = document.querySelector('.cart-assurance');
    if (cart && !document.querySelector('.gob-cart-trust')) cart.insertAdjacentHTML('afterend', `<div class="gob-cart-trust">${pay}${COURIER}${PROMISE}${HELP}</div>`);
    const btn = [...document.querySelectorAll('form button[type=submit]')].find(b => /secure payment/i.test(b.textContent));
    if (btn && !document.querySelector('.gob-checkout-trust')) btn.insertAdjacentHTML('afterend', `<div class="gob-checkout-trust">${pay}${PROMISE}${HELP}</div>`);
  }
  // ---------- 8. contact page: big WhatsApp button + map link
  function contact() {
    if (!/\/contact(\.html)?$/.test(location.pathname)) return;
    const h = [...document.querySelectorAll('h1,h2')].find(x => /talk treats|contact/i.test(x.textContent));
    if (!h || document.querySelector('.gob-contact-cta')) return;
    let block = h; while (block.nextElementSibling && block.nextElementSibling.tagName === 'P') block = block.nextElementSibling;
    block.insertAdjacentHTML('afterend', `<div class="gob-contact-cta"><a class="gob-wa-btn" href="${WA}?text=${encodeURIComponent('Hi Game of Bones! I have a question.')}" target="_blank" rel="noopener">${ICON.chat}Chat on WhatsApp</a><a class="gob-map-btn" href="https://www.google.com/maps/search/?api=1&query=Kalyan+West+Maharashtra+421301" target="_blank" rel="noopener">${ICON.pin}Kalyan West, Maharashtra 421301</a><p>Replies come from a real person in our Kalyan kitchen.</p></div>`);
  }

  function run() { cardStars(); productPage(); homeReviews(); cartCheckout(); contact(); }
  [200, 1200, 3000, 6000].forEach(ms => setTimeout(run, ms));
  const lc = document.getElementById('liveCatalog');
  if (lc) new MutationObserver(() => setTimeout(cardStars, 50)).observe(lc, { childList: true });
})();
