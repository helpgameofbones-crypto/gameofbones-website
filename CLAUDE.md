# Game of Bones – storefront (gameofbones-website)

Static site on Vercel (gameofbones.in). `/api/*` is proxied to gameofbones-admin (see `vercel.json`). Business context: GOB-CONTEXT.md in the owner's GOB folder.

## Never
- **Never commit secrets** (keys, passwords, tokens, `.env*`). Nothing secret belongs in this repo; everything here is public to visitors anyway.
- Never delete `google4d8efd0edc884189.html` (Google Search Console verification).
- Never publish fake reviews, testimonials or claims.

## Product pages – IMPORTANT
Product pages (`product.html` and `seo-static/products/*.html`) load ONE bundled CSS and ONE bundled JS file (`product-bundle.<hash>.css/.js`).
After editing ANY file listed in `scripts/bundle-product-assets.py` (site.js, product-v2.js/css, conversion-extras.js, header-navigation.js, product-hero.js, site.css, …) or regenerating the static product pages, run:

    python3 scripts/bundle-product-assets.py

and upload the new bundle files plus all product pages. Otherwise product pages keep the old code.

## Copy and brand rules
- Health wording: "naturally contains"; no medical claims.
- Delivery: "Free delivery on full packs"; trial boxes free over ₹300, otherwise ₹50. Paying online saves ₹70 vs cash on delivery (₹30 off + no ₹40 COD fee).
- Cart word: "Treat jar" (never "Bag").
- Tuna and Mackerel Fillet are boneless.
- Colours: ink #102c22, green #245b42, gold #bd812a, button gold #9a6418 (white text), light gold #e7bd68, cream #f7f0e4, paper #fffdf8. Fonts: Fraunces (headings) + DM Sans. Icons: 2px line, ink with one gold accent.
- Text at least 12px; tap targets at least 44px.

## Deploying
- Deploys happen automatically from `main` on Vercel. Preview changes before pushing.
- Card images use the 480px copies in `assets/catalogue-plates/480/` and `assets/catalogue-v3/480/`.
