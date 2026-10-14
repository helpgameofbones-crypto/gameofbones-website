(() => {
  const params = new URLSearchParams(window.location.search);
  const order = params.get('order');
  const payment = params.get('payment');
  const reference = document.querySelector('#confirmation-order');
  const copy = document.querySelector('#confirmation-copy');
  if (order && reference) reference.textContent = order;
  if (copy) copy.textContent = payment === 'cod'
    ? 'Your Cash on Delivery order is confirmed. Keep the order reference handy for any delivery questions.'
    : 'Your payment was received and your order is confirmed. We’ll keep you updated from dispatch to delivery.';

  // The first-order ₹50 bag offer is used up once an order is placed.
  try { window.localStorage.removeItem('gob-cart-offer'); } catch (_) {}

  // "Tell us about your dog" popup: name, breed and birthday, saved against
  // this order so the shopper does not retype their details. Birthdays get a
  // 25% off treat. Shown once per order; always skippable.
  if (!order || !/^[A-Za-z0-9-]{3,40}$/.test(order)) return;
  const seenKey = `gob-dog-asked-${order}`;
  try { if (window.sessionStorage.getItem(seenKey)) return; } catch (_) {}

  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = new Date().toISOString().slice(0, 10);
  const breeds = ['Indie / Desi', 'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Beagle', 'Shih Tzu', 'Pug', 'Siberian Husky', 'Rottweiler', 'Doberman', 'Pomeranian', 'Cocker Spaniel', 'Lhasa Apso', 'Dachshund', 'Boxer', 'Great Dane', 'Mixed breed'];

  const style = document.createElement('style');
  style.textContent = `
.dog-modal{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:16px;background:rgba(8,20,15,.55);animation:dogFade .2s ease}
.dog-modal[hidden]{display:none}
.dog-card{position:relative;width:min(440px,100%);max-height:calc(100vh - 32px);overflow:auto;border-radius:18px;background:var(--paper,#fffdf8);color:var(--ink,#102c22);box-shadow:0 24px 60px rgba(0,0,0,.25);padding:26px 22px 22px}
.dog-card h2{margin:4px 0 8px;font-family:var(--display,Fraunces,Georgia,serif);font-size:26px;line-height:1.1}
.dog-card .eyebrow{margin:0;color:var(--gold,#bd812a)}
.dog-card p.dog-lead{margin:0 0 16px;color:var(--ink-soft,#24473a);font-size:15px;line-height:1.5}
.dog-offer{display:flex;gap:10px;align-items:center;margin:0 0 16px;padding:10px 12px;border:1px dashed var(--gold,#bd812a);border-radius:12px;background:#fff6dc;font-size:14px;font-weight:700}
.dog-offer b{font-size:20px}
.dog-form{display:grid;gap:12px}
.dog-form label{display:grid;gap:5px;font-size:13px;font-weight:700}
.dog-form small{font-weight:600;color:var(--muted,#557064)}
.dog-form input{min-height:46px;padding:10px 12px;border:1px solid var(--line,#d9d2c3);border-radius:10px;background:#fff;font:16px var(--body,inherit);color:inherit}
.dog-actions{display:flex;flex-direction:column;gap:8px;margin-top:6px}
.dog-actions .button{width:100%;justify-content:center}
.dog-skip{border:0;background:none;color:var(--ink-soft,#24473a);font:700 13px var(--body,inherit);text-decoration:underline;cursor:pointer;padding:8px}
.dog-close{position:absolute;top:10px;right:10px;width:36px;height:36px;border:0;border-radius:50%;background:transparent;font-size:22px;line-height:1;cursor:pointer;color:inherit}
.dog-status{margin:0;font-size:13px;min-height:1em}
.dog-status.error{color:#a4441c}
@keyframes dogFade{from{opacity:0}to{opacity:1}}`;
  document.head.append(style);

  const modal = document.createElement('div');
  modal.className = 'dog-modal';
  modal.hidden = true;
  modal.innerHTML = `<div class="dog-card" role="dialog" aria-modal="true" aria-labelledby="dogTitle">
    <button class="dog-close" type="button" aria-label="Close">×</button>
    <p class="eyebrow">One last thing</p>
    <h2 id="dogTitle">Who are the treats for?</h2>
    <p class="dog-lead">Tell us about your dog and we’ll celebrate their birthday with you.</p>
    <p class="dog-offer"><span aria-hidden="true">🎂</span><span><b>25% off</b> on your dog’s birthday, every year.</span></p>
    <form class="dog-form" novalidate>
      <label>Dog’s name<input name="dog_name" required maxlength="80" autocomplete="off" placeholder="Bruno, Coco, Luna…"></label>
      <label>Breed <small>optional</small><input name="breed" maxlength="80" list="dogBreeds" autocomplete="off" placeholder="Indie, Labrador, Shih Tzu…"></label>
      <datalist id="dogBreeds">${breeds.map(b => `<option value="${esc(b)}"></option>`).join('')}</datalist>
      <label>Birthday <small>an approximate date is fine</small><input name="birthday" type="date" required max="${today}" min="1995-01-01"></label>
      <p class="dog-status" role="status" aria-live="polite"></p>
      <div class="dog-actions"><button class="button" type="submit">Save my dog’s birthday</button><button class="dog-skip" type="button">Maybe later</button></div>
    </form>
  </div>`;
  document.body.append(modal);

  const form = modal.querySelector('form');
  const status = modal.querySelector('.dog-status');
  const close = () => {
    modal.hidden = true;
    try { window.sessionStorage.setItem(seenKey, '1'); } catch (_) {}
    document.removeEventListener('keydown', onKey);
  };
  const onKey = event => { if (event.key === 'Escape') close(); };
  modal.querySelector('.dog-close').addEventListener('click', close);
  modal.querySelector('.dog-skip').addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal) close(); });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = form.dog_name.value.trim(), breed = form.breed.value.trim(), birthday = form.birthday.value;
    if (!name) { status.textContent = 'Please add your dog’s name.'; status.className = 'dog-status error'; form.dog_name.focus(); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday) || birthday > today) { status.textContent = 'Please pick a birthday (an approximate date is fine).'; status.className = 'dog-status error'; form.birthday.focus(); return; }
    const button = form.querySelector('[type="submit"]');
    button.disabled = true; button.textContent = 'Saving…'; status.textContent = ''; status.className = 'dog-status';
    try {
      const response = await fetch('/api/order-dog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: order, dog_name: name, breed, birthday }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'We could not save this right now. Please try again.');
      try { window.sessionStorage.setItem(seenKey, '1'); } catch (_) {}
      modal.querySelector('.dog-card').innerHTML = `<button class="dog-close" type="button" aria-label="Close">×</button>
        <p class="eyebrow">Saved 🐾</p>
        <h2 id="dogTitle">Happy early birthday, ${esc(name)}!</h2>
        <p class="dog-lead">${data.has_email ? `We’ll email you a <b>25% off</b> code every year on ${esc(name)}’s big day.` : `${esc(name)}’s birthday is saved. Your <b>25% off</b> birthday code is sent by email, so add your email when you next order or contact us.`}</p>
        <div class="dog-actions"><button class="button" type="button" data-done>Done</button></div>`;
      modal.querySelectorAll('.dog-close,[data-done]').forEach(el => el.addEventListener('click', close));
      modal.querySelector('[data-done]').focus();
    } catch (error) {
      status.textContent = error.message; status.className = 'dog-status error';
      button.disabled = false; button.textContent = 'Save my dog’s birthday';
    }
  });

  setTimeout(() => {
    modal.hidden = false;
    document.addEventListener('keydown', onKey);
    form.dog_name.focus({ preventScroll: true });
  }, 1200);
})();
