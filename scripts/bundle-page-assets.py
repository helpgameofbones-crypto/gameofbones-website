#!/usr/bin/env python3
"""Bundle the CSS and JS of the homepage, treat jar (cart) and checkout.

Each page used to load 2-3 stylesheets and 9-12 deferred scripts one by one.
This joins them, in page order, into <name>-bundle.<hash>.css / .js and points
the page at them (same idea as bundle-product-assets.py). Deferred scripts run
in document order, so one deferred bundle behaves the same as the separate tags.
The file name changes with the content, so browsers can cache it for a year.

Run from the repo root after editing ANY file listed below (site.js, site.css,
header-navigation.js, commerce.js ...). It also re-runs the product bundler, so
this one command keeps every bundle current:  python3 scripts/bundle-page-assets.py

To change what a page loads: edit the lists below (keep the original order),
put the separate tags back in the page if you need to, then run the script.
"""
import glob, hashlib, os, re, subprocess, sys

PAGES = {
    'home': {'page': 'index.html',
             'css': ['site.css', 'home-v2.css', 'howmade.css'],
             'js': ['site.js', 'header-navigation.js', 'conversion-extras.js', 'api-client.js', 'catalog.js',
                    'catalogue-reference.js', 'catalog-sync.js', 'restock-notify.js', 'catalog-restock.js',
                    'bogo-promo.js', 'community.js', 'howmade.js']},
    'cart': {'page': 'cart.html',
             'css': ['site.css', 'commerce.css'],
             'js': ['site.js', 'header-navigation.js', 'api-client.js', 'catalog.js', 'catalogue-reference.js',
                    'catalog-sync.js', 'commerce.js', 'cart-recovery.js', 'spin-gift-checkout.js']},
    'checkout': {'page': 'checkout.html',
                 # trust.* added here: checkout has no header-navigation.js, which loads them elsewhere.
                 'css': ['site.css', 'commerce.css', 'trust.css'],
                 'js': ['site.js', 'api-client.js', 'catalog.js', 'catalogue-reference.js', 'catalog-sync.js',
                        'commerce.js', 'commerce-backend.js', 'spin-gift-checkout.js', 'checkout-pin.js', 'trust.js']},
}


def esc(f): return re.escape(f)


def tag_res(cfg):
    link = re.compile(r'[ \t]*<link rel="stylesheet" href="/?(%s)(?:\?[^"]*)?">\n?' % '|'.join(map(esc, cfg['css'])))
    script = re.compile(r'[ \t]*<script defer src="/?(%s)(?:\?[^"]*)?">\s*</script>\n?' % '|'.join(map(esc, cfg['js'])))
    return link, script


def build(files, sep):
    return ''.join(f'/* ===== {f} ===== */\n' + open(f, encoding='utf-8').read().rstrip() + sep for f in files)


def write(name, kind, body):
    h = hashlib.sha256(body.encode()).hexdigest()[:10]
    out = f'{name}-bundle.{h}.{kind}'
    for old in glob.glob(f'{name}-bundle.*.{kind}'):
        if old != out: os.remove(old)
    open(out, 'w', encoding='utf-8').write(body)
    return out


# 1) Check every page first, so a surprise never leaves the site half-converted.
plans = {}
for name, cfg in PAGES.items():
    s = open(cfg['page'], encoding='utf-8').read()
    bundled = re.search(r'%s-bundle\.[0-9a-f]+\.(css|js)' % name, s)
    if bundled:
        plans[name] = 'refresh'; continue
    link, script = tag_res(cfg)
    css_found = [m.group(1) for m in link.finditer(s)]
    js_found = [m.group(1) for m in script.finditer(s)]
    if css_found != cfg['css'] or js_found != cfg['js']:
        sys.exit(f"{cfg['page']}: page tags don't match the list.\n css {css_found}\n js  {js_found}\nNothing written.")
    plans[name] = 'convert'

# 2) Write bundles and point the pages at them.
for name, cfg in PAGES.items():
    css = write(name, 'css', build(cfg['css'], '\n'))
    js = write(name, 'js', build(cfg['js'], '\n;\n'))
    p = cfg['page']; s = open(p, encoding='utf-8').read()
    if plans[name] == 'convert':
        link, script = tag_res(cfg)
        first = True
        def put_css(m):
            global first
            if first:
                first = False
                return f'<link rel="stylesheet" href="/{css}">\n'
            return ''
        s = link.sub(put_css, s)
        firstjs = [True]
        def put_js(m):
            if firstjs[0]:
                firstjs[0] = False
                return f'<script defer src="/{js}"></script>\n'
            return ''
        s = script.sub(put_js, s)
    else:
        s = re.sub(r'/?%s-bundle\.[0-9a-f]+\.css' % name, '/' + css, s)
        s = re.sub(r'/?%s-bundle\.[0-9a-f]+\.js' % name, '/' + js, s)
    open(p, 'w', encoding='utf-8').write(s)
    print(f'{p}: {css} {js}')

# 3) Keep the product-page bundle in step (it shares site.js, site.css, ...).
subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), 'bundle-product-assets.py')], check=True)
