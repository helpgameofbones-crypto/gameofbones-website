(() => {
  function ensureStyles() {
    if (document.querySelector('link[href^="conversion-extras.css"]')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'conversion-extras.css?v=review-flow-2';
    document.head.append(stylesheet);
    const reviewStyles = document.createElement('link');
    reviewStyles.rel = 'stylesheet';
    reviewStyles.href = 'review-public.css?v=verified-reviews-1';
    document.head.append(reviewStyles);
  }

  function addHomeExtras() {
    const target = document.querySelector('.subscribe');
    target?.insertAdjacentHTML('beforebegin', `
      <section class="conversion-block">
        <div class="compare-grid">
          <div><p class="eyebrow">The label check</p><h2>Game of Bones</h2><ul><li>One named ingredient per treat</li><li>No filler, artificial colour or flavour listed</li><li>Slow-dehydrated for a simple treat routine</li></ul></div>
          <div><p class="eyebrow">Typical processed treats</p><h2>More to decode.</h2><ul><li>Ingredient lists can include binders and flavour systems</li><li>Processing and formulation vary by brand</li><li>Always read the current pouch label</li></ul></div>
        </div>
        <div class="bundle-cta"><div><p class="eyebrow">First order, made easy</p><h2>Build a treat box they’ll remember.</h2></div><a class="button" href="bundles.html">Build your bundle</a></div>
      </section>`);

    document.body.insertAdjacentHTML('beforeend', `
      <button class="wheel-launch" id="wheelLaunch">Spin<br>to win</button>
      <div class="wheel-modal" id="wheelModal">
        <div class="wheel-card">
          <button class="wheel-close" data-wheel-close aria-label="Close spin to win">×</button>
          <p class="eyebrow">New here?</p>
          <h2>Spin for your first treat.</h2>
          <p>Enter your details to reveal a welcome offer.</p>
          <form id="wheelForm"></form>
        </div>
      </div>`);
  }

  function addProductExtras() {
    const buyRow = document.querySelector('.buy-row');
    buyRow?.insertAdjacentHTML('afterend', '<button class="wish-btn" id="wishBtn">Save to wishlist</button>');
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
      feed.innerHTML = '<p>Loading verified reviews…</p>';
      try {
        const data = await window.GOB_API.publicProductReviews(name), rows = Array.isArray(data.reviews) ? data.reviews : [];
        const stars = value => '★'.repeat(Math.max(0, Math.min(5, Number(value) || 0))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, Number(value) || 0)));
        feed.innerHTML = rows.length ? `<div class="review-summary"><strong>${Number(data.average_rating || 0).toFixed(1)} / 5</strong><span aria-label="${Number(data.average_rating || 0)} out of 5 stars">${stars(Math.round(Number(data.average_rating || 0)))}</span><small>${data.review_count} verified review${Number(data.review_count) === 1 ? '' : 's'}</small></div><div class="public-review-list">${rows.map(row => `<article class="public-review"><div><strong>${String(row.name || 'Verified dog parent')}</strong><span aria-label="${Number(row.rating || 0)} out of 5 stars">${stars(row.rating)}</span></div><p>${String(row.review || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char])}</p>${row.photo_url ? `<img src="${String(row.photo_url)}" alt="A dog enjoying ${name}" loading="lazy">` : ''}</article>`).join('')}</div>` : '<p class="review-empty">Be the first verified dog parent to share a note about this treat.</p>';
      } catch { feed.innerHTML = '<p class="review-empty">Reviews are temporarily unavailable. Please check back soon.</p>'; }
    };
    renderReviews();
    document.addEventListener('gob:product-ready', renderReviews);
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureStyles();
    const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
    if (isHome) addHomeExtras();
    if (document.querySelector('#addProduct')) addProductExtras();
  });
})();
