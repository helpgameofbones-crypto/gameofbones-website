/* ===== site.js ===== */
/* Keep a customer signed in across tabs and links for their 8-hour session, and offer Log out. */
(function gobLoginSync(){try{const K='gob-customer-token',L='gob-customer-login';const expOf=t=>{try{let p=String(t).split('.')[0].replace(/-/g,'+').replace(/_/g,'/');while(p.length%4)p+='=';return Number(JSON.parse(atob(p)).expiresAt)||0}catch(_){return 0}};let t=sessionStorage.getItem(K);if(t){const e=expOf(t);if(e>Date.now())localStorage.setItem(L,JSON.stringify({token:t,exp:e}));else{sessionStorage.removeItem(K);localStorage.removeItem(L)}}else{const s=JSON.parse(localStorage.getItem(L)||'null');if(s&&s.token&&s.exp>Date.now())sessionStorage.setItem(K,s.token);else if(s)localStorage.removeItem(L)}window.GOB_SIGNED_IN=Boolean(sessionStorage.getItem(K));window.GOB_LOGOUT=()=>{try{sessionStorage.removeItem(K);localStorage.removeItem(L)}catch(_){}location.assign('/')};const fixNav=()=>{if(!window.GOB_SIGNED_IN)return;document.querySelectorAll('header a[href], nav a[href], .nav-actions a[href]').forEach(a=>{if(!/^\/?login(\.html)?$/i.test(a.getAttribute('href')||''))return;const hasAccount=[...a.parentElement.querySelectorAll('a[href="/account"]')].some(x=>x!==a&&/account/i.test(x.textContent));if(hasAccount)a.remove();else{a.href='/account';a.textContent='Account'}});document.querySelectorAll('a.login-trigger[href="/account"]').forEach(t=>t.parentElement&&t.parentElement.querySelectorAll(':scope > a[href="/account"]:not(.login-trigger)').forEach(x=>x.remove()))};try{const mo=new MutationObserver(fixNav);mo.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>mo.disconnect(),6000)}catch(_){}window.addEventListener('load',fixNav);const ready=()=>{if(!window.GOB_SIGNED_IN)return;fixNav();const r=document.getElementById('accountRoot');if(!r||document.querySelector('[data-gob-logout]'))return;const b=document.createElement('button');b.type='button';b.dataset.gobLogout='';b.className='button secondary';b.textContent='Log out';b.style.marginTop='18px';b.addEventListener('click',window.GOB_LOGOUT);r.after(b)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready()}catch(_){}})();
/* SEO essentials are kept here because this file is loaded by every customer
   page. That makes canonical URLs and baseline business markup resilient when
   a static page is added later. Product pages replace the WebPage node with a
   product-specific Product, Offer and BreadcrumbList as their live catalogue
   record becomes available. */
const GOB_SEO=(()=>{
  const origin='https://gameofbones.in';
  const descriptions={
    '/account':'View your Game of Bones orders, saved delivery details and rewards securely.',
    '/login':'Securely access your Game of Bones orders, rewards and saved delivery details.',
    '/cart':'Review your Game of Bones treats and continue to secure checkout.',
    '/checkout':'Complete your secure Game of Bones order with UPI, cards or Cash on Delivery.',
    '/policies':'Read Game of Bones privacy, terms, shipping, returns, grievance and customer data-rights information.',
    '/products':'Shop single-ingredient, naturally dehydrated dog treats from Game of Bones in India.',
    '/our-story':'Learn how Game of Bones makes single-ingredient, naturally dehydrated dog treats in Maharashtra.',
  };
  const ensureDescription=path=>{
    const content=descriptions[path]; if(!content)return;
    let tag=document.querySelector('meta[name="description"]');
    if(!tag){tag=document.createElement('meta');tag.name='description';document.head.append(tag)}
    if(!tag.content)tag.content=content;
  };
  const markPrivatePath=()=>{
    const file=location.pathname.toLowerCase();
    if(!/(?:account|login|cart|checkout|preview|atelier|motion|rich|feeding-health-log|emergency-contacts|sterilization-records|vaccination-records)/.test(file))return;
    let tag=document.querySelector('meta[name="robots"]');
    if(!tag){tag=document.createElement('meta');tag.name='robots';document.head.append(tag)}
    tag.content='noindex,follow';
  };
  const cleanPath=()=>{
    let path=location.pathname.replace(/\\/g,'/').replace(/\/index\.html$/,'/').replace(/\.html$/,'');
    const aliases={'/shop':'/products','/about':'/our-story','/refer':'/rewards','/reviews':'/blog','/faq':'/learn','/privacy':'/policies','/shipping':'/policies','/returns':'/policies'};
    path=aliases[path]||path;
    return path==='/'?'/':(path.replace(/\/+$/,'')||'/');
  };
  const ensureCanonical=url=>{
    let tag=document.querySelector('link[rel="canonical"]');
    if(!tag){tag=document.createElement('link');tag.rel='canonical';document.head.append(tag)}
    tag.href=url;
    return url;
  };
  const script=(id,data)=>{let tag=document.getElementById(id);if(!tag){tag=document.createElement('script');tag.id=id;tag.type='application/ld+json';document.head.append(tag)}tag.textContent=JSON.stringify(data)};
  const absoluteImage=value=>!value?'':(/^https?:\/\//i.test(value)?value:origin+'/'+String(value).replace(/^\/+/,''));
  const basePath=cleanPath();
  ensureDescription(basePath);
  markPrivatePath();
  const baseUrl=ensureCanonical(origin+basePath);
  const staticProductSchema=Boolean(document.getElementById('gob-static-product-schema')&&/^\/products\/[^/]+\/?$/.test(location.pathname));
  const hasServerSchema=Boolean(document.getElementById('gob-home-schema')||staticProductSchema||document.getElementById('gob-static-article-schema'));
  if(!hasServerSchema)script('gob-site-schema',{'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':origin+'/#organization',name:'Game of Bones',url:origin+'/',logo:absoluteImage('assets/gob-logo.png'),description:'Single-ingredient, naturally dehydrated dog treats made in Kalyan, Maharashtra.'},
    {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'Game of Bones',publisher:{'@id':origin+'/#organization'}},
    {'@type':'WebPage','@id':baseUrl+'#webpage',url:baseUrl,name:document.title,isPartOf:{'@id':origin+'/#website'}}
  ]});
  const setProductSchema=(product,url)=>{
    if(staticProductSchema)return;
    if(!product)return;
    const name=product.n||product.name||'Game of Bones treat';
    const price=Number(product.p??product.price??0);
    const id=String(product.id||name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const image=absoluteImage(product.i||product.image);
    const productUrl=ensureCanonical(url||origin+'/products/'+id);
    const availability=Number.isFinite(Number(product.stock))&&Number(product.stock)<=0?'https://schema.org/OutOfStock':'https://schema.org/InStock';
    script('gob-product-schema',{'@context':'https://schema.org','@graph':[
      {'@type':'Product','@id':productUrl+'#product',name,description:product.d||product.desc||'Single-ingredient, naturally dehydrated pet treat from Game of Bones.',image:image?[image]:undefined,sku:id,category:product.c||product.category||undefined,brand:{'@type':'Brand',name:'Game of Bones'},offers:{'@type':'Offer',url:productUrl,priceCurrency:'INR',price:price.toFixed(2),availability,itemCondition:'https://schema.org/NewCondition',seller:{'@id':origin+'/#organization'}}},
      {'@type':'BreadcrumbList','@id':productUrl+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:origin+'/'},{'@type':'ListItem',position:2,name:'Products',item:origin+'/products'},{'@type':'ListItem',position:3,name,item:productUrl}]}
    ]});
  };
  return Object.freeze({setProductSchema});
})();
window.GOB_SEO=GOB_SEO;

const GOB_PRODUCTS={'chicken-jerky':{name:'Chicken Jerky',price:329,image:'assets/chicken-jerky-pouch.webp',tag:'Boneless jerky',catalog_slug:'chicken-jerky'},'chicken-jerky-pack-2':{name:'Chicken Jerky — 2 pouch value pack',price:625,image:'assets/chicken-jerky-pouch.webp',tag:'Boneless jerky · save ₹33',catalog_slug:'chicken-jerky'},'goat-trachea':{name:'Goat Trachea',price:100,image:'assets/goat-trachea-pouch.webp',tag:'Chews & bones',catalog_slug:'goat-trachea'},'goat-trotter':{name:'Goat Trotter',price:250,image:'assets/goat-trotter-plate.webp',tag:'Chews & bones',catalog_slug:'goat-trotter'}};
// Keep the catalogue store on window as well, so every deferred storefront script shares it reliably.
window.GOB_PRODUCTS = GOB_PRODUCTS;
// These aliases preserve existing product buttons and saved carts while every
// new tracking event uses the catalog's public URL slug.
const GOB_LEGACY_PRODUCT_KEYS=Object.freeze({jerky:'chicken-jerky','jerky-pack-2':'chicken-jerky-pack-2',trachea:'goat-trachea',trotter:'goat-trotter'});
const canonicalCartId=id=>GOB_LEGACY_PRODUCT_KEYS[String(id||'')]||String(id||'');
const catalogSlug=value=>String(value||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const catalogProductId=(product,fallbackId='')=>{
  const explicit=String(product?.catalog_slug||product?.catalogSlug||product?.slug||'').trim();
  if(explicit)return catalogSlug(explicit);
  // Names remain stable when the admin catalogue is keyed by a database UUID.
  const name=String(product?.name||product?.n||'').replace(/\s+—\s+.+$/,'').trim();
  if(name)return catalogSlug(name);
  const fallback=String(fallbackId||'');
  return GOB_LEGACY_PRODUCT_KEYS[fallback]||catalogSlug(fallback);
};
const money=n=>`₹${Number(n).toLocaleString('en-IN')}`;
const cart=()=>JSON.parse(localStorage.getItem('gob-preview-cart')||'[]');
const saveCart=value=>{localStorage.setItem('gob-preview-cart',JSON.stringify(value));window.GOB_CART_TRACKING?.queue?.()};
// Cart lines keep the product snapshot from add-to-cart time. Prefer it so a
// later catalogue sync cannot silently change an existing basket's image,
// name, or displayed price; checkout still revalidates current server pricing.
const cartProduct=item=>item.product||GOB_PRODUCTS[canonicalCartId(item.id)]||null;
const META_PIXEL_ID='2097278950833218';function installMetaPixel(){if(window.GOB_META)return;window.GOB_META={track:(name,params={},eventID)=>{if(typeof window.fbq==='function')window.fbq('track',name,params,eventID?{eventID}:undefined)},productId:catalogProductId};!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');window.fbq('init',META_PIXEL_ID);window.fbq('track','PageView')}installMetaPixel();
/* Keep the ad-click id for this tab so checkout can rebuild _fbc if the pixel
   cookie is blocked. Stored only in sessionStorage; never sent anywhere but Meta. */
(function rememberFbclid(){try{const id=new URLSearchParams(location.search).get('fbclid');if(id&&/^[A-Za-z0-9_-]{10,500}$/.test(id))sessionStorage.setItem('gob-fbclid',JSON.stringify({id,ts:Date.now()}))}catch(_){}})();

// GA4 is initialized for every visit. Events never include names, phone
// numbers, email addresses or delivery details.
const GOB_GA4_ID='G-N0KE06DGPV',GOB_CART_TOKEN_KEY='gob-cart-token';
let analyticsEnabled=false,cartCaptureTimer;
function analyticsCartItems(lines=cart()){return lines.map(line=>{const product=cartProduct(line);if(!product)return null;return {item_id:String(line.id),item_name:String(product.name||'Game of Bones treat'),price:Number(product.price)||0,quantity:Number(line.quantity)||1}}).filter(Boolean)}
function installAnalyticsTag(){if(analyticsEnabled)return;analyticsEnabled=true;window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',GOB_GA4_ID,{send_page_view:true});const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOB_GA4_ID)}`;document.head.append(script)}
function trackAnalyticsEvent(event,params={}){if(analyticsEnabled&&typeof window.gtag==='function')window.gtag('event',event,params)}
function trackAnalyticsEventBeforeNavigation(event,params={}){return new Promise(resolve=>{if(!analyticsEnabled||typeof window.gtag!=='function'){resolve(false);return}let complete=false;const done=()=>{if(complete)return;complete=true;resolve(true)};window.gtag('event',event,{...params,transport_type:'beacon',event_callback:done,event_timeout:1500});window.setTimeout(done,1600)})}
window.GOB_ANALYTICS={track:trackAnalyticsEvent,trackAndWait:trackAnalyticsEventBeforeNavigation};
// Microsoft Clarity is intentionally kept off pages that collect account,
// payment or delivery details. Product discovery and public browsing sessions
// remain available for conversion and UX analysis without recording checkout.
const GOB_CLARITY_PROJECT_ID='y5fd0b1rp3';
function installClarity(){
  if(window.__gobClarityInstalled||/(?:^|\/)(?:account|login|checkout|cart)(?:\/|$)/i.test(location.pathname))return;
  window.__gobClarityInstalled=true;
  window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)};
  const script=document.createElement('script');script.async=true;script.src=`https://www.clarity.ms/tag/${encodeURIComponent(GOB_CLARITY_PROJECT_ID)}`;
  document.head.append(script);
}
function cartToken(){let token=localStorage.getItem(GOB_CART_TOKEN_KEY)||'';if(!/^cart_[A-Za-z0-9_-]{20,80}$/.test(token)){const random=window.crypto?.randomUUID?.().replace(/-/g,'')||`${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;token=`cart_${random}`;localStorage.setItem(GOB_CART_TOKEN_KEY,token)}return token}
function queueCartCapture(){clearTimeout(cartCaptureTimer);const lines=analyticsCartItems();if(!lines.length)return;cartCaptureTimer=setTimeout(()=>{if(!window.GOB_API?.abandonedCart)return;const activeLines=analyticsCartItems();if(!activeLines.length)return;const total=activeLines.reduce((sum,line)=>sum+line.price*line.quantity,0);window.GOB_API.abandonedCart({cart_token:cartToken(),items:activeLines,total,cart_lines:cart().map(l=>({id:l.id,quantity:l.quantity,product:l.product?{name:l.product.name,price:l.product.price,packLabel:l.product.packLabel||'',tag:l.product.tag||'',catalog_slug:l.product.catalog_slug||'',image:l.product.image||''}:null}))}).catch(()=>{})},1200)}
window.GOB_CART_TRACKING={token:cartToken,queue:queueCartCapture};
function cartCount(){return cart().reduce((total,item)=>total+item.quantity,0)}
function notice(message,kind='info'){const el=document.querySelector('#toast');if(!el)return;el.className=`toast${kind==='jar'?' jar-toast':''}`;el.innerHTML=kind==='jar'?`<span class="toast-jar" aria-hidden="true"><svg viewBox="0 0 32 36" fill="none"><path d="M9 8V5h14v3M7 9h18l2 22H5L7 9Z" stroke="currentColor" stroke-width="2"/><path d="M10 16h12M11 21h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><span><b>In your treat jar</b>${message}</span>`:message;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3200)}
function updateCart(){const items=cart(),count=cartCount();document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=count);const list=document.querySelector('#cartItems'),total=document.querySelector('#cartTotal');if(!list||!total)return;if(!items.length){list.innerHTML='<p class="empty">Your treat jar is waiting for something delicious.</p>';total.textContent=money(0);return}list.innerHTML=items.map(item=>{const p=cartProduct(item);if(!p)return '';const imageAlt=`${p.name||'Game of Bones treat'} product image`;return `<div class="cart-item"><img src="${p.image}" alt="${imageAlt}"><div><strong>${p.name}</strong><small>${item.quantity} × ${money(p.price)}</small></div><button class="remove" data-remove="${item.id}">Remove</button></div>`}).join('');total.textContent=money(items.reduce((sum,item)=>sum+(cartProduct(item)?.price||0)*item.quantity,0));document.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{saveCart(cart().filter(item=>item.id!==button.dataset.remove));updateCart();notice('Removed from your treat jar.')}))}
function addToCart(id,quantity=1){id=canonicalCartId(id);const items=cart(),product=GOB_PRODUCTS[id],isBogo=[].includes(String(product?.name||'').replace(/\s+—\s+.+$/,'').trim().toLowerCase());if(isBogo&&quantity===1)quantity=2;const snapshot=product?{name:product.name,price:Number(product.price)||0,image:product.image||'',tag:product.tag||'',packLabel:product.packLabel||'',catalog_slug:catalogProductId(product,id)}:null,found=items.find(item=>canonicalCartId(item.id)===id);if(found){found.id=id;found.quantity+=quantity;if(snapshot)found.product=snapshot}else items.push({id,quantity,product:snapshot});saveCart(items);updateCart();const value=(Number(product?.price)||0)*quantity,catalogId=catalogProductId(product,id);window.GOB_META?.track('AddToCart',{content_ids:[catalogId],content_name:product?.name||'Game of Bones treat',content_type:'product',currency:'INR',value});window.GOB_ANALYTICS?.track('add_to_cart',{currency:'INR',value,items:[{item_id:catalogId,item_name:product?.name||'Game of Bones treat',price:Number(product?.price)||0,quantity}]});notice(isBogo?`${product?.name||'Treat'} added — Buy 1 Get 1: your second pack is free.`:`${product?.name||'Treat'} added to your treat jar.`,'jar')}
function openCart(){document.querySelector('#cartDrawer')?.classList.add('open');document.querySelector('#scrim')?.classList.add('open');document.body.classList.add('locked')}
function closeCart(){document.querySelector('#cartDrawer')?.classList.remove('open');document.querySelector('#scrim')?.classList.remove('open');document.body.classList.remove('locked')}
// Customer-facing URLs stay clean even though the static files behind them use
// .html names. This also covers links injected by catalogue, cart and blog UI.
const cleanPageUrls={'index.html':'/','products.html':'/products','product.html':'/product','our-story.html':'/our-story','bundles.html':'/bundles','blog.html':'/blog','contact.html':'/contact','rewards.html':'/rewards','track.html':'/track','learn.html':'/learn','cart.html':'/cart','checkout.html':'/checkout','login.html':'/login','account.html':'/account','policies.html':'/policies'};
function cleanStorefrontUrls(root=document){const links=[...(root.matches?.('a[href]')?[root]:[]),...(root.querySelectorAll?.('a[href]')||[])];links.forEach(link=>{const raw=link.getAttribute('href');if(!raw||/^(?:#|mailto:|tel:|https?:|\/\/)/i.test(raw))return;const match=raw.match(/^([^?#]+)(.*)$/);if(!match)return;const cleaned=cleanPageUrls[match[1]];if(cleaned)link.setAttribute('href',cleaned+match[2])})}
function ensureCart(){if(document.querySelector('#cartDrawer'))return;document.body.insertAdjacentHTML('beforeend','<div class="scrim" id="scrim"></div><aside class="drawer" id="cartDrawer" aria-label="Shopping treat jar"><div class="drawer-top"><h2>Your treat jar</h2><button class="close" data-close-cart aria-label="Close treat jar">×</button></div><div class="cart-items" id="cartItems"></div><div class="cart-total"><div><span>Subtotal</span><span id="cartTotal">₹0</span></div><a class="button" style="width:100%" href="/checkout">Checkout securely</a><a href="/cart" style="display:block;text-align:center;margin-top:10px;font-size:13px;text-decoration:underline">View or edit treat jar</a><p style="margin:8px 0 0;font-size:12px;text-align:center;opacity:.75">Free delivery on full packs · UPI, cards or Cash on Delivery</p></div></aside><div class="toast" id="toast" role="status"></div>')}
function enhanceHeader(){const actions=document.querySelector('.nav-actions'),links=document.querySelector('.nav-links');if(!actions)return;links?.classList.add('compact-nav');const track=links?.querySelector('a[href="track.html"]'),bundles=links?.querySelector('a[href="bundles.html"]');if(track&&bundles)bundles.insertAdjacentElement('afterend',track);if(!document.querySelector('.search-trigger'))actions.insertAdjacentHTML('afterbegin','<button class="search-trigger" type="button" aria-label="Search products" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4"></circle><path d="m16 16 4.3 4.3"></path></svg><span>Search</span></button>');if(!document.querySelector('.login-trigger'))actions.insertAdjacentHTML('afterbegin',(window.GOB_SIGNED_IN?'<a class="login-trigger" href="/account">Account</a>':'<a class="login-trigger" href="login.html">Log in</a>'));actions.querySelector('.icon-btn')?.remove();const jar=actions.querySelector('.cart-trigger');if(jar&&!jar.dataset.jarReady){jar.dataset.jarReady='true';jar.setAttribute('aria-label','Open treat jar');jar.innerHTML='<svg class="jar-icon" viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M9 8V5h14v3M7 9h18l2 22H5L7 9Z" stroke="currentColor" stroke-width="2"/><path d="M10 16h12M11 21h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="sr-only">Treat jar, </span><span class="jar-count" data-cart-count>0</span>'}if(!document.querySelector('link[data-gob-header]')){const styles=document.createElement('link');styles.rel='stylesheet';styles.href='header.css?v=header-4';styles.dataset.gobHeader='true';document.head.append(styles)}}
function setupAnnouncement(){const bar=document.querySelector('.notice'),text=bar?.querySelector('span');if(!bar||!text||bar.dataset.ready)return;bar.dataset.ready='true';const copy=()=> 'Free delivery on full packs • ₹30 off when you pay online • MEGA20: 20% off ₹2,199+';bar.innerHTML='<div class="notice-track"><span></span></div>';const label=bar.querySelector('.notice-track span'),paint=()=>label.textContent=copy();paint()}
function setupSearch(){const trigger=document.querySelector('.search-trigger');if(!trigger||document.querySelector('#productSearch'))return;document.body.insertAdjacentHTML('beforeend','<section class="search-sheet" id="productSearch" aria-hidden="true"><div class="search-panel" role="dialog" aria-modal="true" aria-labelledby="searchTitle"><div class="search-top"><div><p class="eyebrow">Find a treat</p><h2 id="searchTitle">Search the treat cupboard.</h2></div><button class="search-close" type="button" aria-label="Close search">×</button></div><label class="search-field" for="productSearchInput"><span class="sr-only">Search products</span><input id="productSearchInput" type="search" autocomplete="off" placeholder="Try chicken, goat or chew"><span>⌕</span></label><div class="search-results" id="productSearchResults"></div></div></section>');const sheet=document.querySelector('#productSearch'),input=document.querySelector('#productSearchInput'),results=document.querySelector('#productSearchResults');const products=()=>Object.entries(window.GOB_PRODUCTS||GOB_PRODUCTS);const render=value=>{const query=value.trim().toLowerCase(),matches=products().filter(([id,p])=>!query||`${p.name} ${p.tag||''}`.toLowerCase().includes(query)).slice(0,6);results.innerHTML=matches.length?matches.map(([id,p])=>`<a href="product.html?catalog=${encodeURIComponent(id)}"><img src="${p.image}" alt="${p.name||'Game of Bones treat'}"><span><b>${p.name}</b><small>${p.tag||'Single-ingredient treat'} · ${money(p.price)}</small></span><i>→</i></a>`).join(''):'<p>No treats found. Try “chicken” or “goat”.</p>'};const close=()=>{sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');trigger.setAttribute('aria-expanded','false');document.body.classList.remove('locked')};trigger.addEventListener('click',()=>{sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');document.body.classList.add('locked');render('');setTimeout(()=>input.focus(),10)});input.addEventListener('input',()=>render(input.value));sheet.querySelector('.search-close').addEventListener('click',close);sheet.addEventListener('click',event=>{if(event.target===sheet)close()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&sheet.classList.contains('open'))close()})}
function installFooter(){let footer=document.querySelector('footer.footer');if(!footer){footer=document.createElement('footer');footer.className='footer';document.body.appendChild(footer)}footer.dataset.gobFooter='true';footer.innerHTML='<div class="footer-grid"><div><h3>Good treats.<br>Good dogs.</h3><p>Single-ingredient treats, made in Maharashtra for the everyday moments that matter.</p><form class="email-row" data-demo-form><label class="sr-only" for="footerEmail">Email address</label><input id="footerEmail" type="email" required placeholder="Your email for treat notes"><label class="footer-consent"><input type="checkbox" name="marketing_consent" required> I agree to receive Game of Bones offers and can unsubscribe anytime.</label><button type="submit">Join →</button><p class="form-success">You’re on the list.</p></form></div><div><h4>Shop</h4><a href="products.html">All treats</a><a href="bundles.html">Bundles</a><a href="rewards.html">Rewards</a><a href="cart.html">Your treat jar</a></div><div><h4>Learn</h4><a href="our-story.html">Our story</a><a href="blog.html">Journal</a><a href="learn.html">Treat guide</a><a href="blog.html#transition-plan">Transition plan</a></div><div><h4>Help</h4><a href="track.html">Track an order</a><a href="contact.html">Contact us</a><a href="policies.html#shipping">Shipping</a><a href="policies.html#returns">Returns & refunds</a><a href="/terms">Terms</a><a href="policies.html#privacy">Privacy</a><a href="policies.html#grievance">Grievance</a><a href="policies.html#rights">Your data rights</a></div></div><div class="footer-bottom"><span>© 2026 Game of Bones · Made in Kalyan, Maharashtra · <a href="tel:+919082503295">+91 90825 03295</a> · <a href="https://wa.me/919082503295">WhatsApp</a> · <a href="mailto:helpgameofbones@gmail.com">helpgameofbones@gmail.com</a></span><span>UPI · Cards · Cash on Delivery</span></div>'}
function addPolicyLinks(){}
function installRewardShortcut(){if(document.querySelector('.reward-shortcut')||/^\/(cart|checkout|thank-you)(\.html)?\/?$/i.test(location.pathname)||location.pathname.endsWith('rewards.html')||location.pathname.replace(/\/+$/,'')==='/rewards')return;if(!document.querySelector('link[data-gob-reward-shortcut]')){const styles=document.createElement('link');styles.rel='stylesheet';styles.href='reward-shortcut.css?v=1';styles.dataset.gobRewardShortcut='true';document.head.append(styles)}document.body.insertAdjacentHTML('beforeend','<a class="reward-shortcut" href="rewards.html" aria-label="Open Game of Bones rewards" title="Rewards"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9L9.6 7 12 2Z"/><path d="M7 20h10"/></svg><span>Rewards</span></a>')}
function init(){ensureCart();enhanceHeader();setupAnnouncement();setupSearch();installFooter();addPolicyLinks();installRewardShortcut();installAnalyticsTag();installClarity();cleanStorefrontUrls();new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)cleanStorefrontUrls(node)}))).observe(document.body,{childList:true,subtree:true});document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>addToCart(button.dataset.add,Number(button.dataset.quantity||1))));document.querySelectorAll('[data-open-cart]').forEach(button=>button.addEventListener('click',openCart));document.querySelectorAll('[data-close-cart]').forEach(button=>button.addEventListener('click',closeCart));document.querySelector('.menu-toggle')?.addEventListener('click',()=>{const links=document.querySelector('.nav-links'),open=links.classList.toggle('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded',open)});document.querySelectorAll('.option').forEach(button=>button.addEventListener('click',()=>{button.parentElement.querySelectorAll('.option').forEach(x=>x.classList.remove('selected'));button.classList.add('selected')}));document.querySelectorAll('[data-demo-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();form.querySelector('.form-success')?.classList.add('show');form.reset()}));const io='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.14}):null;document.querySelectorAll('.reveal').forEach(el=>io?io.observe(el):el.classList.add('visible'));updateCart()}
document.addEventListener('DOMContentLoaded',init);

// Footer sign-ups must create real leads, not merely display a success state.
// A capture-phase handler runs before the older presentation-only listener above.
function bindNewsletterCapture(){
  document.querySelectorAll('[data-demo-form]').forEach(form=>{
    if(form.dataset.newsletterBound)return;
    form.dataset.newsletterBound='true';
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      if(!form.reportValidity())return;
      const input=form.querySelector('input[type="email"]'),button=form.querySelector('button[type="submit"]'),status=form.querySelector('.form-success');
      const email=input?.value.trim().toLowerCase();
      if(!email||!button)return;
      button.disabled=true;button.textContent='Joining…';
      try{
        const consent=form.querySelector('[name="marketing_consent"]')?.checked===true;
        if(!consent)throw new Error('Please confirm that you want to receive offers.');
        const response=await fetch('/api/public-email-capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,source:'footer_newsletter',marketing_consent:true,privacy_notice_version:'2026-09-14'})});
        const body=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(body.error||'We could not save your email.');
        if(status){status.textContent='You’re on the list.';status.classList.add('show')}
        form.reset();
      }catch(error){
        if(status){status.textContent=error.message||'Please try again.';status.classList.add('show');status.style.color='#a22c22'}
      }finally{button.disabled=false;button.textContent='Join →'}
    },true);
  });
}
document.addEventListener('DOMContentLoaded',bindNewsletterCapture);
// Catalogue synchronisation retains internal IDs for selected packs and legacy
// records. A search should present one result per product, never every alias.
function dedupeSearchResults(){const results=document.querySelector('#productSearchResults');if(!results)return;let cleaning=false;const clean=()=>{if(cleaning)return;cleaning=true;const seen=new Set;results.querySelectorAll(':scope>a').forEach(result=>{const name=result.querySelector('b')?.textContent.trim().toLowerCase();if(!name)return;if(seen.has(name))result.remove();else seen.add(name)});results.dataset.uniqueReady='true';cleaning=false};new MutationObserver(clean).observe(results,{childList:true});clean()}
document.addEventListener('DOMContentLoaded',dedupeSearchResults);

// Pack aliases keep a selected pack priced correctly in the treat jar, but they are
// not separate products. Keep them directly addressable without exposing them
// to the catalogue search's Object.entries() call.
function hidePackAliasesFromSearch(){
  const products=window.GOB_PRODUCTS;
  if(!products)return;
  Object.keys(products).forEach(id=>{
    if(!/-pack-\d+$/.test(id))return;
    const descriptor=Object.getOwnPropertyDescriptor(products,id);
    if(!descriptor?.enumerable)return;
    Object.defineProperty(products,id,{...descriptor,enumerable:false});
  });
}
document.addEventListener('DOMContentLoaded',hidePackAliasesFromSearch);
document.addEventListener('gob:catalog-sync',hidePackAliasesFromSearch);

function installFormFeedback(){
  if(!document.querySelector('link[data-gob-form-feedback]')){
    const stylesheet=document.createElement('link');
    stylesheet.rel='stylesheet';
    stylesheet.href='/form-feedback.css';
    stylesheet.dataset.gobFormFeedback='true';
    document.head.append(stylesheet);
  }
  document.querySelectorAll('form').forEach(form=>{
    form.addEventListener('invalid',event=>{
      const field=event.target;
      if(!(field instanceof HTMLElement))return;
      const key=field.name||field.id;
      field.setAttribute('aria-invalid','true');
      if(!key)return;
      let hint=form.querySelector(`[data-field-error-for="${CSS.escape(key)}"]`);
      if(!hint){
        hint=document.createElement('p');
        hint.className='field-error';
        hint.dataset.fieldErrorFor=key;
        hint.setAttribute('role','alert');
        field.insertAdjacentElement('afterend',hint);
      }
      hint.textContent=field.validationMessage||'Please check this field.';
    },true);
    form.addEventListener('input',event=>{
      const field=event.target;
      if(!(field instanceof HTMLInputElement||field instanceof HTMLSelectElement||field instanceof HTMLTextAreaElement))return;
      if(field.checkValidity()){
        field.removeAttribute('aria-invalid');
        const key=field.name||field.id;
        form.querySelector(`[data-field-error-for="${CSS.escape(key)}"]`)?.remove();
      }
    });
  });
}
document.addEventListener('DOMContentLoaded',installFormFeedback);

// Bone Run game launcher on every storefront page (skipped on checkout/login).
(function(){if(window.__gobBRInject)return;window.__gobBRInject=1;var add=function(){if(document.querySelector('script[src^="/bone-run-loader.js"]'))return;var s=document.createElement('script');s.src='/bone-run-loader.js?v=2';s.defer=true;document.body.appendChild(s);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add,{once:true});else add();})();

// WhatsApp cart-reminder links: /cart?restore=TOKEN rebuilds the shopper's
// saved treat jar (TOKEN.c also applies the treat jar's coupon), then reloads cleanly.
(function(){try{var p=new URLSearchParams(location.search),raw=p.get('restore'),code=String(p.get('code')||'').trim().toUpperCase();if(/^[A-Z0-9-]{4,24}$/.test(code)){try{sessionStorage.setItem('gob-checkout-coupon',code)}catch(_){}}if(p.has('code')&&!raw){p.delete('code');history.replaceState(null,'',location.pathname+(p.toString()?'?'+p.toString():'')+location.hash);return;}if(!raw)return;var withCoupon=/\.c$/.test(raw),token=raw.replace(/\.c$/,'');p.delete('restore');p.delete('code');var clean=location.pathname+(p.toString()?'?'+p.toString():'')+location.hash;if(!/^[A-Za-z0-9_-]{12,40}$/.test(token)){history.replaceState(null,'',clean);return;}fetch('/api/cart-restore?token='+encodeURIComponent(token),{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(d){if(d&&d.found&&Array.isArray(d.lines)&&d.lines.length){var lines=d.lines.filter(function(l){return l&&l.id&&l.product&&l.product.name}).map(function(l){return{id:String(l.id),quantity:Math.max(1,Math.min(99,Number(l.quantity)||1)),product:{name:l.product.name,price:Number(l.product.price)||0,image:l.product.image||'',tag:l.product.tag||'',packLabel:l.product.packLabel||'',catalog_slug:l.product.catalog_slug||''}}});if(lines.length){localStorage.setItem('gob-preview-cart',JSON.stringify(lines));if(withCoupon&&d.coupon_code)sessionStorage.setItem('gob-checkout-coupon',String(d.coupon_code));location.replace(clean);return;}}history.replaceState(null,'',clean);}).catch(function(){history.replaceState(null,'',clean)});}catch(_){}})();

// Stock limits and "Only N left" badges live in their own file so every page
// that loads site.js gets them without editing each HTML page.
(function loadStockGuard(){if(document.querySelector('script[data-gob-stock-guard]'))return;const s=document.createElement('script');s.src='/stock-guard.js?v=1';s.defer=true;s.dataset.gobStockGuard='true';document.head.append(s)})();

(function loadMobilePolish(){if(document.querySelector('script[data-gob-mobile-polish]'))return;const s=document.createElement('script');s.src='/mobile-polish.js?v=2';s.defer=true;s.dataset.gobMobilePolish='true';document.head.append(s)})();

(function loadPreferredSource(){if(document.querySelector('script[data-gob-pref]'))return;const s=document.createElement('script');s.src='/preferred-source.js?v=1';s.defer=true;s.dataset.gobPref='true';document.head.append(s)})();
;
/* ===== api-client.js ===== */
/* Customer storefront API bridge. Production calls stay on the protected
   server-side admin API; previews remain visually testable without it. */
(() => {
  const params = new URLSearchParams(window.location.search);
  const configured = params.get('api') || window.localStorage.getItem('gob-api-base');
  const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const production = ['gameofbones.in', 'www.gameofbones.in'].includes(window.location.hostname);
  const staging = /(^|\.)gameofbones-website(?:-[a-z0-9-]+)?-gameofbones\.vercel\.app$/i.test(window.location.hostname);
  // Production uses the storefront's own /api path. Vercel securely proxies
  // that path to the order service, avoiding a browser-side dependency on a
  // second hostname during checkout.
  const base = (configured || (local ? 'http://localhost:3001/api' : production ? '/api' : '')).replace(/\/$/, '');
  // Catalogue reads are safe for the stable staging preview too. Other
  // customer actions deliberately remain disconnected there, so test orders
  // and personal data never land in production by accident.
  const catalogueBase = (configured || (local ? 'http://localhost:3001/api' : production ? '/api' : staging ? 'https://gameofbones-admin.vercel.app/api' : '')).replace(/\/$/, '');
  async function request(path, options = {}) {
    if (!base) throw new Error('The API bridge is not configured for this preview.');
    const response = await fetch(`${base}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The service could not complete that request.');
    return data;
  }
  async function multipartRequest(path, token, body) {
    if (!base) throw new Error('The API bridge is not configured for this preview.');
    const response = await fetch(`${base}${path}`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The service could not complete that request.');
    return data;
  }
  const customerHeaders = () => {
    const token = window.sessionStorage.getItem('gob-customer-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  const api = {
    base, request,
    catalogue: async () => {
      if (!catalogueBase) throw new Error('The catalogue feed is not configured for this preview.');
      const response = await fetch(`${catalogueBase}/public-products`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The catalogue could not be loaded.');
      return data;
    },
    blogs: async () => {
      if (!catalogueBase) throw new Error('The blog feed is not configured for this preview.');
      const response = await fetch(`${catalogueBase}/public-blogs`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The journal could not be loaded.');
      return data;
    },
    pincode: pin => request(`/pincode-check?pin=${encodeURIComponent(pin)}`),
    requestLoginCode: email => request('/customer-auth/request-code', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyLoginCode: (email, code) => request('/customer-auth/verify-code', { method: 'POST', body: JSON.stringify({ email, code }) }),
    requestAccountCreationCode: body => request('/customer-auth/create-account/request-code', { method: 'POST', body: JSON.stringify(body) }),
    verifyAccountCreationCode: body => request('/customer-auth/create-account/verify-code', { method: 'POST', body: JSON.stringify(body) }),
    account: token => request('/customer-account', { headers: { Authorization: `Bearer ${token}` } }),
    updateAccount: (token, body) => request('/customer-account', { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
    customerReviews: token => request('/customer-reviews', { headers: { Authorization: `Bearer ${token}` } }),
    submitCustomerReview: (token, formData) => multipartRequest('/customer-reviews', token, formData),
    publicProductReviews: product => request(`/public-product-reviews?product=${encodeURIComponent(product)}`),
    capture: body => request('/public-email-capture', { method: 'POST', body: JSON.stringify(body) }),
    contactInquiry: body => request('/contact-inquiries', { method: 'POST', body: JSON.stringify(body) }),
    spinWheel: body => request('/spin-wheel', { method: 'POST', body: JSON.stringify(body) }),
    restockAlert: body => request('/public-restock-alert', { method: 'POST', body: JSON.stringify(body) }),
    abandonedCart: body => request('/abandoned-cart', { method: 'POST', body: JSON.stringify(body) }),
    orderAttempt: body => request('/order-attempt-alert', { method: 'POST', body: JSON.stringify(body) }),
    saveOrder: body => request('/save-order', { method: 'POST', headers: customerHeaders(), body: JSON.stringify(body) }),
    createRazorpayOrder: body => request('/razorpay-order', { method: 'POST', headers: customerHeaders(), body: JSON.stringify(body) }),
    trackOrder: ref => request('/public-order-tracking', { method: 'POST', body: JSON.stringify({ ref }) }),
  };
  window.GOB_API = api;
  window.GOB_PINCODE_CHECKER = async pin => {
    const data = await api.pincode(pin);
    return { serviceable: Boolean(data.serviceable), city: data.city || '', state: data.state || '', cod: Boolean(data.cod), prepaid: Boolean(data.prepaid), dispatch: data.dispatch || '', eta: data.eta || '', source: data.source || '' };
  };
})();
;
/* ===== catalog.js ===== */
window.GOB_LIVE_CATALOG=[
{n:'Chicken Jerky',c:'Jerky',w:'60 g',p:329,d:'Single-ingredient slow-dehydrated chicken breast. High-protein, low-fat and made for training rewards.',i:'assets/catalogue-plates/chicken-jerky.webp',id:'chicken-jerky'},
{n:'Buff Jerky',c:'Jerky',w:'60 g',p:449,d:'Single-ingredient buffalo jerky with a richer flavour profile.',i:'https://gameofbones.in/assets/catalogue-plates/buff-jerky.webp'},
{n:'Chicken Feet',c:'Chews & bones',w:'70 g',p:300,d:'Whole dehydrated chicken feet for supervised chewing.',i:'https://gameofbones.in/assets/catalogue-plates/chicken-feet.webp'},
{n:'Chicken Neck',c:'Chews & bones',w:'70 g',p:300,d:'Whole chicken neck, slowly dehydrated and bone-in.',i:'https://gameofbones.in/assets/catalogue-plates/chicken-neck.webp'},
{n:'Chicken Bites',c:'Jerky',w:'60 g',p:329,d:'Bite-sized dehydrated chicken pieces for training.',i:'assets/catalogue-plates/chicken-bites.webp'},
{n:'Chicken Wings',c:'Chews & bones',w:'5 pieces',p:350,d:'Crunchy dehydrated chicken wings for supervised chewing.',i:'assets/catalogue-plates/chicken-wings.webp'},
{n:'Chicken Wing Tips',c:'Chews & bones',w:'100 g',p:300,d:'Crunchy, single-ingredient chicken wing tips for short supervised chew sessions.',i:'assets/catalogue-plates/chicken-wing-tips.webp',id:'chicken-wing-tips'},
{n:'Chicken Bones',c:'Chews & bones',w:'100 g',p:200,d:'Assorted dehydrated chicken bone pieces for supervised chewing.',i:'assets/catalogue-plates/chicken-bones.webp'},
{n:'Goat Trachea',c:'Chews & bones',w:'1 piece',p:100,d:'A cartilage-rich chew for supervised chew time.',i:'assets/catalogue-plates/goat-trachea.webp',id:'goat-trachea'},
{n:'Goat Trotter',c:'Chews & bones',w:'1 piece',p:250,d:'A dense natural chew with bone, skin and cartilage.',i:'assets/catalogue-plates/goat-trotter-green-plate.webp',id:'goat-trotter'},
{n:'Goat Ear',c:'Chews & bones',w:'6 pieces',p:350,d:'Thin, crunchy goat ears for supervised chew time.',i:'assets/catalogue-plates/goat-ear.webp'},
{n:'Chicken Gizzards',c:'Organ treats',w:'60 g',p:300,d:'Single-ingredient dehydrated chicken gizzards.',i:'assets/catalogue-plates/chicken-gizzards.webp'},
{n:'Chicken Heart & Liver',c:'Organ treats',w:'60 g',p:300,d:'A single-ingredient chicken heart and liver mix.',i:'assets/catalogue-plates/chicken-heart-liver.webp'},
{n:'Goat Liver',c:'Organ treats',w:'60 g',p:450,d:'Single-ingredient dehydrated goat liver.',i:'assets/catalogue-plates/goat-liver.webp'},
{n:'Goat Lungs',c:'Organ treats',w:'60 g',p:450,d:'Lightweight, crunchy dehydrated goat lungs.',i:'assets/catalogue-plates/goat-lungs.webp'},
{n:'Goat Heart & Kidney Mix',c:'Organ treats',w:'60 g',p:500,d:'A single-ingredient goat heart and kidney mix.',i:'assets/catalogue-plates/goat-heart-kidney.webp'},
{n:'Goat Spleen',c:'Organ treats',w:'60 g',p:450,d:'Single-ingredient dehydrated goat spleen.',i:'assets/catalogue-plates/goat-spleen.webp'},
{n:'Anchovies',c:'Fish treats',w:'60 g',p:350,d:'Wild-caught whole anchovies.',i:'assets/catalogue-plates/anchovies.webp'},
{n:'Bombay Duck',c:'Fish treats',w:'60 g',p:450,d:'Traditional Bombil, a coastal single-ingredient treat.',i:'assets/catalogue-plates/bombay-duck.webp'},
{n:'Whole Mackerel',c:'Fish treats',w:'100 g',p:600,d:'Whole dehydrated mackerel.',i:'assets/catalogue-plates/whole-mackerel-green-plate.webp'},
{n:'Mackerel Fillet',c:'Fish treats',w:'60 g',p:650,d:'Boneless dehydrated mackerel fillet.',i:'assets/catalogue-plates/mackerel-fillet.webp'},
{n:'Sardines',c:'Fish treats',w:'60 g',p:400,d:'Whole dehydrated sardines.',i:'assets/catalogue-plates/sardines.webp'},
{n:'White Sardines',c:'Fish treats',w:'60 g',p:350,d:'Whole white sardines, slowly dehydrated into a crisp single-ingredient fish treat.',i:'assets/catalogue-plates/white-sardines.webp',id:'white-sardines'},
{n:'Tuna',c:'Fish treats',w:'60 g',p:500,d:'Lean, high-protein dehydrated tuna.',i:'assets/catalogue-plates/tuna-green-plate.webp'},
{n:'Prawns',c:'Fish treats',w:'60 g',p:599,d:'A premium dehydrated prawn treat.',i:'assets/catalogue-plates/prawns.webp'},
{n:'Whole Quail',c:'Whole prey',w:'1 piece',p:275,d:'Whole dehydrated quail with meat, bone and organs.',i:'assets/catalogue-plates/whole-quail.webp'},
{n:'Cat Trial Box',c:'Bundles',w:'5 fish treats · 120 g',p:749,cp:899,d:'A fish-forward tasting box with five clearly listed single-ingredient treats.',i:'assets/catalogue-v3/cat-trial-box.webp',contents:['Anchovies · 25 g','Sardines · 25 g','Mackerel Fillet · 25 g','Bombay Duck · 25 g','Tuna · 20 g']},
{n:'Surprise Me Box',c:'Bundles',w:'6 treats · assorted',p:1400,cp:1650,d:'A team-curated mix across chicken, fish and natural chews.',i:'assets/catalogue-v3/surprise-me-box.webp',contents:['Chicken Bites · 60 g','Chicken Gizzards · 60 g','Chicken Heart & Liver · 60 g','Anchovies · 60 g','Goat Ear · 5 pieces','Goat Trachea · 1 piece']},
{n:'Small Treat Box',c:'Bundles',w:'9 mini treats · 135 g',p:650,cp:700,d:'Nine labelled 15 g mini samples across jerky, organs, fish and chews.',i:'assets/catalogue-v3/small-treat-box.webp',contents:['Chicken Jerky · 15 g','Chicken Bites · 15 g','Chicken Gizzards · 15 g','Chicken Heart & Liver · 15 g','Anchovies · 15 g','Mackerel Fillet · 15 g','Chicken Bones · 15 g','Chicken Neck · 15 g','Chicken Feet · 15 g']},
{n:'Medium Treat Box',c:'Bundles',w:'7 treats · 360 g+',p:2150,cp:2450,d:'A full-size discovery box across chicken, fish, organs and natural chews.',i:'assets/catalogue-v3/medium-treat-box.webp',contents:['Chicken Jerky · 60 g','Chicken Feet · 60 g','Chicken Gizzards · 60 g','Chicken Heart & Liver · 60 g','Anchovies · 60 g','Mackerel Fillet · 60 g','Goat Ear · 5 pieces']},
{n:'Large Treat Box',c:'Bundles',w:'9 treats · full-range selection',p:2850,cp:3350,d:'A generous full-range discovery box across jerky, fish, organs and natural chews.',i:'assets/catalogue-v3/large-treat-box.webp',contents:['Chicken Jerky · 60 g','Chicken Feet · 60 g','Chicken Gizzards · 60 g','Goat Liver · 60 g','Anchovies · 60 g','Mackerel Fillet · 60 g','Goat Trotter · 1 piece','Chicken Wings · 5 pieces','Buff Jerky · 60 g']}
];
/* On the standalone products page this file runs before site.js (no GOB_PRODUCTS yet) and catalog-standalone.js renders the grid, so skip this block there instead of throwing. */
if(typeof GOB_PRODUCTS!=='undefined'){window.GOB_LIVE_CATALOG.forEach(item=>{const id=item.id||item.n.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');GOB_PRODUCTS[id]??={name:item.n,price:item.p||0,comparePrice:item.cp||0,image:item.i,tag:item.c,packLabel:item.w||'',catalog_slug:item.n.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}});
document.addEventListener('DOMContentLoaded',()=>{const root=document.querySelector('#liveCatalog');if(!root)return;const filters=document.querySelector('#catalogFilters');let category='All';const render=cat=>{category=cat;const items=window.GOB_LIVE_CATALOG.filter(x=>cat==='All'||x.c===cat);root.innerHTML=items.map((x,i)=>{const sale=Number(x.cp)>Number(x.p);const price=x.p?`${sale?`<span class="catalog-price"><s>₹${x.cp}</s><strong>₹${x.p}</strong></span>`:`₹${x.p}`}`:'Ask us';return `<article class="product-card">${sale?'<span class="sale-badge">Sale</span>':''}<a href="${x.id?'product.html?catalog='+x.id:'contact.html'}"><div class="product-image ${i%3===0?'cream':i%3===1?'sage':'brown'}"><img src="${x.i}" alt="${x.n} natural dog treat" width="600" height="600" loading="lazy" decoding="async"></div></a><div class="card-copy"><p class="tag">${x.c}</p><h3>${x.n}</h3><p class="catalog-desc">${x.d}</p><div class="card-bottom"><span>${x.w} · ${price}</span>${x.id?`<button class="quick-add" aria-label="Add ${x.n} to treat jar">+</button>`:`<a class="catalog-link" href="contact.html">Ask us</a>`}</div></div></article>`}).join('');root.querySelectorAll('.quick-add').forEach((button,index)=>button.addEventListener('click',()=>addToCart(items[index].id)))};const renderFilters=()=>{const categories=['All',...new Set(window.GOB_LIVE_CATALOG.map(x=>x.c))];filters.innerHTML=categories.map(c=>`<button class="filter ${c===category?'selected':''}" data-filter="${c}">${c}</button>`).join('');filters.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{filters.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));button.classList.add('selected');render(button.dataset.filter)}));};renderFilters();render(category);document.addEventListener('gob:catalog-sync',()=>{renderFilters();render(category)})});}
;
/* ===== catalogue-reference.js ===== */
/* Canonical product packs from the COGS Calculator Master List. This is the
   verified selling-price and quantity source until the admin records are
   reconciled to the same workbook. */
(() => {
  const reference = {
    'whole-quail': [['1 piece',275],['2 pieces',550],['3 pieces',825],['4 pieces',1000]],
    'chicken-wings': [['5 pieces',350],['10 pieces',700],['15 pieces',975]],
    'chicken-wing-tips': [[100,300],[200,580],[300,860],[400,1140]],
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
    'white-sardines': [[60,350],[120,650],[180,975],[240,1300]],
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
;
/* ===== catalog-sync.js ===== */
/* Keep public product presentation in sync with the admin product editor.
   Static copy remains as a graceful fallback if the API is temporarily down. */
(() => {
  const slug = value => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const safeMoney = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
  const productStore = () => typeof GOB_PRODUCTS !== 'undefined' ? GOB_PRODUCTS : (window.GOB_PRODUCTS ||= {});
  /* A legacy Goat Trachea upload was accidentally attached to Chicken Bones.
     Keep storefront galleries product-safe while the admin record is cleaned. */
  const invalidMedia = new Set([
    'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/937c9539-b00d-4e93-9291-1af00893a061/image-1-1782745615470.png'
  ]);
  const media = (items, type) => (Array.isArray(items) ? items : [])
    .filter(item => typeof item === 'string' && item && !invalidMedia.has(item))
    .map((src, index) => ({ type, src, label: `${type === 'video' ? 'Video' : 'Photo'} ${index + 1}` }));
  const packs = sizes => (Array.isArray(sizes) ? sizes : []).map(size => ({
    label: String(size?.label || '').trim(),
    weight: Number(size?.weight_grams) > 0 ? `${Number(size.weight_grams)} g` : '',
    price: safeMoney(size?.price),
    compare_price: safeMoney(size?.compare_price),
  })).filter(size => size.label);
  // The approved COGS workbook is the source of truth for known treats.
  // An empty (or older) admin sizes array must never replace those packs.
  const approvedPacks = (name, sizes) => {
    const reference = window.GOB_CATALOGUE_REFERENCE?.packs?.(name);
    const uploaded = packs(sizes);
    // Reference packs provide a safe fallback for incomplete catalogue data,
    // but an admin-set compare price is an explicit live sale and must win.
    // Otherwise customers would see the old price while checkout charges the
    // sale price from the order service.
    if (uploaded.some(size => size.compare_price > size.price && size.price > 0)) return uploaded;
    return Array.isArray(reference) && reference.length ? reference : uploaded;
  };

  async function syncCatalogue() {
    if (!window.GOB_API?.catalogue || !Array.isArray(window.GOB_LIVE_CATALOG)) return;
    try {
      const response = await window.GOB_API.catalogue();
      const remote = Array.isArray(response.products) ? response.products : [];
      const byName = new Map(remote.map(item => [slug(item.name), item]));
      const known = new Set();
      const merged = window.GOB_LIVE_CATALOG.reduce((items, item) => {
        const source = byName.get(slug(item.n));
        if (!source) { items.push(item); return items; }
        known.add(slug(item.n));
        if (!source.is_active) return items;
        const productPacks = approvedPacks(source.name, source.sizes);
        const productMedia = [...media(source.images, 'image'), ...media(source.videos, 'video')].slice(0, 6);
        const first = productPacks[0];
        const price = first?.price || safeMoney(source.price) || item.p;
        items.push({
          ...item,
          p: price,
          cp: first?.compare_price || safeMoney(source.compare_price),
          w: first?.weight || item.w,
          i: source.image_url || source.images?.[0] || item.i,
          packs: productPacks,
          media: productMedia,
          bestseller: Boolean(source.is_bestseller),
          low_stock: Boolean(source.low_stock),
          inventory_id: source.id,
        });
        return items;
      }, []);

      remote.forEach(source => {
        if (!source.is_active || known.has(slug(source.name))) return;
        const productPacks = approvedPacks(source.name, source.sizes);
        const first = productPacks[0];
        const productMedia = [...media(source.images, 'image'), ...media(source.videos, 'video')].slice(0, 6);
        merged.push({
          n: source.name,
          c: 'Treats',
          w: first?.weight || '',
          p: first?.price || safeMoney(source.price),
          cp: first?.compare_price || safeMoney(source.compare_price),
          d: 'Single-ingredient treat from Game of Bones.',
          i: source.image_url || source.images?.[0] || 'assets/gob-logo.png',
          id: slug(source.name),
          packs: productPacks,
          media: productMedia,
          bestseller: Boolean(source.is_bestseller),
          low_stock: Boolean(source.low_stock),
          inventory_id: source.id,
        });
      });

      window.GOB_LIVE_CATALOG.splice(0, window.GOB_LIVE_CATALOG.length, ...merged);
      const store = productStore();
      merged.forEach(item => {
        const id = item.id || slug(item.n);
        const source = byName.get(slug(item.n));
        const packs = Array.isArray(item.packs) ? item.packs : [];
        const base = { name: item.n, price: safeMoney(item.p), comparePrice: safeMoney(item.cp), image: item.i, tag: item.c, packLabel: packs[0]?.label || '', lowStock: Boolean(item.low_stock) };
        store[id] = base;
        if (source?.id) store[source.id] = base;
        packs.forEach((pack, index) => {
          const selected = { name: item.n, price: safeMoney(pack.price), comparePrice: safeMoney(pack.compare_price), image: item.i, tag: item.c, packLabel: pack.label || '', lowStock: Boolean(item.low_stock) };
          const packId = `${id}-pack-${index + 1}`;
          store[packId] = selected;
          if (source?.id) store[`${source.id}-pack-${index + 1}`] = selected;
        });
      });
      document.dispatchEvent(new CustomEvent('gob:catalog-sync', { detail: { count: merged.length } }));
    } catch (error) {
      console.warn('Using the saved product catalogue until the live feed is available.', error);
    }
  }

  document.addEventListener('DOMContentLoaded', syncCatalogue);
})();
;
/* ===== commerce.js ===== */
// Preserve the product snapshot selected by the customer. Live catalogue
// syncs must not rewrite an existing cart line's presentation. The one
// exception is an expired sitewide-sale snapshot: restore its current live
// price so an old browser cart cannot retain a finished promotion.
function commerceProduct(item){const snapshot=item.product,current=GOB_PRODUCTS[item.id]||null;if(snapshot&&current&&Number(snapshot.comparePrice)>Number(snapshot.price)&&!(Number(current.comparePrice)>Number(current.price)))return {...snapshot,price:Number(current.price)||0,comparePrice:Number(current.comparePrice)||0};return snapshot||current}
function cartValue(){return cart().reduce((total,item)=>total+(commerceProduct(item)?.price||0)*item.quantity,0)}
// Trial boxes: ₹50 delivery when the treat jar holds trial packs and the treat
// subtotal is under ₹300. The checkout server applies the same rule.
const TRIAL_FREE_DELIVERY_MIN=300,TRIAL_DELIVERY_CHARGE=50
function cartHasTrialPacks(){return cart().some(item=>{const p=commerceProduct(item);return /^trial\b/i.test(String(p?.packLabel||'').trim())||/—\s*trial\b/i.test(String(p?.name||''))})}
function trialDeliveryCharge(){return cartHasTrialPacks()&&cartValue()<TRIAL_FREE_DELIVERY_MIN?TRIAL_DELIVERY_CHARGE:0}
function cartHasSaleItems(){return cart().some(item=>{const product=commerceProduct(item);return Number(product?.comparePrice)>Number(product?.price)})}
const BOGO_TREATS=new Set([]) // Buy 1 Get 1 ended 2 Nov 2026; add names to run it again
function bogoTreat(product){return BOGO_TREATS.has(String(product?.name||'').replace(/\s+—\s+.+$/,'').trim().toLowerCase())}
function cartHasBogoItems(){return cart().some(item=>bogoTreat(commerceProduct(item)))}
function bogoDiscount(){return cart().reduce((total,item)=>{const product=commerceProduct(item);return total+(bogoTreat(product)?Math.floor((Number(item.quantity)||0)/2)*(Number(product?.price)||0):0)},0)}
const POINT_VALUE_RUPEES=.3,MAX_POINTS_DISCOUNT_RUPEES=100,MAX_REDEMPTION_POINTS=Math.floor(MAX_POINTS_DISCOUNT_RUPEES/POINT_VALUE_RUPEES)

// Private offers are still checked by the server before payment. These
// families mirror the currently active campaign configuration so shoppers see
// the same saving in the treat jar and at checkout.
function privateOfferRate(code){
  if(/^SAVE10-[A-Z0-9]+$/.test(code)||code==='GOBFAMILY10'||code==='BOWL10')return .1
  if(/^BDAY[A-Z0-9]+$/.test(code)||code==='PAWTY25')return .25
  return 0
}
function isPreviewablePrivateOffer(code){return privateOfferRate(code)>0}

// Bag-page offer: sharing a WhatsApp number unlocks ₹50 off a first order
// (CART50). The browser only remembers that it was unlocked; the server
// re-checks that the mobile number/email has never ordered at payment.
const CART_OFFER_CODE='CART50',CART_OFFER_AMOUNT=50,CART_OFFER_KEY='gob-cart-offer'
function cartOfferClaimed(){try{const claim=JSON.parse(window.localStorage.getItem(CART_OFFER_KEY)||'null');return Boolean(claim&&claim.code===CART_OFFER_CODE&&Date.now()-Number(claim.at||0)<30*24*60*60*1000)}catch(_){return false}}
function setCartOfferClaim(on){try{if(on)window.localStorage.setItem(CART_OFFER_KEY,JSON.stringify({code:CART_OFFER_CODE,at:Date.now()}));else window.localStorage.removeItem(CART_OFFER_KEY)}catch(_){}}
function offerDiscountFor(code,subtotal,rate){return code===CART_OFFER_CODE?Math.min(CART_OFFER_AMOUNT,Math.max(0,subtotal)):Math.round(subtotal*rate)}

const commerceSlug=value=>String(value||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
async function recoverUnknownCartLines(){
  const lines=cart(),missing=lines.filter(line=>!commerceProduct(line))
  if(!missing.length||!window.GOB_API?.catalogue)return
  try{
    const response=await window.GOB_API.catalogue(),products=Array.isArray(response?.products)?response.products:[]
    let changed=false
    missing.forEach(line=>{
      const id=String(line.id||''),packMatch=id.match(/-pack-(\d+)$/),baseId=packMatch?id.slice(0,packMatch.index):id
      const source=products.find(product=>String(product.id||'')===baseId||commerceSlug(product.name)===baseId)
      if(!source)return
      const packIndex=Math.max(0,Number(packMatch?.[1]||1)-1),pack=Array.isArray(source.sizes)?source.sizes[packIndex]||source.sizes[0]:null
      const price=Number(pack?.price??source.price)
      if(!Number.isFinite(price)||price<=0)return
      line.product={name:source.name,price,comparePrice:Number(pack?.compare_price??source.compare_price)||0,image:source.image_url||source.images?.[0]||'',tag:'Game of Bones treat',packLabel:pack?.label||''}
      changed=true
    })
    if(changed){saveCart(lines);updateCart();renderCommerceCart()}
  }catch(error){console.warn('Cart item recovery will retry when the catalogue is available.',error)}
}

function renderCommerceCart(){
  const root=document.querySelector('#commerceCart')
  if(!root)return
  const items=cart()
  if(!items.length){
    root.innerHTML='<div class="empty-cart"><h2>Your bowl is ready when you are.</h2><p>Pick a single-ingredient treat and come back when you are ready to check out.</p><a class="button" href="/products">Shop all treats</a></div>'
    document.querySelector('#checkoutLink')?.setAttribute('href','/products')
    updateCommerceTotals()
    updateSaleOfferControls()
    return
  }
  const saleBasket=cartHasSaleItems(),bogoBasket=cartHasBogoItems()
  const saleNote=saleBasket?'<aside class="cart-sale-note" role="status"><strong>Your listed sale price is locked in.</strong><span>Add one eligible code and/or reward points at secure checkout for extra savings.</span></aside>':''
  const bogoNote=bogoBasket?'<aside class="cart-sale-note" role="status"><strong>Buy 1 Get 1 is on for Chicken Feet & Chicken Neck.</strong><span>Add two of the same eligible pack and one is free. This offer cannot be combined with coupon codes or reward points.</span></aside>':''
  root.innerHTML=bogoNote+saleNote+items.map(item=>{
    const product=commerceProduct(item)
    if(!product)return ''
    const sale=Number(product.comparePrice)>Number(product.price)
    const bogo=bogoTreat(product),bogoSaving=bogo?Math.floor((Number(item.quantity)||0)/2)*(Number(product.price)||0):0,lineTotal=(Number(product.price)||0)*(Number(item.quantity)||0)-bogoSaving
    return `<article class="cart-line"><img src="${product.image}" alt="${product.name}"><div><h2>${product.name}</h2><p>${product.tag||'Game of Bones treat'}${sale?' · <b>Sale</b>':''}${bogo?' · <b>BUY 1 GET 1</b>':''}</p><div class="line-actions"><div class="mini-qty"><button data-change="${item.id}" data-amount="-1" aria-label="Decrease ${product.name}">−</button><span>${item.quantity}</span><button data-change="${item.id}" data-amount="1" aria-label="Increase ${product.name}">+</button></div><button class="remove-link" data-delete="${item.id}">Remove</button></div></div><div class="line-price">${sale?`<s>${money(product.comparePrice*item.quantity)}</s> `:''}${bogoSaving?`<s>${money(product.price*item.quantity)}</s> `:''}${money(lineTotal)}${bogoSaving?'<small>Buy 1 Get 1</small>':''}</div></article>`
  }).join('')
  root.querySelectorAll('[data-change]').forEach(button=>button.addEventListener('click',()=>{
    const items=cart(),entry=items.find(item=>item.id===button.dataset.change)
    if(!entry)return
    entry.quantity=Math.max(1,entry.quantity+Number(button.dataset.amount))
    saveCart(items);updateCart();renderCommerceCart()
  }))
  root.querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',()=>{
    saveCart(cart().filter(item=>item.id!==button.dataset.delete));updateCart();renderCommerceCart()
  }))
  updateCommerceTotals()
  updateSaleOfferControls()
}

function updateCommerceTotals(){
  const subtotal=cartValue(),count=cartCount(),saleBasket=cartHasSaleItems(),bogoBasket=cartHasBogoItems(),bogoSaving=bogoDiscount()
  const privateCoupon=document.querySelector('[name="private_coupon"]')?.value.trim().toUpperCase()||''
  // A recognised private code can be entered from the treat jar before the secure
  // checkout form exists. Keep it in session storage and show the same quote.
  const storedCoupon=window.sessionStorage.getItem('gob-checkout-coupon')||''
  const coupon=privateCoupon||storedCoupon||document.querySelector('[name="coupon"]:checked')?.value||(!document.querySelector('[name="coupon"]')&&cartOfferClaimed()?'WELCOME15':'none')
  const eligibility=window.GOB_CHECKOUT_ELIGIBILITY||{signedIn:false,firstOrder:false,checking:false,points:0}
  // The displayed price, one valid code and loyalty points can be used together.
  const couponRate=bogoBasket?0:(coupon==='WELCOME15'&&!(eligibility.signedIn&&!eligibility.checking&&!eligibility.firstOrder) ? .15 : coupon==='MEGA20'&&subtotal>=2199 ? .2 : privateOfferRate(coupon))
  const couponDiscount=bogoBasket?0:offerDiscountFor(coupon,subtotal,couponRate),saving=bogoSaving+couponDiscount
  const payment=document.querySelector('[name="payment"]:checked')?.value||'online'
  const requestedPoints=Number(document.querySelector('[name="loyalty_points_redeemed"]')?.value||0)
  const pointsRedeemed=bogoBasket?0:(eligibility.signedIn?Math.min(Math.max(Math.floor(requestedPoints)||0,0),MAX_REDEMPTION_POINTS,Number(eligibility.points||0)):0)
  const pointsDiscount=Math.min(MAX_POINTS_DISCOUNT_RUPEES,Math.round(pointsRedeemed*POINT_VALUE_RUPEES))
  const delivery=trialDeliveryCharge(),paymentChange=payment==='cod'?40:-30,total=Math.max(0,subtotal-saving-pointsDiscount+paymentChange+delivery)
  const pointsEarned=Math.floor(total/10),pointsValue=pointsEarned*.3
  document.querySelectorAll('[data-commerce-subtotal]').forEach(el=>el.textContent=money(subtotal))
  document.querySelectorAll('[data-shipping-label]').forEach(el=>el.textContent=delivery?money(delivery):'Free')
  document.querySelectorAll('[data-delivery-row]').forEach(el=>el.hidden=!delivery)
  document.querySelectorAll('[data-delivery-charge]').forEach(el=>el.textContent=`+${money(delivery)}`)
  document.querySelectorAll('[data-delivery-note]').forEach(el=>{el.hidden=!cartHasTrialPacks();el.textContent=delivery?`Trial box under ${money(TRIAL_FREE_DELIVERY_MIN)}: ${money(delivery)} delivery. Add ${money(TRIAL_FREE_DELIVERY_MIN-subtotal)} more for free delivery.`:'Free delivery on this trial box.'})
  document.querySelectorAll('[data-commerce-total]').forEach(el=>el.textContent=money(total))
  document.querySelectorAll('[data-coupon-discount]').forEach(el=>el.textContent=saving?`−${money(saving)}`:'—')
  document.querySelectorAll('[data-coupon-row]').forEach(el=>el.hidden=!saving)
  document.querySelectorAll('[data-coupon-label]').forEach(el=>el.textContent=bogoSaving?'Buy 1 Get 1':(saving?`Coupon — ${coupon}`:'Coupon'))
  document.querySelectorAll('[data-payment-change]').forEach(el=>el.textContent=payment==='cod'?`+${money(40)}`:`−${money(30)}`)
  document.querySelectorAll('[data-points-discount]').forEach(el=>el.textContent=pointsDiscount?`−${money(pointsDiscount)}`:'—')
  document.querySelectorAll('[data-loyalty-points]').forEach(el=>el.textContent=pointsEarned.toLocaleString('en-IN'))
  document.querySelectorAll('[data-loyalty-value]').forEach(el=>el.textContent=pointsValue.toFixed(pointsValue%1?2:0))
  document.querySelectorAll('[data-commerce-count]').forEach(el=>el.textContent=count)
  const statusMessage=()=>{
    if(bogoBasket){
      return bogoSaving?`Buy 1 Get 1 is applied: ${money(bogoSaving)} saved. Coupon codes and reward points cannot be used with this offer.`:'Buy 1 Get 1 is active for Chicken Feet and Chicken Neck. Add one more of the same eligible pack to receive one free. Coupon codes and reward points cannot be used with this offer.'
    }else if(saleBasket){
      return coupon==='none'&&!privateCoupon?'Your current listed price is applied. Add one eligible code and/or reward points at checkout for extra savings.':'Your current listed price, eligible code and reward points are being applied.'
    }else if(coupon==='WELCOME15'){
      return !eligibility.signedIn?'WELCOME15 is applied: 15% off your first order. No login needed — we check your mobile number and email at payment.':eligibility.checking?'Checking whether this account is eligible for WELCOME15…':eligibility.firstOrder?'WELCOME15 is available for this first order.':'WELCOME15 is not applied: this account already has a completed order, or its first-order status could not be verified.'
    } else if(coupon===CART_OFFER_CODE){
      return `₹${CART_OFFER_AMOUNT} off is applied — your first-order treat jar offer. We confirm it with your mobile number at payment.`
    } else if(coupon==='MEGA20'){
      const remaining=Math.max(0,2199-subtotal)
      return remaining?`MEGA20 is not applied: add ${money(remaining)} of eligible treats to reach the ₹2,199 minimum.`:'MEGA20 is available on this basket.'
    } else if(privateOfferRate(coupon)){
      return `${coupon} is applied — ${Math.round(privateOfferRate(coupon)*100)}% off this order.`
    } else if(privateCoupon){
      return 'Your coupon will be securely verified before payment.'
    } else {
      return 'Your listed price is already applied. Choose one eligible code and/or use reward points for extra savings.'
    }
  }
  const message=statusMessage()
  document.querySelectorAll('[data-coupon-status],[data-checkout-coupon-status]').forEach(status=>status.textContent=message)
}

function ensureLoyaltyEarn(){
  if(!document.querySelector('#checkoutForm'))return
  const total=document.querySelector('.order-row.total')
  if(!total||document.querySelector('.loyalty-earn'))return
  const styles=document.createElement('link');styles.rel='stylesheet';styles.href='loyalty-checkout.css';document.head.append(styles)
  total.insertAdjacentHTML('beforebegin','<div class="loyalty-earn" aria-live="polite"><div class="loyalty-earn-mark" aria-hidden="true">G</div><div><span>Game of Bones rewards</span><strong>You’ll earn <b data-loyalty-points>0</b> points</strong><small>That’s worth ₹<b data-loyalty-value>0</b> off a future order.</small></div></div>')
}

function ensureBulkDiscount(){
  const total=document.querySelector('.order-row.total')
  if(!total)return
  document.querySelector('.bulk-discount')?.remove()
}

function ensureCheckoutOptions(){
  const form=document.querySelector('#checkoutForm'),total=document.querySelector('.order-row.total')
  if(!form||document.querySelector('.checkout-perks'))return
  form.querySelectorAll('[name="payment"]').forEach((input,index)=>input.value=index?'cod':'online')
  const payment=form.querySelector('.form-section:last-of-type')
  payment.insertAdjacentHTML('beforebegin',`<section class="form-section checkout-perks">
    <h3>Offers & rewards</h3>
    <label data-automatic-offer><input type="radio" name="coupon" value="none" checked><span><b data-automatic-offer-title>Continue with the listed price</b> <small data-automatic-offer-copy>Your current listed price is shown above. You may choose one eligible code below.</small></span></label>
    <label data-welcome-offer><input type="radio" name="coupon" value="WELCOME15"><span>WELCOME15 — 15% off your first order <small>No login needed · one use per mobile number and email · checked at payment.</small></span></label>
    <label data-mega-offer><input type="radio" name="coupon" value="MEGA20"><span>MEGA20 — 20% off orders ₹2,199+ <small>Eligible treat subtotal must reach ₹2,199.</small></span></label>
    <details class="private-code"><summary>Have a private code from us?</summary><label>Private birthday code <input name="private_coupon" type="text" inputmode="text" autocomplete="off" maxlength="32" placeholder="Enter your private code"></label><small>Private rewards are sent directly to the pet parent and are not public offers.</small></details>
    <label data-loyalty-redeem hidden><input type="number" name="loyalty_points_redeemed" min="0" max="333" step="1" value="0" inputmode="numeric"><span>Use reward points <small>Use up to ₹100 off per order (maximum 333 points). Every point is worth ₹0.30 and can be combined with one eligible coupon.</small></span></label>
    <p class="perk-status" data-coupon-status role="status" aria-live="polite"></p>
  </section>`)
  total.insertAdjacentHTML('beforebegin','<div class="order-row" data-coupon-row hidden><span data-coupon-label>Coupon</span><span data-coupon-discount>—</span></div><div class="order-row" data-loyalty-discount-row hidden><span>Reward points</span><span data-points-discount>—</span></div><div class="order-row"><span>Payment adjustment</span><span data-payment-change>−₹30</span></div>')
  form.querySelectorAll('[name="coupon"],[name="payment"],[name="loyalty_points_redeemed"],[name="private_coupon"]').forEach(input=>input.addEventListener('input',updateCommerceTotals))

  const privateCode=form.querySelector('[name="private_coupon"]')
  const summaryCode=document.querySelector('#checkoutCoupon')
  const applySummaryCode=()=>{
    if(!privateCode||!summaryCode)return
    const code=summaryCode.value.trim().toUpperCase()
    summaryCode.value=code
    privateCode.value=code
    if(code) privateCode.closest('details')?.setAttribute('open','')
    updateCommerceTotals()
  }
  document.querySelector('[data-apply-checkout-coupon]')?.addEventListener('click',applySummaryCode)
  summaryCode?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();applySummaryCode()}})
  privateCode?.addEventListener('input',()=>{if(summaryCode)summaryCode.value=privateCode.value.trim().toUpperCase()})

  // A code applied from the treat jar is only carried to this secure checkout; it
  // is still checked against the signed-in customer's eligibility below.
  const storedCoupon=window.sessionStorage.getItem('gob-checkout-coupon')
  const requestedCoupon=['WELCOME15','MEGA20'].includes(storedCoupon)?storedCoupon:''
  const requestedInput=requestedCoupon&&form.querySelector(`[name="coupon"][value="${requestedCoupon}"]`)
  if(requestedInput) requestedInput.checked=true
  // Sharing a WhatsApp number in the treat jar pre-selects WELCOME15 (the one first-order offer).
  const welcomeInput=form.querySelector('[name="coupon"][value="WELCOME15"]')
  if(welcomeInput&&cartOfferClaimed()&&!requestedInput&&!isPreviewablePrivateOffer(storedCoupon))welcomeInput.checked=true
  if(isPreviewablePrivateOffer(storedCoupon)){
    if(privateCode){privateCode.value=storedCoupon;privateCode.closest('details')?.setAttribute('open','')}
  }
  if(summaryCode&&privateCode)summaryCode.value=privateCode.value.trim().toUpperCase()
  window.sessionStorage.removeItem('gob-checkout-coupon')
  updateSaleOfferControls()
}

function updateSaleOfferControls(){
  const title=document.querySelector('[data-automatic-offer-title]'),copy=document.querySelector('[data-automatic-offer-copy]')
  const bogoBasket=cartHasBogoItems()
  const form=document.querySelector('#checkoutForm')
  const privateCode=form?.querySelector('[name="private_coupon"]')
  const points=form?.querySelector('[name="loyalty_points_redeemed"]')
  if(bogoBasket){
    if(title)title.textContent='Buy 1 Get 1 is applied automatically'
    if(copy)copy.textContent='Chicken Feet and Chicken Neck Buy 1 Get 1 cannot be combined with coupon codes or reward points.'
    document.querySelectorAll('[data-welcome-offer],[data-cart-offer],[data-mega-offer],.private-code,[data-loyalty-redeem],[data-loyalty-mirror]').forEach(el=>el.hidden=true)
    document.querySelector('[name="coupon"][value="none"]')?.click()
    if(privateCode)privateCode.value=''
    if(points)points.value='0'
    const summary=document.querySelector('#checkoutCoupon');if(summary){summary.value='';summary.disabled=true;summary.placeholder='Not available with Buy 1 Get 1'}
    return
  }
  document.querySelectorAll('[data-welcome-offer],[data-mega-offer],.private-code').forEach(el=>el.hidden=false)
  const summary=document.querySelector('#checkoutCoupon');if(summary){summary.disabled=false;summary.placeholder='Enter coupon code'}
  if(title)title.textContent='Continue with the listed price'
  if(copy)copy.textContent='Your current listed price is shown above. You may choose one eligible code and use reward points.'
  updateWelcomeOfferVisibility()
  updateLoyaltyRedemptionVisibility()
}

function updateWelcomeOfferVisibility(){
  const offer=document.querySelector('[data-welcome-offer]')
  const eligibility=window.GOB_CHECKOUT_ELIGIBILITY
  if(!offer||!eligibility)return
  const hasOrdered=eligibility.signedIn&&!eligibility.checking&&!eligibility.firstOrder
  offer.hidden=hasOrdered
  if(hasOrdered&&offer.querySelector('input:checked')){
    document.querySelector('[name="coupon"][value="none"]')?.click()
  }
  // A signed-in customer with an earlier order cannot use the first-order ₹50 offer.
  const cartOffer=document.querySelector('[data-cart-offer]')
  if(cartOffer&&hasOrdered){
    cartOffer.hidden=true
    if(cartOffer.querySelector('input:checked'))document.querySelector('[name="coupon"][value="none"]')?.click()
  }
}

function updateLoyaltyRedemptionVisibility(){
  const eligibility=window.GOB_CHECKOUT_ELIGIBILITY||{},control=document.querySelector('[data-loyalty-redeem]'),row=document.querySelector('[data-loyalty-discount-row]')
  if(!control||!row)return
  if(cartHasBogoItems()){
    control.hidden=true;row.hidden=true
    const input=control.querySelector('[name="loyalty_points_redeemed"]');if(input)input.value='0'
    const toggle=control.querySelector('[data-loyalty-toggle]');if(toggle)toggle.checked=false
    const mirror=document.querySelector('[data-loyalty-mirror]');if(mirror)mirror.style.display='none'
    const prompt=document.querySelector('[data-loyalty-login]');if(prompt)prompt.hidden=true
    return
  }
  const available=Math.min(MAX_REDEMPTION_POINTS,Math.max(0,Math.floor(Number(eligibility.points||0))))
  control.hidden=!eligibility.signedIn||available<=0
  // Signed-out shoppers never see the points box, so tell them how to use their points.
  let prompt=document.querySelector('[data-loyalty-login]')
  if(!prompt){prompt=document.createElement('p');prompt.dataset.loyaltyLogin='';prompt.className='order-note loyalty-login-prompt';prompt.innerHTML=`Have reward points? <a href="/login?next=${encodeURIComponent(location.pathname)}">Log in</a> to use them on this order.`;control.before(prompt)}
  prompt.hidden=Boolean(eligibility.signedIn)||Boolean(eligibility.checking)
  row.hidden=!eligibility.signedIn||available<=0
  const input=control.querySelector('[name="loyalty_points_redeemed"]')
  if(input){input.max=String(available);input.value=String(Math.min(Number(input.value)||0,available))}
  // The number box rendered as a tiny empty square, so customers could not see or enter points.
  // Use a clear tick-box instead: ticking applies the most points allowed on this order.
  let toggle=control.querySelector('[data-loyalty-toggle]')
  if(!toggle&&input){
    toggle=document.createElement('input');toggle.type='checkbox';toggle.dataset.loyaltyToggle=''
    input.before(toggle);input.style.display='none'
    const copy=control.querySelector('span');if(copy){const note=copy.querySelector('small');copy.innerHTML='<b data-loyalty-title>Use reward points</b> ';if(note)copy.append(note)}
    toggle.addEventListener('change',()=>{input.value=toggle.checked?input.max:'0';input.dispatchEvent(new Event('input',{bubbles:true}))})
  }
  if(toggle&&input){
    toggle.checked=Number(input.value)>0
    const title=control.querySelector('[data-loyalty-title]'),balance=Math.max(0,Math.floor(Number(eligibility.points||0)))
    if(title&&available>0)title.textContent=`Use ${available} reward points — save ₹${Math.min(100,Math.round(available*.3))} (you have ${balance})`
  }
  // Also offer the points in the order summary, next to the coupon box, where shoppers look for savings.
  let mirror=document.querySelector('[data-loyalty-mirror]')
  const promo=document.querySelector('.checkout-promo')
  if(!mirror&&promo&&toggle){
    mirror=document.createElement('label');mirror.dataset.loyaltyMirror=''
    mirror.style.cssText='display:flex;gap:10px;align-items:flex-start;margin:14px 0 0;padding:12px 14px;border:1px solid #c9a24a;background:#fff8e6;font-size:13px;line-height:1.45;cursor:pointer'
    mirror.innerHTML='<input type="checkbox" style="margin-top:2px;flex:none"><span><b data-mirror-title></b><br><small>Up to ₹100 off per order. Works with one coupon.</small></span>'
    promo.after(mirror)
    const box=mirror.querySelector('input')
    box.addEventListener('change',()=>{toggle.checked=box.checked;toggle.dispatchEvent(new Event('change'))})
    toggle.addEventListener('change',()=>{box.checked=toggle.checked})
  }
  if(mirror&&toggle){
    mirror.style.display=control.hidden?'none':'flex'
    mirror.querySelector('input').checked=toggle.checked
    const t=mirror.querySelector('[data-mirror-title]'),src=control.querySelector('[data-loyalty-title]');if(t&&src)t.textContent=src.textContent
  }
}

// Signed-in customers: fill any empty checkout fields from their saved account
// (name, mobile, email, default address, dog), so they do not retype them each order.
// The mobile comes from their own session, which also keeps reward points valid.
function prefillCheckoutFromAccount(account,token){
  const form=document.querySelector('#checkoutForm');if(!form||!account)return
  const set=(sel,val)=>{const el=form.querySelector(sel);if(!el||val==null||!String(val).trim()||String(el.value||'').trim())return;el.value=String(val).trim();el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
  const p=account.profile||{},parts=String(p.name||'').trim().split(/\s+/)
  set('[autocomplete="name"]',parts.join(' '))
  set('[autocomplete="email"]',p.email)
  let phone='';try{let b=String(token).split('.')[0].replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';phone=String(JSON.parse(atob(b)).phone||'').replace(/\D/g,'').slice(-10)}catch(_){}
  set('[autocomplete="tel"]',phone)
  const list=Array.isArray(account.addresses)?account.addresses.filter(Boolean):[]
  const a=list.find(x=>x.is_default)||list[0]||{line1:p.address_line1,line2:p.address_line2,city:p.city,state:p.state,pincode:p.pincode}
  set('[autocomplete="street-address"]',a.line1);set('[autocomplete="address-line2"]',a.line2);set('[autocomplete="address-level2"]',a.city);set('[autocomplete="address-level1"]',a.state);set('[autocomplete="postal-code"]',a.pincode)
  const d=(Array.isArray(account.dogs)&&account.dogs[0])||{}
  set('[name="dog_name"]',d.name||p.dog_name);set('[name="dog_birthday"]',String(d.birthday||p.dog_birthday||'').slice(0,10))
}

async function loadCheckoutEligibility(){
  const token=window.sessionStorage.getItem('gob-customer-token')
  window.GOB_CHECKOUT_ELIGIBILITY={signedIn:Boolean(token),firstOrder:false,checking:Boolean(token),points:0}
  updateCommerceTotals()
  updateWelcomeOfferVisibility()
  updateLoyaltyRedemptionVisibility()
  if(!token)return
  try{
    const account=await window.GOB_API?.account(token)
    try{prefillCheckoutFromAccount(account,token)}catch(_){}
    const orders=Array.isArray(account?.orders)?account.orders:[]
    window.GOB_CHECKOUT_ELIGIBILITY={signedIn:true,firstOrder:orders.length===0,checking:false,points:Number(account?.points?.available||0)}
  }catch(error){
    window.GOB_CHECKOUT_ELIGIBILITY={signedIn:true,firstOrder:false,checking:false,points:0}
  }
  updateWelcomeOfferVisibility()
  updateLoyaltyRedemptionVisibility()
  updateCommerceTotals()
}

function setupCommerce(){
  ensureLoyaltyEarn();ensureBulkDiscount();ensureCheckoutOptions();renderCommerceCart();updateSaleOfferControls();recoverUnknownCartLines();loadCheckoutEligibility()
  document.querySelector('#promoForm')?.addEventListener('submit',event=>{
    event.preventDefault()
    const code=document.querySelector('#promoCode').value.trim().toUpperCase(),message=document.querySelector('#promoMessage')
    if(cartHasBogoItems()){
      window.sessionStorage.removeItem('gob-checkout-coupon')
      message.textContent='Buy 1 Get 1 on Chicken Feet and Chicken Neck cannot be combined with coupon codes or reward points.'
      return
    }
    if(code==='WELCOME15'){
      window.sessionStorage.setItem('gob-checkout-coupon',code)
      message.innerHTML='WELCOME15 is applied: 15% off your first order. <a href="/checkout">Continue to checkout</a>, no login needed.'
    }else if(code==='MEGA20'){
      window.sessionStorage.setItem('gob-checkout-coupon',code)
      message.textContent=cartValue()>=2199?'MEGA20 is ready for secure checkout.':'MEGA20 needs a treat subtotal of ₹2,199 or more; you can still continue to checkout.'
    }else if(isPreviewablePrivateOffer(code)){
      window.sessionStorage.setItem('gob-checkout-coupon',code)
      updateCommerceTotals()
      message.textContent=`${code} is applied — ${Math.round(privateOfferRate(code)*100)}% off will carry through to secure checkout.`
    }else{
      window.sessionStorage.removeItem('gob-checkout-coupon')
      message.textContent='Private birthday rewards are entered securely at checkout. Public offers: WELCOME15 or MEGA20.'
    }
  })
}

document.addEventListener('DOMContentLoaded',setupCommerce)
document.addEventListener('gob:catalog-sync',()=>{renderCommerceCart();updateSaleOfferControls();recoverUnknownCartLines()})
;
/* ===== commerce-backend.js ===== */
/* The new checkout calls the existing API. It does not store PII in browser
   storage; the server encrypts order data before writing it to Supabase. */
(() => {
  const POINT_VALUE_RUPEES = .3, MAX_POINTS_DISCOUNT_RUPEES = 100, MAX_REDEMPTION_POINTS = Math.floor(MAX_POINTS_DISCOUNT_RUPEES / POINT_VALUE_RUPEES);
  // Match active private-offer families for the client-side preview. The
  // server validates every code and computes the final payable amount.
  const privateOfferRate = code => /^SAVE10-[A-Z0-9]+$/.test(code) || code === 'GOBFAMILY10' ? .1 : /^BDAY[A-Z0-9]+$/.test(code) || code === 'PAWTY25' ? .25 : 0;
  const form = document.querySelector('#checkoutForm');
  if (!form || !window.GOB_API) return;
  const get = selector => form.querySelector(selector)?.value.trim() || '';
  const phone = () => get('[autocomplete="tel"]').replace(/\D/g, '').replace(/^91/, '');
  const fullName = () => get('[autocomplete="name"]').replace(/\s+/g, ' ');
  const items = () => cart().map(line => {
    // Keep the product snapshot that was added to the cart. Catalogue edits
    // must not silently change a customer's item, title or price at checkout.
    const product = typeof commerceProduct === 'function' ? commerceProduct(line) : (line.product || GOB_PRODUCTS[line.id]);
    if (!product) return null;
    // Cart snapshots can outlive catalogue edits. Only send a pack label when
    // the current catalogue entry explicitly provides one; never resurrect a
    // legacy label from an old localStorage snapshot.
    const name = String(product.name || '').replace(/\s+—\s+.+$/, '').trim();
    const explicitPackLabel = typeof product.packLabel === 'string' ? product.packLabel.trim() : '';
    // Product pages label dynamically chosen packs in `tag` (for example,
    // "Jerky · 120 g"). Preserve that canonical pack detail in checkout.
    const taggedPackLabel = typeof product.tag === 'string' && product.tag.includes(' · ')
      ? product.tag.split(' · ').pop().trim()
      : '';
    // Pack chosen on the product page is also kept in the name ("Whole Quail — 4 pieces").
    const namedPackLabel = (String(product.name || '').match(/\s+—\s+(.+)$/) || [])[1] || '';
    const packLabel = explicitPackLabel || namedPackLabel.trim() || (taggedPackLabel === 'Pack' ? '' : taggedPackLabel);
    const catalog_id = window.GOB_META?.productId?.(product, line.id) || String(product.catalog_slug || line.id || '');
    const unitPrice = Number(product.price);
    const quantity = Number(line.quantity);
    return { name, catalog_id, pack_label: packLabel, size: packLabel, price: unitPrice, pack_price: unitPrice, unit_price: unitPrice, line_total: unitPrice * quantity, quantity, qty: quantity };
  }).filter(Boolean);
  const subtotal = () => items().reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isBogoTreat = item => [].includes(String(item?.name || '').trim().toLowerCase());
  const bogo = () => {
    const offerItems = items().filter(isBogoTreat);
    return { active: offerItems.length > 0, discount: offerItems.reduce((sum, item) => sum + Math.floor(item.quantity / 2) * item.price, 0) };
  };
  const method = () => form.querySelector('[name="payment"]:checked')?.value === 'cod' ? 'cod' : 'online';
  const address = () => ['street-address', 'address-line2', 'address-level2', 'address-level1', 'postal-code'].map(name => get(`[autocomplete="${name}"]`)).filter(Boolean).join(', ');
  const addressDetails = () => ({ line1: get('[autocomplete="street-address"]'), line2: get('[autocomplete="address-line2"]'), city: get('[autocomplete="address-level2"]'), state: get('[autocomplete="address-level1"]'), pincode: get('[autocomplete="postal-code"]') });
  const dog = () => ({ name: get('[name="dog_name"]'), birthday: get('[name="dog_birthday"]') });
  const reference = () => `GOB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const missingFields = () => {
    const missing = [];
    if (fullName().length < 2) missing.push('name');
    if (!/^\d{10}$/.test(phone())) missing.push('10-digit mobile number');
    // Email is optional (receipts only); if given it must look valid.
    if (get('[autocomplete="email"]') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get('[autocomplete="email"]'))) missing.push('a valid email (or leave it blank)');
    if (!get('[autocomplete="street-address"]') || !get('[autocomplete="address-level2"]') || !get('[autocomplete="address-level1"]')) missing.push('delivery address');
    if (!/^\d{6}$/.test(get('[autocomplete="postal-code"]'))) missing.push('6-digit PIN code');
    if (!items().length) missing.push('at least one treat');
    return missing;
  };
  const valid = () => missingFields().length === 0;
  const saleBasket = () => cart().some(line => { const product = typeof commerceProduct === 'function' ? commerceProduct(line) : (line.product || GOB_PRODUCTS[line.id]); return Number(product?.comparePrice) > Number(product?.price); });
  const total = () => {
    const value = subtotal();
    const privateCoupon = form.querySelector('[name="private_coupon"]')?.value.trim().toUpperCase() || '', coupon = privateCoupon || form.querySelector('[name="coupon"]:checked')?.value || '', eligibility = window.GOB_CHECKOUT_ELIGIBILITY || {};
    const buyOneGetOne = bogo();
    // Catalogue sale pricing may be combined with one valid code and loyalty
    // points; no separate buy-more discount is active during this sale.
    // WELCOME15 needs no login: the server checks this mobile/email has not ordered before.
    const couponRate = buyOneGetOne.active ? 0 : coupon === 'WELCOME15' && !(eligibility.signedIn && !eligibility.checking && !eligibility.firstOrder) ? .15 : coupon === 'MEGA20' && value >= 2199 ? .2 : privateOfferRate(coupon);
    const discount = buyOneGetOne.discount + (buyOneGetOne.active ? 0 : (typeof offerDiscountFor === 'function' ? offerDiscountFor(coupon, value, couponRate) : Math.round(value * couponRate)));
    const requestedPoints = Math.floor(Number(form.querySelector('[name="loyalty_points_redeemed"]')?.value || 0));
    const points = buyOneGetOne.active ? 0 : (eligibility.signedIn ? Math.min(Math.max(requestedPoints, 0), MAX_REDEMPTION_POINTS, Number(eligibility.points || 0)) : 0);
    const pointsDiscount = Math.min(MAX_POINTS_DISCOUNT_RUPEES, Math.round(points * POINT_VALUE_RUPEES)), cod = method() === 'cod' ? 40 : -30;
    // Private codes are validated authoritatively by the checkout server.
    // Preserve the entered code even when the browser cannot know its rate;
    // this lets off-site customer codes work without advertising them here.
    const delivery = typeof trialDeliveryCharge === 'function' ? trialDeliveryCharge() : 0;
    return { value, discount, points, delivery, coupon: buyOneGetOne.active ? '' : (privateCoupon || (couponRate || coupon === 'CART50' ? coupon : '')), bogo: buyOneGetOne, grand: Math.max(1, value - discount - pointsDiscount + cod + delivery) };
  };
  const result = (html, failed = false) => { const el = document.querySelector('#checkoutSuccess'); if (!el) return; el.classList.add('show'); el.style.background = failed ? '#f9e1da' : '#e4ebdf'; el.innerHTML = html; el.focus(); };
  const completeOrder = (ref, payment) => {
    window.location.assign(`/thank-you?${new URLSearchParams({ order: ref, payment }).toString()}`);
  };
  // Meta signals for the server-side Purchase event. _fbp/_fbc are Meta's own
  // first-party cookies; they let Meta attribute the order to the ad click.
  const cookie = key => document.cookie.split('; ').find(part => part.startsWith(`${key}=`))?.slice(key.length + 1) || '';
  const metaSignals = () => {
    let fbc = cookie('_fbc');
    if (!fbc) { try { const saved = JSON.parse(sessionStorage.getItem('gob-fbclid') || 'null'); if (saved?.id) fbc = `fb.1.${saved.ts}.${saved.id}`; } catch (_) {} }
    return { fbp: cookie('_fbp'), fbc, event_source_url: `${location.origin}${location.pathname}`, client_user_agent: navigator.userAgent.slice(0, 250) };
  };
  const analyticsItems = () => items().map(item => ({ item_id: item.catalog_id || item.name, item_name: item.name, price: item.price, quantity: item.quantity }));
  const metaContents = orderItems => orderItems.map(item => ({ id: item.catalog_id || item.name, quantity: item.quantity, item_price: item.price }));
  const metaContentIds = orderItems => metaContents(orderItems).map(item => item.id).filter(Boolean);
  if (items().length) window.GOB_ANALYTICS?.track('begin_checkout', { currency: 'INR', value: subtotal(), items: analyticsItems() });
  let captureTimer, captureSent = false;
  const marketingConsent = () => form.querySelector('[name="marketing_consent"]')?.checked === true;
  const whatsappOptIn = () => form.querySelector('[name="whatsapp_opt_in"]')?.checked === true;
  // Exact bag lines so a WhatsApp reminder link can rebuild this treat jar.
  const cartLines = () => cart().map(line => ({ id: line.id, quantity: line.quantity, product: line.product ? { name: line.product.name, price: line.product.price, packLabel: line.product.packLabel || '', tag: line.product.tag || '', catalog_slug: line.product.catalog_slug || '', image: line.product.image || '' } : null }));
  const policyAcknowledged = () => form.querySelector('[name="checkout_policy_acknowledged"]')?.checked === true;
  const noticeVersion = () => get('[name="privacy_notice_version"]') || '2026-09-14';
  async function capture() { if (captureSent || !valid()) return; captureSent = true; try { await window.GOB_API.abandonedCart({ cart_token: window.GOB_CART_TRACKING?.token?.(), whatsapp_opt_in: whatsappOptIn(), cart_lines: cartLines(), phone: phone(), email: get('[autocomplete="email"]'), name: fullName(), items: items(), total: subtotal() }); } catch (_) { /* Do not retry every keystroke after a server-side rate limit. */ } }
  form.addEventListener('input', () => { clearTimeout(captureTimer); captureTimer = setTimeout(capture, 1800); });
  form.querySelector('[name="whatsapp_opt_in"]')?.addEventListener('change', () => { captureSent = false; clearTimeout(captureTimer); captureTimer = setTimeout(capture, 600); });
  async function save(ref, transactionId = '') { const pricing = total(), orderItems = items(); const response = await window.GOB_API.saveOrder({ ref, whatsapp_opt_in: whatsappOptIn(), customer_name: fullName(), customer_phone: phone(), customer_email: get('[autocomplete="email"]'), items: orderItems, subtotal: pricing.value, total_amount: pricing.value, shipping: pricing.delivery || 0, discount: pricing.discount, grand_total: pricing.grand, payment_method: method() === 'cod' ? 'cod' : 'razorpay', transaction_id: transactionId || null, shipping_address: address(), address_details: addressDetails(), dog: dog(), coupon_code: pricing.coupon || null, loyalty_points_redeemed: pricing.points, packaging: method() === 'cod' ? 40 : 0, marketing_consent: marketingConsent(), checkout_policy_acknowledged: policyAcknowledged(), privacy_notice_version: noticeVersion(), meta: metaSignals() }); await trackPurchase(ref, pricing, orderItems); return response; }
  // Purchase signals for Meta and GA4. Also used when payment succeeded but the
  // browser could not save the order details (the payment webhook records it).
  async function trackPurchase(ref, pricing = total(), orderItems = items()) { window.GOB_META?.track('Purchase',{currency:'INR',value:pricing.grand,content_type:'product',content_ids:metaContentIds(orderItems),contents:metaContents(orderItems)},ref); const purchaseEvent={transaction_id:ref,currency:'INR',value:pricing.grand,coupon:pricing.coupon||undefined,items:analyticsItems()}; if(window.GOB_ANALYTICS?.trackAndWait)await window.GOB_ANALYTICS.trackAndWait('purchase',purchaseEvent);else window.GOB_ANALYTICS?.track('purchase',purchaseEvent); }
  function razorpayScript() { if (window.Razorpay) return Promise.resolve(); return new Promise((resolve, reject) => { const tag = document.createElement('script'); tag.src = 'https://checkout.razorpay.com/v1/checkout.js'; tag.onload = resolve; tag.onerror = reject; document.head.append(tag); }); }
  async function prepaid(ref, pricing) { const serializedItems = JSON.stringify(items()); const order = await window.GOB_API.createRazorpayOrder({ items: items(), payment_method: 'online', coupon_code: pricing.coupon, loyalty_points_redeemed: pricing.points, receipt: ref, notes: { ref, order_ref: ref, customer_name: fullName(), customer_phone: phone(), customer_email: get('[autocomplete="email"]'), items_1: serializedItems.slice(0, 1400), items_2: serializedItems.slice(1400, 2800), items_3: serializedItems.slice(2800, 4200), ...(() => { const meta = metaSignals(), geo = addressDetails(); return { meta_fbp: meta.fbp, meta_fbc: meta.fbc.slice(0, 250), meta_url: meta.event_source_url.slice(0, 250), meta_ua: meta.client_user_agent, ship_geo: [geo.city, geo.state, geo.pincode].join('|').slice(0, 250) }; })() } }); await razorpayScript(); return new Promise((resolve, reject) => new window.Razorpay({ key: order.key, amount: order.amount, currency: order.currency, name: 'Game of Bones', description: 'Natural dog treats', order_id: order.order_id, prefill: { name: fullName(), contact: phone(), email: get('[autocomplete="email"]') }, theme: { color: '#bd812a' }, handler: async response => { try { await save(ref, response.razorpay_payment_id); } catch (error) { /* The customer has already paid. Never show a failure (they might pay twice); the Razorpay webhook records the order from the payment notes. */ console.warn('Order details will be recovered from the payment record.', error); try { await trackPurchase(ref); } catch (_) {} } resolve(order.quote); }, modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) } }).open()); }
  async function delivery(){
    const pin=get('[autocomplete="postal-code"]')
    const result=await window.GOB_PINCODE_CHECKER?.(pin)
    if(!result?.serviceable) throw new Error('This PIN code is not currently serviceable by Delhivery.')
    if(method()==='cod'&&!result.cod) throw new Error('Cash on Delivery is not available for this PIN code. Please choose online payment.')
    if(method()==='online'&&!result.prepaid) throw new Error('Online payment is not available for this PIN code. Please choose Cash on Delivery.')
    return result
  }
  // Explain what went wrong and offer one-tap fixes instead of a dead end.
  function checkoutFailed(error) {
    const message = String(error?.message || '');
    const cancelled = /cancelled/i.test(message);
    const codeProblem = /code|WELCOME15|MEGA20|CART50|offer/i.test(message);
    const esc = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const actions = [];
    if (codeProblem) actions.push('<button type="button" class="button" data-fix="remove-code">Remove code &amp; pay now</button>');
    if (cancelled || !codeProblem) actions.push('<button type="button" class="button secondary" data-fix="cod">Switch to Cash on Delivery</button>');
    const inApp = /Instagram|FBAN|FBAV|FB_IAB/i.test(navigator.userAgent);
    const help = cancelled
      ? (inApp ? 'Payment window closed. If Google Pay or PhonePe did not open inside Instagram, choose <b>UPI ID</b> or <b>QR code</b> in the payment window, or tap ⋯ and <b>Open in browser</b>. You can also pay on delivery.' : 'Payment window closed before paying. Try again, choose another method, or pay on delivery.')
      : esc(message || 'Please try again or select Cash on Delivery.');
    result(`<strong>${cancelled ? 'Payment not completed.' : 'Checkout could not start.'}</strong> ${help}<div class="checkout-fix-row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${actions.join('')}</div>`, true);
    document.querySelectorAll('[data-fix]').forEach(btn => btn.addEventListener('click', () => {
      if (btn.dataset.fix === 'remove-code') {
        if (form.querySelector('[name="coupon"][value="CART50"]:checked') && typeof setCartOfferClaim === 'function') { setCartOfferClaim(false); const offer = form.querySelector('[data-cart-offer]'); if (offer) offer.hidden = true; }
        const priv = form.querySelector('[name="private_coupon"]'); if (priv) priv.value = '';
        const none = form.querySelector('[name="coupon"][value="none"], [name="coupon"][value=""]'); if (none) none.checked = true; else form.querySelectorAll('[name="coupon"]').forEach(r => { r.checked = false; });
        try { sessionStorage.removeItem('gob-checkout-coupon'); } catch (_) {}
      } else {
        const cod = form.querySelector('[name="payment"][value="cod"]'); if (cod) cod.checked = true;
      }
      form.dispatchEvent(new Event('input', { bubbles: true })); form.dispatchEvent(new Event('change', { bubbles: true }));
      if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, { once: true }));
  }
  form.addEventListener('submit', async event => { event.preventDefault(); if (!valid()) return result('<strong>Checkout needs attention.</strong> Please complete your name, 10-digit mobile number and delivery address.', true); if (!policyAcknowledged()) return result('<strong>Please review the policies.</strong> Confirm the checkout policies before continuing.', true); const button = form.querySelector('[type="submit"]'), ref = reference(), pricing = total(), orderItems = items(); if (button) { button.disabled = true; button.textContent = 'Checking delivery…'; } try { await delivery(); await (window.GOB_PRIZE_CLAIM ? window.GOB_PRIZE_CLAIM() : null); window.GOB_META?.track('InitiateCheckout',{currency:'INR',value:pricing.grand,content_type:'product',content_ids:metaContentIds(orderItems),contents:metaContents(orderItems)}); if (button) button.textContent = 'Preparing secure checkout…'; await capture(); await window.GOB_API.orderAttempt({ ref, customer_name: fullName(), customer_phone: phone(), customer_email: get('[autocomplete="email"]'), payment_method: method() === 'cod' ? 'cod' : 'razorpay', subtotal: pricing.value, grand_total: pricing.grand, items: orderItems, shipping_address: address(), coupon_code: pricing.coupon, coupon_label: pricing.coupon || 'automatic saving' }); if (method() === 'cod') { await save(ref); saveCart([]); updateCart(); completeOrder(ref, 'cod'); } else { await prepaid(ref, pricing); saveCart([]); updateCart(); completeOrder(ref, 'paid'); } } catch (error) { checkoutFailed(error); } finally { if (button) { button.disabled = false; button.textContent = 'Continue to secure payment'; } } });
})();
;
/* ===== spin-gift-checkout.js ===== */
/* Free prize (Bone Run game, or an older spin-wheel gift) in the cart and at
   checkout. When the treat jar is ₹499+ the prize is shown as a ₹0 line in the
   order summary, because the server adds it to the order automatically
   (admin lib/spin-gifts.ts, matched by the mobile number or email used to
   claim it). This file only previews it; the server decides. */
(() => {
  const MIN_ORDER = 499;
  // Goat Trachea (Bone Run tier 1) is free with any order; bigger prizes need ₹499+.
  const minFor = label => /all 3 treats/i.test(String(label || '')) ? 2500 : /goat trachea/i.test(String(label || '')) ? 0 : MIN_ORDER;
  const form = document.querySelector('#checkoutForm');
  const cartPage = !form && document.querySelector('#checkoutLink');
  if (!form && !cartPage) return;

  const style = document.createElement('style');
  style.textContent = `
.spin-gift-note{margin:0 0 14px;padding:12px 14px;border:1px solid var(--ink,#102c22);background:var(--gold-soft,#f4e6c9);color:var(--ink,#102c22);font-size:13px;line-height:1.45}
.spin-gift-note strong{display:block;margin-bottom:2px;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.spin-gift-note.is-unlocked{background:#e4ebdf}
.order-row.prize-row{background:#fff4d6;margin:6px -8px;padding:8px;border-radius:6px;font-weight:700}
.order-row.prize-row span:last-child{color:#16824a}`;
  document.head.append(style);

  const note = document.createElement('div');
  note.className = 'spin-gift-note';
  note.setAttribute('role', 'status');
  note.setAttribute('aria-live', 'polite');
  note.hidden = true;
  if (form) { const submit = form.querySelector('[type="submit"]'); (submit || form.lastElementChild)?.before(note); }
  else cartPage.before(note);

  const prizeRow = document.createElement('div');
  prizeRow.className = 'order-row prize-row';
  prizeRow.hidden = true;
  const placeRow = () => { const total = document.querySelector('.order-row.total'); if (total && prizeRow.nextElementSibling !== total) total.before(prizeRow); };

  const value = selector => form?.querySelector(selector)?.value.trim() || '';
  const rupees = amount => `₹${Math.round(amount).toLocaleString('en-IN')}`;
  const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function subtotal() {
    try {
      const lines = typeof cart === 'function' ? cart() : [];
      return lines.reduce((sum, line) => {
        const product = line.product || (typeof GOB_PRODUCTS !== 'undefined' ? GOB_PRODUCTS[line.id] : null);
        return sum + (Number(product?.price) || 0) * (Number(line.quantity) || 0);
      }, 0);
    } catch (_) { return 0; }
  }

  // Prize claimed on this device (set by bone-run.js), or the per-customer
  // record saved when they claimed with this email + mobile.
  function deviceAward() {
    try {
      const award = JSON.parse(localStorage.getItem('gob-bonerun-award') || 'null');
      if (!award || !award.label || !award.claimed) return null;
      if (award.valid_until && String(award.valid_until).slice(0, 10) < new Date().toISOString().slice(0, 10)) return null;
      return award;
    } catch (_) { return null; }
  }
  async function customerAward() {
    const email = value('[autocomplete="email"]').toLowerCase();
    const phone = value('[autocomplete="tel"]').replace(/\D/g, '').slice(-10);
    if (!email || phone.length !== 10 || !window.crypto?.subtle) return null;
    try {
      const bytes = new TextEncoder().encode(`gob-spin-v1:${email}|${phone}`);
      const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
      const award = JSON.parse(localStorage.getItem(`gob-spin:${hash}`) || 'null');
      return award && award.label && !/%/.test(award.label) ? award : null;
    } catch (_) { return null; }
  }

  // ---- Prize won in Bone Run but the form was skipped: claim it here with
  // the checkout's name, mobile and email, so it is added to this order.
  function unclaimedPrize() {
    try { const u = JSON.parse(localStorage.getItem('gob-bonerun-unclaimed') || 'null'); return u && u.tier >= 0 && Date.now() - Number(u.at || 0) < 7 * 864e5 ? u : null; } catch (_) { return null; }
  }
  const TIER_LABELS = ['2 free Goat Trachea', '1 free pack of Chicken Feet (70 g)', '1 free pack of Mackerel (60 g)', 'All 3 treats free: 2 Goat Trachea, Chicken Feet 70 g & Mackerel 60 g'];
  let claimPromise = null, claimedKey = '', claimError = '';
  async function claimAtCheckout() {
    const u = unclaimedPrize(); if (!form || !u) return null;
    const name = value('[autocomplete="name"]') || value('[autocomplete="name"]');
    const email = value('[autocomplete="email"]').toLowerCase();
    const phone = value('[autocomplete="tel"]').replace(/\D/g, '').slice(-10);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[6-9]\d{9}$/.test(phone)) return null;
    const key = email + '|' + phone;
    if (claimPromise && claimedKey === key) return claimPromise;
    claimedKey = key; claimError = '';
    claimPromise = (async () => {
      const response = await fetch('/api/bone-run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phone, score: u.score, run_ms: u.ms, via_checkout: true }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { claimError = result.error || 'Your Bone Run prize could not be added.'; claimPromise = null; queue(); return null; }
      const label = result.prize || TIER_LABELS[u.tier];
      try {
        localStorage.removeItem('gob-bonerun-unclaimed');
        if (result.status !== 'already_used') {
          localStorage.setItem('gob-bonerun-award', JSON.stringify({ label, claimed: true, valid_until: result.valid_until || new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10) }));
          const bytes = new TextEncoder().encode(`gob-spin-v1:${email}|${phone}`);
          const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
          localStorage.setItem(`gob-spin:${hash}`, JSON.stringify({ label, detail: result.coupon_code || '' }));
        } else claimError = 'Your Bone Run prize was already used on an earlier order.';
      } catch (_) {}
      document.dispatchEvent(new Event('gob:prize-updated'));
      queue();
      return result;
    })();
    return claimPromise;
  }
  // Checkout waits for this before starting payment, so the prize is linked first.
  window.GOB_PRIZE_CLAIM = () => claimAtCheckout().catch(() => null);

  let renderId = 0;
  async function render() {
    const id = ++renderId;
    const total = subtotal();
    const award = (form ? await customerAward() : null) || deviceAward();
    const pending = !award && unclaimedPrize();
    if (pending) {
      const label = escapeHtml(TIER_LABELS[pending.tier] || 'your free treat');
      const min = minFor(TIER_LABELS[pending.tier]);
      const shortBy = Math.max(0, min - total);
      placeRow();
      prizeRow.hidden = !(total > 0 && shortBy === 0);
      prizeRow.innerHTML = `<span>🎁 FREE: ${label} (Bone Run prize)</span><span>₹0</span>`;
      note.hidden = false; note.classList.toggle('is-unlocked', shortBy === 0);
      note.innerHTML = claimError
        ? `<strong>Bone Run prize</strong>${escapeHtml(claimError)}`
        : shortBy > 0
          ? `<strong>You're ${rupees(shortBy)} away from your free treat</strong>Add ${rupees(shortBy)} more and ${label} from Bone Run is added free.`
          : `<strong>🎁 Your Bone Run prize is ready</strong>${label} will be added at ₹0 when you place this order. ${form ? 'Just fill in your details below, no extra form.' : 'Continue to checkout to get it.'}`;
      if (form) claimAtCheckout();
      return;
    }
    if (id !== renderId) return;
    const short = Math.max(0, (award ? minFor(award.label) : MIN_ORDER) - total);
    const label = award ? escapeHtml(award.label) : '';
    const item = award ? escapeHtml(award.label.replace(/\bfree\s+/i, '')) : '';
    placeRow();
    if (award && total > 0 && short === 0) {
      prizeRow.innerHTML = `<span>🎁 FREE: ${item} (Bone Run prize)</span><span>₹0</span>`;
      prizeRow.hidden = false;
      note.hidden = false; note.classList.add('is-unlocked');
      note.innerHTML = `<strong>🎁 Your free treat is in!</strong>${label} is included in this order at ₹0. Check out with the same mobile number or email you used to claim it. Works together with your coupon code and reward points.`;
    } else if (award && total > 0) {
      prizeRow.hidden = true;
      note.hidden = false; note.classList.remove('is-unlocked');
      note.innerHTML = `<strong>You're ${rupees(short)} away from your free treat</strong>Add ${rupees(short)} more and ${label} is added to this order automatically.`;
    } else if (form && !award) {
      prizeRow.hidden = true;
      note.hidden = false; note.classList.remove('is-unlocked');
      note.innerHTML = `<strong>Won a free treat in Bone Run?</strong>It is added automatically when you order with the same mobile number or email: Goat Trachea on any order, bigger prizes on orders of ${rupees(MIN_ORDER)}+. No code needed, and it works with coupon codes and reward points.`;
    } else {
      prizeRow.hidden = true; note.hidden = true;
    }
  }

  let timer;
  const queue = () => { clearTimeout(timer); timer = setTimeout(render, 250); };
  form?.addEventListener('input', queue);
  document.addEventListener('click', () => setTimeout(queue, 60));
  window.addEventListener('storage', queue);
  document.addEventListener('gob:cart-updated', queue);
  document.addEventListener('gob:prize-updated', queue);
  const totalEl = document.querySelector('[data-commerce-total]');
  if (totalEl) new MutationObserver(queue).observe(totalEl, { childList: true, characterData: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  else render();
})();
;
/* ===== checkout-pin.js ===== */
// Checkout: PIN code comes first. As soon as 6 digits are typed we ask Delhivery
// (via /api/pincode-check), fill in city and state, say whether cash on delivery
// is available, and show real arrival dates instead of "2–4 business days".
// Transit days mirror deliveryEstimate() in the admin's pincode-check route.
(() => {
  const form = document.getElementById('checkoutForm');
  const pinEl = form?.querySelector('[autocomplete="postal-code"]');
  const status = document.getElementById('pinStatus');
  if (!form || !pinEl || !status) return;
  const cityEl = form.querySelector('[autocomplete="address-level2"]');
  const stateEl = form.querySelector('[autocomplete="address-level1"]');
  const STATES = { AN: 'Andaman and Nicobar Islands', AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar', CH: 'Chandigarh', CT: 'Chhattisgarh', CG: 'Chhattisgarh', DN: 'Dadra and Nagar Haveli and Daman and Diu', DD: 'Dadra and Nagar Haveli and Daman and Diu', DL: 'Delhi', GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana', HP: 'Himachal Pradesh', JK: 'Jammu and Kashmir', JH: 'Jharkhand', KA: 'Karnataka', KL: 'Kerala', LA: 'Ladakh', LD: 'Lakshadweep', MP: 'Madhya Pradesh', MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya', MZ: 'Mizoram', NL: 'Nagaland', OR: 'Odisha', OD: 'Odisha', PY: 'Puducherry', PB: 'Punjab', RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TG: 'Telangana', TS: 'Telangana', TR: 'Tripura', UP: 'Uttar Pradesh', UK: 'Uttarakhand', UT: 'Uttarakhand', WB: 'West Bengal' };
  // Working days from today: dispatch (1–2) + transit for the region.
  const span = st => st === 'MH' ? [3, 6] : ['GJ', 'GA', 'KA', 'MP', 'RJ', 'TG', 'TS'].includes(st) ? [4, 7] : [5, 9];
  const addWorkingDays = n => { const d = new Date(); let left = n; while (left > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) left--; } return d; };
  const fmt = d => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const radio = v => form.querySelector(`input[name="payment"][value="${v}"]`);
  const autoFilled = new WeakSet();
  const fill = (el, val) => { if (!el || !val) return; if (!el.value.trim() || autoFilled.has(el)) { el.value = val; autoFilled.add(el); el.dispatchEvent(new Event('input', { bubbles: true })); } };
  const setPay = (v, ok, note) => {
    const r = radio(v); if (!r) return;
    r.disabled = !ok; r.closest('label')?.classList.toggle('is-unavailable', !ok);
    let n = r.closest('label')?.querySelector('.pay-note');
    if (!ok && r.closest('label') && !n) { n = document.createElement('em'); n.className = 'pay-note'; r.closest('label').querySelector('span')?.append(n); }
    if (n) n.textContent = ok ? '' : note;
    if (!ok && r.checked) { const other = radio(v === 'cod' ? 'online' : 'cod'); if (other && !other.disabled) other.checked = true; other?.dispatchEvent(new Event('change', { bubbles: true })); }
  };
  let last = '', timer;
  async function check() {
    const pin = pinEl.value.replace(/\D/g, '').slice(0, 6);
    if (pinEl.value !== pin) pinEl.value = pin;
    if (pin.length < 6) { status.className = 'pin-status'; status.textContent = pin ? 'Enter all 6 digits to see delivery dates.' : ''; last = ''; setPay('cod', true); setPay('online', true); return; }
    if (pin === last || !window.GOB_PINCODE_CHECKER) return;
    last = pin; status.className = 'pin-status checking'; status.textContent = 'Checking delivery…';
    try {
      const r = await window.GOB_PINCODE_CHECKER(pin);
      if (pin !== last) return;
      if (!r.serviceable) { status.className = 'pin-status error'; status.textContent = 'Delhivery doesn’t deliver to this PIN yet. Please check it, or WhatsApp us on +91 90825 03295.'; return; }
      const city = r.city ? r.city.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : '';
      fill(cityEl, city); fill(stateEl, STATES[r.state] || '');
      const [a, b] = span(r.state);
      status.className = 'pin-status ok';
      status.innerHTML = `✓ Delivers${city ? ' to ' + city : ''}. <b>Arrives ${fmt(addWorkingDays(a))} – ${fmt(addWorkingDays(b))}</b>${r.cod ? ' · Cash on delivery available' : ' · Online payment only for this PIN'}`;
      setPay('cod', r.cod, 'Not available for this PIN code');
      setPay('online', r.prepaid !== false, 'Not available for this PIN code');
    } catch (_) {
      if (pin === last) { status.className = 'pin-status'; status.textContent = 'We’ll confirm delivery for this PIN when you continue.'; last = ''; }
    }
  }
  pinEl.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(check, 350); });
  pinEl.addEventListener('change', check);
  // Saved addresses fill the PIN in for returning customers.
  setTimeout(check, 1200);
})();
;
/* ===== trust.js ===== */
/* Trust details: star ratings, homepage reviews, order-help promise, courier, cart/checkout reassurance, footer contact, contact page. */
(() => {
  const WA = 'https://wa.me/919082503295';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = v => String(v || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();
  const stars = avg => { const full = Math.round(avg); return '<span class="gob-st" aria-hidden="true">' + '★★★★★'.slice(0, full) + '<i>' + '★★★★★'.slice(full) + '</i></span>'; };
  const ICON = {
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6" cy="17.5" r="1.8" stroke="#bd812a"/><circle cx="17" cy="17.5" r="1.8" stroke="#bd812a"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.4 2.4 4.6-4.8" stroke="#bd812a"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19l1.4-3.6A8 8 0 1 1 8.6 19z"/><path d="M9 10h6M9 13h4" stroke="#bd812a"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3" stroke="#bd812a"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6" stroke="#bd812a"/></svg>',
  };
  const PROMISE = `<div class="gob-promise">${ICON.shield}<p><b>Something wrong with your order?</b> Tell us within 48 hours of delivery, with a photo, and we’ll replace it or refund you. <a href="/policies#returns">Returns policy</a></p></div>`;
  const COURIER = `<p class="gob-courier">${ICON.truck}<span>Shipped &amp; tracked by <b>Delhivery</b> · dispatched in 1–2 working days · <a href="/track">Track an order</a></span></p>`;
  const HELP = `<a class="gob-help" href="${WA}" target="_blank" rel="noopener">${ICON.chat}<span><b>Questions before you order?</b> WhatsApp us on +91 90825 03295</span></a>`;

  // ---------- review data (cached for 10 minutes per tab)
  let summaryP;
  const summary = () => summaryP || (summaryP = (async () => {
    try { const c = JSON.parse(sessionStorage.getItem('gob-rev-sum') || 'null'); if (c && Date.now() - c.t < 600000) return c.d; } catch {}
    const d = await fetch('/api/public-product-reviews?summary=1', { headers: { Accept: 'application/json' } }).then(r => r.ok ? r.json() : null).catch(() => null);
    if (d) { try { sessionStorage.setItem('gob-rev-sum', JSON.stringify({ t: Date.now(), d })); } catch {} }
    return d;
  })());
  const lookup = (d, name) => { if (!d?.products) return null; const n = norm(name); for (const [k, v] of Object.entries(d.products)) if (norm(k) === n) return v; return null; };

  // ---------- 1. stars on product cards (shop, collections, homepage bestsellers)
  async function cardStars() {
    const d = await summary(); if (!d) return;
    document.querySelectorAll('.product-card h3, .hv2 .card h3, a.card h3').forEach(h => {
      const box = h.closest('.product-card, .card'); if (!box || box.querySelector('.gob-card-rating')) return;
      const r = lookup(d, h.textContent.trim()); if (!r || !r.count) return;
      h.insertAdjacentHTML('afterend', `<p class="gob-card-rating" aria-label="Rated ${r.average} out of 5 from ${r.count} review${r.count > 1 ? 's' : ''}">${stars(r.average)}<b>${r.average.toFixed(1)}</b><span>(${r.count})</span></p>`);
    });
  }
  // ---------- product page: stars under the name + promise + courier
  async function productPage() {
    const h1 = document.getElementById('productName'); if (!h1) return;
    const ship = document.getElementById('v2Ship');
    if (ship && !ship.querySelector('.gob-promise')) { const pay = ship.querySelector('.gob-pay'); (pay || ship.lastElementChild).insertAdjacentHTML(pay ? 'beforebegin' : 'afterend', COURIER + PROMISE); }
    if (document.querySelector('.gob-pdp-rating')) return;
    const d = await summary(); const r = lookup(d, h1.textContent.trim()); if (!r || !r.count) return;
    const target = document.getElementById('productReviewFeed') || document.querySelector('[id*="review" i]');
    h1.insertAdjacentHTML('afterend', `<a class="gob-pdp-rating" href="#${target?.id || ''}">${stars(r.average)}<b>${r.average.toFixed(1)}</b><span>${r.count} review${r.count > 1 ? 's' : ''}</span></a>`);
  }
  // ---------- 3. homepage reviews strip (before the FAQ)
  async function homeReviews() {
    const faq = document.querySelector('.hv2 section.faq'); if (!faq || document.getElementById('gobReviews')) return;
    const d = await summary(); if (!d?.latest?.length) return;
    const o = d.overall || {};
    // One review per person (their best), and leave out reviews that read like health claims.
    const CLAIM = /inflamm|sooth|cure|heal|skin|gut|medic|disease|allerg|immun|joint|digest/i;
    const best = new Map();
    for (const r of d.latest) { if (CLAIM.test(r.review)) continue; const k = r.name.split('·')[0].trim(); const b = best.get(k); if (!b || r.rating > b.rating || (r.rating === b.rating && r.review.length > b.review.length)) best.set(k, r); }
    const picks = [...best.values()].slice(0, 8); if (!picks.length) return;
    const cards = picks.map(r => `<figure class="gob-rv"><div class="gob-rv-top">${stars(r.rating)}<span class="gob-rv-p">${esc(r.product)}</span></div><blockquote>“${esc(r.review)}”</blockquote><figcaption>${esc(r.name)}</figcaption></figure>`).join('');
    faq.insertAdjacentHTML('beforebegin', `<section class="s" id="gobReviews" style="padding-top:0"><div class="wrap"><div class="row-head"><div><p class="eyebrow">Reviews</p><h2>What pet parents say</h2></div>${o.count ? `<p class="gob-rv-sum">${stars(o.average)} <b>${Number(o.average).toFixed(1)}</b> from ${o.count} reviews</p>` : ''}</div><div class="gob-rv-row">${cards}</div><p class="gob-rv-note">Every review is from a real customer and is checked before it appears.</p></div></section>`);
  }
  // ---------- 6. cart + checkout reassurance
  // Checkout doesn't load header-navigation.js, so define the same payment-logo row here if it's missing.
  // Keep in step with header-navigation.js (PAY list).
  if (typeof window.GOB_payRow !== 'function') {
    const PAY = [['upi','UPI'],['googlepay','Google Pay'],['phonepe','PhonePe'],['paytm','Paytm'],['visa','Visa'],['mastercard','Mastercard'],['rupay','RuPay'],['maestro','Maestro']];
    const EXTRA = [['Net banking','<path d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18M12 3l9 5H3z"/>'],['Wallets','<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h5M3 9h14"/>'],['Cash on delivery','<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>']];
    const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#bd812a"/></svg>';
    const payRow = extra => `<div class="gob-pay${extra ? ' ' + extra : ''}" aria-label="Payment methods we accept"><p class="gob-pay-t">${LOCK}<span>Secure payments by Razorpay</span></p><ul class="gob-pay-logos">${PAY.map(([k, n]) => `<li class="gob-pay-${k}"><img src="/assets/pay/${k}.svg" alt="${n}" width="54" height="34" loading="lazy" decoding="async"></li>`).join('')}</ul><ul class="gob-pay-more">${EXTRA.map(([n, d]) => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>${n}</li>`).join('')}</ul></div>`;
    window.GOB_payRow = payRow;
  }
  function cartCheckout() {
    const pay = typeof window.GOB_payRow === 'function' ? window.GOB_payRow('gob-pay-cart') : '';
    const cart = document.querySelector('.cart-assurance');
    if (cart && !document.querySelector('.gob-cart-trust')) cart.insertAdjacentHTML('afterend', `<div class="gob-cart-trust">${pay}${COURIER}${PROMISE}${HELP}</div>`);
    const btn = [...document.querySelectorAll('form button[type=submit]')].find(b => /secure payment/i.test(b.textContent));
    if (btn && !document.querySelector('.gob-checkout-trust')) btn.insertAdjacentHTML('afterend', `<div class="gob-checkout-trust">${pay}${PROMISE}${HELP}</div>`);
  }
  // ---------- 8. contact page: big WhatsApp button + map link
  function contact() {
    if (!/\/contact(\.html)?$/.test(location.pathname)) return;
    const h = [...document.querySelectorAll('h1,h2')].find(x => /talk treats|contact/i.test(x.textContent));
    if (!h || document.querySelector('.gob-contact-cta')) return;
    let block = h; while (block.nextElementSibling && block.nextElementSibling.tagName === 'P') block = block.nextElementSibling;
    block.insertAdjacentHTML('afterend', `<div class="gob-contact-cta"><a class="gob-wa-btn" href="${WA}?text=${encodeURIComponent('Hi Game of Bones! I have a question.')}" target="_blank" rel="noopener">${ICON.chat}Chat on WhatsApp</a><a class="gob-map-btn" href="https://www.google.com/maps/search/?api=1&query=Kalyan+West+Maharashtra+421301" target="_blank" rel="noopener">${ICON.pin}Kalyan West, Maharashtra 421301</a><p>Replies come from a real person in our Kalyan kitchen.</p></div>`);
  }

  function run() { cardStars(); productPage(); homeReviews(); cartCheckout(); contact(); }
  [200, 1200, 3000, 6000].forEach(ms => setTimeout(run, ms));
  const lc = document.getElementById('liveCatalog');
  if (lc) new MutationObserver(() => setTimeout(cardStars, 50)).observe(lc, { childList: true });
})();
;
