/* Cart page conversion helpers.
   1. The "save your bowl" box becomes a WhatsApp offer: sharing a number
      takes ₹50 off automatically (CART50, first order only, once per
      customer) and saves the bowl for a reminder.
   2. The total and checkout button sit above that box, so shoppers see the
      way forward before an invitation to leave.
   3. Phones get a sticky checkout bar while the checkout button is off screen.
   4. Reassurance (shipping, payment, quality, returns) sits next to the button.
   Contact details are still only sent when the shopper submits the form. */
(() => {
  // `cart` and `commerceProduct` are top-level declarations in the storefront
  // scripts, so they are global names but NOT properties of window.
  // (Reading window.cart made the old save form always say the bag was empty.)
  const cartLines = () => { try { return typeof cart === 'function' ? cart() : []; } catch (_) { return []; } };
  const productFor = line => line.product || (typeof commerceProduct === 'function' ? commerceProduct(line) : null) || (typeof GOB_PRODUCTS !== 'undefined' ? GOB_PRODUCTS[line.id] : null);
  const form = document.querySelector('#cartSaveForm');
  const save = document.querySelector('.cart-save');
  const total = document.querySelector('.order-row.total');
  const checkout = document.querySelector('#checkoutLink');
  const assurance = document.querySelector('.cart-assurance');

  const style = document.createElement('style');
  style.textContent = `
.cart-save .cart-offer-code{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px}
.cart-save .cart-offer-code b{font-size:18px;letter-spacing:.08em;padding:6px 12px;border:1px dashed currentColor;background:#fff}
.cart-save .cart-offer-code button{padding:8px 14px;font-size:13px}
.cart-assurance.cart-assurance-list{display:block;margin:14px 0 18px;padding:0;list-style:none;font-size:13px;line-height:1.5}
.cart-assurance-list li{display:flex;gap:8px;align-items:flex-start;padding:4px 0}
.cart-assurance-list li::before{content:"✓";font-weight:700;color:var(--gold,#a8681c)}
.cart-sticky-checkout{display:none}
@media (max-width:760px){
  .cart-sticky-checkout{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;align-items:center;gap:12px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:var(--paper,#fffdf8);border-top:1px solid rgba(16,44,34,.15);box-shadow:0 -6px 18px rgba(0,0,0,.08);transition:transform .2s ease}
  .cart-sticky-checkout[hidden]{display:flex;transform:translateY(110%)}
  .cart-sticky-checkout .sticky-total{display:flex;flex-direction:column;font-size:12px;line-height:1.2}
  .cart-sticky-checkout .sticky-total strong{font-size:18px}
  .cart-sticky-checkout .button{flex:1;text-align:center;margin:0}
  body.has-cart-sticky{padding-bottom:84px}
}`;
  document.head.append(style);

  // 2. Total and checkout button before the offer box.
  if (save && total && checkout) {
    save.before(total);
    save.before(checkout);
  }

  // 4. Reassurance right under the checkout button.
  if (checkout) {
    const list = document.createElement('ul');
    list.className = 'cart-assurance cart-assurance-list';
    list.setAttribute('aria-label', 'Why order with us');
    list.innerHTML = [
      'Free shipping on every order · dispatched within 1–2 business days',
      'Pay by UPI, card or Cash on Delivery (most PIN codes)',
      'Single-ingredient treats made in Kalyan · loved by verified dog parents',
      'Wrong or damaged pack? Tell us within 48 hours and we will make it right',
    ].map(text => `<li>${text}</li>`).join('');
    checkout.after(list);
    assurance?.remove();
  }

  // 3. Sticky checkout bar for phones.
  if (checkout) {
    const bar = document.createElement('div');
    bar.className = 'cart-sticky-checkout';
    bar.hidden = true;
    bar.innerHTML = '<span class="sticky-total">Total<strong data-sticky-total>₹0</strong></span><a class="button" href="/checkout">Secure checkout</a>';
    document.body.append(bar);
    const source = document.querySelector('[data-commerce-total]');
    const sync = () => {
      const target = bar.querySelector('[data-sticky-total]');
      if (source && target && target.textContent !== source.textContent) target.textContent = source.textContent;
      const empty = !cartLines().length;
      bar.style.visibility = empty ? 'hidden' : '';
    };
    sync();
    if (source) new MutationObserver(sync).observe(source, { childList: true, characterData: true, subtree: true });
    document.addEventListener('gob:cart-updated', sync);
    // Show the bar whenever the real checkout button is not on screen.
    let queued = false;
    const update = () => {
      queued = false;
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const rect = checkout.getBoundingClientRect();
      const buttonVisible = rect.top < window.innerHeight - 8 && rect.bottom > 0;
      bar.hidden = !mobile || buttonVisible;
      document.body.classList.toggle('has-cart-sticky', mobile && !buttonVisible);
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
    setTimeout(update, 600);
  }

  // 1. WhatsApp offer.
  if (!form) return;
  const email = form.querySelector('[name="email"]');
  const phone = form.querySelector('[name="phone"]');
  const status = document.querySelector('#cartSaveStatus');
  const button = form.querySelector('button[type="submit"]');
  const setCopy = (eyebrowText, titleText, introText) => {
    if (!save) return;
    const eyebrow = save.querySelector('.eyebrow');
    const title = save.querySelector('h3');
    const intro = save.querySelector('p:not(.eyebrow):not(.cart-save-status)');
    if (eyebrow) eyebrow.textContent = eyebrowText;
    if (title) title.textContent = titleText;
    if (intro) intro.textContent = introText;
  };
  setCopy('First order? ₹50 off', 'Get ₹50 off this order.', 'Add your WhatsApp number and ₹50 comes off your bag automatically. For first orders, once per customer. You agree to a reminder or two about this bag on WhatsApp (reply STOP anytime).');
  if (email) email.hidden = true;
  if (phone) phone.placeholder = 'WhatsApp number (10 digits)';
  if (button) button.textContent = 'Get ₹50 off';

  const message = (text, kind = '') => { if (!status) return; status.textContent = text; status.className = `cart-save-status ${kind}`; };
  const refreshTotals = () => { if (typeof updateCommerceTotals === 'function') updateCommerceTotals(); };
  const lines = () => cartLines().map(line => {
    const product = productFor(line);
    return product ? { name: product.name, pack_label: product.packLabel || '', quantity: Number(line.quantity) || 1, price: Number(product.price) || 0 } : null;
  }).filter(Boolean);

  const showApplied = () => {
    form.hidden = false;
    form.querySelectorAll('input,button').forEach(el => { el.hidden = true; });
    setCopy('Offer unlocked', '₹50 off is applied to your bag.', 'It will show at checkout. We confirm it with your mobile number at payment, as it is for first orders.');
    message('₹50 off applied ✓', 'success');
  };
  const claimed = () => (typeof cartOfferClaimed === 'function' ? cartOfferClaimed() : false);
  if (claimed()) showApplied();

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const normalizedEmail = String(email?.value || '').trim().toLowerCase();
    const normalizedPhone = String(phone?.value || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    const validPhone = /^[6-9]\d{9}$/.test(normalizedPhone);
    if (!validPhone) return message('Enter a valid 10-digit WhatsApp number to get ₹50 off.', 'error');
    const items = lines();
    if (!items.length) return message('Add a treat first, then unlock your ₹50 off.', 'error');
    const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (!window.GOB_API?.abandonedCart) return message('We could not unlock this right now. Please try again.', 'error');
    button.disabled = true; button.textContent = 'Checking…';
    try {
      const rawLines = cartLines().map(line => { const product = productFor(line); return { id: line.id, quantity: Number(line.quantity) || 1, product: product ? { name: product.name, price: Number(product.price) || 0, packLabel: product.packLabel || '', tag: product.tag || '', catalog_slug: product.catalog_slug || '', image: product.image || '' } : null }; });
      const response = await window.GOB_API.abandonedCart({ offer: 'CART50', cart_token: window.GOB_CART_TRACKING?.token?.(), whatsapp_opt_in: true, cart_lines: rawLines, email: validEmail ? normalizedEmail : '', phone: normalizedPhone, items, total: totalValue });
      const offer = response && response.cart_offer;
      if (!offer) { message('We saved your bag but could not check the offer. Please try again.', 'error'); return; }
      if (!offer.eligible) {
        if (typeof setCartOfferClaim === 'function') setCartOfferClaim(false);
        form.reset();
        message('Thanks, your bag is saved. This number has ordered with us before, so the first-order ₹50 offer does not apply — but you still save ₹30 when you pay online.', '');
        refreshTotals();
        return;
      }
      if (typeof setCartOfferClaim === 'function') setCartOfferClaim(true);
      form.reset();
      refreshTotals();
      showApplied();
    } catch (_) { message('We could not unlock this right now. Please try again.', 'error'); }
    finally { button.disabled = false; if (!claimed()) button.textContent = 'Get ₹50 off'; }
  });
})();
