(() => {
  function ensureStyles() {
    if (document.querySelector('link[href^="conversion-extras.css"]')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'conversion-extras.css?v=review-flow-2';
    document.head.append(stylesheet);
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
      <section class="review-box" aria-labelledby="reviewFlowTitle">
        <p class="eyebrow">Love this treat?</p>
        <h2 id="reviewFlowTitle">Leave a review, earn 50 points.</h2>
        <p>Verified purchasers receive a review invitation by email after their order is delivered. Reviews are published only after moderation, and 50 points are added once your review is approved.</p>
        <div class="reward-review">Already ordered? Check the email address used at checkout for your invitation.</div>
      </section>`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureStyles();
    const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
    if (isHome) addHomeExtras();
    if (document.querySelector('#addProduct')) addProductExtras();
  });
})();
