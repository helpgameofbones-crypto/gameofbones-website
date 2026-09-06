# Game of Bones storefront rules

## Product catalogue source of truth

- The `Master List` in `COGS Calculator (Monthly Report with Charts) (2).xlsx`
  is the approved source for product selling prices and pack quantities.
- Do not replace those values with an older product catalogue, mock data, or
  stale Supabase pack data.
- The current verified examples are Chicken Wings: 5 pieces / Rs. 350 and
  Chicken Bones: 100 g / Rs. 200.
- Product media, availability, descriptions and future edits should continue
  to come from the admin dashboard. The remaining follow-up is to reconcile
  every Supabase `products.sizes` value with the COGS Master List so admin is
  again the single live source for packs and prices.

## Release checks

- Check desktop and mobile catalogue cards and product pages after any
  catalogue change.
- Confirm each card's first pack quantity and price match its product page.
- Do not publish a catalogue pricing change until it has been checked against
  the COGS Master List.
