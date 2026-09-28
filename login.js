(() => {
  function show(message, kind = 'error') { const result = document.querySelector('#loginResult'); if (!result) return; result.textContent = message; result.className = `login-result ${kind}`; }
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#loginForm'), codeStep = document.querySelector('#codeStep'), phoneInput = document.querySelector('#loginPhone'), codeInput = document.querySelector('#loginCode'), changeNumber = document.querySelector('#changeNumber'), resendCode = document.querySelector('#resendCode');
    if (!form || !phoneInput || !codeInput) return;
    const resetCodeStep = () => { codeStep.hidden = true; codeInput.required = false; codeInput.value = ''; phoneInput.readOnly = false; if (changeNumber) changeNumber.hidden = true; if (resendCode) resendCode.hidden = true; const submit = form.querySelector('button[type="submit"]'); if (submit) submit.textContent = 'Send secure code'; show(''); };
    changeNumber?.addEventListener('click', () => { resetCodeStep(); phoneInput.focus(); });
    resendCode?.addEventListener('click', async () => { resendCode.disabled = true; try { await window.GOB_API.requestLoginCode(phoneInput.value.replace(/\D/g, '').slice(-10)); codeInput.value = ''; codeInput.focus(); show('A new code is on its way. Only the newest code will work.', 'success'); } catch (error) { show(error.message || 'Unable to resend the code right now.'); } finally { resendCode.disabled = false; } });
    form.addEventListener('submit', async event => {
      event.preventDefault(); const phone = phoneInput.value.replace(/\D/g, '').slice(-10);
      if (!/^\d{10}$/.test(phone)) return show('Enter a valid 10-digit mobile number.');
      const submit = form.querySelector('button[type="submit"]'); submit.disabled = true;
      try {
        if (!codeStep.hidden) { const code = codeInput.value.replace(/\D/g, ''); if (!/^\d{6}$/.test(code)) throw new Error('Enter the six-digit code from your email.'); const session = await window.GOB_API.verifyLoginCode(phone, code); window.sessionStorage.setItem('gob-customer-token', session.token); window.sessionStorage.setItem('gob-customer-phone', phone); window.location.assign('/account'); return; }
        await window.GOB_API.requestLoginCode(phone); codeStep.hidden = false; codeInput.required = true; phoneInput.readOnly = true; if (changeNumber) changeNumber.hidden = false; if (resendCode) resendCode.hidden = false; codeInput.focus(); submit.textContent = 'Verify secure code'; show('If this number is linked to an account, a six-digit code is on its way to the saved email address. Check your inbox and spam folder.', 'success');
      } catch (error) { show(error.message || 'Unable to continue right now.'); } finally { submit.disabled = false; }
    });
  });
})();
