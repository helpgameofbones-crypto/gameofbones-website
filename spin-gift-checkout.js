/* Spin-to-win free treat: tell the customer at the end of checkout whether
   their free treat is included, or how much more to add to unlock it.
   The server decides the gift (admin lib/spin-gifts.ts); this is only a
   helpful preview that reads the spin result saved on this device. */
(() => {
  const MIN_ORDER = 499;
  const form = document.querySelector('#checkoutForm');
  if (!form) return;

  const style = document.createElement('style');
  style.textContent = `
.spin-gift-note{margin:0 0 14px;padding:12px 14px;border:1px solid var(--ink,#102c22);background:var(--gold-soft,#f4e6c9);color:var(--ink,#102c22);font-size:13px;line-height:1.45}
.spin-gift-note strong{display:block;margin-bottom:2px;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.spin-gift-note.is-unlocked{background:#e4ebdf}`;
  document.head.append(style);

  const note = document.createElement('div');
  note.className = 'spin-gift-note';
  note.setAttribute('role', 'status');
  note.setAttribute('aria-live', 'polite');
  const submit = form.querySelector('[type="submit"]');
  (submit || form.lastElementChild)?.before(note);

  const value = selector => form.querySelector(selector)?.value.trim() || '';
  const rupees = amount => `₹${Math.round(amount).toLocaleString('en-IN')}`;

  function subtotal() {
    try {
      const lines = typeof cart === 'function' ? cart() : [];
      return lines.reduce((sum, line) => {
        const product = line.product || (typeof GOB_PRODUCTS !== 'undefined' ? GOB_PRODUCTS[line.id] : null);
        return sum + (Number(product?.price) || 0) * (Number(line.quantity) || 0);
      }, 0);
    } catch (_) { return 0; }
  }

  // Same key the spin wheel uses to remember a customer's result on this device.
  async function savedAward() {
    const email = value('[autocomplete="email"]').toLowerCase();
    const phone = value('[autocomplete="tel"]').replace(/\D/g, '').slice(-10);
    if (!email || phone.length !== 10 || !window.crypto?.subtle) return null;
    try {
      const bytes = new TextEncoder().encode(`gob-spin-v1:${email}|${phone}`);
      const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
      const award = JSON.parse(localStorage.getItem(`gob-spin:${hash}`) || 'null');
      return award && award.label && !/%/.test(award.label) ? award : null;
    } catch (_) { return null; }
  }

  let renderId = 0;
  async function render() {
    const id = ++renderId;
    const total = subtotal();
    const award = await savedAward();
    if (id !== renderId) return;
    const short = Math.max(0, MIN_ORDER - total);
    note.classList.toggle('is-unlocked', Boolean(award) && short === 0);
    if (award && short === 0) {
      note.innerHTML = `<strong>Free treat included</strong>${award.label} will be added to this order at ₹0. It works together with your coupon code and reward points.`;
    } else if (award) {
      note.innerHTML = `<strong>Unlock your free treat</strong>Add ${rupees(short)} more to get ${award.label}. Free treats are added automatically on orders of ${rupees(MIN_ORDER)} or more.`;
    } else {
      note.innerHTML = `<strong>Won a free treat in Bone Run?</strong>It is added automatically on orders of ${rupees(MIN_ORDER)} or more placed with the same mobile number or email. No code needed, and it works together with coupon codes and reward points.`;
    }
  }

  let timer;
  const queue = () => { clearTimeout(timer); timer = setTimeout(render, 300); };
  form.addEventListener('input', queue);
    document.addEventListener('click', () => setTimeout(queue, 50));
  window.addEventListener('storage', render);
  document.addEventListener('gob:cart-updated', render);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  else render();
})();
