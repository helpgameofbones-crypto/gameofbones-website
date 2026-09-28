(() => {
  const params = new URLSearchParams(window.location.search);
  const order = params.get('order');
  const payment = params.get('payment');
  const reference = document.querySelector('#confirmation-order');
  const copy = document.querySelector('#confirmation-copy');
  if (order && reference) reference.textContent = order;
  if (copy) copy.textContent = payment === 'cod'
    ? 'Your Cash on Delivery order is confirmed. Keep the order reference handy for any delivery questions.'
    : 'Your payment was received and your order is confirmed. We’ll keep you updated from dispatch to delivery.';
})();
