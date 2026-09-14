(() => {
  const form = document.querySelector('#privacyRequestForm');
  if (!form) return;
  const response = document.querySelector('#privacyRequestResponse');
  const submit = form.querySelector('[type="submit"]');
  const show = (message, error = false) => { response.textContent = message; response.className = `privacy-response ${error ? 'is-error' : 'is-success'}`; };
  const normalisePhone = value => String(value || '').replace(/\D/g, '').replace(/^91/, '');
  const download = data => { const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(file); link.download = 'game-of-bones-data-export.json'; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(link.href); };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const phone = normalisePhone(values.phone);
    if (!values.confirm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email || '')) || !/^\d{10}$/.test(phone)) { show('Please enter the email and 10-digit mobile number used for your order, then confirm the request.', true); return; }
    submit.disabled = true; submit.textContent = 'Sending…'; response.textContent = '';
    try {
      if (values.action === 'access') {
        const result = await fetch('/api/public-data-export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: String(values.email).trim(), phone }) });
        const data = await result.json().catch(() => ({}));
        if (!result.ok) throw new Error(data.error || 'Your data could not be prepared right now.');
        download(data); show('Your data export has downloaded. Keep it private and contact us if anything needs correcting.');
      } else {
        const result = await fetch('/api/public-privacy-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: values.action, email: String(values.email).trim(), phone, details: String(values.details || '').trim(), privacy_notice_version: '2026-09-14' }) });
        const data = await result.json().catch(() => ({}));
        if (!result.ok) throw new Error(data.error || 'Your request could not be submitted right now.');
        form.reset(); show('Your request is with Customer Care. We will verify it before making a change and contact you through your registered details.');
      }
    } catch (error) { show(error.message || 'Something went wrong. Please email helpgameofbones@gmail.com.', true); }
    finally { submit.disabled = false; submit.textContent = 'Send my request'; }
  });
})();
