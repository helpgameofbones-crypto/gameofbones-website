(() => {
  function show(message, kind = 'error') { const result = document.querySelector('#loginResult'); if (!result) return; result.textContent = message; result.className = `login-result ${kind}`; }
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm'), codeStep = document.querySelector('#codeStep'), emailInput = document.querySelector('#loginEmail'), codeInput = document.querySelector('#loginCode'), changeEmail = document.querySelector('#changeEmail'), resendCode = document.querySelector('#resendCode');
    if (!form || !emailInput || !codeInput) return;
    const email = () => emailInput.value.trim().toLowerCase();
    const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const resetCodeStep = () => { codeStep.hidden = true; codeInput.required = false; codeInput.value = ''; emailInput.readOnly = false; if (changeEmail) changeEmail.hidden = true; if (resendCode) resendCode.hidden = true; const submit = form.querySelector('button[type="submit"]'); if (submit) submit.textContent = 'Send secure code'; show(''); };
    changeEmail?.addEventListener('click', () => { resetCodeStep(); emailInput.focus(); });
    resendCode?.addEventListener('click', async () => { resendCode.disabled = true; try { await window.GOB_API.requestLoginCode(email()); codeInput.value = ''; codeInput.focus(); show('A new code is on its way. Only the newest code will work.', 'success'); } catch (error) { show(error.message || 'Unable to resend the code right now.'); } finally { resendCode.disabled = false; } });
    form.addEventListener('submit', async event => {
      event.preventDefault(); const address = email();
      if (!validEmail(address)) return show('Enter the email address linked to your account.');
      const submit = form.querySelector('button[type="submit"]'); submit.disabled = true;
      try {
        if (!codeStep.hidden) { const code = codeInput.value.replace(/\D/g, ''); if (!/^\d{6}$/.test(code)) throw new Error('Enter the six-digit code from your email.'); const session = await window.GOB_API.verifyLoginCode(address, code); window.sessionStorage.setItem('gob-customer-token', session.token); window.location.assign('/account'); return; }
        await window.GOB_API.requestLoginCode(address); codeStep.hidden = false; codeInput.required = true; emailInput.readOnly = true; if (changeEmail) changeEmail.hidden = false; if (resendCode) resendCode.hidden = false; codeInput.focus(); submit.textContent = 'Verify secure code'; show('If this email is linked to an account, a six-digit code is on its way. Check your inbox and spam folder.', 'success');
      } catch (error) { show(error.message || 'Unable to continue right now.'); } finally { submit.disabled = false; }
    });
  });
})();
