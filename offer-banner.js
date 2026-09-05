(() => {
  const offers = [
    { copy: 'WELCOME15: 15% off your first order', href: 'products.html' },
    { copy: 'Pay online and get ₹30 off', href: 'checkout.html' },
    { copy: 'Buy 3+ treats, save 5% automatically', href: 'products.html#buyMoreTitle' },
    { copy: 'MEGA20: 20% off orders above ₹2,199', href: 'products.html' },
    { copy: 'Free shipping on every order', href: 'products.html' }
  ];
  function setup() {
    const notice = document.querySelector('.notice'); if (!notice || notice.dataset.offersReady) return; notice.dataset.offersReady = 'true';
    let index = 0, paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches, timer;
    notice.innerHTML = '<div class="offer-rotator" aria-live="polite"><span class="offer-kicker">Game of Bones</span><a class="offer-copy offer-link" href="products.html"></a></div><button class="offer-toggle" type="button" aria-label="Pause offers" aria-pressed="false"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M8 6v12M16 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
    const link = notice.querySelector('.offer-link'), toggle = notice.querySelector('.offer-toggle');
    const draw = immediate => { const offer = offers[index]; if (!immediate) link.classList.add('leaving'); window.setTimeout(() => { link.textContent = offer.copy; link.href = offer.href; link.classList.remove('leaving'); }, immediate ? 0 : 160); };
    const schedule = () => { window.clearInterval(timer); if (!paused) timer = window.setInterval(() => { index = (index + 1) % offers.length; draw(false); }, 4200); };
    draw(true); schedule();
    toggle.addEventListener('click', () => { paused = !paused; toggle.setAttribute('aria-pressed', String(paused)); toggle.setAttribute('aria-label', paused ? 'Play offers' : 'Pause offers'); toggle.innerHTML = paused ? '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m8 5 10 7-10 7V5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>' : '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M8 6v12M16 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; schedule(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
