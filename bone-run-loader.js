/* Bone Run launcher + loader for every storefront page (injected by site.js).
   Shows the "Play & win a treat" button, opens the game once per browser
   session 20 seconds after landing, and lazy-loads /bone-run.js. */
(() => {
  if (window.__gobBRLoaderRan) return; window.__gobBRLoaderRan = true;
  // Never on cart/checkout pages: the floating button must not cover the checkout button.
  if (/^\/(cart|checkout|login|thank-you)(\.html)?\/?$/i.test(location.pathname)) return;
  const init = () => {
    if (document.querySelector('#wheelLaunch')) return;
    const style = document.createElement('style');
    style.textContent = `
.br-launch{position:fixed;z-index:44;left:22px;bottom:22px;display:inline-flex;align-items:center;gap:10px;min-height:48px;border:1px solid #d8a52f;cursor:pointer;text-align:left;
  background:#102c22;color:#fffdf8;border-radius:999px;padding:0 16px 0 6px;font:800 11px/1.15 "DM Sans",system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;
  box-shadow:0 10px 28px rgba(16,44,34,.25);animation:brGlow 2.4s ease-in-out infinite;transition:transform .2s,background .2s}
.br-launch:hover,.br-launch:focus-visible{background:#245b42;transform:translateY(-2px)}
.br-launch .br-medal{flex:0 0 36px;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:17px;line-height:1;letter-spacing:0;background:radial-gradient(circle at 35% 30%,#f6dfa6,#c9963a 60%,#9a6e22)}
.br-launch .br-txt{display:flex;flex-direction:column;align-items:flex-start}
.br-launch small{font-weight:600;font-size:9.5px;letter-spacing:.06em;text-transform:none;opacity:.75;margin-top:2px;white-space:nowrap}
@keyframes brGlow{0%,100%{box-shadow:0 10px 28px rgba(16,44,34,.25),0 0 0 0 rgba(201,150,58,.45)}50%{box-shadow:0 10px 28px rgba(16,44,34,.25),0 0 0 8px rgba(201,150,58,0)}}
@media(max-width:760px){
  /* Play & win (left) and Rewards (right) sit side by side on one line. */
  .br-launch{left:max(16px,env(safe-area-inset-left))!important;right:auto!important;bottom:max(16px,env(safe-area-inset-bottom))!important;min-height:54px;height:54px;padding:0 14px 0 6px;font-size:10.5px;z-index:54}
  .br-launch .br-medal{width:42px;height:42px;flex-basis:42px;font-size:19px}
  .br-launch small{display:none}
  .reward-shortcut{bottom:max(16px,env(safe-area-inset-bottom))!important}
  body.br-buybar .br-launch,body.br-buybar .reward-shortcut,body:has(.mobile-purchase-bar) .br-launch,body:has(.mobile-purchase-bar) .reward-shortcut{bottom:calc(max(16px,env(safe-area-inset-bottom)) + 66px)!important}
  body:has(.cart-sticky-checkout:not([hidden])) .br-launch,body:has(.cart-sticky-checkout:not([hidden])) .reward-shortcut{bottom:calc(max(16px,env(safe-area-inset-bottom)) + 70px)!important}
}
.br-launch.br-has-prize .br-medal{position:relative}
.br-launch.br-has-prize .br-medal::after{content:"";position:absolute;top:0;right:0;width:11px;height:11px;border-radius:50%;background:#e2483d;box-shadow:0 0 0 2px #102c22}
@media(prefers-reduced-motion:reduce){.br-launch{animation:none}}`;
    document.head.append(style);
    document.body.insertAdjacentHTML('beforeend', `<button class="br-launch" id="wheelLaunch" type="button" aria-label="Play Bone Run and win a free treat"><span class="br-medal" aria-hidden="true">🦴</span><span class="br-txt">Play &amp; win a treat<small>Bone Run · free treats up to Mackerel</small></span></button>`);

    // Older in-app browsers do not support :has(); lift the buttons above the
    // product page's buy bar with a class instead.
    const markBuyBar = () => document.body.classList.toggle('br-buybar', Boolean(document.querySelector('.mobile-purchase-bar')));
    markBuyBar(); [600, 1500, 3000, 6000].forEach(ms => setTimeout(markBuyBar, ms));

    // Open the game for everyone 20 seconds after landing, once per session.
    const autoOpenKey = 'gob-wheel-auto-opened-v2';
    const openOnce = () => {
      // Never auto-open for someone who has already played Bone Run.
      try { if (sessionStorage.getItem(autoOpenKey) || localStorage.getItem('gob-bonerun-played')) return; } catch (_) {}
      const open = () => {
        try { if (sessionStorage.getItem(autoOpenKey) || localStorage.getItem('gob-bonerun-played')) return; sessionStorage.setItem(autoOpenKey, '1'); } catch (_) {}
        if (typeof window.GOB_openSpinWheel === 'function') window.GOB_openSpinWheel();
      };
      if (typeof window.GOB_openSpinWheel === 'function') open();
      else document.addEventListener('gob:wheel-ready', open, { once: true });
    };
    window.setTimeout(openOnce, 20_000);

    const load = () => {
      if (document.querySelector('script[data-gob-wheel-game]')) return;
      const script = document.createElement('script');
      script.dataset.gobWheelGame = 'true';
      script.src = '/bone-run.js?v=9';
      document.body.append(script);
    };
    if (document.readyState === 'complete') ('requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 2500 }) : setTimeout(load, 1200));
    else window.addEventListener('load', () => ('requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 2500 }) : setTimeout(load, 1200)), { once: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
