(() => {
  function show(message, kind = 'error') { const result = document.querySelector('#loginResult'); if (!result) return; result.textContent = message; result.className = `login-result ${kind}`; }
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm'), codeStep = document.querySelector('#codeStep'), phoneInput = document.querySelector('#loginPhone'), codeInput = document.querySelector('#loginCode');
    if (!form || !phoneInput || !codeInput) return;
    form.addEventListener('submit', async event => {
      event.preventDefault(); const phone = phoneInput.value.replace(/\D/g, '').slice(-10);
      if (!/^\d{10}$/.test(phone)) return show('Enter a valid 10-digit mobile number.');
      const submit = form.querySelector('button[type="submit"]'); submit.disabled = true;
      try {
        if (!codeStep.hidden) { const code = codeInput.value.replace(/\D/g, ''); if (!/^\d{6}$/.test(code)) throw new Error('Enter the six-digit code from your email.'); const session = await window.GOB_API.verifyLoginCode(phone, code); window.sessionStorage.setItem('gob-customer-token', session.token); window.sessionStorage.setItem('gob-customer-phone', phone); window.location.assign('account.html'); return; }
        const response = await window.GOB_API.requestLoginCode(phone); codeStep.hidden = false; codeInput.required = true; codeInput.focus(); submit.textContent = 'Verify secure code'; show(`A six-digit code was sent to ${response.emailHint}.`, 'success');
      } catch (error) { show(error.message || 'Unable to continue right now.'); } finally { submit.disabled = false; }
    });
  });
})();
