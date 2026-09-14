import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const origin = 'https://gameofbones.in';
const products = [
  ['chicken-jerky', 'Chicken Jerky', 329, 'Single-ingredient slow-dehydrated chicken breast. High-protein, low-fat and made for training rewards.', 'assets/chicken-jerky-pouch.png', 'Jerky'],
  ['buff-jerky', 'Buff Jerky', 449, 'Single-ingredient buffalo jerky with a richer flavour profile.', '', 'Jerky'],
  ['chicken-feet', 'Chicken Feet', 300, 'Whole dehydrated chicken feet for supervised chewing.', '', 'Chews & bones'],
  ['chicken-neck', 'Chicken Neck', 300, 'Whole chicken neck, slowly dehydrated and bone-in.', '', 'Chews & bones'],
  ['chicken-bites', 'Chicken Bites', 329, 'Bite-sized dehydrated chicken pieces for training.', '', 'Jerky'],
  ['chicken-wings', 'Chicken Wings', 350, 'Crunchy dehydrated chicken wings for supervised chewing.', '', 'Chews & bones'],
  ['chicken-bones', 'Chicken Bones', 200, 'Assorted dehydrated chicken bone pieces for supervised chewing.', '', 'Chews & bones'],
  ['goat-trachea', 'Goat Trachea', 100, 'A cartilage-rich chew for supervised chew time.', 'assets/goat-trachea-pouch.png', 'Chews & bones'],
  ['goat-trotter', 'Goat Trotter', 250, 'A dense natural chew with bone, skin and cartilage.', 'assets/goat-trotter-plate.png', 'Chews & bones'],
  ['goat-ear', 'Goat Ear', 350, 'Thin, crunchy goat ears for supervised chew time.', '', 'Chews & bones'],
  ['chicken-gizzards', 'Chicken Gizzards', 300, 'Single-ingredient dehydrated chicken gizzards.', '', 'Organ treats'],
  ['chicken-heart-liver', 'Chicken Heart & Liver', 300, 'A single-ingredient chicken heart and liver mix.', '', 'Organ treats'],
  ['goat-liver', 'Goat Liver', 450, 'Single-ingredient dehydrated goat liver.', '', 'Organ treats'],
  ['goat-lungs', 'Goat Lungs', 450, 'Lightweight, crunchy dehydrated goat lungs.', '', 'Organ treats'],
  ['goat-heart-kidney-mix', 'Goat Heart & Kidney Mix', 500, 'A single-ingredient goat heart and kidney mix.', '', 'Organ treats'],
  ['goat-spleen', 'Goat Spleen', 450, 'Single-ingredient dehydrated goat spleen.', '', 'Organ treats'],
  ['anchovies', 'Anchovies', 350, 'Wild-caught whole anchovies.', '', 'Fish treats'],
  ['bombay-duck', 'Bombay Duck', 450, 'Traditional Bombil, a coastal single-ingredient treat.', '', 'Fish treats'],
  ['whole-mackerel', 'Whole Mackerel', 600, 'Whole dehydrated mackerel.', '', 'Fish treats'],
  ['mackerel-fillet', 'Mackerel Fillet', 650, 'Boneless dehydrated mackerel fillet.', '', 'Fish treats'],
  ['sardines', 'Sardines', 400, 'Whole dehydrated sardines.', '', 'Fish treats'],
  ['tuna', 'Tuna', 500, 'Lean, high-protein dehydrated tuna.', '', 'Fish treats'],
  ['prawns', 'Prawns', 599, 'A premium dehydrated prawn treat.', '', 'Fish treats'],
  ['whole-quail', 'Whole Quail', 275, 'Whole dehydrated quail with meat, bone and organs.', '', 'Whole prey'],
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
    { '@type': 'Product', '@id': `${url}#product`, name, description, image: image ? [`${origin}/${image}`] : undefined, sku: slug, category, brand: { '@type': 'Brand', name: 'Game of Bones' }, offers: { '@type': 'Offer', url, priceCurrency: 'INR', price: price.toFixed(2), availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', seller: { '@id': `${origin}/#organization` } } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` }, { '@type': 'ListItem', position: 2, name: 'Products', item: `${origin}/products` }, { '@type': 'ListItem', position: 3, name, item: url }] },
  ] };
  return template
    .replace('<head>', '<head><base href="/">')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(name)} — Game of Bones</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`)
    .replace(/<script id="gob-static-product-schema" type="application\/ld\+json">[\s\S]*?<\/script>/, schemaTag(schema))
    .replace(/<h1 id="productName">[\s\S]*?<\/h1>/, `<h1 id="productName">${escape(name)}</h1>`);
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
    .replace(/<script id="journal-schema" type="application\/ld\+json">[\s\S]*?<\/script>/, schemaTag(schema))
    .replace(/<h1 class="display">[\s\S]*?<\/h1>/, `<h1 class="display">${escape(title)}</h1>`);
};

const root = fileURLToPath(new URL('..', import.meta.url));
const output = join(root, 'seo-static');
await rm(output, { recursive: true, force: true });
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
