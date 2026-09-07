(() => {
  const form = document.querySelector('#contactForm');
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('#contactStatus');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    button.disabled = true; button.textContent = 'Sending…'; status.className = 'form-success'; status.removeAttribute('style'); status.textContent = '';
    try {
      await window.GOB_API.contactInquiry(data);
      status.textContent = 'Thanks—we have received your message. Our team will get back to you soon.';
      status.classList.add('show'); status.removeAttribute('style'); form.reset();
    } catch (error) {
      status.textContent = error.message || 'We could not send your message. Please try again or use WhatsApp.';
      status.classList.add('show'); status.style.color = '#a22c22';
    } finally { button.disabled = false; button.textContent = 'Send message'; }
  });
})();
