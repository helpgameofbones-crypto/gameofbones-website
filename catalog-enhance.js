const gobSlug = value => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const gobMethod = product => product.c === 'Jerky' ? ['Slow-dehydrated at 65°C', 'Training rewards & everyday treats'] : product.c === 'Chews & bones' ? ['Slow-dehydrated at 58°C', 'Supervised chew time'] : product.c === 'Organ treats' ? ['Slow-dehydrated at 52–55°C', 'Small, occasional rewards'] : product.c === 'Fish treats' ? ['Slow-dehydrated at low heat', 'High-value treat time'] : product.c === 'Whole prey' ? ['Slow-dehydrated at low heat', 'Supervised treat time'] : ['Curated by the Game of Bones team', 'Discovery and variety'];
const gobProducts = () => typeof GOB_PRODUCTS !== 'undefined' ? GOB_PRODUCTS : (window.GOB_PRODUCTS ||= {});
const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };

function currentProduct() {
  const params = new URLSearchParams(location.search);
  const routeSlug = location.pathname.match(/^\/products\/([^/]+)\/?$/)?.[1];
  const id = params.get('catalog') || params.get('product') || (routeSlug ? decodeURIComponent(routeSlug) : '');
  return id && window.GOB_LIVE_CATALOG.find(item => (item.id || gobSlug(item.n)) === id || gobSlug(item.n) === id);
}

function hydrateCatalogCards(root) {
  root.querySelectorAll('.product-card').forEach(card => {
    const product = window.GOB_LIVE_CATALOG.find(item => item.n === card.querySelector('h3')?.textContent.trim());
    if (!product) return;
    const id = product.id || gobSlug(product.n);
    gobProducts()[id] = { name: product.n, price: Number(product.p) || 0, image: product.i, tag: product.c };
    const link = card.querySelector('a');
    if (link) link.href = `/products/${encodeURIComponent(gobSlug(product.n))}`;
    const image = card.querySelector('.product-image img');
    if (image && product.i) { image.src = product.i; image.alt = product.n; }
    const price = card.querySelector('.card-bottom span');
    if (price) price.textContent = `${product.w || 'Pack'} · ${product.p ? `₹${Number(product.p).toLocaleString('en-IN')}` : 'Ask us'}`;
  });
}

function hydrateProduct() {
  const product = currentProduct();
  if (!product || !document.querySelector('#productName')) return;
  const [method, bestFor] = gobMethod(product);
  const id = product.id || gobSlug(product.n);
  window.GOB_CURRENT_PRODUCT = product;
  gobProducts()[id] = { name: product.n, price: Number(product.p) || 0, image: product.i, tag: product.c };
  document.title = `${product.n} — Game of Bones`;
  const cleanUrl = `https://gameofbones.in/products/${encodeURIComponent(gobSlug(product.n))}`;
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
  canonical.href = cleanUrl;
  window.GOB_SEO?.setProductSchema(product, cleanUrl);
  const description = `${product.n}: ${product.d || 'single-ingredient dog treat from Game of Bones.'}`;
  let descriptionMeta = document.querySelector('meta[name="description"]');
  if (!descriptionMeta) { descriptionMeta = document.createElement('meta'); descriptionMeta.name = 'description'; document.head.append(descriptionMeta); }
  descriptionMeta.content = description;
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', cleanUrl);
  setText('#productName', product.n);
  setText('#productPrice', product.p ? `₹${Number(product.p).toLocaleString('en-IN')}` : 'Contact us');
  setText('#productTag', `${product.c} · Made in Kalyan`);
  setText('#productDesc', product.d);
  setText('#inside', `${product.n}. Single ingredient; see the product pouch for the current label.`);
  setText('#labelIngredient', `${product.n}.`);
  setText('#specMethod', method);
  setText('#specPack', `${product.w} · packed fresh`);
  setText('#specBest', bestFor);
  /* Keep the gallery aligned with the product title immediately; the complete
     admin gallery replaces this single safe fallback as soon as it arrives. */
  if (window.GOB_SET_PRODUCT_MEDIA) {
    if (product.media?.length) window.GOB_SET_PRODUCT_MEDIA(id, product.media);
    else if (!window.GOB_PRODUCT_MEDIA?.[id]?.length && product.i) {
      window.GOB_SET_PRODUCT_MEDIA(id, [{ type: 'image', src: product.i, alt: product.n, label: 'Product photo' }]);
    }
  }
  document.dispatchEvent(new CustomEvent('gob:product-ready', { detail: { product } }));
}

document.addEventListener('DOMContentLoaded', () => {
  const catalog = document.querySelector('#liveCatalog');
  if (catalog) {
    hydrateCatalogCards(catalog);
    new MutationObserver(() => hydrateCatalogCards(catalog)).observe(catalog, { childList: true, subtree: true });
  }
  hydrateProduct();
});
document.addEventListener('gob:catalog-sync', () => {
  const catalog = document.querySelector('#liveCatalog');
  if (catalog) hydrateCatalogCards(catalog);
  hydrateProduct();
});
