/* The new checkout calls the existing API. It does not store PII in browser
   storage; the server encrypts order data before writing it to Supabase. */
(() => {
  const POINT_VALUE_RUPEES = .3, MAX_POINTS_DISCOUNT_RUPEES = 100, MAX_REDEMPTION_POINTS = Math.floor(MAX_POINTS_DISCOUNT_RUPEES / POINT_VALUE_RUPEES);
  const form = document.querySelector('#checkoutForm');
  if (!form || !window.GOB_API) return;
  const get = selector => form.querySelector(selector)?.value.trim() || '';
  const phone = () => get('[autocomplete="tel"]').replace(/\D/g, '').replace(/^91/, '');
  const fullName = () => [get('[autocomplete="given-name"]'), get('[autocomplete="family-name"]')].filter(Boolean).join(' ');
  const items = () => cart().map(line => {
    const product = GOB_PRODUCTS[line.id] || line.product;
    if (!product) return null;
    // Cart snapshots can outlive catalogue edits. Only send a pack label when
    // the current catalogue entry explicitly provides one; never resurrect a
    // legacy label from an old localStorage snapshot.
    const name = String(product.name || '').replace(/\s+—\s+.+$/, '').trim();
    const packLabel = typeof product.packLabel === 'string' ? product.packLabel.trim() : '';
    return { name, pack_label: packLabel, price: Number(product.price), pack_price: Number(product.price), quantity: Number(line.quantity), qty: Number(line.quantity) };
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
  const total = () => {
    const value = subtotal(), count = cartCount(), bulk = count >= 10 ? .15 : count >= 8 ? .12 : count >= 5 ? .08 : count >= 3 ? .05 : 0;
    const coupon = form.querySelector('[name="coupon"]:checked')?.value || '', eligibility = window.GOB_CHECKOUT_ELIGIBILITY || {};
    const couponRate = coupon === 'WELCOME15' && eligibility.signedIn && eligibility.firstOrder ? .15 : coupon === 'MEGA20' && value >= 2199 ? .2 : 0;
    const discount = Math.round(value * Math.max(bulk, couponRate));
    const requestedPoints = Math.floor(Number(form.querySelector('[name="loyalty_points_redeemed"]')?.value || 0));
    const points = eligibility.signedIn ? Math.min(Math.max(requestedPoints, 0), MAX_REDEMPTION_POINTS, Number(eligibility.points || 0)) : 0;
    const pointsDiscount = Math.min(MAX_POINTS_DISCOUNT_RUPEES, Math.round(points * POINT_VALUE_RUPEES)), cod = method() === 'cod' ? 40 : -30;
    return { value, discount, points, coupon: couponRate ? coupon : '', grand: Math.max(1, value - discount - pointsDiscount + cod) };
  };
  const result = (html, failed = false) => { const el = document.querySelector('#checkoutSuccess'); if (!el) return; el.classList.add('show'); el.style.background = failed ? '#f9e1da' : '#e4ebdf'; el.innerHTML = html; el.focus(); };
  const accountFollowUp = () => '<p>Your Game of Bones account is ready. Use this same mobile number at <a href="/login">log in</a> any time to see your order, saved delivery details and rewards.</p>';
  let captureTimer, captureSent = false;
  async function capture() { if (captureSent || !valid()) return; captureSent = true; try { await window.GOB_API.abandonedCart({ phone: phone(), email: get('[autocomplete="email"]'), name: fullName(), items: items(), total: subtotal() }); } catch (_) { captureSent = false; } }
  form.addEventListener('input', () => { clearTimeout(captureTimer); captureTimer = setTimeout(capture, 1800); });
  async function save(ref, transactionId = '') { const pricing = total(); return window.GOB_API.saveOrder({ ref, customer_name: fullName(), customer_phone: phone(), customer_email: get('[autocomplete="email"]'), items: items(), subtotal: pricing.value, total_amount: pricing.value, shipping: 0, discount: pricing.discount, grand_total: pricing.grand, payment_method: method() === 'cod' ? 'cod' : 'razorpay', transaction_id: transactionId || null, shipping_address: address(), address_details: addressDetails(), dog: dog(), coupon_code: pricing.coupon || null, loyalty_points_redeemed: pricing.points, packaging: method() === 'cod' ? 40 : 0 }); }
  function razorpayScript() { if (window.Razorpay) return Promise.resolve(); return new Promise((resolve, reject) => { const tag = document.createElement('script'); tag.src = 'https://checkout.razorpay.com/v1/checkout.js'; tag.onload = resolve; tag.onerror = reject; document.head.append(tag); }); }
  async function prepaid(ref, pricing) { const order = await window.GOB_API.createRazorpayOrder({ items: items(), payment_method: 'online', coupon_code: pricing.coupon, loyalty_points_redeemed: pricing.points, receipt: ref, notes: { ref, customer_name: fullName(), customer_phone: phone(), customer_email: get('[autocomplete="email"]'), items_1: JSON.stringify(items()).slice(0, 1400) } }); await razorpayScript(); return new Promise((resolve, reject) => new window.Razorpay({ key: order.key, amount: order.amount, currency: order.currency, name: 'Game of Bones', description: 'Natural dog treats', order_id: order.order_id, prefill: { name: fullName(), contact: phone(), email: get('[autocomplete="email"]') }, theme: { color: '#bd812a' }, handler: async response => { try { await save(ref, response.razorpay_payment_id); resolve(order.quote); } catch (error) { reject(error); } }, modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) } }).open()); }
  async function delivery(){
    const pin=get('[autocomplete="postal-code"]')
    const result=await window.GOB_PINCODE_CHECKER?.(pin)
    if(!result?.serviceable) throw new Error('This PIN code is not currently serviceable by Delhivery.')
    if(method()==='cod'&&!result.cod) throw new Error('Cash on Delivery is not available for this PIN code. Please choose online payment.')
    if(method()==='online'&&!result.prepaid) throw new Error('Online payment is not available for this PIN code. Please choose Cash on Delivery.')
    return result
  }
  form.addEventListener('submit', async event => { event.preventDefault(); if (!valid()) return result('<strong>Checkout needs attention.</strong> Please complete your name, 10-digit mobile number, email, and delivery address.', true); const button = form.querySelector('[type="submit"]'), ref = reference(), pricing = total(); if (button) { button.disabled = true; button.textContent = 'Checking delivery…'; } try { await delivery(); if (button) button.textContent = 'Preparing secure checkout…'; await capture(); await window.GOB_API.orderAttempt({ ref, customer_name: fullName(), customer_phone: phone(), customer_email: get('[autocomplete="email"]'), payment_method: method() === 'cod' ? 'cod' : 'razorpay', subtotal: pricing.value, grand_total: pricing.grand, items: items(), shipping_address: address(), coupon_code: pricing.coupon, coupon_label: pricing.coupon || 'automatic saving' }); if (method() === 'cod') { const saved=await save(ref); const confirmedTotal=Number(saved?.order?.[0]?.grand_total ?? pricing.grand); saveCart([]); updateCart(); result(`<strong>Order ${ref} confirmed.</strong> Pay ₹${confirmedTotal.toLocaleString('en-IN')} when it reaches your door.${accountFollowUp()}`); } else { await prepaid(ref, pricing); saveCart([]); updateCart(); result(`<strong>Payment received for ${ref}.</strong> We’ll send confirmation to ${get('[autocomplete="email"]')}.${accountFollowUp()}`); } } catch (error) { result(`<strong>Checkout could not start.</strong> ${error?.message || 'Please try again or select Cash on Delivery.'}`, true); } finally { if (button) { button.disabled = false; button.textContent = 'Continue to secure payment'; } } });
})();
