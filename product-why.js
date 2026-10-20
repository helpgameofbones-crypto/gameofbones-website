/* "Why it's good for them": one compact, product-specific section that replaces the four
   generic explainer blocks (key benefits, plain-language role, nutrient profile, how to serve).
   Copy is written from public pet-nutrition guidance and kept to "naturally contains / a source of"
   language: treats are not medicine. Mobile first: 3 short points, 2 tap-to-open details. */
(() => {
  if (window.__gobWhy) return;
  window.__gobWhy = true;

  const CHEW_GIVE = 'One piece per chew session, a few times a week. Choose a size your dog can’t swallow whole, and count it as part of the day’s food.';
  const CHEW_CARE = 'Always watch while your dog chews. Take it away once it’s small enough to swallow whole, and skip it for dogs that gulp. Keep water nearby.';
  const ORGAN_GIVE = 'Organ meat is rich, so a little goes a long way: a few small pieces a day, broken up for training. Start with less for the first few days.';
  const FISH_GIVE_DOG = 'Small dogs and cats: 1–2 small fish a day. Medium and large dogs: a few more. Start with one and see how the tummy takes it.';
  const FISH_CARE = 'Fish is rich, so go slowly with new eaters. Skip it if your pet has a known fish allergy, and keep fresh water out.';
  const BOX_GIVE = 'Open one pack at a time and follow the serving note for that treat. Try a new one every few days so you can tell what your dog loves.';
  const TEN = 'Vets suggest treats make up no more than 10% of a day’s food.';

  const P = {
    'chicken-jerky': { who: 'dog', lead: 'Lean chicken breast, slow-dried. It tears into tiny pieces, which makes it a go-to training reward.',
      pts: [['Lean protein', 'Chicken breast is mostly muscle meat, so you get a protein-rich reward without much fat.'],
            ['Made for training', 'One strip breaks into many pea-sized bits — enough for a whole session of “sit” and “stay”.'],
            ['Holds attention', 'Drying concentrates the smell, which helps keep focus on walks and around distractions.']],
      give: 'Break into small pieces. A few pieces a day for small dogs and puppies, more for big dogs.',
      care: 'Chicken is one of the more common food sensitivities in dogs. If you see itching or loose stools, pause and try Buff Jerky instead.' },
    'chicken-bites': { who: 'dog', lead: 'Ready-cut chicken pieces for when you don’t want to break treats on a walk.',
      pts: [['Lean protein', 'Pure chicken meat — protein-rich, low in fat, nothing else added.'],
            ['Pocket-ready size', 'Already bite-sized, so rewards are quick and timing stays sharp during training.'],
            ['Easy on small mouths', 'Small, soft-enough pieces suit puppies and small breeds.']],
      give: 'A handful through the day as rewards; cut back on meal portions on heavy training days.',
      care: 'If your dog is sensitive to chicken (itching, loose stools), switch to Buff Jerky or a fish treat.' },
    'buff-jerky': { who: 'dog', lead: 'Buffalo meat, slow-dried. A different protein for picky eaters and dogs that don’t do well on chicken.',
      pts: [['A different protein', 'Buffalo is not part of most everyday dog foods, so it’s a useful swap for dogs that react to chicken.'],
            ['Red-meat minerals', 'Red meat is a natural source of iron and zinc.'],
            ['Strong, meaty aroma', 'The rich smell wins over fussy eaters and works well as a high-value reward.']],
      give: 'Break into small pieces for small dogs. A few pieces a day is plenty.',
      care: 'If you are testing for a food sensitivity, ask your vet before adding any new treat.' },
    'chicken-feet': { who: 'dog', lead: 'A crunchy, short chew. Feet are mostly skin, tendon and cartilage — the parts dogs love to crunch.',
      pts: [['Cartilage & collagen', 'Feet are naturally made of cartilage, skin and tendon, which contain collagen, glucosamine and chondroitin.'],
            ['Good crunch', 'The crunchy texture gives dogs a satisfying chew and keeps them busy for a few minutes.'],
            ['Short, simple chew', 'Easy to portion and a good first chew for dogs new to natural chews.']],
      give: CHEW_GIVE, care: CHEW_CARE },
    'chicken-neck': { who: 'dog', lead: 'A meaty, crunchy chew for medium and large dogs.',
      pts: [['Bone & cartilage', 'Neck bone and cartilage are a natural source of calcium, phosphorus and collagen.'],
            ['Busy jaws', 'Takes a few minutes to work through, which helps chewy dogs settle.'],
            ['Meat on the bone', 'Comes with its own meat, so it feels like a proper reward.']],
      give: CHEW_GIVE, care: 'Dried at low heat, never cooked or fried — cooked bones are the ones that splinter. ' + CHEW_CARE },
    'chicken-wings': { who: 'dog', lead: 'A meaty crunchy chew for medium and large dogs who like a bit more to work on.',
      pts: [['Meat, skin & bone', 'A mix of meat, skin and small bones — protein plus natural calcium.'],
            ['Satisfying crunch', 'Crunchy texture that dogs enjoy working through.'],
            ['Bigger reward', 'Feels like a special treat for the end of a walk or a calm evening.']],
      give: CHEW_GIVE, care: 'Dried at low heat, never cooked or fried. ' + CHEW_CARE },
    'chicken-wing-tips': { who: 'dog', lead: 'The small end of the wing — a light, crunchy chew sized for small and medium dogs.',
      pts: [['Small & crunchy', 'Mostly skin, cartilage and tiny bones, so it’s a quicker, lighter chew.'],
            ['Cartilage & collagen', 'Naturally contains cartilage and collagen, like other wing and feet chews.'],
            ['Easy to portion', 'Small pieces make it simple to give just one or two.']],
      give: '1–2 pieces at a time, a few times a week.', care: CHEW_CARE },
    'chicken-bones': { who: 'dog', lead: 'Crunchy chicken bone pieces for dogs who love to crunch.',
      pts: [['Natural minerals', 'Bone is a natural source of calcium and phosphorus.'],
            ['Busy jaws', 'Crunching through bone is good enrichment for chewy dogs.'],
            ['Dried, not cooked', 'Dried at low heat, never cooked or fried — cooked bones are the ones that splinter.']],
      give: CHEW_GIVE, care: CHEW_CARE + ' Not for very small dogs or dogs with dental problems.' },
    'goat-trotter': { who: 'dog', lead: 'A long-lasting chew for medium and large dogs who chew through everything.',
      pts: [['Long chew time', 'Dense and tough, so it keeps strong chewers busy for longer than most treats.'],
            ['Skin, tendon & collagen', 'Trotters are mostly skin, tendon and bone, which are naturally rich in collagen.'],
            ['Good for boredom', 'A long chew gives restless dogs a calm job to do while you work or cook.']],
      give: 'One trotter per chew session, a few times a week.', care: CHEW_CARE + ' Not for very small dogs or dogs with weak teeth.' },
    'goat-trachea': { who: 'dog', lead: 'The windpipe — ridged rings of cartilage that make a crunchy, satisfying chew.',
      pts: [['Natural cartilage', 'Trachea is mostly cartilage, which naturally contains glucosamine and chondroitin.'],
            ['Ridged texture', 'The rings give dogs something to grip and gnaw, and many dogs love the crunch.'],
            ['Lighter than bone', 'Crunchy but lighter than bone chews, so it suits dogs of most sizes.']],
      give: CHEW_GIVE, care: CHEW_CARE + ' It is a treat, not a replacement for joint supplements or tooth brushing.' },
    'goat-ear': { who: 'dog', lead: 'A thin, crunchy chew that’s gentle enough for small dogs and older dogs.',
      pts: [['Low-fat chew', 'Goat ears are thinner and lighter than pig or cow ears.'],
            ['Cartilage inside', 'Mostly skin and cartilage, a natural source of collagen.'],
            ['Quick and easy', 'A short chew that suits small dogs and dogs with gentler jaws.']],
      give: '1 ear per day for small dogs, up to 2 for bigger dogs.', care: CHEW_CARE },
    'chicken-gizzards': { who: 'dog', lead: 'A chewy, meaty muscle — lean, rich in taste and easy to cut small for training.',
      pts: [['Lean muscle meat', 'Gizzard is a hard-working muscle: high in protein and low in fat.'],
            ['Iron, zinc & B12', 'Naturally contains iron, zinc and B vitamins including B12.'],
            ['Chewy texture', 'Firmer than jerky, so it lasts a little longer as a reward.']],
      give: ORGAN_GIVE, care: 'Chicken-sensitive dogs may react — if you see itching or loose stools, stop and switch protein.' },
    'chicken-heart-liver': { who: 'dog', lead: 'Heart and liver together — two of the most nutrient-dense parts of the bird.',
      pts: [['Heart: taurine & CoQ10', 'Heart muscle naturally contains taurine, CoQ10 and B vitamins.'],
            ['Liver: vitamin A & B12', 'Liver is one of nature’s richest sources of vitamin A, B12, iron and copper.'],
            ['Top-value reward', 'Strong taste and smell — saves the day when you need your dog’s full attention.']],
      give: ORGAN_GIVE, care: 'Because liver is so rich in vitamin A, keep it to a few small pieces a day — not a meal.' },
    'goat-liver': { who: 'dog', lead: 'Rich, strong-smelling liver — the treat most dogs will do anything for.',
      pts: [['Vitamin A & B12', 'Liver is one of the richest natural sources of vitamin A, B12, iron and copper.'],
            ['Nutrient-dense', 'Small amounts carry a lot of nutrition, so tiny pieces are enough.'],
            ['Highest-value reward', 'Great for recall training and nervous dogs at the vet or groomer.']],
      give: 'A few small pieces a day. Vet nutritionists suggest liver stays around 5% of a dog’s total diet.',
      care: 'Too much liver over time can mean too much vitamin A. Keep it a treat, not a topper on every meal.' },
    'goat-lungs': { who: 'dog', lead: 'Light, airy and crumbly — a low-fat reward that’s easy on small mouths.',
      pts: [['Light and low in fat', 'Lung is airy and lean, so you can give more pieces for fewer calories.'],
            ['Easy to break', 'Snaps into tiny bits with your fingers — perfect for small dogs and puppies.'],
            ['Good for weight-watchers', 'A sensible pick for dogs that need to keep the weight down.']],
      give: 'Break into small bits. A small handful through the day is fine for most dogs.', care: 'Crumbly — give over a mat or bowl. Keep water nearby.' },
    'goat-heart-kidney-mix': { who: 'dog', lead: 'Heart and kidney together — a meaty mix of muscle and organ.',
      pts: [['Heart: taurine & CoQ10', 'Heart muscle naturally contains taurine, CoQ10 and B vitamins.'],
            ['Kidney: B vitamins & iron', 'Kidney is a natural source of B12, riboflavin, iron and selenium.'],
            ['Rich taste', 'Strong flavour makes it a reward dogs remember.']],
      give: ORGAN_GIVE, care: 'Rich food — go slowly with dogs new to organ meat.' },
    'goat-spleen': { who: 'dog', lead: 'An iron-rich organ with a deep, meaty taste dogs go crazy for.',
      pts: [['Iron-rich', 'Spleen is one of the richest natural sources of iron among organ meats.'],
            ['Vitamins & zinc', 'Also naturally contains B12, zinc and other vitamins.'],
            ['High-value reward', 'Strong flavour — a little piece goes a long way.']],
      give: ORGAN_GIVE, care: 'Rich food — start with a small piece and build up.' },
    'anchovies': { who: 'both', lead: 'Small whole fish, dried crunchy. Loved by dogs and cats.',
      pts: [['Omega-3 fats', 'Oily fish like anchovies contain EPA and DHA, omega-3 fats linked to healthy skin and a shiny coat.'],
            ['Low in mercury', 'Small, short-lived fish sit low in the food chain, so they carry far less mercury than big fish.'],
            ['Whole fish, soft bones', 'Eaten whole, small bones and all — a natural source of calcium.']],
      give: FISH_GIVE_DOG, care: FISH_CARE },
    'sardines': { who: 'both', lead: 'Whole sardines, dried. A fish treat for picky eaters, dogs and cats alike.',
      pts: [['Omega-3 fats', 'Sardines are one of the best natural sources of EPA and DHA, omega-3s linked to healthy skin and coat.'],
            ['Low in mercury', 'Small fish low in the food chain carry very little mercury.'],
            ['Calcium from soft bones', 'Eaten whole, so the small bones add natural calcium.']],
      give: FISH_GIVE_DOG, care: FISH_CARE },
    'white-sardines': { who: 'both', lead: 'Small white sardines, dried whole — a lighter fish treat for dogs and cats.',
      pts: [['Omega-3 fats', 'Like other sardines, a natural source of EPA and DHA for skin and coat.'],
            ['Low in mercury', 'Small fish low in the food chain carry very little mercury.'],
            ['Whole fish, soft bones', 'Eaten whole, small bones and all, for natural calcium.']],
      give: FISH_GIVE_DOG, care: FISH_CARE },
    'bombay-duck': { who: 'both', lead: 'Bombil, the Mumbai favourite — light, crunchy and low in fat.',
      pts: [['High protein, low fat', 'Bombay duck is a lean fish; drying concentrates its protein.'],
            ['Omega-3 fats', 'Dried bombil contains EPA and DHA, the omega-3s linked to skin and coat.'],
            ['Light and crunchy', 'Breaks easily, so it’s simple to give small pieces to cats and small dogs.']],
      give: FISH_GIVE_DOG, care: FISH_CARE },
    'tuna': { who: 'both', lead: 'Lean tuna pieces — a fish treat with a taste cats and dogs can’t ignore.',
      pts: [['Lean protein', 'Tuna is high in protein and low in fat.'],
            ['Some omega-3', 'Contains omega-3 fats, though less than small oily fish like sardines.'],
            ['Irresistible taste', 'Useful for fussy eaters and for getting a pet into the carrier.']],
      give: 'An occasional treat: a few small pieces, a few times a week — not every day.',
      care: 'Big fish like tuna carry more mercury than small fish, so vets advise keeping tuna occasional. For daily fish treats, choose sardines or anchovies.' },
    'mackerel-fillet': { who: 'both', lead: 'Boneless mackerel fillet — an oily fish reward with no bones to worry about.',
      pts: [['Omega-3 fats', 'Mackerel is an oily fish, a natural source of EPA and DHA for skin and coat.'],
            ['Boneless', 'Fillet only, so it’s easy for cats and small dogs.'],
            ['Protein-rich', 'High in protein; breaks into small training-size bits.']],
      give: FISH_GIVE_DOG.replace('1–2 small fish', 'a few small pieces').replace('a few more', 'a little more'), care: FISH_CARE },
    'whole-mackerel': { who: 'dog', lead: 'A whole dried mackerel — a bigger fish chew for medium and large dogs.',
      pts: [['Omega-3 fats', 'Oily mackerel is a natural source of EPA and DHA for skin and coat.'],
            ['Whole fish', 'Meat, skin and bones together, for protein plus natural calcium.'],
            ['Chew & treat in one', 'Takes a while to finish, so it works as a chew too.']],
      give: 'Medium dogs: half a fish. Large dogs: one fish, a few times a week.', care: 'Watch while your dog eats it. ' + FISH_CARE },
    'prawns': { who: 'both', lead: 'Dried prawns — a crunchy, low-fat special treat.',
      pts: [['Lean protein', 'Prawns are high in protein and low in fat and calories.'],
            ['B12 & minerals', 'Naturally contains vitamin B12, phosphorus and iodine.'],
            ['A novel treat', 'A change from meat treats — good for dogs and cats bored of the usual.']],
      give: 'A few prawns at a time, a few times a week.', care: 'Shellfish allergies are possible — give one and wait a day the first time.' },
    'whole-quail': { who: 'dog', lead: 'A whole dried quail — meat, bone and organs together, the way nature packed it.',
      pts: [['Whole-prey nutrition', 'Muscle, bone and organs in one, for a natural mix of protein, calcium and vitamins.'],
            ['A different protein', 'Quail is a novel protein, often chosen for dogs that don’t do well on chicken or mutton.'],
            ['Big chew', 'A substantial, crunchy treat for medium and large dogs.']],
      give: 'One quail as a special treat, once or twice a week. Feed a little less at that day’s meal.', care: CHEW_CARE },
    'cat-trial-box': { who: 'cat', lead: 'Five fish treats in one box, so you can find out what your cat actually likes.',
      pts: [['Made for meat-eaters', 'Cats are strict carnivores and do best on animal foods — every treat here is just fish.'],
            ['Omega-3 fats', 'Oily fish contains EPA and DHA, linked to healthy skin and a glossy coat.'],
            ['Find the favourite', 'Cats can be fussy; trying five is the quickest way to see what they’ll eat.']],
      give: '1–2 small pieces a day. Treats should stay under 10% of what your cat eats in a day.', care: 'Introduce one fish at a time and keep water out. Skip if your cat has a fish allergy.' },
    'small-treat-box': { who: 'dog', lead: 'Nine mini packs to discover what your dog loves before buying full packs.',
      pts: [['Variety of proteins', 'Chicken, goat, buffalo and fish — different proteins mean different nutrients.'],
            ['Find the favourite', 'The fastest way to learn what works for training, chewing and fussy days.'],
            ['Chews and rewards', 'A mix of quick training treats and longer chews.']],
      give: BOX_GIVE, care: 'Introduce one new treat at a time so you know which suits your dog best.' },
    'medium-treat-box': { who: 'dog', lead: 'Seven full packs — about a month of variety for one dog.',
      pts: [['Variety of proteins', 'Different meats and fish bring different nutrients through the month.'],
            ['Chews and rewards', 'Training bites for daily practice plus chews for calm time.'],
            ['Better value', 'Costs less than buying the packs one by one.']],
      give: BOX_GIVE, care: 'Introduce one new treat at a time.' },
    'large-treat-box': { who: 'dog', lead: 'Ten full packs for multi-dog homes, big appetites or a great gift.',
      pts: [['Variety of proteins', 'Chicken, goat, buffalo and fish for a wide mix of nutrients.'],
            ['For every dog', 'Small rewards for little ones, bigger chews for big dogs.'],
            ['Best value', 'The lowest price per pack across our range.']],
      give: BOX_GIVE, care: 'Introduce one new treat at a time.' },
    'surprise-me-box': { who: 'dog', lead: 'A surprise mix of our treats — fun to open, easy to share.',
      pts: [['Something new', 'A change of protein and texture keeps treat time interesting.'],
            ['Chews and rewards', 'A mix of quick rewards and longer chews.'],
            ['Single-ingredient', 'Every treat inside is one ingredient, nothing added.']],
      give: BOX_GIVE, care: 'Introduce one new treat at a time.' },
  };

  const slug = () => {
    const m = location.pathname.match(/\/products\/([a-z0-9-]+)/);
    if (m) return m[1].replace('chicken-heart-and-liver', 'chicken-heart-liver').replace('goat-heart-and-kidney-mix', 'goat-heart-kidney-mix');
    const n = (document.querySelector('#productName')?.textContent || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return n.replace('chicken-heart-and-liver', 'chicken-heart-liver').replace('goat-heart-and-kidney-mix', 'goat-heart-kidney-mix');
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const css = `
  body.gob-why-on .key-benefits,body.gob-why-on .benefit-panel,body.gob-why-on .nutrient-panel,body.gob-why-on .serve-panel{display:none!important}
  .gob-why{max-width:1180px;margin:0 auto;padding:28px 18px 8px;color:#102c22}
  .gob-why .eyebrow{margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#bd812a}
  .gob-why h2{margin:0 0 8px;font-size:clamp(26px,7vw,40px);line-height:1.08}
  .gob-why .lead{margin:0 0 16px;font-size:15px;line-height:1.5;color:#36473f;max-width:640px}
  .gob-why ol{list-style:none;margin:0;padding:0;display:grid;gap:8px}
  .gob-why li{display:grid;grid-template-columns:30px 1fr;gap:10px;align-items:start;background:#fffdf8;border:1px solid rgba(16,44,34,.12);border-radius:12px;padding:12px}
  .gob-why li b.n{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#f0dfaa;font-size:12px;font-weight:800}
  .gob-why li strong{display:block;font-size:15px;line-height:1.25;margin-bottom:2px}
  .gob-why li span{display:block;font-size:13.5px;line-height:1.45;color:#3f5249}
  .gob-why details{padding:0!important;margin-top:8px;border:1px solid rgba(16,44,34,.12);border-radius:12px;background:#fffdf8}
  .gob-why details>summary{cursor:pointer;list-style:none;padding:12px 14px!important;min-height:0!important;height:auto!important;margin:0!important;line-height:1.3;font-weight:800;font-size:14px;display:flex;justify-content:space-between;align-items:center}
  .gob-why details>summary::-webkit-details-marker{display:none}
  .gob-why details>summary:after{content:'+';font-size:20px;line-height:1;color:#bd812a}
  .gob-why details[open]>summary:after{content:'–'}
  .gob-why details p{margin:0;padding:0 14px 14px;font-size:13.5px;line-height:1.5;color:#3f5249}
  .gob-why .note{margin:12px 0 0;font-size:11.5px;line-height:1.45;color:#6b7a72}
  @media(min-width:900px){.gob-why{padding:48px 24px 16px}.gob-why ol{grid-template-columns:repeat(3,1fr);gap:12px}.gob-why li{grid-template-columns:1fr;padding:18px}.gob-why .more{display:grid;grid-template-columns:1fr 1fr;gap:12px}.gob-why details{margin-top:12px}}
  `;

  function render() {
    const d = P[slug()];
    if (!d || document.getElementById('gobWhy')) return !!d;
    const anchor = document.querySelector('.detail');
    if (!anchor) return false;
    if (!document.getElementById('gob-why-style')) { const s = document.createElement('style'); s.id = 'gob-why-style'; s.textContent = css; document.head.append(s); }
    const pet = d.who === 'cat' ? 'your cat' : d.who === 'both' ? 'your dog or cat' : 'your dog';
    const sec = document.createElement('section');
    sec.id = 'gobWhy'; sec.className = 'gob-why'; sec.setAttribute('aria-labelledby', 'gobWhyTitle');
    sec.innerHTML = `<p class="eyebrow">Why it’s good for ${pet}</p>
      <h2 id="gobWhyTitle">What it does for ${pet}.</h2>
      <p class="lead">${esc(d.lead)}</p>
      <ol>${d.pts.map((p, i) => `<li><b class="n">0${i + 1}</b><div><strong>${esc(p[0])}</strong><span>${esc(p[1])}</span></div></li>`).join('')}</ol>
      <div class="more">
        <details><summary>How much to give</summary><p>${esc(d.give)} ${d.who === 'cat' ? '' : esc(TEN)}</p></details>
        <details><summary>Good to know</summary><p>${esc(d.care)} If ${pet} has a health condition or a special diet, check with your vet first.</p></details>
      </div>
      <p class="note">A treat, not a complete meal or a medicine. Nutrients named here occur naturally in the ingredient; amounts vary by batch.</p>`;
    anchor.insertAdjacentElement('afterend', sec);
    document.body.classList.add('gob-why-on');
    return true;
  }
  const start = () => { if (!render()) { setTimeout(render, 600); setTimeout(render, 1800); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
