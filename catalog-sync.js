/* Keep public product presentation in sync with the admin product editor.
   Static copy remains as a graceful fallback if the API is temporarily down. */
(() => {
  const slug = value => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const safeMoney = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
  const productStore = () => typeof GOB_PRODUCTS !== 'undefined' ? GOB_PRODUCTS : (window.GOB_PRODUCTS ||= {});
  /* A legacy Goat Trachea upload was accidentally attached to Chicken Bones.
     Keep storefront galleries product-safe while the admin record is cleaned. */
  const invalidMedia = new Set([
    'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/937c9539-b00d-4e93-9291-1af00893a061/image-1-1782745615470.png'
  ]);
  const media = (items, type) => (Array.isArray(items) ? items : [])
    .filter(item => typeof item === 'string' && item && !invalidMedia.has(item))
    .map((src, index) => ({ type, src, label: `${type === 'video' ? 'Video' : 'Photo'} ${index + 1}` }));
  const packs = sizes => (Array.isArray(sizes) ? sizes : []).map(size => ({
    label: String(size?.label || '').trim(),
    weight: Number(size?.weight_grams) > 0 ? `${Number(size.weight_grams)} g` : '',
    price: safeMoney(size?.price),
    compare_price: safeMoney(size?.compare_price),
  })).filter(size => size.label);

  async function syncCatalogue() {
    if (!window.GOB_API?.catalogue || !Array.isArray(window.GOB_LIVE_CATALOG)) return;
    try {
      const response = await window.GOB_API.catalogue();
      const remote = Array.isArray(response.products) ? response.products : [];
      const byName = new Map(remote.map(item => [slug(item.name), item]));
      const known = new Set();
      const merged = window.GOB_LIVE_CATALOG.reduce((items, item) => {
        const source = byName.get(slug(item.n));
        if (!source) { items.push(item); return items; }
        known.add(slug(item.n));
        if (!source.is_active) return items;
        const productPacks = packs(source.sizes) || window.GOB_CATALOGUE_REFERENCE?.packs(source.name);
        const productMedia = [...media(source.images, 'image'), ...media(source.videos, 'video')].slice(0, 6);
        const first = productPacks[0];
        const price = first?.price || safeMoney(source.price) || item.p;
        items.push({
          ...item,
          p: price,
          w: first?.weight || item.w,
          i: source.image_url || source.images?.[0] || item.i,
          packs: productPacks,
          media: productMedia,
          bestseller: Boolean(source.is_bestseller),
        });
        return items;
      }, []);

      remote.forEach(source => {
        if (!source.is_active || known.has(slug(source.name))) return;
        const productPacks = packs(source.sizes) || window.GOB_CATALOGUE_REFERENCE?.packs(source.name);
        const first = productPacks[0];
        const productMedia = [...media(source.images, 'image'), ...media(source.videos, 'video')].slice(0, 6);
        merged.push({
          n: source.name,
          c: 'Treats',
          w: first?.weight || '',
          p: first?.price || safeMoney(source.price),
          d: 'Single-ingredient treat from Game of Bones.',
          i: source.image_url || source.images?.[0] || 'assets/gob-logo.png',
          id: slug(source.name),
          packs: productPacks,
          media: productMedia,
          bestseller: Boolean(source.is_bestseller),
        });
      });

      window.GOB_LIVE_CATALOG.splice(0, window.GOB_LIVE_CATALOG.length, ...merged);
      const store = productStore();
      merged.forEach(item => {
        const id = item.id || slug(item.n);
        const source = byName.get(slug(item.n));
        const packs = Array.isArray(item.packs) ? item.packs : [];
        const base = { name: item.n, price: safeMoney(item.p), image: item.i, tag: item.c, packLabel: packs[0]?.label || '' };
        store[id] = base;
        if (source?.id) store[source.id] = base;
        packs.forEach((pack, index) => {
          const selected = { name: item.n, price: safeMoney(pack.price), image: item.i, tag: item.c, packLabel: pack.label || '' };
          const packId = `${id}-pack-${index + 1}`;
          store[packId] = selected;
          if (source?.id) store[`${source.id}-pack-${index + 1}`] = selected;
        });
      });
      document.dispatchEvent(new CustomEvent('gob:catalog-sync', { detail: { count: merged.length } }));
    } catch (error) {
      console.warn('Using the saved product catalogue until the live feed is available.', error);
    }
  }

  document.addEventListener('DOMContentLoaded', syncCatalogue);
})();
