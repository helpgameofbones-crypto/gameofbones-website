/* The new checkout calls the existing API. It does not store PII in browser
   storage; the server encrypts order data before writing it to Supabase. */
(() => {
  const POINT_VALUE_RUPEES = .3, MAX_POINTS_DISCOUNT_RUPEES = 100, MAX_REDEMPTION_POINTS = Math.floor(MAX_POINTS_DISCOUNT_RUPEES / POINT_VALUE_RUPEES);
  // Match active private-offer families for the client-side preview. The
  // server validates every code and computes the final payable amount.
  const privateOfferRate = code => /^SAVE10-[A-Z0-9]+$/.test(code) || code === 'GOBFAMILY10' ? .1 : /^BDAY[A-Z0-9]+$/.test(code) || code === 'PAWTY25' ? .25 : 0;
  const form = document.querySelector('#checkoutForm');
  if (!form || !window.GOB_API) return;
  const get = selector => form.querySelector(selector)?.value.trim() || '';
  const phone = () => get('[autocomplete="tel"]').replace(/\D/g, '').replace(/^91/, '');
  const fullName = () => [get('[autocomplete="given-name"]'), get('[autocomplete="family-name"]')].filter(Boolean).join(' ');
  const items = () => cart().map(line => {
    // Keep the product snapshot that was added to the cart. Catalogue edits
    // must not silently change a customer's item, title or price at checkout.
    const product = line.product || GOB_PRODUCTS[line.id];
    if (!product) return null;
    // Cart snapshots can outlive catalogue edits. Only send a pack label when
    // the current catalogue entry explicitly provides one; never resurrect a
    // legacy label from an old localStorage snapshot.
    const name = String(product.name || '').replace(/\s+—\s+.+$/, '').trim();
    const explicitPackLabel = typeof product.packLabel === 'string' ? product.packLabel.trim() : '';
    // Product pages label dynamically chosen packs in `tag` (for example,
    // "Jerky · 120 g"). Preserve that canonical pack detail in checkout.
    const taggedPackLabel = typeof product.tag === 'string' && product.tag.includes(' · ')
      ? product.tag.split(' · ').pop().trim()
      : '';
    // Pack chosen on the product page is also kept in the name ("Whole Quail — 4 pieces").
    const namedPackLabel = (String(product.name || '').match(/\s+—\s+(.+)$/) || [])[1] || '';
    const packLabel = explicitPackLabel || namedPackLabel.trim() || (taggedPackLabel === 'Pack' ? '' : taggedPackLabel);
    const catalog_id = window.GOB_META?.productId?.(product, line.id) || String(product.catalog_slug || line.id || '');
    const unitPrice = Number(product.price);
    const quantity = Number(line.quantity);
    return { name, catalog_id, pack_label: packLabel, size: packLabel, price: unitPrice, pack_price: unitPrice, unit_price: unitPrice, line_total: unitPrice * quantity, quantity, qty: quantity };
  }).filter(Boolean);
  const subtotal = () => items().reduce((sum, item) => sum + item.price * item.quantity, 0);
  const method = () => form.querySelector('[name="payment"]:checked')?.value === 'cod' ? 'cod' : 'online';
  const address = () => ['street-address', 'address-line2', 'address-level2', 'address-level1', 'postal-code'].map(name => get(`[autocomplete="${name}"]`)).filter(Boolean).join(', ');
  const addressDetails = () => ({ line1: get('[autocomplete="street-address"]'), line2: get('[autocomplete="address-line2"]'), city: get('[autocomplete="address-level2"]'), state: get('[autocomplete="address-level1"]'), pincode: get('[autocomplete="postal-code"]') });
  const dog = () => ({ name: get('[name="dog_name"]'), birthday: get('[name="dog_birthday"]') });
  const reference = () => `GOB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const missingFields = () => {
    const missing = [];
    if (!get('[autocomplete="given-name"]') || !get('[autocomplete="family-name"]')) missing.push('name');
    if (!/^\d{10}$/.test(phone())) missing.push('10-digit mobile number');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get('[autocomplete="email"]'))) missing.push('email');
    if (!get('[autocomplete="street-address"]') || !get('[autocomplete="address-level2"]') || !get('[autocomplete="address-level1"]')) missing.push('delivery address');
    if (!/^\d{6}$/.test(get('[autocomplete="postal-code"]'))) missing.push('6-digit PIN code');
    if (!items().length) missing.push('at least one treat');
    return missing;
  };
  const valid = () => missingFields().length === 0;
  const saleBasket = () => cart().some(line => { const product = line.product || GOB_PRODUCTS[line.id]; return Number(product?.comparePrice) > Number(product?.price); });
  const total = () => {
    const value = subtotal();
    const privateCoupon = form.querySelector('[name="private_coupon"]')?.value.trim().toUpperCase() || '', coupon = privateCoupon || form.querySelector('[name="coupon"]:checked')?.value || '', eligibility = window.GOB_CHECKOUT_ELIGIBILITY || {};
    // Catalogue sale pricing may be combined with one valid code and loyalty
    // points; no separate buy-more discount is active during this sale.
    // WELCOME15 needs no login: the server checks this mobile/email has not ordered before.
    const couponRate = coupon === 'WELCOME15' && !(eligibility.signedIn && !eligibility.checking && !eligibility.firstOrder) ? .15 : coupon === 'MEGA20' && value >= 2199 ? .2 : privateOfferRate(coupon);
    const discount = Math.round(value * couponRate);
    const requestedPoints = Math.floor(Number(form.querySelector('[name="loyalty_points_redeemed"]')?.value || 0));
    const points = eligibility.signedIn ? Math.min(Math.max(requestedPoints, 0), MAX_REDEMPTION_POINTS, Number(eligibility.points || 0)) : 0;
    const pointsDiscount = Math.min(MAX_POINTS_DISCOUNT_RUPEES, Math.round(points * POINT_VALUE_RUPEES)), cod = method() === 'cod' ? 40 : -30;
    // Private codes are validated authoritatively by the checkout server.
    // Preserve the entered code even when the browser cannot know its rate;
    // this lets off-site customer codes work without advertising them here.
    return { value, discount, points, coupon: privateCoupon || (couponRate ? coupon : ''), grand: Math.max(1, value - discount - pointsDiscount + cod) };
  };
  const result = (html, failed = false) => { const el = document.querySelector('#checkoutSuccess'); if (!el) return; el.classList.add('show'); el.style.background = failed ? '#f9e1da' : '#e4ebdf'; el.innerHTML = html; el.focus(); };
  const completeOrder = (ref, payment) => {
    window.location.assign(`/thank-you?${new URLSearchParams({ order: ref, payment }).toString()}`);
  };
  // Meta signals for the server-side Purchase event. _fbp/_fbc are Meta's own
  // first-party cookies; they let Meta attribute the order to the ad click.
  const cookie = key => document.cookie.split('; ').find(part => part.startsWith(`${key}=`))?.slice(key.length + 1) || '';
  const metaSignals = () => {
    let fbc = cookie('_fbc');
    if (!fbc) { try { const saved = JSON.parse(sessionStorage.getItem('gob-fbclid') || 'null'); if (saved?.id) fbc = `fb.1.${saved.ts}.${saved.id}`; } catch (_) {} }
    return { fbp: cookie('_fbp'), fbc, event_source_url: `${location.origin}${location.pathname}`, client_user_agent: navigator.userAgent.slice(0, 250) };
  };
  const analyticsItems = () => items().map(item => ({ item_id: item.catalog_id || item.name, item_name: item.name, price: item.price, quantity: item.quantity }));
  const metaContents = orderItems => orderItems.map(item => ({ id: item.catalog_id || item.name, quantity: item.quantity, item_price: item.price }));
  const metaContentIds = orderItems => metaContents(orderItems).map(item => item.id).filter(Boolean);
  if (items().length) window.GOB_ANALYTICS?.track('begin_checkout', { currency: 'INR', value: subtotal(), items: analyticsItems() });
  let captureTimer, captureSent = false;
  const marketingConsent = () => form.querySelector('[name="marketing_consent"]')?.checked === true;
  const whatsappOptIn = () => form.querySelector('[name="whatsapp_opt_in"]')?.checked === true;
  // Exact bag lines so a WhatsApp reminder link can rebuild this bag.
  const cartLines = () => cart().map(line => ({ id: line.id, quantity: line.quantity, product: line.product ? { name: line.product.name, price: line.product.price, packLabel: line.product.packLabel || '', tag: line.product.tag || '', catalog_slug: line.product.catalog_slug || '', image: line.product.image || '' } : null }));
  const policyAcknowledged = () => form.querySelector('[name="checkout_policy_acknowledged"]')?.checked === true;
  const noticeVersion = () => get('[name="privacy_notice_version"]') || '2026-09-14';
  async function capture() { if (captureSent || !valid()) return; captureSent = true; try { await window.GOB_API.abandonedCart({ cart_token: window.GOB_CART_TRACKING?.token?.(), whatsapp_opt_in: whatsappOptIn(), cart_lines: cartLines(), phone: phone(), email: get('[autocomplete="email"]'), name: fullName(), items: items(), total: subtotal() }); } catch (_) { /* Do not retry every keystroke after a server-side rate limit. */ } }
  form.addEventListener('input', () => { clearTimeout(captureTimer); captureTimer = setTimeout(capture, 1800); });
  form.querySelector('[name="whatsapp_opt_in"]')?.addEventListener('change', () => { captureSent = false; clearTimeout(captureTimer); captureTimer = setTimeout(capture, 600); });
  async function save(ref, transactionId = '') { const pricing = total(), orderItems = items(); const response = await window.GOB_API.saveOrder({ ref, whatsapp_opt_in: whatsappOptIn(), customer_name: fullName(), customer_phone: phone(), customer_email: get('[autocomplete="email"]'), items: orderItems, subtotal: pricing.value, total_amount: pricing.value, shipping: 0, discount: pricing.discount, grand_total: pricing.grand, payment_method: method() === 'cod' ? 'cod' : 'razorpay', transaction_id: transactionId || null, shipping_address: address(), address_details: addressDetails(), dog: dog(), coupon_code: pricing.coupon || null, loyalty_points_redeemed: pricing.points, packaging: method() === 'cod' ? 40 : 0, marketing_consent: marketingConsent(), checkout_policy_acknowledged: policyAcknowledged(), privacy_notice_version: noticeVersion(), meta: metaSignals() }); window.GOB_META?.track('Purchase',{currency:'INR',value:pricing.grand,content_type:'product',content_ids:metaContentIds(orderItems),contents:metaContents(orderItems)},ref); const purchaseEvent={transaction_id:ref,currency:'INR',value:pricing.grand,coupon:pricing.coupon||undefined,items:analyticsItems()}; if(window.GOB_ANALYTICS?.trackAndWait)await window.GOB_ANALYTICS.trackAndWait('purchase',purchaseEvent);else window.GOB_ANALYTICS?.track('purchase',purchaseEvent); return response; }
  function razorpayScript() { if (window.Razorpay) return Promise.resolve(); return new Promise((resolve, reject) => { const tag = document.createElement('script'); tag.src = 'https://checkout.razorpay.com/v1/checkout.js'; tag.onload = resolve; tag.onerror = reject; document.head.append(tag); }); }
  async function prepaid(ref, pricing) { const serializedItems = JSON.stringify(items()); const order = await window.GOB_API.createRazorpayOrder({ items: items(), payment_method: 'online', coupon_code: pricing.coupon, loyalty_points_redeemed: pricing.points, receipt: ref, notes: { ref, order_ref: ref, customer_name: fullName(), customer_phone: phone(), customer_email: get('[autocomplete="email"]'), items_1: serializedItems.slice(0, 1400), items_2: serializedItems.slice(1400, 2800), items_3: serializedItems.slice(2800, 4200), ...(() => { const meta = metaSignals(), geo = addressDetails(); return { meta_fbp: meta.fbp, meta_fbc: meta.fbc.slice(0, 250), meta_url: meta.event_source_url.slice(0, 250), meta_ua: meta.client_user_agent, ship_geo: [geo.city, geo.state, geo.pincode].join('|').slice(0, 250) }; })() } }); await razorpayScript(); return new Promise((resolve, reject) => new window.Razorpay({ key: order.key, amount: order.amount, currency: order.currency, name: 'Game of Bones', description: 'Natural dog treats', order_id: order.order_id, prefill: { name: fullName(), contact: phone(), email: get('[autocomplete="email"]') }, theme: { color: '#bd812a' }, handler: async response => { try { await save(ref, response.razorpay_payment_id); resolve(order.quote); } catch (error) { reject(error); } }, modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) } }).open()); }
  async function delivery(){
    const pin=get('[autocomplete="postal-code"]')
    const result=await window.GOB_PINCODE_CHECKER?.(pin)
    if(!result?.serviceable) throw new Error('This PIN code is not currently serviceable by Delhivery.')
    if(method()==='cod'&&!result.cod) throw new Error('Cash on Delivery is not available for this PIN code. Please choose online payment.')
    if(method()==='online'&&!result.prepaid) throw new Error('Online payment is not available for this PIN code. Please choose Cash on Delivery.')
    return result
  }
  // Explain what went wrong and offer one-tap fixes instead of a dead end.
  function checkoutFailed(error) {
    const message = String(error?.message || '');
    const cancelled = /cancelled/i.test(message);
    const codeProblem = /code|WELCOME15|MEGA20|offer/i.test(message);
    const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const actions = [];
    if (codeProblem) actions.push('<button type="button" class="button" data-fix="remove-code">Remove code &amp; pay now</button>');
    if (cancelled || !codeProblem) actions.push('<button type="button" class="button secondary" data-fix="cod">Switch to Cash on Delivery</button>');
    const inApp = /Instagram|FBAN|FBAV|FB_IAB/i.test(navigator.userAgent);
    const help = cancelled
      ? (inApp ? 'Payment window closed. If Google Pay or PhonePe did not open inside Instagram, choose <b>UPI ID</b> or <b>QR code</b> in the payment window, or tap ⋯ and <b>Open in browser</b>. You can also pay on delivery.' : 'Payment window closed before paying. Try again, choose another method, or pay on delivery.')
      : esc(message || 'Please try again or select Cash on Delivery.');
    result(`<strong>${cancelled ? 'Payment not completed.' : 'Checkout could not start.'}</strong> ${help}<div class="checkout-fix-row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${actions.join('')}</div>`, true);
    document.querySelectorAll('[data-fix]').forEach(btn => btn.addEventListener('click', () => {
      if (btn.dataset.fix === 'remove-code') {
        const priv = form.querySelector('[name="private_coupon"]'); if (priv) priv.value = '';
        const none = form.querySelector('[name="coupon"][value="none"], [name="coupon"][value=""]'); if (none) none.checked = true; else form.querySelectorAll('[name="coupon"]').forEach(r => { r.checked = false; });
        try { sessionStorage.removeItem('gob-checkout-coupon'); } catch (_) {}
      } else {
        const cod = form.querySelector('[name="payment"][value="cod"]'); if (cod) cod.checked = true;
      }
      form.dispatchEvent(new Event('input', { bubbles: true })); form.dispatchEvent(new Event('change', { bubbles: true }));
      if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, { once: true }));
  }
  form.addEventListener('submit', async event => { event.preventDefault(); if (!valid()) return result('<strong>Checkout needs attention.</strong> Please complete your name, 10-digit mobile number, email, and delivery address.', true); if (!policyAcknowledged()) return result('<strong>Please review the policies.</strong> Confirm the checkout policies before continuing.', true); const button = form.querySelector('[type="submit"]'), ref = reference(), pricing = total(), orderItems = items(); if (button) { button.disabled = true; button.textContent = 'Checking delivery…'; } try { await delivery(); window.GOB_META?.track('InitiateCheckout',{currency:'INR',value:pricing.grand,content_type:'product',content_ids:metaContentIds(orderItems),contents:metaContents(orderItems)}); if (button) button.textContent = 'Preparing secure checkout…'; await capture(); await window.GOB_API.orderAttempt({ ref, customer_name: fullName(), customer_phone: phone(), customer_email: get('[autocomplete="email"]'), payment_method: method() === 'cod' ? 'cod' : 'razorpay', subtotal: pricing.value, grand_total: pricing.grand, items: orderItems, shipping_address: address(), coupon_code: pricing.coupon, coupon_label: pricing.coupon || 'automatic saving' }); if (method() === 'cod') { await save(ref); saveCart([]); updateCart(); completeOrder(ref, 'cod'); } else { await prepaid(ref, pricing); saveCart([]); updateCart(); completeOrder(ref, 'paid'); } } catch (error) { checkoutFailed(error); } finally { if (button) { button.disabled = false; button.textContent = 'Continue to secure payment'; } } });
})();
