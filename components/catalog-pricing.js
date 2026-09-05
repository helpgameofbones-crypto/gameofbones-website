(function () {
  'use strict';

  // Selling prices transcribed from the supplied COGS workbook (Chicken, Goat,
  // Fish and Others tabs). Keeping this in a module makes the workbook the
  // single reviewable source for storefront pack prices during the migration.
  var workbookPacks = {
    'Chicken Jerky': [['60 Grams', 329], ['120 Grams', 658], ['180 Grams', 987], ['240 Grams', 1316]],
    'Chicken Neck': [['70 Grams', 300], ['140 Grams', 600], ['210 Grams', 900], ['280 Grams', 1200]],
    'Chicken Feet': [['70 Grams', 300], ['140 Grams', 600], ['210 Grams', 900], ['280 Grams', 1200]],
    'Goat Trotter': [['1 Piece', 250], ['2 Pieces', 500], ['3 Pieces', 750], ['4 Pieces', 1000]],
    'Goat Liver': [['60 Grams', 450], ['120 Grams', 900], ['180 Grams', 1350], ['240 Grams', 1800]],
    'Goat Lungs': [['60 Grams', 450], ['120 Grams', 900], ['180 Grams', 1350], ['240 Grams', 1800]],
    'Whole Mackerel': [['100 Grams', 600], ['200 Grams', 1200], ['300 Grams', 1800]],
    'Mackerel Fillet': [['60 Grams', 650], ['120 Grams', 1300], ['180 Grams', 1950], ['240 Grams', 2600]],
    'Anchovies': [['60 Grams', 350], ['120 Grams', 700], ['180 Grams', 1050], ['240 Grams', 1400]],
    'Whole Quail': [['1 Piece', 275], ['2 Pieces', 550], ['3 Pieces', 825], ['4 Pieces', 1100]],
    'Buff Jerky': [['60 Grams', 449], ['120 Grams', 898], ['180 Grams', 1347], ['240 Grams', 1796]]
  };

  function buildSizes(packs) {
    return packs.map(function (pack, index) {
      return { label: 'Pack of ' + (index + 1) + ' · ' + pack[0], price: pack[1], mrp: pack[1] };
    });
  }

  function catalog() {
    // `products` is a top-level `let` in the legacy storefront, so it is not a
    // window property even though later classic scripts can still read it.
    return typeof products !== 'undefined' ? products : window.products;
  }

  function refreshVisibleCatalog() {
    var currentProducts = catalog();
    if (typeof window.renderProducts !== 'function' || !Array.isArray(currentProducts)) return;
    var home = document.getElementById('homeProd');
    var shop = document.getElementById('shopProd');
    if (home) window.renderProducts(currentProducts.slice(0, 4), 'homeProd');
    if (shop) window.renderProducts(currentProducts, 'shopProd');
  }

  function applyWorkbookPrices() {
    var currentProducts = catalog();
    if (!Array.isArray(currentProducts)) return false;
    currentProducts.forEach(function (product) {
      var packs = workbookPacks[product.name];
      if (!packs) return;
      product.sizes = buildSizes(packs);
      product.weight = packs[0][0];
    });
    refreshVisibleCatalog();
    window.dispatchEvent(new CustomEvent('gob:catalog-prices-ready'));
    return true;
  }

  window.GobCatalogPricing = Object.freeze({ source: 'COGS workbook — September 2026', apply: applyWorkbookPrices, packs: workbookPacks });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyWorkbookPrices);
  else applyWorkbookPrices();
}());
