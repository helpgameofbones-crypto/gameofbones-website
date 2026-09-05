/* Canonical product packs from Product Catalogue.xlsx.  This keeps the
   storefront accurate while product records are maintained in the admin. */
(() => {
  const reference = {
    'whole-quail': [['1 piece',399],['2 pieces',799],['3 pieces',1149],['4 pieces',1499]],
    'chicken-wings': [['5 pieces',399],['10 pieces',799],['15 pieces',1149]],
    'trachea-chew': [['1 piece',299],['2 pieces',599],['3 pieces',849]],
    'goat-trotter': [['1 piece',299],['2 pieces',599],['3 pieces',849],['4 pieces',1099]],
    'goat-ear': [['6 pieces',299],['12 pieces',599],['18 pieces',899],['24 pieces',1049]],
    'chicken-neck': [[70,300],[140,599],[210,849],[280,1049]],
    'chicken-feet': [[70,300],[140,599],[210,849],[280,1049]],
    'chicken-jerky': [[60,329],[120,658],[180,987],[240,1316]],
    'chicken-neck-and-feet': [[70,300],[140,599],[210,849],[280,1049]],
    'chicken-bones': [[100,349],[200,679],[300,999],[400,1199]],
    'chicken-gizzards': [[60,359],[120,699],[180,1049],[240,1249]],
    'chicken-liver': [[60,359],[120,699],[180,1049],[240,1249]],
    'chicken-bites': [[60,329],[120,658],[180,987],[240,1316]],
    'goat-liver': [[60,549],[120,1049],[180,1549],[240,2049]],
    'goat-lungs': [[60,549],[120,1049],[180,1549],[240,2049]],
    'goat-heart-and-kidney-mix': [[60,549],[120,1049],[180,1549],[240,2049]],
    'goat-spleen': [[60,549],[120,1049],[180,1549],[240,2049]],
    'bombay-duck': [[60,499],[120,949],[180,1349],[240,1849]],
    'mackerel-whole': [[100,629],[200,1199],[300,1799]],
    'anchovies': [[60,449],[120,849],[180,1249],[240,1549]],
    'prawns': [[60,649],[120,1249],[180,1849],[240,2499]],
    'sardines': [[60,549],[120,1049],[180,1549],[240,2099]],
    'tuna': [[60,649],[120,1249],[180,1849],[240,2499]],
    'fish-bites': [[60,549],[120,1049],[180,1549],[240,2099]],
    'mackerel-fillet': [[60,599],[120,1199],[180,1749],[240,2249]],
    'buff-jerky': [[60,449],[120,898],[180,1299],[240,1599]],
  };
  const aliases = { 'goat-trachea': 'trachea-chew', 'whole-mackerel': 'mackerel-whole' };
  const slug = value => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const packRows = (name) => {
    const key = aliases[slug(name)] || slug(name);
    const rows = reference[key];
    if (!rows) return null;
    return rows.map(([amount, price], index) => {
      const isWeight = typeof amount === 'number';
      return {
        label: isWeight ? `${index + 1} pouch${index ? 'es' : ''}` : amount,
        weight: isWeight ? `${amount} g` : '',
        weight_grams: isWeight ? amount : 0,
        price,
        compare_price: 0,
      };
    });
  };
  const apply = item => {
    const packs = packRows(item?.n || item?.name);
    if (!packs) return item;
    const first = packs[0];
    return { ...item, packs, p: first.price, w: first.weight || first.label };
  };

  window.GOB_CATALOGUE_REFERENCE = { packs: packRows, apply };
  if (Array.isArray(window.GOB_LIVE_CATALOG)) {
    window.GOB_LIVE_CATALOG.splice(0, window.GOB_LIVE_CATALOG.length, ...window.GOB_LIVE_CATALOG.map(apply));
  }
})();
