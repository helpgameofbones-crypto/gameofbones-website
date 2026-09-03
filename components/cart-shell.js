(function () {
  window._saveCart = function () {
    try { localStorage.setItem('gobCartItems', JSON.stringify(cartItems)); } catch (error) { console.warn('Unable to persist cart', error); }
  };

  window.toggleCart = function () {
    var drawer = document.getElementById('cartDrawer'), overlay = document.getElementById('cartOverlay');
    if (!drawer || !overlay) return;
    if (drawer.classList.contains('open')) {
      drawer.style.transform = 'translateX(100%)'; overlay.style.opacity = '0'; overlay.style.display = 'none'; drawer.classList.remove('open'); document.body.style.overflow = '';
    } else {
      renderCartDrawer(); overlay.style.display = 'block'; requestAnimationFrame(function () { overlay.style.opacity = '1'; drawer.style.transform = 'translateX(0)'; }); drawer.classList.add('open'); document.body.style.overflow = 'hidden';
    }
  };

  window.updateCartBadge = function () {
    var total = cartItems.reduce(function (sum, item) { return sum + item.qty; }, 0);
    var badge = document.getElementById('cartCount'); if (badge) badge.textContent = total;
    if (typeof _debouncedAbandonedCartSync === 'function') _debouncedAbandonedCartSync();
  };
}());
