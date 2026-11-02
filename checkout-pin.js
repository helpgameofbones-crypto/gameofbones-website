// Checkout: PIN code comes first. As soon as 6 digits are typed we ask Delhivery
// (via /api/pincode-check), fill in city and state, say whether cash on delivery
// is available, and show real arrival dates instead of "2–4 business days".
// Transit days mirror deliveryEstimate() in the admin's pincode-check route.
(() => {
  const form = document.getElementById('checkoutForm');
  const pinEl = form?.querySelector('[autocomplete="postal-code"]');
  const status = document.getElementById('pinStatus');
  if (!form || !pinEl || !status) return;
  const cityEl = form.querySelector('[autocomplete="address-level2"]');
  const stateEl = form.querySelector('[autocomplete="address-level1"]');
  const STATES = { AN: 'Andaman and Nicobar Islands', AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar', CH: 'Chandigarh', CT: 'Chhattisgarh', CG: 'Chhattisgarh', DN: 'Dadra and Nagar Haveli and Daman and Diu', DD: 'Dadra and Nagar Haveli and Daman and Diu', DL: 'Delhi', GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana', HP: 'Himachal Pradesh', JK: 'Jammu and Kashmir', JH: 'Jharkhand', KA: 'Karnataka', KL: 'Kerala', LA: 'Ladakh', LD: 'Lakshadweep', MP: 'Madhya Pradesh', MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya', MZ: 'Mizoram', NL: 'Nagaland', OR: 'Odisha', OD: 'Odisha', PY: 'Puducherry', PB: 'Punjab', RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TG: 'Telangana', TS: 'Telangana', TR: 'Tripura', UP: 'Uttar Pradesh', UK: 'Uttarakhand', UT: 'Uttarakhand', WB: 'West Bengal' };
  // Working days from today: dispatch (1–2) + transit for the region.
  const span = st => st === 'MH' ? [3, 6] : ['GJ', 'GA', 'KA', 'MP', 'RJ', 'TG', 'TS'].includes(st) ? [4, 7] : [5, 9];
  const addWorkingDays = n => { const d = new Date(); let left = n; while (left > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) left--; } return d; };
  const fmt = d => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const radio = v => form.querySelector(`input[name="payment"][value="${v}"]`);
  const autoFilled = new WeakSet();
  const fill = (el, val) => { if (!el || !val) return; if (!el.value.trim() || autoFilled.has(el)) { el.value = val; autoFilled.add(el); el.dispatchEvent(new Event('input', { bubbles: true })); } };
  const setPay = (v, ok, note) => {
    const r = radio(v); if (!r) return;
    r.disabled = !ok; r.closest('label')?.classList.toggle('is-unavailable', !ok);
    let n = r.closest('label')?.querySelector('.pay-note');
    if (!ok && r.closest('label') && !n) { n = document.createElement('em'); n.className = 'pay-note'; r.closest('label').querySelector('span')?.append(n); }
    if (n) n.textContent = ok ? '' : note;
    if (!ok && r.checked) { const other = radio(v === 'cod' ? 'online' : 'cod'); if (other && !other.disabled) other.checked = true; other?.dispatchEvent(new Event('change', { bubbles: true })); }
  };
  let last = '', timer;
  async function check() {
    const pin = pinEl.value.replace(/\D/g, '').slice(0, 6);
    if (pinEl.value !== pin) pinEl.value = pin;
    if (pin.length < 6) { status.className = 'pin-status'; status.textContent = pin ? 'Enter all 6 digits to see delivery dates.' : ''; last = ''; setPay('cod', true); setPay('online', true); return; }
    if (pin === last || !window.GOB_PINCODE_CHECKER) return;
    last = pin; status.className = 'pin-status checking'; status.textContent = 'Checking delivery…';
    try {
      const r = await window.GOB_PINCODE_CHECKER(pin);
      if (pin !== last) return;
      if (!r.serviceable) { status.className = 'pin-status error'; status.textContent = 'Delhivery doesn’t deliver to this PIN yet. Please check it, or WhatsApp us on +91 90825 03295.'; return; }
      const city = r.city ? r.city.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : '';
      fill(cityEl, city); fill(stateEl, STATES[r.state] || '');
      const [a, b] = span(r.state);
      status.className = 'pin-status ok';
      status.innerHTML = `✓ Delivers${city ? ' to ' + city : ''}. <b>Arrives ${fmt(addWorkingDays(a))} – ${fmt(addWorkingDays(b))}</b>${r.cod ? ' · Cash on delivery available' : ' · Online payment only for this PIN'}`;
      setPay('cod', r.cod, 'Not available for this PIN code');
      setPay('online', r.prepaid !== false, 'Not available for this PIN code');
    } catch (_) {
      if (pin === last) { status.className = 'pin-status'; status.textContent = 'We’ll confirm delivery for this PIN when you continue.'; last = ''; }
    }
  }
  pinEl.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(check, 350); });
  pinEl.addEventListener('change', check);
  // Saved addresses fill the PIN in for returning customers.
  setTimeout(check, 1200);
})();
