(() => {
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c]);
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#trackingForm'), input = document.querySelector('#trackingReference'), result = document.querySelector('#trackingResult');
    if (!form || !input || !result) return;
    form.addEventListener('submit', async event => {
      event.preventDefault(); const ref = input.value.trim().toUpperCase(); const submit = form.querySelector('button[type=submit]');
      if (!/^[A-Z0-9-]{3,40}$/.test(ref)) { result.className = 'account-form-status error'; result.textContent = 'Enter a valid order number or tracking reference.'; return; }
      submit.disabled = true; result.className = 'account-form-status'; result.textContent = 'Looking up your order…';
      try {
        const order = await window.GOB_API.trackOrder(ref);
        if (!order.found) { result.className = 'account-form-status error'; result.textContent = 'We could not find that order. Please check the reference in your confirmation message.'; return; }
        const items = (order.items || []).map(item => `${esc(item.name)} × ${Number(item.quantity || 1)}`).join(' · ') || 'Treats in your order';
        const carrier = order.delhiveryAwb ? `<a class="text-link" target="_blank" rel="noopener" href="https://www.delhivery.com/track/package/${encodeURIComponent(order.delhiveryAwb)}">Track live on Delhivery →</a>` : '<span>Your tracking link will appear once this order is dispatched.</span>';
        result.className = 'account-form-status success'; result.innerHTML = `<strong>${esc(order.ref)} · ${esc(order.status || 'Confirmed')}</strong><br>${items}<br>${carrier}`;
      } catch (error) { result.className = 'account-form-status error'; result.textContent = error.message || 'We could not look up that order right now.'; }
      finally { submit.disabled = false; }
    });
  });
})();
