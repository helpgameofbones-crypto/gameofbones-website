/* Google "Preferred sources" button.
   A reader who likes our guides can pin gameofbones.in as a preferred source in Google,
   so our articles show up for them first (Top Stories, AI Overviews, AI Mode).
   Uses Google's plain deeplink: no third-party script, no tracking, no CSP changes.
   Shown at the end of journal articles (where the reader has just finished reading)
   and as a small link in the footer on every page. */
(() => {
  if (window.__gobPreferred) return;
  window.__gobPreferred = true;
  const URL = 'https://www.google.com/preferences/source?q=gameofbones.in';
  const G = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.2C12.5 13.7 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.6 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.9-6.2C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.2-8.5 2.2-6.2 0-11.5-4.2-13.4-9.9l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>';
  const css = `
  .gob-pref{max-width:760px;margin:28px auto 8px;padding:18px;border:1px solid rgba(16,44,34,.14);border-radius:16px;background:#fffdf8;color:#102c22;display:grid;gap:10px;font-family:inherit}
  .gob-pref b{font-size:16px}.gob-pref p{margin:0;font-size:14px;line-height:1.5;color:#3f5249}
  .gob-pref a,.gob-pref-foot a{display:inline-flex;align-items:center;gap:8px;justify-self:start;padding:10px 16px;border-radius:999px;border:1px solid #dadce0;background:#fff;color:#1f1f1f;font-weight:700;font-size:14px;text-decoration:none}
  .gob-pref a:hover{background:#f8f9fa}
  .gob-pref-foot{margin-top:10px}.gob-pref-foot a{padding:7px 12px;font-size:12.5px}
  `;
  function style() { if (document.getElementById('gob-pref-css')) return; const s = document.createElement('style'); s.id = 'gob-pref-css'; s.textContent = css; document.head.append(s); }
  const link = text => `<a href="${URL}" target="_blank" rel="noopener" data-gob-pref>${G}<span>${text}</span></a>`;

  function article() {
    if (!/^\/blog\/[a-z0-9-]+\/?$/.test(location.pathname) || document.querySelector('.gob-pref')) return;
    const main = document.querySelector('main article') || document.querySelector('main');
    if (!main) return;
    main.insertAdjacentHTML('beforeend', `<aside class="gob-pref" aria-label="Follow Game of Bones on Google"><b>Found this useful?</b><p>Add Game of Bones as a preferred source on Google, and our pet-care guides will show up first when you search.</p>${link('Add as a preferred source on Google')}</aside>`);
  }
  function footer() {
    if (document.querySelector('.gob-pref-foot')) return;
    const foot = document.querySelector('footer .footer-bottom') || document.querySelector('footer');
    if (!foot) return;
    foot.insertAdjacentHTML('beforebegin', `<div class="gob-pref-foot">${link('Add us on Google')}</div>`);
  }
  document.addEventListener('click', e => {
    if (e.target.closest?.('[data-gob-pref]') && typeof window.gtag === 'function') window.gtag('event', 'preferred_source_click', { page: location.pathname });
  });
  function run() { style(); article(); footer(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(run, 300), { once: true });
  else setTimeout(run, 300);
  setTimeout(run, 2000);
})();
