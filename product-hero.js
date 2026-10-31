/* Product page "first screen": the facts, proof and a real treat-time clip a shopper
   needs in the first few seconds, placed right under the price (moves with the price
   into the mobile head). Pack sizes match the admin product record; review quotes come
   only from published, verified reviews. */
(() => {
  if (window.__gobProductHero) return;
  window.__gobProductHero = true;
  if (!document.querySelector('script[src*="product-why.js"]')) { const w = document.createElement('script'); w.src = '/product-why.js?v=1'; w.defer = true; document.head.append(w); }

  // pack = first pack the page sells · best = what it is for · dogs = who it suits · clip = treat-time video
  const FACTS = {
    'chicken-jerky':        { pack: '60 g pouch', best: 'Training & everyday rewards', dogs: 'All sizes · breaks into small bites', clip: 'train' },
    'chicken-bites':        { pack: '60 g pouch', best: 'Training rewards on the go', dogs: 'All sizes · ready-cut bites', clip: 'train' },
    'buff-jerky':           { pack: '60 g pouch', best: 'Picky eaters & chicken-sensitive dogs', dogs: 'All sizes · break for small dogs', clip: 'train' },
    'chicken-feet':         { pack: '70 g pouch · Buy 1 Get 1', best: 'Short, crunchy chew', dogs: 'Small to large dogs', clip: 'chew-feet' },
    'chicken-neck':         { pack: '70 g pouch · Buy 1 Get 1', best: 'Crunchy chew', dogs: 'Medium & large dogs', clip: 'chew-neck' },
    'chicken-wings':        { pack: '5 pieces', best: 'Crunchy chew', dogs: 'Medium & large dogs', clip: 'chew-neck' },
    'chicken-wing-tips':    { pack: '100 g pouch', best: 'Light crunchy chew', dogs: 'Small & medium dogs', clip: 'chew-feet' },
    'chicken-bones':        { pack: '100 g pouch', best: 'Crunchy chew', dogs: 'Medium & large dogs', clip: 'chew-trotter' },
    'goat-trotter':         { pack: '1 piece', best: 'Long-lasting chew', dogs: 'Medium & large dogs', clip: 'chew-trotter' },
    'goat-trachea':         { pack: '1 piece', best: 'Long, crunchy chew', dogs: 'All sizes · supervise', clip: 'chew-trotter' },
    'goat-ear':             { pack: '6 pieces', best: 'Quick, crunchy chew', dogs: 'All sizes', clip: 'chew-feet' },
    'chicken-gizzards':     { pack: '60 g pouch', best: 'High-value rewards', dogs: 'All sizes · small portions', clip: 'bowl' },
    'chicken-heart-liver':  { pack: '60 g pouch', best: 'High-value rewards', dogs: 'All sizes · small portions', clip: 'bowl' },
    'goat-liver':           { pack: '60 g pouch', best: 'High-value rewards', dogs: 'All sizes · small portions', clip: 'bowl' },
    'goat-lungs':           { pack: '60 g pouch', best: 'Light, airy rewards', dogs: 'All sizes · good for small dogs', clip: 'bowl' },
    'goat-heart-kidney-mix':{ pack: '60 g pouch', best: 'High-value rewards', dogs: 'All sizes · small portions', clip: 'bowl' },
    'goat-spleen':          { pack: '60 g pouch', best: 'High-value rewards', dogs: 'All sizes · small portions', clip: 'bowl' },
    'anchovies':            { pack: '60 g pouch', best: 'Small, crunchy fish treat', dogs: 'Dogs & cats · all sizes', clip: 'cat-bite' },
    'sardines':             { pack: '60 g pouch', best: 'Fish treat for picky eaters', dogs: 'Dogs & cats · all sizes', clip: 'cat-fish' },
    'white-sardines':       { pack: '60 g pouch', best: 'Fish treat for picky eaters', dogs: 'Dogs & cats · all sizes', clip: 'cat-fish' },
    'bombay-duck':          { pack: '60 g pouch', best: 'Light, crunchy fish treat', dogs: 'Dogs & cats · all sizes', clip: 'cat-fish' },
    'tuna':                 { pack: '60 g pouch', best: 'Lean fish reward', dogs: 'Dogs & cats · all sizes', clip: 'cat-bite' },
    'mackerel-fillet':      { pack: '60 g pouch', best: 'Boneless fish reward', dogs: 'Dogs & cats · all sizes', clip: 'cat-bite' },
    'whole-mackerel':       { pack: '100 g pouch', best: 'Whole fish chew', dogs: 'Medium & large dogs', clip: 'bowl' },
    'prawns':               { pack: '60 g pouch', best: 'Crunchy special treat', dogs: 'Dogs & cats · all sizes', clip: 'cat-bite' },
    'whole-quail':          { pack: '1 piece', best: 'Whole-prey chew', dogs: 'Medium & large dogs', clip: 'quail' },
    'cat-trial-box':        { pack: '130 g · 5 fish treats', best: 'Trying what your cat likes', dogs: 'Cats', clip: 'cat-fish' },
    'small-treat-box':      { pack: '9 mini packs · 120 g+', best: 'Finding your dog’s favourite', dogs: 'All sizes', clip: 'bowl' },
    'medium-treat-box':     { pack: '7 full packs · 360 g+', best: 'A month of variety', dogs: 'All sizes', clip: 'bowl' },
    'large-treat-box':      { pack: '10 full packs · 700 g+', best: 'Multi-dog homes & gifting', dogs: 'All sizes', clip: 'bowl' },
    'surprise-me-box':      { pack: '200 g assorted', best: 'A surprise mix to try', dogs: 'All sizes', clip: 'bowl' },
  };
  window.GOB_HERO_FACTS = FACTS;

  const slug = () => {
    const m = location.pathname.match(/\/products\/([a-z0-9-]+)/);
    if (m) return m[1].replace('chicken-heart-and-liver', 'chicken-heart-liver').replace('goat-heart-and-kidney-mix', 'goat-heart-kidney-mix');
    const name = document.querySelector('#productName')?.textContent || '';
    return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      .replace('chicken-heart-and-liver', 'chicken-heart-liver').replace('goat-heart-and-kidney-mix', 'goat-heart-kidney-mix');
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const css = `
  .gob-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0 4px}
  .gob-facts div{background:#fffdf8;border:1px solid rgba(16,44,34,.14);border-radius:10px;padding:7px 8px;min-width:0}
  .gob-facts small{display:block;font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#bd812a;margin-bottom:2px}
  .gob-facts strong{display:block;font-size:12.5px;line-height:1.25;color:#102c22;font-weight:700}
  .gob-quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;margin:12px 0 4px}.gallery .gob-quotes{margin:8px 0 4px}
  .gob-quotes blockquote{margin:0;padding:8px 10px;background:#f7f0e4;border-left:3px solid #bd812a;border-radius:6px;font-size:13px;line-height:1.4;color:#102c22}
  .gob-quotes cite{display:block;margin-top:3px;font-style:normal;font-size:12px;font-weight:700;color:#557064}
  .gob-quotes .gob-stars{color:#bd812a;letter-spacing:1px;margin-right:4px}
  #productMediaStage{position:relative}
  .gob-clip{position:absolute;right:10px;bottom:10px;width:38%;max-width:190px;aspect-ratio:1;border-radius:14px;overflow:hidden;border:3px solid #fffdf8;box-shadow:0 8px 22px rgba(16,44,34,.28);background:#102c22;z-index:3;cursor:pointer}
  .gob-clip video{width:100%;height:100%;object-fit:cover;display:block}
  .gob-clip span{position:absolute;left:0;right:0;bottom:0;padding:3px 6px;font-size:12px;font-weight:800;letter-spacing:.04em;color:#fff;background:linear-gradient(transparent,rgba(16,44,34,.85));text-align:center}
  .gob-clip.is-big{width:92%;max-width:none;right:4%;bottom:4%}
  @media(max-width:760px){.gob-facts strong{font-size:12px}.gob-clip{width:40%}}
  `;

  function ensureStyle() {
    if (document.getElementById('gob-hero-style')) return;
    const s = document.createElement('style'); s.id = 'gob-hero-style'; s.textContent = css; document.head.append(s);
  }

  function renderFacts() {
    const f = FACTS[slug()];
    const price = document.querySelector('#productPrice');
    if (!f || !price) return;
    let box = document.getElementById('gobQuickFacts');
    if (!box) {
      box = document.createElement('div'); box.id = 'gobQuickFacts'; box.className = 'gob-facts';
      // Mobile: price lives in .mobile-buy-head; keep the facts right after it either way.
      price.after(box);
    } else if (box.previousElementSibling !== price && !price.parentElement.contains(box)) {
      price.after(box);
    }
    box.innerHTML = `<div><small>Pack</small><strong>${esc(f.pack)}</strong></div><div><small>Best for</small><strong>${esc(f.best)}</strong></div><div><small>Suits</small><strong>${esc(f.dogs)}</strong></div>`;
  }

  function renderClip() {
    const f = FACTS[slug()];
    const stage = document.querySelector('#productMediaStage');
    if (!f || !f.clip || !stage) return;
    if (stage.querySelector('.gob-clip')) return;
    const wrap = document.createElement('button');
    wrap.type = 'button'; wrap.className = 'gob-clip'; wrap.setAttribute('aria-label', 'Real treat time video — tap to enlarge');
    wrap.innerHTML = `<video src="/assets/treat-clips/${f.clip}.mp4" poster="/assets/treat-clips/${f.clip}.jpg" muted loop playsinline autoplay preload="metadata"></video><span>Real treat time</span>`;
    wrap.addEventListener('click', e => { e.preventDefault(); wrap.classList.toggle('is-big'); });
    stage.append(wrap);
    const v = wrap.querySelector('video'); v.muted = true; v.play?.().catch(() => {});
  }

  let quotesFor = '';
  async function renderQuotes() {
    const name = document.querySelector('#productName')?.textContent?.trim();
    if (!name || !window.GOB_API?.publicProductReviews || quotesFor === name) return;
    quotesFor = name;
    let rows = [];
    try { const data = await window.GOB_API.publicProductReviews(name); rows = Array.isArray(data.reviews) ? data.reviews : []; } catch { rows = []; }
    document.getElementById('gobQuotes')?.remove();
    const picks = rows.filter(r => String(r.review || '').trim().length > 12).slice(0, 2);
    if (!picks.length) return;
    const box = document.createElement('div'); box.id = 'gobQuotes'; box.className = 'gob-quotes';
    box.innerHTML = picks.map(r => {
      const text = String(r.review).replace(/\s+/g, ' ').trim();
      const short = text.length > 110 ? text.slice(0, 107).replace(/\s+\S*$/, '') + '…' : text;
      return `<blockquote><span class="gob-stars" aria-label="${Number(r.rating) || 5} out of 5">${'★'.repeat(Math.max(1, Math.min(5, Number(r.rating) || 5)))}</span>“${esc(short)}”<cite>${esc(r.name || 'Verified dog parent')}</cite></blockquote>`;
    }).join('');
    const desktop = window.matchMedia('(min-width: 761px)').matches;
    const anchor = desktop
      ? (document.getElementById('gobQuickFacts') || document.querySelector('#productPrice'))
      : (document.querySelector('#productMediaCount') || document.querySelector('#productMediaStage') || document.getElementById('gobQuickFacts'));
    anchor?.after(box);
  }

  const NEW_PRODUCTS = new Set(['white-sardines', 'chicken-wing-tips']);
  function renderNewTag() {
    const tag = document.querySelector('#productTag');
    if (!tag || !NEW_PRODUCTS.has(slug()) || tag.querySelector('.gob-new')) return;
    tag.insertAdjacentHTML('afterbegin', '<span class="gob-new" style="display:inline-block;margin-right:8px;padding:3px 8px;border-radius:4px;background:#bd812a;color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em;vertical-align:1px">NEW</span>');
  }
  function run() { ensureStyle(); renderNewTag(); renderFacts(); renderQuotes(); document.querySelectorAll('.gob-clip').forEach(n => n.remove()); }
  const start = () => {
    run();
    setTimeout(run, 600); setTimeout(run, 1800);
    document.addEventListener('gob:product-ready', () => { quotesFor = ''; run(); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
