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
/* ===== header-navigation.js ===== */
/* One complete navigation source for every customer-facing page. */
(() => {
  const navigation = [
    ['/products', 'Shop'],
    ['/dog-chews', 'Dog chews'],
    ['/dog-training-treats', 'Training treats'],
    ['/cat-treats', 'Cat treats'],
    ['/our-story', 'Our story'],
  ];
  const tickerCopy = 'Free delivery on full packs · ₹30 off when you pay online';

  const installLiveTicker = () => {
    const notice = document.querySelector('.notice');
    if (!notice || notice.querySelector('.gob-live-ticker')) return;
    notice.dataset.gobLiveTickerReady = 'true';
    notice.innerHTML = '<div class="gob-live-ticker"><span></span></div>';
    const label = notice.querySelector('.gob-live-ticker span');
    const paint = () => {
      label.textContent = tickerCopy;
      requestAnimationFrame(() => document.documentElement.style.setProperty('--gob-notice-height', `${notice.offsetHeight}px`));
    };
    paint();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installLiveTicker, { once: true });
  else installLiveTicker();
  window.setTimeout(installLiveTicker, 120);
  if (!document.querySelector('link[data-gob-header-navigation]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'header-navigation.css?v=live-ticker-7';
    stylesheet.dataset.gobHeaderNavigation = 'true';
    document.head.append(stylesheet);
  }
  // Bone Run lives in the footer now (the floating launcher is hidden). It still opens once per visit on its own.
  const addPlayLink = () => {
    const shop = [...document.querySelectorAll('footer h4')].find(h => /shop/i.test(h.textContent))?.parentElement;
    if (!shop || shop.querySelector('[data-play-bonerun]')) return;
    shop.insertAdjacentHTML('beforeend', '<a href="#" data-play-bonerun>Play &amp; win a treat</a>');
    shop.querySelector('[data-play-bonerun]').addEventListener('click', event => {
      event.preventDefault();
      if (typeof window.GOB_openSpinWheel === 'function') window.GOB_openSpinWheel();
      else document.addEventListener('gob:wheel-ready', () => window.GOB_openSpinWheel?.(), { once: true });
    });
  };
  [400, 1500, 4000].forEach(ms => window.setTimeout(addPlayLink, ms));

  // Accepted payment methods (Razorpay + cash on delivery): footer on every page, and under "Add to treat jar" on product pages.
  const PAY = [['upi','UPI'],['googlepay','Google Pay'],['phonepe','PhonePe'],['paytm','Paytm'],['visa','Visa'],['mastercard','Mastercard'],['rupay','RuPay'],['maestro','Maestro']];
  const EXTRA = [['Net banking','<path d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18M12 3l9 5H3z"/>'],['Wallets','<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h5M3 9h14"/>'],['Cash on delivery','<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>']];
  const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#bd812a"/></svg>';
  const payRow = extra => `<div class="gob-pay${extra ? ' ' + extra : ''}" aria-label="Payment methods we accept"><p class="gob-pay-t">${LOCK}<span>Secure payments by Razorpay</span></p><ul class="gob-pay-logos">${PAY.map(([k, n]) => `<li class="gob-pay-${k}"><img src="/assets/pay/${k}.svg" alt="${n}" width="54" height="34" loading="lazy" decoding="async"></li>`).join('')}</ul><ul class="gob-pay-more">${EXTRA.map(([n, d]) => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>${n}</li>`).join('')}</ul></div>`;
  window.GOB_payRow = payRow;
  const addPayments = () => {
    const bottom = document.querySelector('footer .footer-bottom');
    if (bottom && !document.querySelector('footer .gob-pay')) bottom.insertAdjacentHTML('beforebegin', payRow('gob-pay-footer'));
    const ship = document.getElementById('v2Ship');
    if (ship && !ship.querySelector('.gob-pay')) ship.insertAdjacentHTML('beforeend', payRow('gob-pay-product'));
  };
  [300, 1500, 4000].forEach(ms => window.setTimeout(addPayments, ms));
  if (!document.querySelector('script[data-gob-trust]')) {
    const tl = document.createElement('link'); tl.rel = 'stylesheet'; tl.href = '/trust.css?v=2'; document.head.append(tl);
    const ts = document.createElement('script'); ts.src = '/trust.js?v=2'; ts.defer = true; ts.dataset.gobTrust = '1'; document.head.append(ts);
  }

  const nav = document.querySelector('.nav');
  if (!nav || nav.dataset.minimalHeader === 'true') return;
  const pathname = location.pathname.toLowerCase();
  const activeHref = pathname.endsWith('product.html') || pathname === '/product' ? '/products' : navigation.find(([href]) => href === '/' ? pathname === '/' || pathname.endsWith('/index.html') : pathname === href || pathname.endsWith(href + '.html'))?.[0];
  const links = nav.querySelector('.nav-links') || document.createElement('div');
  links.className = 'nav-links compact-nav';
  links.setAttribute('aria-label', 'Site sections');
  links.innerHTML = navigation.map(([href, label]) => `<a${href === activeHref ? ' class="active"' : ''} href="${href}">${label}</a>`).join('');
  if (!links.parentElement) nav.insertBefore(links, nav.querySelector('.nav-actions'));
})();
;
/* ===== conversion-extras.js ===== */
(() => {
  function ensureStyles() {
    if (document.querySelector('link[href^="conversion-extras.css"]')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'conversion-extras.css?v=review-flow-2';
    document.head.append(stylesheet);
    const paidTrafficStyles = document.createElement('link');
    paidTrafficStyles.rel = 'stylesheet';
    paidTrafficStyles.href = 'conversion-paid-traffic.css?v=1';
    document.head.append(paidTrafficStyles);
    const reviewStyles = document.createElement('link');
    reviewStyles.rel = 'stylesheet';
    reviewStyles.href = 'review-public.css?v=verified-reviews-1';
    document.head.append(reviewStyles);
  }

  function addWheelPrompt() {
    // The Bone Run launcher now lives in /bone-run-loader.js (loaded by
    // site.js on every page). Load it here too in case site.js is older.
    if (window.__gobBRLoaderRan || document.querySelector('script[src^="/bone-run-loader.js"]')) return;
    const s = document.createElement('script'); s.src = '/bone-run-loader.js?v=1'; document.body.append(s);
  }

  function addHomeExtras() {
    document.querySelector('.hero .proof')?.insertAdjacentHTML('afterend', `
      <aside class="home-sale-note" aria-label="Shopping details">
        <strong>Simple prices, straight to your jar.</strong>
        <span>Free delivery on full packs across India · ₹30 off when you pay online.</span>
      </aside>`);
    const target = document.querySelector('.subscribe');
    target?.insertAdjacentHTML('beforebegin', `
      <section class="conversion-block">
        <div class="compare-grid">
          <div><p class="eyebrow">The label check</p><h2>Game of Bones</h2><ul><li>One named ingredient per treat</li><li>No filler, artificial colour or flavour listed</li><li>Slow-dehydrated for a simple treat routine</li></ul></div>
          <div><p class="eyebrow">Typical processed treats</p><h2>More to decode.</h2><ul><li>Ingredient lists can include binders and flavour systems</li><li>Processing and formulation vary by brand</li><li>Always read the current pouch label</li></ul></div>
        </div>
        <div class="bundle-cta"><div><p class="eyebrow">First order, made easy</p><h2>Build a treat box they’ll remember.</h2></div><a class="button" href="bundles.html">Build your bundle</a></div>
      </section>`);
  }

  function addProductExtras() {
    const buyRow = document.querySelector('.buy-row');
    buyRow?.insertAdjacentHTML('afterend', `
      <section class="paid-traffic-promise" aria-label="Order reassurance">
        <span><b>Price shown is current</b><small>No code needed</small></span>
        <span><b>Free delivery</b><small>On all full packs</small></span>
        <span><b>₹30 off paying online</b><small>no COD fee</small></span>
      </section>
      <section class="quick-review-proof" id="quickReviewProof" aria-live="polite">
        <span class="quick-review-stars" aria-hidden="true">★★★★★</span>
        <span><b>Verified dog-parent reviews</b><small>Loading product feedback…</small></span>
        <a href="#productReviewSection">Read reviews</a>
      </section>
      <button class="wish-btn" id="wishBtn">Sign in to save favourites</button>`);
    document.querySelector('#wishBtn')?.addEventListener('click', () => location.assign('login.html'));

    document.querySelector('.accordion')?.insertAdjacentHTML('afterend', `
      <section class="review-box" id="productReviewSection" aria-labelledby="reviewFlowTitle">
        <p class="eyebrow">Notes from dog parents</p>
        <h2 id="reviewFlowTitle">Reviews from real treat time.</h2>
        <p class="review-intro">New reviews can only be written by customers with a delivered order, and every review is checked before it appears.</p>
        <div id="productReviewFeed" class="product-review-feed" aria-live="polite"><p>Loading reviews…</p></div>
        <div class="reward-review">Bought this treat? <a href="/account">Sign in to review your delivered items</a> · 100 points for an approved review, or 150 with a photo of your dog.</div>
      </section>`);
    const renderReviews = async () => {
      const name = document.querySelector('#productName')?.textContent?.trim();
      const feed = document.querySelector('#productReviewFeed'); if (!name || !feed || !window.GOB_API?.publicProductReviews) return;
      const quickProof = document.querySelector('#quickReviewProof');
      feed.innerHTML = '<p>Loading reviews…</p>';
      try {
        const data = await window.GOB_API.publicProductReviews(name), rows = Array.isArray(data.reviews) ? data.reviews : [];
        const stars = value => '★'.repeat(Math.max(0, Math.min(5, Number(value) || 0))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, Number(value) || 0)));
        const headerRating = document.querySelector('#productRating');
        if (headerRating) {
          if (rows.length) {
            const avg = Number(data.average_rating || 0);
            headerRating.innerHTML = `${stars(Math.round(avg))} <a href="#productReviewSection" style="color:var(--ink);font-weight:600">${avg.toFixed(1)} · ${data.review_count} review${Number(data.review_count) === 1 ? '' : 's'}</a>`;
            headerRating.hidden = false;
          } else { headerRating.hidden = true; headerRating.innerHTML = ''; }
        }
        if (quickProof) {
          const firstReview = String(rows[0]?.review || '').replace(/\s+/g, ' ').trim();
          const safeExcerpt = firstReview.replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
          quickProof.innerHTML = rows.length
            ? `<span class="quick-review-stars" aria-hidden="true">${stars(Math.round(Number(data.average_rating || 0)))}</span><span><b>${Number(data.average_rating || 0).toFixed(1)} from dog parents</b><small>${safeExcerpt.slice(0, 96)}${safeExcerpt.length > 96 ? '…' : ''}</small></span><a href="#productReviewSection">Read ${data.review_count} review${Number(data.review_count) === 1 ? '' : 's'}</a>`
            : '<span><b>No reviews yet</b><small>Bought it? Review it after delivery and earn 100 points.</small></span>';
        }
        feed.innerHTML = rows.length ? `<div class="review-summary"><strong>${Number(data.average_rating || 0).toFixed(1)} / 5</strong><span aria-label="${Number(data.average_rating || 0)} out of 5 stars">${stars(Math.round(Number(data.average_rating || 0)))}</span><small>${data.review_count} review${Number(data.review_count) === 1 ? '' : 's'}</small></div><div class="public-review-list">${rows.map(row => `<article class="public-review"><div><strong>${String(row.name || 'Verified dog parent')}</strong><span aria-label="${Number(row.rating || 0)} out of 5 stars">${stars(row.rating)}</span></div><p>${String(row.review || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char])}</p>${row.photo_url ? `<img src="${String(row.photo_url)}" alt="A dog enjoying ${name}" loading="lazy">` : ''}</article>`).join('')}</div>` : '<p class="review-empty">Be the first verified dog parent to share a note about this treat.</p>';
      } catch {
        if (quickProof) quickProof.innerHTML = '<span><b>Customer reviews</b><small>Reviews are shown after moderation.</small></span>';
        const headerRating = document.querySelector('#productRating'); if (headerRating) headerRating.hidden = true;
        feed.innerHTML = '<p class="review-empty">Reviews are temporarily unavailable. Please check back soon.</p>';
      }
    };
    renderReviews();
    document.addEventListener('gob:product-ready', renderReviews);
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureStyles();
    addWheelPrompt();
    const isHome = location.pathname === '/' || location.pathname.endsWith('/index.html');
    if (isHome) addHomeExtras();
    if (document.querySelector('#addProduct')) addProductExtras();
  });
})();
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
/* ===== restock-notify.js ===== */
/* Back-in-stock requests are offered only for catalogue items that the public
   API marks as low stock. Contact data is saved by the protected admin API. */
(() => {
  const escape = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const decode = value => { try { return decodeURIComponent(value || '') } catch { return '' } };
  const style = `
    .restock-notify-area{display:grid;gap:7px;margin-top:12px;padding:13px 14px;border:1px solid #ead8b9;border-radius:10px;background:#fff8e7;color:#553719;font-size:13px;line-height:1.45}.restock-notify-area strong{font-size:13px}.restock-notify-area span{color:#66594d}.restock-notify-button{border:1px solid #6d4825;background:#fff8e7;color:#553719;border-radius:999px;padding:9px 14px;font:700 12px/1.2 inherit;cursor:pointer;white-space:nowrap;width:max-content}.restock-notify-button:hover{background:#f6e2b9}.restock-notify-modal{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:rgba(26,16,8,.56)}.restock-notify-card{width:min(460px,100%);background:#fffaf3;border-radius:16px;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.28);position:relative}.restock-notify-card h2{margin:4px 0 8px;color:#1a1008}.restock-notify-card p{color:#66594d;line-height:1.55}.restock-notify-close{position:absolute;right:14px;top:12px;background:transparent;border:0;font-size:24px;cursor:pointer;color:#553719}.restock-notify-card label{display:grid;gap:7px;margin:18px 0 10px;color:#382617;font-weight:700;font-size:13px}.restock-notify-card input{border:1px solid #d9c8b3;border-radius:8px;padding:12px;font:inherit}.restock-notify-consent{display:flex!important;grid-template-columns:18px 1fr;align-items:start;font-weight:400!important;line-height:1.4}.restock-notify-submit{width:100%;border:0;border-radius:8px;background:#1a1008;color:#fff;padding:13px;font:700 14px inherit;cursor:pointer}.restock-notify-status{min-height:20px;font-size:13px;margin:10px 0 0;color:#8b3f19}`;

  function ensureStyles() { if (!document.querySelector('#restock-notify-styles')) { const tag = document.createElement('style'); tag.id = 'restock-notify-styles'; tag.textContent = style; document.head.append(tag); } }
  function close() { document.querySelector('#restockNotifyModal')?.remove(); }
  function open(button) {
    ensureStyles(); close();
    const productId = decode(button.dataset.restockProduct), productName = decode(button.dataset.restockName);
    if (!productId || !productName) return;
    const modal = document.createElement('section'); modal.id = 'restockNotifyModal'; modal.className = 'restock-notify-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `<form class="restock-notify-card"><button class="restock-notify-close" type="button" aria-label="Close">×</button><p class="eyebrow">Fresh batches, every day</p><h2>Tell us where to reach you.</h2><p>${escape(productName)} is running low. Leave an email address or WhatsApp number and we’ll let you know when fresh stock is ready.</p><label>Email address or mobile number<input name="contact" required autocomplete="email" placeholder="you@example.com or 98765 43210"></label><label class="restock-notify-consent"><input name="consent" type="checkbox" required><span>I agree to receive a back-in-stock alert for this treat.</span></label><button class="restock-notify-submit" type="submit">Notify me when it’s back</button><p class="restock-notify-status" aria-live="polite"></p></form>`;
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    modal.querySelector('.restock-notify-close').addEventListener('click', close);
    modal.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault(); const form = event.currentTarget, contact = String(new FormData(form).get('contact') || '').trim(), status = form.querySelector('.restock-notify-status'), submit = form.querySelector('button[type="submit"]');
      const email = /@/.test(contact) ? contact : '', phone = email ? '' : contact.replace(/[\s()-]/g, '');
      submit.disabled = true; status.textContent = 'Saving your alert…';
      try { await window.GOB_API.restockAlert({ product_id: productId, email, phone, notification_consent: true, privacy_notice_version: '2026-10-15' }); status.style.color = '#146c61'; status.textContent = 'You’re on the list. We’ll let you know when fresh stock is ready.'; form.reset(); submit.remove(); }
      catch (error) { status.style.color = '#8b3f19'; status.textContent = error?.message || 'We could not save your alert. Please try again.'; submit.disabled = false; }
    });
    document.body.append(modal); modal.querySelector('input[name="contact"]')?.focus();
  }
  document.addEventListener('click', event => { const button = event.target.closest('[data-restock-product]'); if (button) { event.preventDefault(); open(button); } });
})()
;
/* ===== catalog-restock.js ===== */
/* Adds low-stock alerts to the homepage catalogue after its cards are rendered. */
(() => {
  const encode = value => encodeURIComponent(String(value || ''));
  function addRestockButtons() {
    const catalogue = Array.isArray(window.GOB_LIVE_CATALOG) ? window.GOB_LIVE_CATALOG : [];
    document.querySelectorAll('#liveCatalog .product-card').forEach(card => {
      if (card.querySelector('[data-restock-product]')) return;
      const name = card.querySelector('h3')?.textContent?.trim();
      const product = catalogue.find(item => item.n === name);
      if (!product?.low_stock) return;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'restock-notify-button';
      button.dataset.restockProduct = encode(product.inventory_id || product.id);
      button.dataset.restockName = encode(product.n);
      button.textContent = 'Notify me';
      card.querySelector('.card-bottom')?.insertAdjacentElement('afterend', button);
    });
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(addRestockButtons, 0));
  document.addEventListener('gob:catalog-sync', () => setTimeout(addRestockButtons, 0));
})();
;
/* ===== bogo-promo.js ===== */
/* Buy 1 Get 1 is automatic for the two selected treats. The checkout service
   remains authoritative for the discount and exclusivity rules. */
(() => {
  const eligible = value => [].includes(String(value || '').replace(/\s+—\s+.+$/, '').trim().toLowerCase());
  const cardOffer = card => {
    if (card.querySelector('[data-bogo-card]') || !eligible(card.querySelector('h3')?.textContent)) return;
    const badge = document.createElement('p'); badge.dataset.bogoCard = '';
    badge.style.cssText = 'margin:10px 0 0;color:#a84312;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase';
    badge.textContent = 'Buy 1 Get 1 · no code needed';
    card.querySelector('.card-bottom')?.insertAdjacentElement('afterend', badge);
  };
  const productOffer = product => {
    if (!eligible(product?.n || product?.name) || document.querySelector('[data-bogo-product]')) return;
    const note = document.createElement('aside'); note.dataset.bogoProduct = '';
    note.className = 'restock-notify-area';
    note.innerHTML = '<strong>Buy 1 Get 1 on this treat</strong><span>Add two of the same pack and one is free automatically at checkout. This offer cannot be combined with coupon codes or reward points.</span>';
    document.querySelector('#addProduct')?.insertAdjacentElement('afterend', note);
  };
  const decorate = () => document.querySelectorAll('.product-card').forEach(cardOffer);
  const observeCards = () => {
    const catalogue = document.querySelector('#liveCatalog');
    if (!catalogue || catalogue.dataset.bogoObserved) return;
    catalogue.dataset.bogoObserved = 'true';
    new MutationObserver(() => decorate()).observe(catalogue, { childList: true, subtree: true });
  };
  document.addEventListener('DOMContentLoaded', () => { decorate(); observeCards(); productOffer(window.GOB_CURRENT_PRODUCT); });
  document.addEventListener('gob:catalog-sync', () => setTimeout(decorate, 0));
  document.addEventListener('gob:product-ready', event => productOffer(event.detail?.product));
})();
;
/* ===== community.js ===== */
/* "Dogs of Game of Bones": real customer photos from published, verified-purchase reviews.
   Stays hidden until at least 3 photos exist, so the homepage never shows an empty or padded gallery. */
(() => {
  const box = document.getElementById('gobDogs');
  if (!box) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  fetch('/api/public-product-reviews?photos=1', { headers: { Accept: 'application/json' } })
    .then(r => r.ok ? r.json() : { photos: [] })
    .then(({ photos = [] }) => {
      const list = photos.filter(p => p && p.photo_url).slice(0, 8);
      if (list.length < 3) return;
      box.querySelector('.dogs-grid').innerHTML = list.map(p => `<figure class="dog-tile"><img src="${esc(p.photo_url)}" alt="${esc(p.name.split(' ·')[0])}’s dog with ${esc(p.product)}" loading="lazy"><figcaption><b>${'★'.repeat(Math.max(1, Math.min(5, p.rating || 5)))}</b> ${esc(p.product)}${p.review ? `<span>“${esc(p.review.slice(0, 90))}${p.review.length > 90 ? '…' : ''}”</span>` : ''}<small>${esc(p.name)}</small></figcaption></figure>`).join('');
      box.hidden = false;
    })
    .catch(() => {});
})();
;
/* ===== howmade.js ===== */
/* Scroll-driven "How it's made": the photo and progress follow whichever step is in the middle of the screen. */
(() => {
  const root = document.querySelector('[data-howmade]'); if (!root) return;
  const steps = [...root.querySelectorAll('.hm-step')], imgs = [...root.querySelectorAll('.hm-img')];
  const cap = root.querySelector('.hm-cap b'), count = root.querySelector('.hm-count'), bar = root.querySelector('.hm-bar i'), line = root.querySelector('.hm-line'), list = root.querySelector('.hm-steps');
  let cur = -1, ticking = false;
  function set(i) {
    if (i === cur) return; cur = i;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
    cap.textContent = steps[i].querySelector('h3').textContent;
    count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0');
    bar.style.width = ((i + 1) / steps.length * 100) + '%';
    const s = steps[i], top = s.offsetTop + 26; line.style.height = Math.max(0, top - 10) + 'px';
  }
  // keep the photo just below the sticky header, whatever its height
  function headerGap(){ const h=document.querySelector('.site-header,header,.nav'); const b=h?h.getBoundingClientRect().bottom:64; root.style.setProperty('--hm-top', Math.max(56, Math.round(b+12))+'px'); }
  function update() {
    ticking = false;
    const mid = window.innerHeight * (window.innerWidth < 880 ? 0.72 : 0.55);
    let best = 0;
    steps.forEach((s, k) => { if (s.getBoundingClientRect().top < mid) best = k; });
    set(best);
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', () => { headerGap(); update(); });
  headerGap(); update(); setTimeout(headerGap, 1200);
})();
;
