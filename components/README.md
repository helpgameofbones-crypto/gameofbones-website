# Storefront component migration

The production storefront remains static during the migration so that checkout,
cart, order tracking, abandoned-cart recovery, and analytics do not change
their runtime contract.

The first extracted production module is `assets/js/routes.js`. It owns the
canonical route list and converts browser paths to an application page. New
route-specific modules should be added under `components/` and loaded only by
the route that uses them. The next extraction targets are, in order:

1. Shared navigation and footer
2. Shop catalogue and filters
3. Product detail view
4. Cart and checkout (after transaction regression testing)

Do not move payment, order, or customer-data code until its server route and
browser flow have been verified together.
