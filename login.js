(() => {
  // After logging in, return to the page the customer came from (e.g. /cart), if it is a safe on-site path.
  const nextPage = () => { const next = new URLSearchParams(location.search).get('next') || ''; return /^\/(?!\/)[A-Za-z0-9\-_/]*$/.test(next) ? next : '/account' }
  function message(target, text, kind = 'error') {
    if (!target) return
    target.textContent = text
    target.className = `login-result ${kind}`
  }

  function emailValid(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) }
  function phoneDigits(value) {
    const digits = String(value || '').replace(/\D/g, '')
    return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits
  }

  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#loginForm')
    const createForm = document.querySelector('#createAccountForm')
    const signInTab = document.querySelector('#signInTab')
    const createTab = document.querySelector('#createAccountTab')
    const lead = document.querySelector('#accountLead')
    const loginResult = document.querySelector('#loginResult')
    const createResult = document.querySelector('#createAccountResult')
    const loginEmail = document.querySelector('#loginEmail')
    const loginCode = document.querySelector('#loginCode')
    const loginCodeStep = document.querySelector('#codeStep')
    const changeEmail = document.querySelector('#changeEmail')
    const resendLogin = document.querySelector('#resendCode')
    const createName = document.querySelector('#createName')
    const createEmail = document.querySelector('#createEmail')
    const createPhone = document.querySelector('#createPhone')
    const createCode = document.querySelector('#createCode')
    const createCodeStep = document.querySelector('#createCodeStep')
    const resendCreate = document.querySelector('#resendCreateCode')
    const changeRegistration = document.querySelector('#changeRegistration')
    if (!loginForm || !createForm || !loginEmail || !loginCode || !createName || !createEmail || !createPhone || !createCode) return

    const selectMode = mode => {
      const create = mode === 'create'
      loginForm.hidden = create
      createForm.hidden = !create
      signInTab.classList.toggle('is-active', !create)
      createTab.classList.toggle('is-active', create)
      signInTab.setAttribute('aria-selected', String(!create))
      createTab.setAttribute('aria-selected', String(create))
      lead.textContent = create
        ? 'Set up your profile now. You can add a dog, address and start earning rewards before you place an order.'
        : 'Enter the email address linked to your account and we’ll send a one-time code.'
      message(create ? createResult : loginResult, '')
      ;(create ? createName : loginEmail).focus()
    }
    signInTab.addEventListener('click', () => selectMode('sign-in'))
    createTab.addEventListener('click', () => selectMode('create'))

    const resetLogin = () => {
      loginCodeStep.hidden = true; loginCode.required = false; loginCode.value = ''; loginEmail.readOnly = false
      changeEmail.hidden = true; resendLogin.hidden = true
      loginForm.querySelector('button[type="submit"]').textContent = 'Send secure code'
      message(loginResult, '')
    }
    changeEmail.addEventListener('click', () => { resetLogin(); loginEmail.focus() })
    resendLogin.addEventListener('click', async () => {
      resendLogin.disabled = true
      try { await window.GOB_API.requestLoginCode(loginEmail.value.trim().toLowerCase()); loginCode.value = ''; loginCode.focus(); message(loginResult, 'A new code is on its way. Only the newest code will work.', 'success') }
      catch (error) { message(loginResult, error.message || 'Unable to resend the code right now.') }
      finally { resendLogin.disabled = false }
    })
    loginForm.addEventListener('submit', async event => {
      event.preventDefault()
      const email = loginEmail.value.trim().toLowerCase()
      if (!emailValid(email)) return message(loginResult, 'Enter the email address linked to your account.')
      const submit = loginForm.querySelector('button[type="submit"]'); submit.disabled = true
      try {
        if (!loginCodeStep.hidden) {
          const code = loginCode.value.replace(/\D/g, '')
          if (!/^\d{6}$/.test(code)) throw new Error('Enter the six-digit code from your email.')
          const session = await window.GOB_API.verifyLoginCode(email, code)
          window.sessionStorage.setItem('gob-customer-token', session.token); window.location.assign(nextPage()); return
        }
        await window.GOB_API.requestLoginCode(email)
        loginCodeStep.hidden = false; loginCode.required = true; loginEmail.readOnly = true; changeEmail.hidden = false; resendLogin.hidden = false; loginCode.focus()
        submit.textContent = 'Verify secure code'
        message(loginResult, 'If this email is linked to an account, a six-digit code is on its way. Check your inbox and spam folder.', 'success')
      } catch (error) { message(loginResult, error.message || 'Unable to continue right now.') }
      finally { submit.disabled = false }
    })

    const registration = () => ({ name: createName.value.trim().replace(/\s+/g, ' '), email: createEmail.value.trim().toLowerCase(), phone: phoneDigits(createPhone.value) })
    const registrationValid = data => data.name.length >= 2 && emailValid(data.email) && /^\d{10}$/.test(data.phone)
    const lockRegistration = locked => {
      ;[createName, createEmail, createPhone].forEach(input => { input.readOnly = locked })
      createCodeStep.hidden = !locked; createCode.required = locked
      resendCreate.hidden = !locked; changeRegistration.hidden = !locked
      createForm.querySelector('button[type="submit"]').textContent = locked ? 'Create my account' : 'Email me a verification code'
    }
    const resetRegistration = () => { lockRegistration(false); createCode.value = ''; message(createResult, ''); createName.focus() }
    changeRegistration.addEventListener('click', resetRegistration)
    resendCreate.addEventListener('click', async () => {
      const details = registration(); resendCreate.disabled = true
      try { await window.GOB_API.requestAccountCreationCode(details); createCode.value = ''; createCode.focus(); message(createResult, 'A new code is on its way. Only the newest code will work.', 'success') }
      catch (error) { message(createResult, error.message || 'Unable to resend the code right now.') }
      finally { resendCreate.disabled = false }
    })
    createForm.addEventListener('submit', async event => {
      event.preventDefault()
      const details = registration()
      if (!registrationValid(details)) return message(createResult, 'Enter your name, a valid email address, and a 10-digit mobile number.')
      const submit = createForm.querySelector('button[type="submit"]'); submit.disabled = true
      try {
        if (!createCodeStep.hidden) {
          const code = createCode.value.replace(/\D/g, '')
          if (!/^\d{6}$/.test(code)) throw new Error('Enter the six-digit code from your email.')
          const session = await window.GOB_API.verifyAccountCreationCode({ ...details, code })
          window.sessionStorage.setItem('gob-customer-token', session.token); window.location.assign(nextPage()); return
        }
        await window.GOB_API.requestAccountCreationCode(details)
        lockRegistration(true); createCode.focus()
        message(createResult, 'We sent a six-digit verification code to your email. Check your inbox and spam folder.', 'success')
      } catch (error) {
        if (error.message === 'An account is already linked to these details. Please sign in instead.') {
          selectMode('sign-in')
          loginEmail.value = details.email
          message(loginResult, 'You already have an account. Use Sign in to receive your secure code.', 'success')
        } else {
          message(createResult, error.message || 'Unable to create your account right now.')
        }
      }
      finally { submit.disabled = false }
    })
  })
})()
