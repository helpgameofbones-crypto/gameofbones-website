import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const origin = 'https://gameofbones.in';
const products = [
  ['chicken-jerky', 'Chicken Jerky', 329, 'Single-ingredient slow-dehydrated chicken breast. High-protein, low-fat and made for training rewards.', 'assets/chicken-jerky-pouch.png', 'Jerky'],
  ['buff-jerky', 'Buff Jerky', 449, 'Single-ingredient buffalo jerky with a richer flavour profile.', '', 'Jerky'],
  ['chicken-feet', 'Chicken Feet', 300, 'Whole dehydrated chicken feet for supervised chewing.', '', 'Chews & bones'],
  ['chicken-neck', 'Chicken Neck', 300, 'Whole chicken neck, slowly dehydrated and bone-in.', '', 'Chews & bones'],
  ['chicken-bites', 'Chicken Bites', 329, 'Bite-sized dehydrated chicken pieces for training.', 'assets/catalogue-v3/chicken-bites.webp', 'Jerky'],
  ['chicken-wings', 'Chicken Wings', 350, 'Crunchy dehydrated chicken wings for supervised chewing.', 'assets/catalogue-v3/chicken-wings.webp', 'Chews & bones'],
  ['chicken-bones', 'Chicken Bones', 200, 'Assorted dehydrated chicken bone pieces for supervised chewing.', 'assets/catalogue-v3/chicken-bones.webp', 'Chews & bones'],
  ['goat-trachea', 'Goat Trachea', 100, 'A cartilage-rich chew for supervised chew time.', 'assets/goat-trachea-pouch.png', 'Chews & bones'],
  ['goat-trotter', 'Goat Trotter', 250, 'A dense natural chew with bone, skin and cartilage.', 'assets/goat-trotter-plate.png', 'Chews & bones'],
  ['goat-ear', 'Goat Ear', 350, 'Thin, crunchy goat ears for supervised chew time.', 'assets/catalogue-v3/goat-ear.webp', 'Chews & bones'],
  ['chicken-gizzards', 'Chicken Gizzards', 300, 'Single-ingredient dehydrated chicken gizzards.', 'assets/catalogue-v3/chicken-gizzards.webp', 'Organ treats'],
  ['chicken-heart-liver', 'Chicken Heart & Liver', 300, 'A single-ingredient chicken heart and liver mix.', 'assets/catalogue-v3/chicken-heart-liver.webp', 'Organ treats'],
  ['goat-liver', 'Goat Liver', 450, 'Single-ingredient dehydrated goat liver.', 'assets/catalogue-v3/goat-liver.webp', 'Organ treats'],
  ['goat-lungs', 'Goat Lungs', 450, 'Lightweight, crunchy dehydrated goat lungs.', 'assets/catalogue-v3/goat-lungs.webp', 'Organ treats'],
  ['goat-heart-kidney-mix', 'Goat Heart & Kidney Mix', 500, 'A single-ingredient goat heart and kidney mix.', 'assets/catalogue-v3/goat-heart-kidney.webp', 'Organ treats'],
  ['goat-spleen', 'Goat Spleen', 450, 'Single-ingredient dehydrated goat spleen.', 'assets/catalogue-v3/goat-spleen.webp', 'Organ treats'],
  ['anchovies', 'Anchovies', 350, 'Wild-caught whole anchovies.', 'assets/catalogue-v3/anchovies.webp', 'Fish treats'],
  ['bombay-duck', 'Bombay Duck', 450, 'Traditional Bombil, a coastal single-ingredient treat.', 'assets/catalogue-v3/bombay-duck.webp', 'Fish treats'],
  ['whole-mackerel', 'Whole Mackerel', 600, 'Whole dehydrated mackerel.', 'assets/catalogue-v3/whole-mackerel.webp', 'Fish treats'],
  ['mackerel-fillet', 'Mackerel Fillet', 650, 'Boneless dehydrated mackerel fillet.', 'assets/catalogue-v3/mackerel-fillet.webp', 'Fish treats'],
  ['sardines', 'Sardines', 400, 'Whole dehydrated sardines.', 'assets/catalogue-v3/sardines.webp', 'Fish treats'],
  ['tuna', 'Tuna', 500, 'Lean, high-protein dehydrated tuna.', 'assets/catalogue-v3/tuna.webp', 'Fish treats'],
  ['prawns', 'Prawns', 599, 'A premium dehydrated prawn treat.', 'assets/catalogue-v3/prawns.webp', 'Fish treats'],
  ['whole-quail', 'Whole Quail', 275, 'Whole dehydrated quail with meat, bone and organs.', 'assets/catalogue-v3/whole-quail.webp', 'Whole prey'],
  ['cat-trial-box', 'Cat Trial Box', 749, 'A fish-forward 120 g tasting box with five clearly listed single-ingredient treats.', 'assets/catalogue-v3/cat-trial-box.webp', 'Bundles'],
  ['surprise-me-box', 'Surprise Me Box', 1400, 'A team-curated mix across chicken, fish and natural chews.', 'assets/catalogue-v3/surprise-me-box.webp', 'Bundles'],
  ['small-treat-box', 'Small Treat Box', 650, 'Nine labelled 15 g mini samples across jerky, organs, fish and chews.', 'assets/catalogue-v3/small-treat-box.webp', 'Bundles'],
  ['medium-treat-box', 'Medium Treat Box', 2150, 'A full-size discovery box across chicken, fish, organs and natural chews.', 'assets/catalogue-v3/medium-treat-box.webp', 'Bundles'],
  ['large-treat-box', 'Large Treat Box', 2850, 'A generous full-range discovery box across jerky, fish, organs and natural chews.', 'assets/catalogue-v3/large-treat-box.webp', 'Bundles'],
];

const articles = [
  ['dog-food-sensitivity-signs', 'Dog Food Sensitivity Signs: What to Watch For', 'Practical signs that may suggest a food sensitivity and when to speak to your veterinarian.'],
  ['hidden-truth-dog-treats', 'How to Read What Is Really in Your Dog’s Treat', 'A practical guide to reading an ingredient label beyond the claims on the front of the pack.'],
  ['human-foods-dogs-can-eat', 'Human Foods Dogs Can Eat: A Careful Guide', 'Everyday food questions, with a reminder to confirm material dietary changes with your veterinarian.'],
  ['7-day-transition-plan', 'The 7-Day Transition Plan for New Dog Treats', 'A gradual, supervised routine for introducing a new treat without rushing your dog.'],
  ['store-treats-indian-humidity', 'How to Store Dog Treats in Indian Humidity', 'Keep naturally dehydrated treats fresh with sensible storage practices for warm, humid climates.'],
  ['fish-treats-underrated', 'Why Fish Treats Are Underrated for Dogs', 'A practical introduction to fish treats, their texture and how to serve them thoughtfully.'],
  ['new-dog-parent-guide', 'A New Dog Parent’s Guide to Treats', 'How to choose an appropriate size, introduce treats thoughtfully and supervise every chew.'],
  ['natural-treats-clean-teeth', 'Can Natural Treats Help Keep Teeth Clean?', 'What a chew can and cannot do for your dog’s dental routine.'],
  ['buffalo-vs-chicken-jerky', 'Buffalo vs Chicken Jerky for Dogs', 'A straightforward comparison of two single-ingredient jerky choices.'],
  ['can-dogs-eat-eggs', 'Can Dogs Eat Eggs?', 'A careful guide to serving eggs as part of a dog’s broader diet.'],
  ['can-dogs-eat-rice', 'Can Dogs Eat Rice?', 'When rice may fit into a dog’s meal and when to ask a veterinarian.'],
  ['fruits-dogs-cats-can-eat', 'Fruits Dogs and Cats Can Eat', 'A careful overview of common fruits and pet-safe serving considerations.'],
  ['dog-diarrhea-what-to-feed', 'Dog Diarrhea: What to Feed and When to Call a Vet', 'Gentle feeding guidance and signs that require professional care.'],
  ['why-is-my-dog-eating-grass', 'Why Is My Dog Eating Grass?', 'Common reasons dogs eat grass and when the behaviour needs a closer look.'],
  ['house-plants-safe-for-dogs-and-cats', 'House Plants Safe for Dogs and Cats', 'A starter guide to choosing safer plants for pet-friendly homes.'],
  ['puppy-teething-guide', 'Puppy Teething Guide: Treats and Chews', 'How to choose appropriate supervised chews during the teething stage.'],
  ['best-diet-for-senior-dogs', 'Choosing a Diet for Senior Dogs', 'Questions to consider with your veterinarian as your dog’s needs change.'],
  ['best-natural-treats-for-cats', 'Natural Treats for Cats: A Careful Guide', 'How to choose simple, appropriate treats for cats.'],
  ['rabies-awareness-guide', 'Rabies Awareness Guide for Dog Parents', 'Key prevention and awareness information for responsible pet care.'],
  ['vaccination-guide-community-dogs', 'Vaccination Guide for Community Dogs', 'Practical, community-minded information about canine vaccination.'],
  ['is-grain-free-better', 'Is Grain-Free Better for Dogs?', 'A balanced look at grain-free choices and individual dietary needs.'],
  ['preservatives-explained', 'Preservatives in Dog Treats Explained', 'What preservatives do and how to read a product label with confidence.'],
  ['what-are-fillers', 'What Are Fillers in Dog Food?', 'How to understand filler claims and focus on a clear ingredient list.'],
  ['how-to-read-dog-food-labels', 'How to Read Dog Food Labels', 'A clear checklist for comparing dog food and treat labels.'],
  ['best-treats-for-training', 'Best Treats for Dog Training', 'What makes a training treat practical, rewarding and easy to portion.'],
  ['treats-for-aggressive-chewers', 'Treats for Aggressive Chewers', 'How to choose a suitable chew and supervise chew time safely.'],
];

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const schemaTag = data => `<script type="application/ld+json">${JSON.stringify(data)}</script>`;

const productHtml = (template, [slug, name, price, description, image, category]) => {
  const url = `${origin}/products/${slug}`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Product', '@id': `${url}#product`, name, description, image: image ? [`${origin}/${image}`] : undefined, sku: slug, category, brand: { '@type': 'Brand', name: 'Game of Bones' }, offers: Number.isFinite(price) ? { '@type': 'Offer', url, priceCurrency: 'INR', price: price.toFixed(2), availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', seller: { '@id': `${origin}/#organization` } } : undefined },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` }, { '@type': 'ListItem', position: 2, name: 'Products', item: `${origin}/products` }, { '@type': 'ListItem', position: 3, name, item: url }] },
  ] };
  return template
    .replace('<head>', '<head><base href="/">')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(name)} — Game of Bones</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}"><meta property="og:type" content="product"><meta property="og:title" content="${escape(name)} — Game of Bones"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${url}">`)
    .replace(/<script id="gob-static-product-schema" type="application\/ld\+json">[\s\S]*?<\/script>/, schemaTag(schema))
    .replace(/<h1 id="productName">[\s\S]*?<\/h1>/, `<h1 id="productName">${escape(name)}</h1>`)
    .replace(/<p class="eyebrow" id="productTag">[\s\S]*?<\/p>/, `<p class="eyebrow" id="productTag">${escape(category)} · Made in Kalyan</p>`)
    .replace(/<p class="price" id="productPrice">[\s\S]*?<\/p>/, `<p class="price" id="productPrice">${Number.isFinite(price) ? `₹${price.toLocaleString('en-IN')}` : 'Contact us'}</p>`)
    .replace(/<p class="lead" id="productDesc">[\s\S]*?<\/p>/, `<p class="lead" id="productDesc">${escape(description)}</p>`)
    .replace(/<img id="productImage"[^>]*>/, image ? `<img id="productImage" src="${escape(image)}" alt="${escape(name)} pouch" width="1200" height="1200">` : '<img id="productImage" src="assets/gob-logo.png" alt="Game of Bones product" width="512" height="512">');
};

const articleHtml = (template, [slug, title, description]) => {
  const url = `${origin}/blog/${slug}`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BlogPosting', '@id': `${url}#article`, mainEntityOfPage: url, headline: title, description, author: { '@type': 'Organization', name: 'Game of Bones' }, publisher: { '@type': 'Organization', name: 'Game of Bones' } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` }, { '@type': 'ListItem', position: 2, name: 'Journal', item: `${origin}/blog` }, { '@type': 'ListItem', position: 3, name: title, item: url }] },
  ] };
  return template
    .replace('<head>', '<head><base href="/">')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)} | Game of Bones Journal</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:type" content="[^"]*">/, '<meta property="og:type" content="article">')
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escape(title)} | Game of Bones Journal">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escape(description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<script id="journal-schema" type="application\/ld\+json">[\s\S]*?<\/script>/, schemaTag(schema))
    .replace(/<h1 class="display">[\s\S]*?<\/h1>/, `<h1 class="display">${escape(title)}</h1>`)
    .replace(/<p class="lead">[\s\S]*?<\/p>/, `<p class="lead">${escape(description)}</p>`);
};

const root = fileURLToPath(new URL('..', import.meta.url));
const output = join(root, 'seo-static');
for (const [kind, templateName, entries, renderer] of [
  ['products', 'product.html', products, productHtml],
  ['blog', 'blog.html', articles, articleHtml],
]) {
  const template = await readFile(join(root, templateName), 'utf8');
  for (const entry of entries) {
    const target = join(output, kind, `${entry[0]}.html`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, renderer(template, entry));
  }
}
console.log(`Generated ${products.length} product and ${articles.length} article crawl-visible pages.`);
