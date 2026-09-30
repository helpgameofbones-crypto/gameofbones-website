(() => {
  const prizes = [
    { label: '10% off' }, { label: '15% off' }, { label: '20% off' },
    { label: '10% off' }, { label: '15% off' }, { label: '20% off' },
  ];

  async function customerKey({ email, phone }) {
    const value = `${email.trim().toLowerCase()}|${phone.replace(/\D/g, '').slice(-10)}`;
    const bytes = new TextEncoder().encode(`gob-spin-v1:${value}`);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function awardMarkup(award, message) {
    return `<span class="wheel-prize"><span>${message}</span><strong>${award.label}</strong><span class="wheel-code">Your code: ${award.detail}</span></span><small>Keep this code for checkout. One spin is allowed per customer.</small><a class="button wheel-shop" href="products.html">Shop treats</a><button class="wheel-again" type="button">Close</button>`;
  }

  function installWheel() {
    const modal = document.querySelector('#wheelModal');
    const form = document.querySelector('#wheelForm');
    if (!modal || !form) return;
    if (!document.querySelector('link[href="wheel-game.css?v=wheel-8"]')) {
      const stylesheet = document.createElement('link'); stylesheet.rel = 'stylesheet'; stylesheet.href = 'wheel-game.css?v=wheel-8'; document.head.append(stylesheet);
    }

    const intro = modal.querySelector('.wheel-card > p:not(.eyebrow)');
    intro?.classList.add('wheel-intro');
    intro.textContent = 'Fill in your details, then spin once to see the offer you landed on.';
    form.innerHTML = `<label class="wheel-form-label">Name <input required name="name" autocomplete="name" placeholder="Your name"></label><label class="wheel-form-label">Email <input required name="email" type="email" autocomplete="email" placeholder="you@example.com"></label><label class="wheel-form-label">Mobile number <input required name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="10-digit mobile number" pattern="[0-9]{10}" title="Enter a 10-digit mobile number"></label><label class="wheel-consent"><input required name="marketing_consent" type="checkbox" value="true"> <span>Send me this offer and occasional Game of Bones news. I can unsubscribe anytime.</span></label><button class="button wheel-continue" type="submit">Continue to the wheel</button>`;
    modal.querySelector('#wheelResult')?.remove();
    const close = () => modal.classList.remove('open');
    const open = () => {
      modal.classList.add('open');
      form.hidden = false;
      modal.querySelector('.wheel-play,.wheel-previous')?.remove();
      modal.querySelector('input[name="name"]')?.focus();
    };
    document.querySelector('#wheelLaunch')?.addEventListener('click', open);
    modal.querySelector('[data-wheel-close]')?.addEventListener('click', close);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) close(); });
    modal.addEventListener('click', event => { if (event.target === modal) close(); });

    form.addEventListener('submit', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!form.reportValidity()) return;
      const capture = Object.fromEntries(new FormData(form));
      capture.marketing_consent = capture.marketing_consent === 'true';
      const card = modal.querySelector('.wheel-card');
      const continueButton = form.querySelector('button[type="submit"]');
      continueButton.disabled = true; continueButton.textContent = 'Checking your spin…';
      let key, award, alreadySpun = false;
      try {
        key = await customerKey(capture);
        const localAward = JSON.parse(localStorage.getItem(`gob-spin:${key}`) || 'null');
        if (localAward) { award = localAward; alreadySpun = true; }
        else {
          const serverAward = await window.GOB_API?.spinWheel(capture);
          award = { label: serverAward.prize, detail: serverAward.coupon_code };
          alreadySpun = Boolean(serverAward.alreadySpun);
          localStorage.setItem(`gob-spin:${key}`, JSON.stringify(award));
        }
      } catch (error) {
        form.querySelector('.wheel-error')?.remove();
        form.insertAdjacentHTML('beforeend', `<p class="wheel-error" role="alert">We could not create your offer right now. Please try again in a moment.</p>`);
        return;
      } finally { continueButton.disabled = false; continueButton.textContent = 'Continue to the wheel'; }

      form.hidden = true;
      card.querySelector('.wheel-play,.wheel-previous')?.remove();
      if (alreadySpun) {
        intro.textContent = 'You have already used your one spin. Here is the reward saved for this customer.';
        card.insertAdjacentHTML('beforeend', `<section class="wheel-previous"><div class="wheel-status">${awardMarkup(award, 'Your saved reward')}</div></section>`);
        card.querySelector('.wheel-again')?.addEventListener('click', close);
        return;
      }

      intro.textContent = 'Your welcome offer is on the wheel. It will stop on one prize.';
      card.insertAdjacentHTML('beforeend', `<section class="wheel-play" aria-label="Spin to win prize wheel"><div class="wheel-stage"><span class="wheel-pointer" aria-hidden="true"></span><div class="prize-wheel" id="prizeWheel" role="img" aria-label="Prize wheel with six welcome offers"><span class="wheel-segment wheel-s1">15%<br>OFF</span><span class="wheel-segment dark wheel-s2">₹75<br>OFF</span><span class="wheel-segment wheel-s3">10%<br>OFF</span><span class="wheel-segment wheel-s4">FREE<br>SHIP</span><span class="wheel-segment wheel-s5">₹50<br>OFF</span><span class="wheel-segment dark wheel-s6">20%<br>OFF</span><span class="wheel-hub">SPIN</span></div></div><p class="wheel-status" aria-live="polite">Spinning your welcome offer…</p></section>`);
      const wheel = card.querySelector('#prizeWheel'), status = card.querySelector('.wheel-status');
      const chosenIndex = prizes.findIndex(prize => prize.label === award.label);
      requestAnimationFrame(() => { wheel.style.transform = `rotate(${2160 - Math.max(0, chosenIndex) * 60}deg)`; });
      window.setTimeout(() => {
        card.classList.add('wheel-result-ready'); card.scrollTo({ top: 0, behavior: 'smooth' });
        status.innerHTML = awardMarkup(award, 'You landed on'); status.querySelector('.wheel-again')?.addEventListener('click', close);
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 4200);
    }, true);
  }
  // index.html loads this optional feature after the page's load event to
  // protect first-paint performance. By then DOMContentLoaded has already
  // happened, so do not wait for an event that will never fire.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installWheel, { once: true });
  else installWheel();
})();
