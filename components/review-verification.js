/* Customer review purchase verification. The server returns only a boolean. */
(function () {
  window.verifyReviewPurchase = function () {
    var phone = document.getElementById('review-phone').value.trim().replace(/\D/g, '');
    document.getElementById('review-phone-error').textContent = '';
    document.getElementById('review-verify-status').textContent = '';
    if (phone.length < 10) {
      document.getElementById('review-phone-error').textContent = 'Enter valid 10-digit number';
      reviewVerified = false;
      return;
    }
    var phoneLast10 = phone.slice(-10);
    var productName = (products[currentReviewIdx] && products[currentReviewIdx].name) || '';
    document.getElementById('review-verify-status').textContent = 'Verifying...';
    postCustomerData('public-review-purchase', { phone: phone, productName: productName })
      .then(function (response) { return response.ok ? response.json() : Promise.reject(new Error('Verification failed')); })
      .then(function (result) {
        if (result.purchased) {
          reviewVerified = true;
          reviewVerifiedPhone = phoneLast10;
          document.getElementById('review-verify-status').textContent = '✓ Verified';
          document.getElementById('review-phone-error').textContent = '';
        } else {
          document.getElementById('review-phone-error').textContent = 'No purchase history for this product';
        }
      })
      .catch(function () { document.getElementById('review-phone-error').textContent = 'Verification error'; });
  };
}());
