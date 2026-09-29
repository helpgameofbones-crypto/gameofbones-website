(() => {
  const token = sessionStorage.getItem('gob-customer-token');
  const root = document.querySelector('#accountRoot');
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c]);
  const field = (label, name, value = '', type = 'text', required = false) => `<label class="account-field">${label}<input ${required ? 'required' : ''} type="${type}" name="${name}" value="${esc(value)}"></label>`;
  const editButton = (label, panel) => `<button class="text-link account-edit" type="button" data-toggle="${panel}">${label}</button>`;
  const activityLabel = type => ({ delivered: 'Points earned', order: 'Points earned', referral: 'Referral reward', review: 'Review reward', manual_credit: 'Points added', redeemed: 'Points used' }[type] || 'Reward activity');
  const activityDate = value => { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };
  const activityRows = activity => activity?.length ? activity.map(item => {
    const points = Number(item.points || 0), sign = points > 0 ? '+' : '−', pointText = `${sign}${Math.abs(points).toLocaleString('en-IN')} pts`;
    const meta = [item.order_ref ? `Order ${item.order_ref}` : '', activityDate(item.created_at)].filter(Boolean).join(' · ');
    return `<article class="reward-activity-row"><div><strong>${esc(activityLabel(item.type))}</strong><p>${esc(item.description || meta || 'Reward activity')}</p>${meta && item.description ? `<small>${esc(meta)}</small>` : ''}</div><div class="reward-activity-points ${points < 0 ? 'is-used' : ''}">${pointText}<small>Balance: ${Number(item.balance_after || 0).toLocaleString('en-IN')}</small></div></article>`;
  }).join('') : '<p class="order-note">No rewards activity yet. Points earned and used will appear here.</p>';
  const addressForm = address => `<form class="account-form" data-form="address"><input type="hidden" name="id" value="${esc(address?.id || '')}"><div class="account-form-grid">${field('Label', 'label', address?.label || 'Home')}${field('Address line 1', 'line1', address?.line1, 'text', true)}${field('Address line 2', 'line2', address?.line2)}${field('City', 'city', address?.city, 'text', true)}${field('State', 'state', address?.state, 'text', true)}${field('PIN code', 'pincode', address?.pincode, 'text', true)}</div><label class="account-check"><input type="checkbox" name="isDefault" ${address?.is_default ? 'checked' : ''}> Use as my default delivery address</label><button class="button" type="submit">Save address</button><p class="account-form-status" aria-live="polite"></p></form>`;
  const dogForm = dog => `<form class="account-form" data-form="dog"><input type="hidden" name="id" value="${esc(dog?.id || '')}"><div class="account-form-grid">${field('Dog name', 'name', dog?.name, 'text', true)}${field('Birthday', 'birthday', dog?.birthday, 'date')}${field('Breed', 'breed', dog?.breed)}${field('Age', 'age', dog?.age)}${field('Weight', 'weight', dog?.weight)}${field('Preferences / notes', 'preferences', dog?.preferences)}</div><button class="button" type="submit">Save dog profile</button><p class="account-form-status" aria-live="polite"></p></form>`;
  function bind() {
    root.querySelectorAll('[data-toggle]').forEach(button => button.addEventListener('click', () => { const panel = root.querySelector(`#${button.dataset.toggle}`); panel.hidden = !panel.hidden; if (!panel.hidden) panel.querySelector('input:not([type=hidden])')?.focus(); }));
    root.querySelectorAll('[data-form]').forEach(form => form.addEventListener('submit', async event => {
      event.preventDefault(); const submit = form.querySelector('button[type=submit]'), status = form.querySelector('.account-form-status'); submit.disabled = true; status.textContent = 'Saving…'; status.className = 'account-form-status';
      const payload = Object.fromEntries(new FormData(form).entries()); payload.action = form.dataset.form; payload.isDefault = form.elements.isDefault?.checked || false;
      try { await window.GOB_API.updateAccount(token, payload); status.textContent = 'Saved. Refreshing your account…'; status.classList.add('success'); await render(); } catch (error) { status.textContent = error.message || 'Unable to save this change.'; status.classList.add('error'); submit.disabled = false; }
    }));
    root.querySelector('[data-copy-referral]')?.addEventListener('click', async event => {
      const button = event.currentTarget, link = button.dataset.copyReferral;
      try { await navigator.clipboard.writeText(link); button.textContent = 'Link copied'; }
      catch { window.prompt('Copy your referral link:', link); }
    });
  }
  async function render() {
    if (!token) { location.replace('/login'); return; }
    try {
      const data = await window.GOB_API.account(token), profile = data.profile || {}, address = data.addresses?.[0], dog = data.dogs?.[0];
      const orders = data.orders?.length ? data.orders.map(order => `<article class="account-row"><strong>${esc(order.ref)}</strong><span>${esc(order.status || 'Confirmed')}</span><span>₹${Number(order.grand_total || order.total_amount || 0).toLocaleString('en-IN')}</span></article>`).join('') : '<p class="order-note">No orders linked to this account yet.</p>';
      root.innerHTML = `<section class="account-grid"><article><p class="eyebrow">Your details</p><h2>${esc(profile.name || 'Dog parent')}</h2><p>${esc(profile.email || '—')}<br>${esc(profile.phone || '—')}</p>${editButton('Edit details', 'contactEdit')}</article><article><p class="eyebrow">Rewards</p><h2>${Number(data.points?.available || 0).toLocaleString('en-IN')} points</h2><p>${Number(data.points?.redeemed || 0)} points used · Earn 1 point for every ₹10 spent.</p><a class="text-link" href="/rewards">See ways to earn</a></article><article><p class="eyebrow">Refer a friend</p><h2>${esc(data.referral?.referral_code || '—')}</h2><p>Points are awarded after their first completed order.</p><a class="text-link" href="/rewards">Get referral link</a></article></section><section id="contactEdit" class="account-editor" hidden><h2>Edit contact details</h2><form class="account-form" data-form="contact"><div class="account-form-grid">${field('Your name', 'name', profile.name, 'text', true)}${field('Email address', 'email', profile.email, 'email', true)}</div><p class="account-form-note">Your verified mobile number remains the sign-in method.</p><button class="button" type="submit">Save details</button><p class="account-form-status" aria-live="polite"></p></form></section><section class="account-section"><div class="account-section-head"><p class="eyebrow">Saved addresses</p>${editButton(address ? 'Edit address' : 'Add address', 'addressEdit')}</div>${address ? `<article class="account-row"><strong>${esc(address.label || 'Address')}</strong><span>${esc(address.line1)}, ${esc(address.city)}, ${esc(address.state)} ${esc(address.pincode)}</span><span>${address.is_default ? 'Default' : ''}</span></article>` : '<p class="order-note">No saved address yet.</p>'}</section><section id="addressEdit" class="account-editor" hidden><h2>${address ? 'Edit delivery address' : 'Add a delivery address'}</h2>${addressForm(address)}</section><section class="account-section"><div class="account-section-head"><p class="eyebrow">Dog profiles</p>${editButton(dog ? 'Edit dog profile' : 'Add dog', 'dogEdit')}</div>${dog ? `<article class="account-row"><strong>${esc(dog.name)}</strong><span>${dog.breed ? `${esc(dog.breed)} · ` : ''}${dog.birthday ? `Birthday: ${esc(dog.birthday)}` : 'Birthday not added'}</span><span>${esc(dog.age || '')}</span></article>` : '<p class="order-note">Add your dog’s name and birthday to receive relevant reminders.</p>'}</section><section id="dogEdit" class="account-editor" hidden><h2>${dog ? 'Edit dog profile' : 'Add your dog'}</h2>${dogForm(dog)}</section><section class="account-section"><p class="eyebrow">Order history</p>${orders}</section>`;
      const referralCode = String(data.referral?.referral_code || '');
      const referralLink = referralCode ? `${location.origin}/?ref=${encodeURIComponent(referralCode)}` : '';
      const referralCard = root.querySelector('.account-grid article:nth-child(3)');
      const oldReferralLink = referralCard?.querySelector('a');
      if (oldReferralLink && referralLink) oldReferralLink.outerHTML = `<button class="text-link" type="button" data-copy-referral="${esc(referralLink)}">Copy referral link</button>`;
      root.querySelector('#contactEdit')?.insertAdjacentHTML('afterend', `<section class="account-section reward-activity"><div class="account-section-head"><p class="eyebrow">Rewards activity</p><a class="text-link" href="/rewards">How points work</a></div>${activityRows(data.reward_activity)}</section>`);
      // Customer sign-in is email OTP. The profile keeps the verified mobile
      // number for deliveries, but it is not presented as a login credential.
      const accountLoginNote = root.querySelector('.account-form-note');
      if (accountLoginNote) accountLoginNote.textContent = 'Your verified email address is used to sign in securely.';
      bind();
    } catch (error) { root.innerHTML = `<div class="account-error"><h2>Your account could not load.</h2><p>${esc(error.message || 'Please try again.')}</p><a class="button" href="/login">Back to log in</a></div>`; }
  }
  document.addEventListener('DOMContentLoaded', render);
})();
