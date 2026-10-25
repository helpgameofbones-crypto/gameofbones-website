/* Canonical product packs from the COGS Calculator Master List. This is the
   verified selling-price and quantity source until the admin records are
   reconciled to the same workbook. */
(() => {
  const reference = {
    'whole-quail': [['1 piece',275],['2 pieces',550],['3 pieces',825],['4 pieces',1000]],
    'chicken-wings': [['5 pieces',350],['10 pieces',700],['15 pieces',975]],
    'chicken-wing-tips': [[100,300],[200,600],[300,900],[400,1200]],
    'trachea-chew': [['1 piece',100],['2 pieces',175],['3 pieces',250]],
    'goat-trotter': [['1 piece',250],['2 pieces',500],['3 pieces',700],['4 pieces',900]],
    'goat-ear': [['6 pieces',350],['12 pieces',650],['18 pieces',975],['24 pieces',1300]],
    'chicken-neck': [[70,300],[140,580],[210,860],[280,1140]],
    'chicken-feet': [[70,300],[140,580],[210,860],[280,1140]],
    'chicken-jerky': [[60,329],[120,630],[180,925],[240,1220]],
    'chicken-bones': [[100,200],[200,380],[300,560],[400,740]],
    'chicken-gizzards': [[60,300],[120,580],[180,860],[240,1140]],
    'chicken-liver': [[60,300],[120,580],[180,860],[240,1140]],
    'chicken-bites': [[60,329],[120,630],[180,925],[240,1220]],
    'goat-liver': [[60,450],[120,880],[180,1300],[240,1720]],
    'goat-lungs': [[60,450],[120,880],[180,1300],[240,1720]],
    'goat-heart-and-kidney-mix': [[60,500],[120,980],[180,1460],[240,1900]],
    'goat-spleen': [[60,450],[120,880],[180,1300],[240,1720]],
    'bombay-duck': [[60,450],[120,900],[180,1350],[240,1800]],
    'mackerel-whole': [[100,600],[200,1150],[300,1650]],
    'anchovies': [[60,350],[120,650],[180,975],[240,1300]],
    'prawns': [[60,600],[120,1200],[180,1800],[240,2400]],
    'sardines': [[60,400],[120,775],[180,1150],[240,1500]],
    'white-sardines': [[60,350],[120,700],[180,1050],[240,1400]],
    'tuna': [[60,500],[120,1000],[180,1500],[240,2000]],
    'mackerel-fillet': [[60,650],[120,1250],[180,1850],[240,2550]],
    'buff-jerky': [[60,449],[120,875],[180,1300],[240,1700]],
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
