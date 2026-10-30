#!/usr/bin/env python3
"""Bundle the product-page CSS and JS into two cacheable files.

Product pages used to load 14 stylesheets and 23 deferred scripts one by one.
This joins them, in the same order, into product-bundle.<hash>.css / .js and
points product.html + seo-static/products/*.html at them. The file name changes
whenever the content changes, so browsers can cache it for a year.

Run from the repo root after editing any file below, or after regenerating the
static product pages:  python3 scripts/bundle-product-assets.py
"""
import glob, hashlib, os, re, sys

CSS = ['site.css', 'product-experience.css', 'purchase-conversion.css', 'product-benefits.css',
       'nutrient-profile.css', 'pincode-checker.css', 'product-media.css', 'product-loyalty.css',
       'key-benefits.css', 'product-layout.css', 'product-reference.css', 'product-stability.css',
       'sale-pricing.css', 'product-v2.css']
JS = ['site.js', 'header-navigation.js', 'api-client.js', 'catalog.js', 'catalogue-reference.js',
      'catalog-enhance.js', 'catalog-sync.js', 'product-context.js', 'product-packs.js',
      'restock-notify.js', 'bogo-promo.js', 'catalog-purchase.js', 'product-loyalty.js',
      'product-media.js', 'product-benefits.js', 'nutrient-profile.js', 'pincode-checker.js',
      'key-benefits.js', 'product-hero.js', 'conversion-extras.js', 'product-layout.js',
      'mobile-buy-summary.js', 'product-v2.js']

def build(files, sep):
    parts = []
    for f in files:
        parts.append(f'/* ===== {f} ===== */\n' + open(f, encoding='utf-8').read().rstrip() + sep)
    return ''.join(parts)

def write(kind, body):
    h = hashlib.sha256(body.encode()).hexdigest()[:10]
    for old in glob.glob(f'product-bundle.*.{kind}'):
        os.remove(old)
    name = f'product-bundle.{h}.{kind}'
    open(name, 'w', encoding='utf-8').write(body)
    return name


def esc(f): return re.escape(f)
link_re = re.compile(r'<link rel="stylesheet" href="(?:%s)(?:\?[^"]*)?">\n?' % '|'.join(map(esc, CSS)))
script_re = re.compile(r'<script defer src="(?:%s)(?:\?[^"]*)?">\s*</script>\n?' % '|'.join(map(esc, JS)))
bundle_link_re = re.compile(r'<link rel="stylesheet" href="product-bundle\.[0-9a-f]+\.css">')
bundle_script_re = re.compile(r'<script defer src="product-bundle\.[0-9a-f]+\.js"></script>')

pages = ['product.html'] + sorted(glob.glob('seo-static/products/*.html'))
# Check every page first, so a surprise never leaves the site half-converted.
for p in pages:
    s = open(p, encoding='utf-8').read()
    if bundle_link_re.search(s):
        continue
    n_css = len(link_re.findall(s)); n_js = len(script_re.findall(s))
    if n_css != len(CSS) or n_js < len(JS) - 2:
        sys.exit(f'{p}: expected {len(CSS)} css / ~{len(JS)} js tags, found {n_css} / {n_js}. Nothing written.')
css_name = write('css', build(CSS, '\n'))
js_name = write('js', build(JS, '\n;\n'))
changed = 0
for p in pages:
    s = open(p, encoding='utf-8').read(); orig = s
    if bundle_link_re.search(s):
        s = bundle_link_re.sub(f'<link rel="stylesheet" href="{css_name}">', s)
        s = bundle_script_re.sub(f'<script defer src="{js_name}"></script>', s)
    else:
        first = link_re.search(s).start()
        s = link_re.sub('', s)
        s = s[:first] + f'<link rel="stylesheet" href="{css_name}">\n' + s[first:]
        first = script_re.search(s).start()
        s = script_re.sub('', s)
        s = s[:first] + f'<script defer src="{js_name}"></script>\n' + s[first:]
    if s != orig:
        open(p, 'w', encoding='utf-8').write(s); changed += 1
print(css_name, js_name, f'{changed} pages updated')
