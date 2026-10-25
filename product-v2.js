/* Product page v2 (mobile first).
   Turns the long product page into: name + what it is + price -> photos -> quick facts ->
   pack choice (with price per 100 g / per piece) -> "before you buy" -> add to jar -> delivery.
   Below: why it's good (product-why.js), then one tidy accordion with label facts, feeding,
   nutrition, storage and delivery, then complementary products.
   Facts come from the printed pouch labels where we have them. Nothing unverified is shown:
   if a measurement or lab value is not known, the line is simply left out.
   Existing purchase controls (#packOptions, #addProduct, sticky bar, PIN check) are reused, never copied. */
(() => {
  if (window.__gobV2) return;
  window.__gobV2 = true;

  const LABEL_FEED = [['Small dog', '2–3 pieces'], ['Medium dog', '3–4 pieces'], ['Large dog', '4–5 pieces']];
  const LABEL_STORE = ['Use within <b>15 days</b> of opening.', 'After opening, keep it in the original pouch or an airtight container.', 'Best before <b>12 months</b> from the month of manufacture (printed on the pack).'];
  const GEN_STORE = ['Keep the pack sealed, cool and dry, away from sunlight.', 'After opening, store in an airtight container and use it up soon.', 'Use by the best-before date printed on the pack.'];
  const TEN = 'Treats and chews should stay under about 10% of your pet’s daily food.';

  const W = {
    bone: { hard: true, t: 'Contains bone', p: 'A bone-containing chew, not a dental treatment.', li: ['Pieces can injure teeth or cause choking or a tummy upset, so watch the whole time.', 'Not for dogs that gulp. Take it away once it’s small enough to swallow whole.', 'Keep fresh water nearby.'] },
    hard: { hard: true, t: 'Hard chew with bone: read before buying', p: 'Hard chews can crack teeth, and bone pieces can cause choking or a stomach blockage.', li: ['Not for puppies, small dogs, older dogs with worn teeth, or dogs that gulp.', 'Watch the whole time. Take it away when it’s small enough to swallow whole, or if it splinters or gets sharp edges.', 'Not a training treat and not a dental treatment. Ask your vet if you’re unsure.'] },
    chew: { hard: true, t: 'Chew safely', p: 'Every piece is a little different in size and firmness.', li: ['Pick a piece your dog can’t fit fully in its mouth.', 'Watch the whole time and take it away once it’s small enough to swallow.', 'Skip it for dogs that gulp food.'] },
    fish: { hard: false, t: 'Good to know', p: 'Whole fish naturally have small, soft bones. Break larger fish for small dogs and cats, introduce slowly, and keep water nearby. Skip fish if your pet has a fish allergy.' },
    fillet: { hard: false, t: 'Good to know', p: 'Fillets are deboned by hand, so the odd tiny bone can remain. Break into small pieces for cats and small dogs, and keep water nearby.' },
    shell: { hard: false, t: 'Good to know', p: 'Shellfish is a common allergen. Offer one piece first and watch for itching or an upset tummy. Supervise while your pet eats.' },
    soft: { hard: false, t: 'Good to know', p: 'Break into small pieces for puppies and small dogs. Introduce slowly, keep water nearby and supervise while treating.' },
    organ: { hard: false, t: 'Good to know', p: 'Organ treats are rich, so a little goes a long way. Start with a few small pieces a day and supervise while treating.' },
    box: { hard: false, t: 'Good to know', p: 'Open one pack at a time and follow the serving note for that treat. Supervise with chews, and keep water nearby.' }
  };

  // id: [ident, texture, chew level 1-5, chew label, warning, pairs, extras]
  const D = {
    'chicken-jerky': ['100% chicken breast · single ingredient', 'Thin, crunchy strips', 1, 'Easy · snaps by hand', 'soft', ['buff-jerky', 'chicken-bites', 'goat-lungs'], { label: '100% Real Chicken Breast', printed: true, lede: 'Chicken breast, slow-dehydrated into thin, crunchy strips. Snap into small pieces for training, or give a few as an everyday treat.', care: 'Chicken is a common food sensitivity: if you see itching or loose stools, pause and try Buff Jerky.' }],
    'chicken-bites': ['100% chicken · single ingredient', 'Small, ready-cut bites', 1, 'Easy · bite-sized', 'soft', ['chicken-jerky', 'goat-lungs', 'chicken-heart-liver']],
    'buff-jerky': ['100% water buffalo meat · single ingredient', 'Firm, crunchy strips', 2, 'Firm · break for small dogs', 'soft', ['chicken-jerky', 'goat-lungs', 'goat-trachea'], { label: '100% Real Water Buffalo Meat', printed: true }],
    'chicken-feet': ['100% chicken feet · contains small bones', 'Crunchy, with small bones', 3, 'Medium-firm · small bones', 'bone', ['chicken-neck', 'goat-trachea', 'chicken-jerky'], { label: '100% Real Chicken Feet', printed: true, lede: 'Whole chicken feet, slow-dehydrated until crunchy: skin, cartilage, tendon and small bones. A short chew for dogs that are used to chews.', nutri: [['Energy', '444 kcal'], ['Protein', '50.7 g'], ['Fat', '26.8 g'], ['Carbohydrates', 'Below detectable level'], ['Calcium', '4,872 mg'], ['Glucosamine', '9,035 mg']], faq: [['Are dehydrated bones safe?', 'No bone chew is risk-free. Dehydrated feet crunch rather than splinter like cooked bone, but pieces can still break off, so always supervise.'], ['Will it help my dog’s joints?', 'Feet naturally contain glucosamine (see the analysis), but they’re a treat, not a joint treatment.']] }],
    'chicken-neck': ['100% chicken neck · contains bone', 'Meaty and crunchy, with bone', 3, 'Medium-firm · bone inside', 'bone', ['chicken-feet', 'chicken-wings', 'buff-jerky'], { label: '100% Real Chicken Neck', printed: true, nutri: [['Energy', '372 kcal'], ['Protein', '42.8 g'], ['Carbohydrates', '13.4 g'], ['Fat', '16.4 g'], ['Calcium', '49.8 mg'], ['Iron', '12.6 mg']] }],
    'chicken-wings': ['100% chicken wing · contains bone', 'Meaty and crunchy, with bone', 3, 'Medium-firm · bone inside', 'bone', ['chicken-neck', 'chicken-feet', 'goat-trachea']],
    'chicken-wing-tips': ['100% chicken wing tips · contains small bones', 'Light and crunchy, small bones', 2, 'Light crunch · small bones', 'bone', ['chicken-feet', 'goat-ear', 'chicken-jerky']],
    'chicken-bones': ['100% chicken bones', 'Hard and crunchy', 4, 'Hard · bone', 'hard', ['chicken-neck', 'goat-trachea', 'buff-jerky']],
    'goat-trotter': ['100% goat lower leg · skin, tendon & bone', 'Hard and dense, with bone', 5, 'Hard · bone inside', 'hard', ['goat-trachea', 'goat-ear', 'buff-jerky'], { lede: 'A dense, long-lasting chew with bone inside. Only for medium and large dogs who chew steadily, and only with you watching.', faq: [['Can puppies have it?', 'No. Choose a softer treat such as Chicken Jerky or Goat Lungs for puppies.'], ['Does it clean teeth?', 'We don’t claim that. Chewing isn’t a replacement for brushing or vet dental care.']] }],
    'goat-trachea': ['100% goat windpipe · single ingredient · no bone', 'Crunchy rings of cartilage', 3, 'Medium · crunchy', 'chew', ['goat-ear', 'chicken-feet', 'goat-lungs'], { lede: 'A goat windpipe, slow-dehydrated into a ridged, crunchy chew. Made for chew time with you watching, not for quick training rewards.' }],
    'goat-ear': ['100% goat ear · single ingredient', 'Thin and crunchy', 2, 'Easy-medium · crunchy', 'chew', ['goat-trachea', 'chicken-feet', 'goat-lungs']],
    'chicken-gizzards': ['100% chicken gizzard · single ingredient', 'Firm and chewy', 2, 'Chewy · cut small', 'organ', ['chicken-heart-liver', 'goat-lungs', 'chicken-jerky']],
    'chicken-heart-liver': ['Chicken heart & liver · two organs, nothing else', 'Firm, crisp pieces', 1, 'Easy · breaks small', 'organ', ['chicken-gizzards', 'goat-lungs', 'chicken-jerky']],
    'goat-liver': ['100% goat liver · single ingredient', 'Firm, crisp pieces', 1, 'Easy · breaks small', 'organ', ['goat-lungs', 'goat-spleen', 'chicken-jerky']],
    'goat-lungs': ['100% goat lung · single ingredient', 'Light and airy', 1, 'Very easy · light', 'organ', ['goat-liver', 'chicken-jerky', 'goat-trachea']],
    'goat-heart-kidney-mix': ['Goat heart & kidney · two organs, nothing else', 'Firm, chewy pieces', 2, 'Chewy · cut small', 'organ', ['goat-lungs', 'goat-liver', 'buff-jerky']],
    'goat-spleen': ['100% goat spleen · single ingredient', 'Firm, crisp pieces', 1, 'Easy · breaks small', 'organ', ['goat-lungs', 'goat-liver', 'goat-trachea']],
    'anchovies': ['100% anchovies · whole small fish', 'Small and crunchy', 1, 'Easy · tiny fish', 'fish', ['sardines', 'bombay-duck', 'mackerel-fillet']],
    'sardines': ['100% sardines · whole fish', 'Crunchy whole fish', 2, 'Easy-medium · soft bones', 'fish', ['anchovies', 'white-sardines', 'tuna']],
    'white-sardines': ['100% white sardines · whole fish', 'Crunchy whole fish', 2, 'Easy-medium · soft bones', 'fish', ['sardines', 'anchovies', 'bombay-duck']],
    'bombay-duck': ['100% Bombay duck (bombil) fish', 'Light and crisp', 1, 'Easy · light', 'fish', ['anchovies', 'prawns', 'tuna']],
    'tuna': ['100% tuna · single ingredient', 'Firm, flaky pieces', 1, 'Easy · breaks small', 'fillet', ['mackerel-fillet', 'anchovies', 'sardines']],
    'mackerel-fillet': ['100% mackerel fillet · single ingredient', 'Firm fillet pieces', 1, 'Easy · breaks small', 'fillet', ['tuna', 'whole-mackerel', 'anchovies']],
    'whole-mackerel': ['100% mackerel · whole fish with bones', 'Whole fish, firm', 3, 'Medium · fish bones', 'bone', ['mackerel-fillet', 'sardines', 'chicken-neck']],
    'prawns': ['100% prawns · single ingredient', 'Crunchy', 2, 'Easy-medium · crunchy', 'shell', ['bombay-duck', 'anchovies', 'tuna']],
    'whole-quail': ['100% quail · whole bird with bones', 'Whole bird, crunchy', 3, 'Medium · bones inside', 'bone', ['chicken-neck', 'goat-trotter', 'chicken-feet']],
    'cat-trial-box': ['5 fish treats for cats', null, 0, '', 'box', ['anchovies', 'sardines', 'tuna']],
    'small-treat-box': ['9 mini packs to try', null, 0, '', 'box', ['chicken-jerky', 'goat-trachea', 'sardines']],
    'medium-treat-box': ['7 full packs', null, 0, '', 'box', ['chicken-jerky', 'goat-trachea', 'sardines']],
    'large-treat-box': ['10 full packs', null, 0, '', 'box', ['chicken-jerky', 'goat-trachea', 'sardines']],
    'surprise-me-box': ['200 g assorted treats', null, 0, '', 'box', ['chicken-jerky', 'goat-trachea', 'sardines']]
  };
  const PUBLIC = { 'chicken-heart-liver': 'chicken-heart-and-liver', 'goat-heart-kidney-mix': 'goat-heart-and-kidney-mix' };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const norm = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace('chicken-heart-and-liver', 'chicken-heart-liver').replace('goat-heart-and-kidney-mix', 'goat-heart-kidney-mix');
  const slug = () => {
    const m = location.pathname.match(/\/products\/([a-z0-9-]+)/);
    return norm(m ? m[1] : document.querySelector('#productName')?.textContent);
  };
  const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const $ = s => document.querySelector(s);

  function ensureCss() {
    if (document.querySelector('link[href*="product-v2.css"]')) return;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/product-v2.css?v=1'; document.head.append(l);
  }

  function meter(n) { return n ? `<div class="v2-meter" aria-hidden="true">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div>` : ''; }

  function facts(id, d) {
    const hero = (window.GOB_HERO_FACTS || {})[id] || {};
    const f = [];
    if (d[1]) f.push(['Texture', esc(d[1]), '']);
    if (hero.best) f.push(['Best for', esc(hero.best), '']);
    if (hero.dogs) f.push(['Suits', esc(hero.dogs), '']);
    if (d[2]) f.push(['Chew level', esc(d[3]), meter(d[2])]);
    if (!d[1] && hero.pack) f.unshift(['In the box', esc(hero.pack), '']);
    return f.length ? `<div class="v2-facts" id="v2Facts">${f.slice(0, 4).map(([k, v, m]) => `<div class="v2-fact"><small>${k}</small><strong>${v}</strong>${m}</div>`).join('')}</div>` : '';
  }

  function beforeBox(d) {
    const x = d[6] || {}, w = W[d[4]] || W.soft;
    const p = x.care && !w.hard ? `${w.p} ${x.care}` : w.p;
    return `<div class="v2-before${w.hard ? ' hard' : ''}" id="v2Before" role="note"><h3>${w.hard ? '⚠ ' : ''}${esc(w.t)}</h3><p>${esc(p)}</p>${w.li ? `<ul>${w.li.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}</div>`;
  }

  function perUnit() {
    const opts = document.querySelectorAll('#packOptions .option');
    opts.forEach(btn => {
      if (btn.querySelector('.v2-unit')) return;
      const txt = btn.textContent.replace(/\s+/g, ' ');
      const prices = [...txt.matchAll(/₹\s?([\d,]+)/g)].map(m => Number(m[1].replace(/,/g, '')));
      const price = prices[prices.length - 1];
      if (!price) return;
      let unit = '';
      const g = txt.match(/(\d+(?:\.\d+)?)\s?(kg|gm|g)(?![a-z])/);
      const pc = txt.match(/(\d+)\s?(pieces|piece|pcs)/i);
      if (g) { const grams = Number(g[1]) * (g[2] === 'kg' ? 1000 : 1); if (grams >= 20) unit = money(price / grams * 100) + ' / 100 g'; }
      else if (pc && Number(pc[1]) > 1) unit = money(price / Number(pc[1])) + ' each';
      if (unit) btn.insertAdjacentHTML('beforeend', `<span class="v2-unit">${unit}</span>`);
    });
  }

  function catalogItem(id) {
    const list = window.GOB_LIVE_CATALOG || [];
    return list.find(p => norm(p.id) === id || norm(p.n) === id);
  }

  function pairsHtml(d) {
    const cards = d[5].map(id => {
      const c = catalogItem(id); if (!c) return '';
      const img = String(c.i || '').replace(/^(?!https?:|\/)/, '/');
      return `<a class="v2-pair" href="/products/${PUBLIC[id] || id}"><img src="${esc(img)}" alt="${esc(c.n)}" loading="lazy" width="300" height="300"><span><b>${esc(c.n)}</b>${c.p ? `<small>from ${money(c.p)}</small>` : ''}</span></a>`;
    }).join('');
    return cards ? `<section class="v2-pairs" id="v2Pairs" aria-labelledby="v2PairsTitle"><p class="eyebrow">Pairs well with</p><h2 id="v2PairsTitle">Good next treats to try</h2><div class="v2-pair-row">${cards}</div></section>` : '';
  }

  function accordion(id, d) {
    const x = d[6] || {};
    const name = $('#productName')?.textContent.trim() || 'this treat';
    const sec = [];
    const ingr = x.label ? `<p>The pouch lists one ingredient: <b>“${esc(x.label)}”</b>. No salt, spices, preservatives or fillers are added.</p>` : `<p>${esc(d[0].split(' · ')[0])}. Nothing else is added: no salt, spices, preservatives or fillers.</p>`;
    sec.push(['Ingredients & label', ingr + '<p>Slow-dehydrated at low heat in small batches in Kalyan, Maharashtra.</p>', true]);
    if (x.printed) sec.push(['Feeding guide (from the pack)', `<table class="v2-tbl"><tr><th>Dog size</th><th>Per day</th></tr>${LABEL_FEED.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table><p class="v2-note">Don’t overfeed, keep fresh water out, and supervise. ${TEN}</p>`]);
    if (x.nutri) sec.push(['Nutrition (per 100 g)', `<table class="v2-tbl"><tr><th>Per 100 g</th><th>Amount</th></tr>${x.nutri.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table><p class="v2-note">Guaranteed analysis as printed on the pack.</p>`]);
    sec.push(['Storage & shelf life', `<ul>${(x.printed ? LABEL_STORE : GEN_STORE).map(s => `<li>${s}</li>`).join('')}</ul>`]);
    sec.push(['Delivery & returns', '<ul><li>Dispatched in 1–2 working days; tracking by SMS / WhatsApp.</li><li>Free delivery across India. Pay online and save ₹30, or pay cash on delivery (₹40 fee).</li><li>If something arrives damaged or isn’t right, message us with your order number and we’ll help.</li></ul>']);
    if (x.faq) sec.push(['Questions', x.faq.map(([q, a]) => `<p><b>${esc(q)}</b><br>${esc(a)}</p>`).join('')]);
    return `<section class="v2-acc" id="v2Acc" aria-label="${esc(name)} details">${sec.map(([h, b, o]) => `<details${o ? ' open' : ''}><summary>${h}</summary><div class="v2-body">${b}</div></details>`).join('')}<p class="v2-help">Still unsure? <a href="https://wa.me/919082503295?text=${encodeURIComponent('Hi Game of Bones, I have a question about ' + name)}" target="_blank" rel="noreferrer">WhatsApp us</a>. A real person replies.</p></section>`;
  }

  function apply() {
    const id = slug(), d = D[id];
    const info = $('.product-info'), buyRow = $('.buy-row');
    if (!d || !info || !buyRow || $('#v2Before')) return !!$('#v2Before');
    ensureCss();
    document.body.classList.add('gob-v2');
    const x = d[6] || {};

    // identity line under the name, and a plainer description
    const h1 = $('#productName');
    if (h1 && !$('#v2Ident')) h1.insertAdjacentHTML('afterend', `<p class="v2-ident" id="v2Ident">${esc(d[0])}</p>`);
    if (x.lede && $('#productDesc')) $('#productDesc').textContent = x.lede;

    // quick facts after the description
    const desc = $('#productDesc');
    if (desc && !$('#v2Facts')) desc.insertAdjacentHTML('afterend', facts(id, d));

    // before-you-buy right above the add-to-jar row
    buyRow.insertAdjacentHTML('beforebegin', beforeBox(d));

    // one short delivery line after the buy row (replaces three repeated blocks)
    buyRow.insertAdjacentHTML('afterend', '<ul class="v2-ship" id="v2Ship"><li>Dispatched in 1–2 working days · free delivery</li><li>Pay online and save ₹30 · COD available (₹40 fee)</li></ul>');

    // per-unit pricing on pack buttons (packs re-render when data arrives)
    perUnit();
    const po = $('#packOptions');
    if (po) new MutationObserver(perUnit).observe(po, { childList: true, subtree: true });

    // replace the generic accordion with the product-specific one
    const oldAcc = $('.accordion');
    const anchor = $('#gobWhy') || $('.detail');
    if (anchor && !$('#v2Acc')) anchor.insertAdjacentHTML('afterend', accordion(id, d));
    if (oldAcc) oldAcc.classList.add('v2-hidden');

    // complementary products instead of the generic "make it a bundle" block
    const quote = $('.quote-section');
    const pairs = pairsHtml(d);
    if (pairs) (quote || $('#v2Acc')).insertAdjacentHTML(quote ? 'beforebegin' : 'afterend', pairs);
    return true;
  }

  function start() {
    let tries = 0;
    const tick = () => { if (apply() || ++tries > 12) return; setTimeout(tick, 350); };
    tick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 60), { once: true });
  else setTimeout(start, 60);
})();
