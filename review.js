/* One-tap review page (/review?t=...), opened from the review-request email.
   The link token is swapped for a short review-only session, then removed from the
   address bar straight away. No tracking scripts load on this page. */
(() => {
  const root = document.getElementById('reviewRoot');
  if (!root) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const linkToken = new URLSearchParams(location.search).get('t') || '';
  if (linkToken) history.replaceState(null, '', '/review');
  let token = '';

  async function api(path, options = {}) {
    const res = await fetch('/api' + path, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong. Please try again.'), { status: res.status });
    return data;
  }
  const signIn = msg => { root.innerHTML = `<div class="review-state"><p>${esc(msg)}</p></div><p style="margin-top:18px"><a class="button" href="/account">Sign in to review</a></p><p class="order-note">Or WhatsApp us on <a href="https://wa.me/919082503295">+91 90825 03295</a> and tell us how treat time went.</p>`; };

  const status = s => ({ ready: 'Ready to review', pending: 'Thanks! Awaiting moderation', published: 'Published', rejected: 'Not published' }[s] || 'Ready to review');
  const row = item => {
    const ready = item.status === 'ready';
    const img = item.product_image ? `<img class="review-product-image" src="${esc(item.product_image)}" alt="${esc(item.product_name)}">` : '<div class="review-product-image review-product-image-empty" aria-hidden="true">🐾</div>';
    const id = esc(item.product_id);
    const body = ready
      ? `<form class="review-form" data-review-form><input type="hidden" name="product_id" value="${id}"><fieldset><legend>Your rating</legend><div class="review-stars" role="radiogroup" aria-label="Rating for ${esc(item.product_name)}">${[5, 4, 3, 2, 1].map(n => `<input required type="radio" id="r-${id}-${n}" name="rating" value="${n}"><label for="r-${id}-${n}" title="${n} star${n === 1 ? '' : 's'}">★</label>`).join('')}</div></fieldset><label class="review-copy-label">A line or two for other pet parents<textarea required minlength="8" maxlength="1500" name="review" placeholder="Did your dog love it? How did they eat it?"></textarea></label><label class="review-photo-label">Add a photo of your pet with it <small>Optional · JPG, PNG or WebP up to 5 MB · 150 points instead of 100 · approved photos may be shown on our website</small><input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label><div class="review-form-footer"><span>100 points after approval<br><b>150 with a photo</b></span><button class="button" type="submit">Submit review</button></div><p class="account-form-status" aria-live="polite"></p></form>`
      : `<div class="review-state"><p>${item.status === 'pending' ? 'Thank you! We’ll check it and publish it soon.' : item.status === 'published' ? `Published · ${Number(item.reward_points || 0)} points added` : 'This review was not published. Message us if you need help.'}</p>${item.review ? `<blockquote>“${esc(item.review)}”</blockquote>` : ''}</div>`;
    return `<article class="review-row"><div class="review-row-head">${img}<div><p class="eyebrow">${esc(status(item.status))}</p><h3>${esc(item.product_name)}</h3><p class="review-order-meta">Order ${esc(item.order_ref || '—')}</p></div></div>${body}</article>`;
  };

  async function render() {
    const { reviews = [] } = await api('/customer-reviews', { headers: { Authorization: `Bearer ${token}` } });
    if (!reviews.length) { root.innerHTML = '<p class="order-note">We couldn’t find a delivered order to review yet. If yours has arrived, WhatsApp us on <a href="https://wa.me/919082503295">+91 90825 03295</a>.</p>'; return; }
    const left = reviews.filter(r => r.status === 'ready').length;
    root.innerHTML = `<p class="lead">${left ? `${left} treat${left === 1 ? '' : 's'} to review. Short and honest is perfect, and every approved review earns points, whatever the stars.` : 'All done. Thank you for helping other pet parents!'}</p>${reviews.map(row).join('')}`;
    root.querySelectorAll('[data-review-form]').forEach(form => form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]'), st = form.querySelector('.account-form-status');
      btn.disabled = true; st.className = 'account-form-status'; st.textContent = 'Sending your review…';
      try {
        await api('/customer-reviews', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: new FormData(form) });
        st.textContent = 'Thank you!'; st.classList.add('success'); await render();
      } catch (err) {
        if (err.status === 401) return signIn('This page has timed out. Open the link in your email again, or sign in.');
        st.textContent = err.message; st.classList.add('error'); btn.disabled = false;
      }
    }));
  }

  (async () => {
    if (!linkToken) return signIn('Open the review link from your email, or sign in with the email you ordered with.');
    try {
      ({ token } = await api('/review-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: linkToken }) }));
      await render();
    } catch (err) { signIn(err.status === 401 ? 'This review link has expired.' : err.message); }
  })();
})();
