/* "Dogs of Game of Bones": real customer photos from published, verified-purchase reviews.
   Stays hidden until at least 3 photos exist, so the homepage never shows an empty or padded gallery. */
(() => {
  const box = document.getElementById('gobDogs');
  if (!box) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  fetch('/api/public-product-reviews?photos=1', { headers: { Accept: 'application/json' } })
    .then(r => r.ok ? r.json() : { photos: [] })
    .then(({ photos = [] }) => {
      const list = photos.filter(p => p && p.photo_url).slice(0, 8);
      if (list.length < 3) return;
      box.querySelector('.dogs-grid').innerHTML = list.map(p => `<figure class="dog-tile"><img src="${esc(p.photo_url)}" alt="${esc(p.name.split(' ·')[0])}’s dog with ${esc(p.product)}" loading="lazy"><figcaption><b>${'★'.repeat(Math.max(1, Math.min(5, p.rating || 5)))}</b> ${esc(p.product)}${p.review ? `<span>“${esc(p.review.slice(0, 90))}${p.review.length > 90 ? '…' : ''}”</span>` : ''}<small>${esc(p.name)}</small></figcaption></figure>`).join('');
      box.hidden = false;
    })
    .catch(() => {});
})();
