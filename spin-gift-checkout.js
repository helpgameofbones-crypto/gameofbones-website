/* Free prize (Bone Run game, or an older spin-wheel gift) in the cart and at
   checkout. When the bag is ₹499+ the prize is shown as a ₹0 line in the
   order summary, because the server adds it to the order automatically
   (admin lib/spin-gifts.ts, matched by the mobile number or email used to
   claim it). This file only previews it; the server decides. */
(() => {
  const MIN_ORDER = 499;
  // Goat Trachea (Bone Run tier 1) is free with any order; bigger prizes need ₹499+.
  const minFor = label => /goat trachea/i.test(String(label || '')) ? 0 : MIN_ORDER;
  const form = document.querySelector('#checkoutForm');
  const cartPage = !form && document.querySelector('#checkoutLink');
  if (!form && !cartPage) return;

  const style = document.createElement('style');
  style.textContent = `
.spin-gift-note{margin:0 0 14px;padding:12px 14px;border:1px solid var(--ink,#102c22);background:var(--gold-soft,#f4e6c9);color:var(--ink,#102c22);font-size:13px;line-height:1.45}
.spin-gift-note strong{display:block;margin-bottom:2px;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.spin-gift-note.is-unlocked{background:#e4ebdf}
.order-row.prize-row{background:#fff4d6;margin:6px -8px;padding:8px;border-radius:6px;font-weight:700}
.order-row.prize-row span:last-child{color:#16824a}`;
  document.head.append(style);

  const note = document.createElement('div');
  note.className = 'spin-gift-note';
  note.setAttribute('role', 'status');
  note.setAttribute('aria-live', 'polite');
  note.hidden = true;
  if (form) { const submit = form.querySelector('[type="submit"]'); (submit || form.lastElementChild)?.before(note); }
  else cartPage.before(note);

  const prizeRow = document.createElement('div');
  prizeRow.className = 'order-row prize-row';
  prizeRow.hidden = true;
  const placeRow = () => { const total = document.querySelector('.order-row.total'); if (total && prizeRow.nextElementSibling !== total) total.before(prizeRow); };

  const value = selector => form?.querySelector(selector)?.value.trim() || '';
  const rupees = amount => `₹${Math.round(amount).toLocaleString('en-IN')}`;
  const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function subtotal() {
    try {
      const lines = typeof cart === 'function' ? cart() : [];
      return lines.reduce((sum, line) => {
        const product = line.product || (typeof GOB_PRODUCTS !== 'undefined' ? GOB_PRODUCTS[line.id] : null);
        return sum + (Number(product?.price) || 0) * (Number(line.quantity) || 0);
      }, 0);
    } catch (_) { return 0; }
  }

  // Prize claimed on this device (set by bone-run.js), or the per-customer
  // record saved when they claimed with this email + mobile.
  function deviceAward() {
    try {
      const award = JSON.parse(localStorage.getItem('gob-bonerun-award') || 'null');
      if (!award || !award.label || !award.claimed) return null;
      if (award.valid_until && String(award.valid_until).slice(0, 10) < new Date().toISOString().slice(0, 10)) return null;
      return award;
    } catch (_) { return null; }
  }
  async function customerAward() {
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
    const award = (form ? await customerAward() : null) || deviceAward();
    if (id !== renderId) return;
    const short = Math.max(0, (award ? minFor(award.label) : MIN_ORDER) - total);
    const label = award ? escapeHtml(award.label) : '';
    const item = award ? escapeHtml(award.label.replace(/\bfree\s+/i, '')) : '';
    placeRow();
    if (award && total > 0 && short === 0) {
      prizeRow.innerHTML = `<span>🎁 FREE: ${item} (Bone Run prize)</span><span>₹0</span>`;
      prizeRow.hidden = false;
      note.hidden = false; note.classList.add('is-unlocked');
      note.innerHTML = `<strong>🎁 Your free treat is in!</strong>${label} is included in this order at ₹0. Check out with the same mobile number or email you used to claim it. Works together with your coupon code and reward points.`;
    } else if (award && total > 0) {
      prizeRow.hidden = true;
      note.hidden = false; note.classList.remove('is-unlocked');
      note.innerHTML = `<strong>You're ${rupees(short)} away from your free treat</strong>Add ${rupees(short)} more and ${label} is added to this order automatically.`;
    } else if (form && !award) {
      prizeRow.hidden = true;
      note.hidden = false; note.classList.remove('is-unlocked');
      note.innerHTML = `<strong>Won a free treat in Bone Run?</strong>It is added automatically when you order with the same mobile number or email: Goat Trachea on any order, bigger prizes on orders of ${rupees(MIN_ORDER)}+. No code needed, and it works with coupon codes and reward points.`;
    } else {
      prizeRow.hidden = true; note.hidden = true;
    }
  }

  let timer;
  const queue = () => { clearTimeout(timer); timer = setTimeout(render, 250); };
  form?.addEventListener('input', queue);
  document.addEventListener('click', () => setTimeout(queue, 60));
  window.addEventListener('storage', queue);
  document.addEventListener('gob:cart-updated', queue);
  document.addEventListener('gob:prize-updated', queue);
  const totalEl = document.querySelector('[data-commerce-total]');
  if (totalEl) new MutationObserver(queue).observe(totalEl, { childList: true, characterData: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  else render();
})();
