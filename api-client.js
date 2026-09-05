/* Customer storefront API bridge. Production calls stay on the protected
   server-side admin API; previews remain visually testable without it. */
(() => {
  const params = new URLSearchParams(window.location.search);
  const configured = params.get('api') || window.localStorage.getItem('gob-api-base');
  const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const production = ['gameofbones.in', 'www.gameofbones.in'].includes(window.location.hostname);
  const staging = /(^|\.)gameofbones-website(?:-[a-z0-9-]+)?-gameofbones\.vercel\.app$/i.test(window.location.hostname);
  const base = (configured || (local ? 'http://localhost:3001/api' : production ? 'https://gameofbones-admin.vercel.app/api' : '')).replace(/\/$/, '');
  // Catalogue reads are safe for the stable staging preview too. Other
  // customer actions deliberately remain disconnected there, so test orders
  // and personal data never land in production by accident.
  const catalogueBase = (configured || (local ? 'http://localhost:3001/api' : (production || staging) ? 'https://gameofbones-admin.vercel.app/api' : '')).replace(/\/$/, '');
  async function request(path, options = {}) {
    if (!base) throw new Error('The API bridge is not configured for this preview.');
    const response = await fetch(`${base}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The service could not complete that request.');
    return data;
  }
  const api = {
    base, request,
    catalogue: async () => {
      if (!catalogueBase) throw new Error('The catalogue feed is not configured for this preview.');
      const response = await fetch(`${catalogueBase}/public-products`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The catalogue could not be loaded.');
      return data;
    },
    pincode: pin => request(`/pincode-check?pin=${encodeURIComponent(pin)}`),
    requestLoginCode: phone => request('/customer-auth/request-code', { method: 'POST', body: JSON.stringify({ phone }) }),
    verifyLoginCode: (phone, code) => request('/customer-auth/verify-code', { method: 'POST', body: JSON.stringify({ phone, code }) }),
    account: token => request('/customer-account', { headers: { Authorization: `Bearer ${token}` } }),
    updateAccount: (token, body) => request('/customer-account', { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
    capture: body => request('/public-email-capture', { method: 'POST', body: JSON.stringify(body) }),
    spinWheel: body => request('/spin-wheel', { method: 'POST', body: JSON.stringify(body) }),
    abandonedCart: body => request('/abandoned-cart', { method: 'POST', body: JSON.stringify(body) }),
    orderAttempt: body => request('/order-attempt-alert', { method: 'POST', body: JSON.stringify(body) }),
    saveOrder: body => request('/save-order', { method: 'POST', body: JSON.stringify(body) }),
    createRazorpayOrder: body => request('/razorpay-order', { method: 'POST', body: JSON.stringify(body) }),
    loyaltySummary: phone => request('/public-loyalty-summary', { method: 'POST', body: JSON.stringify({ phone }) }),
    trackOrder: ref => request('/public-order-tracking', { method: 'POST', body: JSON.stringify({ ref }) }),
  };
  window.GOB_API = api;
  window.GOB_PINCODE_CHECKER = async pin => {
    const data = await api.pincode(pin);
    return { serviceable: Boolean(data.serviceable), city: data.city || '', state: data.state || '', cod: Boolean(data.cod), prepaid: Boolean(data.prepaid), dispatch: data.dispatch || '', eta: data.eta || '', source: data.source || '' };
  };
})();
