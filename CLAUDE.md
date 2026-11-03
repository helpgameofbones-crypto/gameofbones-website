# Game of Bones – storefront (gameofbones-website)

Static site on Vercel (gameofbones.in). `/api/*` is proxied to gameofbones-admin (see `vercel.json`). Business context: GOB-CONTEXT.md in the owner's GOB folder.

## Never
- **Never commit secrets** (keys, passwords, tokens, `.env*`). Nothing secret belongs in this repo; everything here is public to visitors anyway.
- Never delete `google4d8efd0edc884189.html` (Google Search Console verification).
- Never publish fake reviews, testimonials or claims.

## Product pages – IMPORTANT
Product pages (`product.html`, `seo-static/products/*.html`), the homepage, cart and checkout each load ONE bundled CSS and ONE bundled JS file (`product-/home-/cart-/checkout-bundle.<hash>.css/.js`), built from the files listed at the top of `scripts/bundle-page-assets.py` and `scripts/bundle-product-assets.py` (site.js, site.css, header-navigation.js, commerce.js, product-v2.js, trust.js, …).

The bundles rebuild AUTOMATICALLY: `.github/workflows/bundle.yml` runs `python3 scripts/bundle-page-assets.py` on every push to main and commits "Rebuild bundles (automatic)" if anything changed; Vercel deploys that commit about a minute later. So after editing a bundled file you only upload that file. You may still run the script yourself and upload the results (the workflow then finds nothing to do). If the workflow fails (GitHub → Actions), the live pages keep the previous bundles until it is fixed.

## Copy and brand rules
- Health wording: "naturally contains"; no medical claims.
- Delivery: "Free delivery on full packs"; trial boxes free over ₹300, otherwise ₹50. Paying online gets ₹30 off (cash on delivery has a ₹40 fee).
- Cart word: "Treat jar" (never "Bag").
- Tuna and Mackerel Fillet are boneless.
- Colours: ink #102c22, green #245b42, gold #bd812a, button gold #9a6418 (white text), light gold #e7bd68, cream #f7f0e4, paper #fffdf8. Fonts: Fraunces (headings) + DM Sans. Icons: 2px line, ink with one gold accent.
- Text at least 12px; tap targets at least 44px.

## Deploying
- Deploys happen automatically from `main` on Vercel. Preview changes before pushing.
- Card images use the 480px copies in `assets/catalogue-plates/480/` and `assets/catalogue-v3/480/`.
