/* The shopper chooses when to share contact details. Anonymous cart telemetry
   remains anonymous until this form is submitted or checkout begins. */
(() => {
  const form = document.querySelector('#cartSaveForm');
  if (!form) return;
  const email = form.querySelector('[name="email"]');
  const phone = form.querySelector('[name="phone"]');
  const status = document.querySelector('#cartSaveStatus');
  const button = form.querySelector('button[type="submit"]');
  const message = (text, kind = '') => { if (!status) return; status.textContent = text; status.className = `cart-save-status ${kind}`; };
  const lines = () => (window.cart?.() || []).map(line => {
    const product = line.product || window.GOB_PRODUCTS?.[line.id];
    return product ? { name: product.name, pack_label: product.packLabel || '', quantity: Number(line.quantity) || 1, price: Number(product.price) || 0 } : null;
  }).filter(Boolean);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const normalizedEmail = String(email?.value || '').trim().toLowerCase();
    const normalizedPhone = String(phone?.value || '').replace(/\D/g, '').replace(/^91/, '');
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    const validPhone = /^\d{10}$/.test(normalizedPhone);
    if (!validEmail && !validPhone) return message('Add a valid email or 10-digit WhatsApp number to save your bowl.', 'error');
    const items = lines();
    if (!items.length) return message('Add a treat first, then we can save your bowl.', 'error');
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (!window.GOB_API?.abandonedCart) return message('We could not save this right now. Please try again.', 'error');
    button.disabled = true; button.textContent = 'Saving…';
    try {
      await window.GOB_API.abandonedCart({ cart_token: window.GOB_CART_TRACKING?.token?.(), email: validEmail ? normalizedEmail : '', phone: validPhone ? normalizedPhone : '', items, total });
      message('Saved. Your bowl will be waiting when you are ready.', 'success');
      form.reset();
    } catch (_) { message('We could not save this right now. Please try again.', 'error'); }
    finally { button.disabled = false; button.textContent = 'Save my bowl'; }
  });
})();
