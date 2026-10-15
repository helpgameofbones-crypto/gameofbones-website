/* Back-in-stock requests are offered only for catalogue items that the public
   API marks as low stock. Contact data is saved by the protected admin API. */
(() => {
  const escape = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const decode = value => { try { return decodeURIComponent(value || '') } catch { return '' } };
  const style = `
    .restock-notify-area{display:grid;gap:7px;margin-top:12px;padding:13px 14px;border:1px solid #ead8b9;border-radius:10px;background:#fff8e7;color:#553719;font-size:13px;line-height:1.45}.restock-notify-area strong{font-size:13px}.restock-notify-area span{color:#66594d}.restock-notify-button{border:1px solid #6d4825;background:#fff8e7;color:#553719;border-radius:999px;padding:9px 14px;font:700 12px/1.2 inherit;cursor:pointer;white-space:nowrap;width:max-content}.restock-notify-button:hover{background:#f6e2b9}.restock-notify-modal{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:rgba(26,16,8,.56)}.restock-notify-card{width:min(460px,100%);background:#fffaf3;border-radius:16px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.28);position:relative}.restock-notify-card h2{margin:4px 0 8px;color:#1a1008}.restock-notify-card p{color:#66594d;line-height:1.55}.restock-notify-close{position:absolute;right:14px;top:12px;background:transparent;border:0;font-size:24px;cursor:pointer;color:#553719}.restock-notify-card label{display:grid;gap:7px;margin:18px 0 10px;color:#382617;font-weight:700;font-size:13px}.restock-notify-card input{border:1px solid #d9c8b3;border-radius:8px;padding:12px;font:inherit}.restock-notify-consent{display:flex!important;grid-template-columns:18px 1fr;align-items:start;font-weight:400!important;line-height:1.4}.restock-notify-submit{width:100%;border:0;border-radius:8px;background:#1a1008;color:#fff;padding:13px;font:700 14px inherit;cursor:pointer}.restock-notify-status{min-height:20px;font-size:13px;margin:10px 0 0;color:#8b3f19}`;

  function ensureStyles() { if (!document.querySelector('#restock-notify-styles')) { const tag = document.createElement('style'); tag.id = 'restock-notify-styles'; tag.textContent = style; document.head.append(tag); } }
  function close() { document.querySelector('#restockNotifyModal')?.remove(); }
  function open(button) {
    ensureStyles(); close();
    const productId = decode(button.dataset.restockProduct), productName = decode(button.dataset.restockName);
    if (!productId || !productName) return;
    const modal = document.createElement('section'); modal.id = 'restockNotifyModal'; modal.className = 'restock-notify-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `<form class="restock-notify-card"><button class="restock-notify-close" type="button" aria-label="Close">×</button><p class="eyebrow">Fresh batches, every day</p><h2>Tell us where to reach you.</h2><p>${escape(productName)} is running low. Leave an email address or WhatsApp number and we’ll let you know when fresh stock is ready.</p><label>Email address or mobile number<input name="contact" required autocomplete="email" placeholder="you@example.com or 98765 43210"></label><label class="restock-notify-consent"><input name="consent" type="checkbox" required><span>I agree to receive a back-in-stock alert for this treat.</span></label><button class="restock-notify-submit" type="submit">Notify me when it’s back</button><p class="restock-notify-status" aria-live="polite"></p></form>`;
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    modal.querySelector('.restock-notify-close').addEventListener('click', close);
    modal.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault(); const form = event.currentTarget, contact = String(new FormData(form).get('contact') || '').trim(), status = form.querySelector('.restock-notify-status'), submit = form.querySelector('button[type="submit"]');
      const email = /@/.test(contact) ? contact : '', phone = email ? '' : contact.replace(/[\s()-]/g, '');
      submit.disabled = true; status.textContent = 'Saving your alert…';
      try { await window.GOB_API.restockAlert({ product_id: productId, email, phone, notification_consent: true, privacy_notice_version: '2026-10-15' }); status.style.color = '#146c61'; status.textContent = 'You’re on the list. We’ll let you know when fresh stock is ready.'; form.reset(); submit.remove(); }
      catch (error) { status.style.color = '#8b3f19'; status.textContent = error?.message || 'We could not save your alert. Please try again.'; submit.disabled = false; }
    });
    document.body.append(modal); modal.querySelector('input[name="contact"]')?.focus();
  }
  document.addEventListener('click', event => { const button = event.target.closest('[data-restock-product]'); if (button) { event.preventDefault(); open(button); } });
})()
