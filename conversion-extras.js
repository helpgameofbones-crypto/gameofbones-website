(() => {
  function ensureStyles() {
    if (document.querySelector('link[href^="conversion-extras.css"]')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'conversion-extras.css?v=review-flow-2';
    document.head.append(stylesheet);
    const paidTrafficStyles = document.createElement('link');
    paidTrafficStyles.rel = 'stylesheet';
    paidTrafficStyles.href = 'conversion-paid-traffic.css?v=1';
    document.head.append(paidTrafficStyles);
    const reviewStyles = document.createElement('link');
    reviewStyles.rel = 'stylesheet';
    reviewStyles.href = 'review-public.css?v=verified-reviews-1';
    document.head.append(reviewStyles);
  }

  function addWheelPrompt() {
    // Bone Run (bone-run.js) replaced the spin wheel. This only adds the
    // floating launcher; the game itself loads lazily after the page.
    if (document.querySelector('#wheelLaunch')) return;
    const launchStyle = document.createElement('style');
    launchStyle.textContent = `.br-launch{position:fixed;z-index:38;left:18px;bottom:18px;display:inline-flex;align-items:center;gap:10px;border:0;cursor:pointer;text-align:left;
      background:linear-gradient(135deg,#173a2d,#0a1f17);color:#f6efe2;border-radius:999px;padding:6px 16px 6px 6px;font:800 13.5px/1.15 "DM Sans",system-ui,sans-serif;
      box-shadow:0 10px 24px rgba(10,31,23,.35),inset 0 0 0 1.5px rgba(231,194,122,.65);animation:brGlow 2.4s ease-in-out infinite}
      .br-launch .br-medal{flex:0 0 34px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:16px;line-height:1;background:radial-gradient(circle at 35% 30%,#f6dfa6,#c9963a 60%,#9a6e22)}
      .br-launch .br-txt{display:flex;flex-direction:column;align-items:flex-start}
      .br-launch small{font-weight:600;font-size:10.5px;opacity:.75;margin-top:2px;white-space:nowrap}
      @keyframes brGlow{0%,100%{box-shadow:0 10px 24px rgba(10,31,23,.35),inset 0 0 0 1.5px rgba(231,194,122,.65),0 0 0 0 rgba(201,150,58,.45)}50%{box-shadow:0 10px 24px rgba(10,31,23,.35),inset 0 0 0 1.5px rgba(231,194,122,.9),0 0 0 8px rgba(201,150,58,0)}}
      @media(max-width:650px){.br-launch{left:12px;bottom:14px;padding:5px 13px 5px 5px;font-size:12.5px}.br-launch small{display:none}}
      @media(prefers-reduced-motion:reduce){.br-launch{animation:none}}`;
    document.head.append(launchStyle);
    document.body.insertAdjacentHTML('beforeend', `
      <button class="br-launch" id="wheelLaunch" type="button" aria-label="Play Bone Run and win a free treat"><span class="br-medal" aria-hidden="true">🦴</span><span class="br-txt">Play &amp; win a treat<small>Bone Run · free treats up to Mackerel</small></span></button>`);

    // Let visitors orient themselves, then invite first-time visitors to play.
    // The modal is opened once per browser session; the small launcher remains
    // available afterwards for anyone who closes it and wants to return.
    // Do not mark it as shown until the wheel is actually available and opened:
    // the wheel script intentionally loads after the page so marking it earlier
    // could permanently suppress the prompt on a slow connection.
    const launch = document.querySelector('#wheelLaunch');
    const autoOpenKey = 'gob-wheel-auto-opened-v2';
    const revealWheel = () => launch?.classList.add('is-ready');
    const openWheelOnce = () => {
      revealWheel();
      if (sessionStorage.getItem(autoOpenKey)) return;
      const open = () => {
        if (sessionStorage.getItem(autoOpenKey) || typeof window.GOB_openSpinWheel !== 'function') return;
        window.GOB_openSpinWheel();
        sessionStorage.setItem(autoOpenKey, '1');
      };
      if (typeof window.GOB_openSpinWheel === 'function') open();
      else document.addEventListener('gob:wheel-ready', open, { once: true });
    };
    // Bone Run opens for every visitor 20 seconds after landing, once per
    // browser session. The launcher stays available afterwards.
    window.setTimeout(openWheelOnce, 20_000);
    document.addEventListener('mouseout', event => {
      if (event.relatedTarget || event.clientY > 0) return;
      revealWheel();
    }, { once: true });

    // The wheel module is deliberately non-critical. Start loading it only
    // after the page itself is interactive, but always mount it on both the
    // homepage and product landing pages before its 15–20 second prompt.
    const loadWheelGame = () => {
      if (document.querySelector('script[data-gob-wheel-game]')) return;
      const script = document.createElement('script');
      script.dataset.gobWheelGame = 'true';
      script.src = 'bone-run.js?v=4';
      document.body.append(script);
    };
    const scheduleWheelLoad = () => {
      if ('requestIdleCallback' in window) requestIdleCallback(loadWheelGame, { timeout: 2500 });
      else window.setTimeout(loadWheelGame, 1200);
    };
    if (document.readyState === 'complete') scheduleWheelLoad();
    else window.addEventListener('load', scheduleWheelLoad, { once: true });
  }

  function addHomeExtras() {
    document.querySelector('.hero .proof')?.insertAdjacentHTML('afterend', `
      <aside class="home-sale-note" aria-label="Current sale details">
        <strong>Sale prices are already included.</strong>
        <span>10% off treats · 15% off Whole Mackerel · plus ₹30 off when you pay online.</span>
      </aside>`);
    const target = document.querySelector('.subscribe');
    target?.insertAdjacentHTML('beforebegin', `
      <section class="conversion-block">
        <div class="compare-grid">
          <div><p class="eyebrow">The label check</p><h2>Game of Bones</h2><ul><li>One named ingredient per treat</li><li>No filler, artificial colour or flavour listed</li><li>Slow-dehydrated for a simple treat routine</li></ul></div>
          <div><p class="eyebrow">Typical processed treats</p><h2>More to decode.</h2><ul><li>Ingredient lists can include binders and flavour systems</li><li>Processing and formulation vary by brand</li><li>Always read the current pouch label</li></ul></div>
        </div>
        <div class="bundle-cta"><div><p class="eyebrow">First order, made easy</p><h2>Build a treat box they’ll remember.</h2></div><a class="button" href="bundles.html">Build your bundle</a></div>
      </section>`);
  }

  function addProductExtras() {
    const buyRow = document.querySelector('.buy-row');
    buyRow?.insertAdjacentHTML('afterend', `
      <section class="paid-traffic-promise" aria-label="Order reassurance">
        <span><b>Sale price applied</b><small>No code needed</small></span>
        <span><b>Free shipping</b><small>Across India</small></span>
        <span><b>₹30 off prepaid</b><small>UPI, cards & wallets</small></span>
      </section>
      <section class="quick-review-proof" id="quickReviewProof" aria-live="polite">
        <span class="quick-review-stars" aria-hidden="true">★★★★★</span>
        <span><b>Verified dog-parent reviews</b><small>Loading product feedback…</small></span>
        <a href="#productReviewSection">Read reviews</a>
      </section>
      <button class="wish-btn" id="wishBtn">Sign in to save favourites</button>`);
    document.querySelector('#wishBtn')?.addEventListener('click', () => location.assign('login.html'));

    document.querySelector('.accordion')?.insertAdjacentHTML('afterend', `
      <section class="review-box" id="productReviewSection" aria-labelledby="reviewFlowTitle">
        <p class="eyebrow">Notes from dog parents</p>
        <h2 id="reviewFlowTitle">Verified reviews, from real treat time.</h2>
        <p class="review-intro">Only customers with a paid, delivered order can write a review. Reviews appear here after moderation.</p>
        <div id="productReviewFeed" class="product-review-feed" aria-live="polite"><p>Loading verified reviews…</p></div>
        <div class="reward-review">Bought this treat? <a href="/account">Sign in to review your delivered items</a> · 100 points for an approved review, or 150 with a photo of your dog.</div>
      </section>`);
    const renderReviews = async () => {
      const name = document.querySelector('#productName')?.textContent?.trim();
      const feed = document.querySelector('#productReviewFeed'); if (!name || !feed || !window.GOB_API?.publicProductReviews) return;
      const quickProof = document.querySelector('#quickReviewProof');
      feed.innerHTML = '<p>Loading verified reviews…</p>';
      try {
        const data = await window.GOB_API.publicProductReviews(name), rows = Array.isArray(data.reviews) ? data.reviews : [];
        const stars = value => '★'.repeat(Math.max(0, Math.min(5, Number(value) || 0))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, Number(value) || 0)));
        if (quickProof) {
          const firstReview = String(rows[0]?.review || '').replace(/\s+/g, ' ').trim();
          const safeExcerpt = firstReview.replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
          quickProof.innerHTML = rows.length
            ? `<span class="quick-review-stars" aria-hidden="true">${stars(Math.round(Number(data.average_rating || 0)))}</span><span><b>${Number(data.average_rating || 0).toFixed(1)} from verified dog parents</b><small>${safeExcerpt.slice(0, 96)}${safeExcerpt.length > 96 ? '…' : ''}</small></span><a href="#productReviewSection">Read ${data.review_count} review${Number(data.review_count) === 1 ? '' : 's'}</a>`
            : '<span class="quick-review-stars" aria-hidden="true">★★★★★</span><span><b>Verified purchase reviews</b><small>Feedback is published after moderation.</small></span><a href="#productReviewSection">Learn more</a>';
        }
        feed.innerHTML = rows.length ? `<div class="review-summary"><strong>${Number(data.average_rating || 0).toFixed(1)} / 5</strong><span aria-label="${Number(data.average_rating || 0)} out of 5 stars">${stars(Math.round(Number(data.average_rating || 0)))}</span><small>${data.review_count} verified review${Number(data.review_count) === 1 ? '' : 's'}</small></div><div class="public-review-list">${rows.map(row => `<article class="public-review"><div><strong>${String(row.name || 'Verified dog parent')}</strong><span aria-label="${Number(row.rating || 0)} out of 5 stars">${stars(row.rating)}</span></div><p>${String(row.review || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char])}</p>${row.photo_url ? `<img src="${String(row.photo_url)}" alt="A dog enjoying ${name}" loading="lazy">` : ''}</article>`).join('')}</div>` : '<p class="review-empty">Be the first verified dog parent to share a note about this treat.</p>';
      } catch {
        if (quickProof) quickProof.innerHTML = '<span class="quick-review-stars" aria-hidden="true">★★★★★</span><span><b>Verified purchase reviews</b><small>Reviews are shown after moderation.</small></span><a href="#productReviewSection">Learn more</a>';
        feed.innerHTML = '<p class="review-empty">Reviews are temporarily unavailable. Please check back soon.</p>';
      }
    };
    renderReviews();
    document.addEventListener('gob:product-ready', renderReviews);
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureStyles();
    addWheelPrompt();
    const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
    if (isHome) addHomeExtras();
    if (document.querySelector('#addProduct')) addProductExtras();
  });
})();
