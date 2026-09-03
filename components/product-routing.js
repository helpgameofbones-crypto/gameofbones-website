(function () {
  function slugFor(product) { return String(product && product.name || '').toLowerCase().replace(/[&\s]+/g, '-'); }
  window.GobProductRoute = Object.freeze({ slugFor: slugFor, pathFor: function (product) { return '/products/' + slugFor(product); } });

  window.injectProductSchema = function (product) {
    try {
      var previous = document.getElementById('product-schema-ld');
      if (previous) previous.remove();
      var image = product.img && product.img.startsWith('http') ? product.img : SUPABASE_IMG_URL + product.img;
      var prices = (product.sizes || []).map(function (size) { return size.price; });
      var schema = {
        '@context': 'https://schema.org', '@type': 'Product', name: product.name, image: [image], description: product.desc || '',
        brand: { '@type': 'Brand', name: 'Game of Bones' },
        offers: { '@type': 'AggregateOffer', priceCurrency: 'INR', lowPrice: prices.length ? Math.min.apply(null, prices) : 0, highPrice: prices.length ? Math.max.apply(null, prices) : 0, offerCount: prices.length, availability: 'https://schema.org/InStock', url: 'https://gameofbones.in' + window.GobProductRoute.pathFor(product) }
      };
      var rating = typeof getProductRating === 'function' ? getProductRating(product.name) : null;
      if (rating && rating.count > 0) schema.aggregateRating = { '@type': 'AggregateRating', ratingValue: rating.avg, reviewCount: rating.count, bestRating: 5, worstRating: 1 };
      var tag = document.createElement('script'); tag.type = 'application/ld+json'; tag.id = 'product-schema-ld'; tag.text = JSON.stringify(schema); document.head.appendChild(tag);
    } catch (error) { console.log('schema inject failed', error); }
  };
}());
