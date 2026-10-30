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
function updateCart(){const items=cart(),count=cartCount();document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=count);const list=document.querySelector('#cartItems'),total=document.querySelector('#cartTotal');if(!list||!total)return;if(!items.length){list.innerHTML='<p class="empty">Your bag is waiting for something delicious.</p>';total.textContent=money(0);return}list.innerHTML=items.map(item=>{const p=cartProduct(item);if(!p)return '';const imageAlt=`${p.name||'Game of Bones treat'} product image`;return `<div class="cart-item"><img src="${p.image}" alt="${imageAlt}"><div><strong>${p.name}</strong><small>${item.quantity} × ${money(p.price)}</small></div><button class="remove" data-remove="${item.id}">Remove</button></div>`}).join('');total.textContent=money(items.reduce((sum,item)=>sum+(cartProduct(item)?.price||0)*item.quantity,0));document.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{saveCart(cart().filter(item=>item.id!==button.dataset.remove));updateCart();notice('Removed from your bag.')}))}
function addToCart(id,quantity=1){id=canonicalCartId(id);const items=cart(),product=GOB_PRODUCTS[id],isBogo=['chicken feet','chicken neck'].includes(String(product?.name||'').replace(/\s+—\s+.+$/,'').trim().toLowerCase());if(isBogo&&quantity===1)quantity=2;const snapshot=product?{name:product.name,price:Number(product.price)||0,image:product.image||'',tag:product.tag||'',packLabel:product.packLabel||'',catalog_slug:catalogProductId(product,id)}:null,found=items.find(item=>canonicalCartId(item.id)===id);if(found){found.id=id;found.quantity+=quantity;if(snapshot)found.product=snapshot}else items.push({id,quantity,product:snapshot});saveCart(items);updateCart();const value=(Number(product?.price)||0)*quantity,catalogId=catalogProductId(product,id);window.GOB_META?.track('AddToCart',{content_ids:[catalogId],content_name:product?.name||'Game of Bones treat',content_type:'product',currency:'INR',value});window.GOB_ANALYTICS?.track('add_to_cart',{currency:'INR',value,items:[{item_id:catalogId,item_name:product?.name||'Game of Bones treat',price:Number(product?.price)||0,quantity}]});notice(isBogo?`${product?.name||'Treat'} added — Buy 1 Get 1: your second pack is free.`:`${product?.name||'Treat'} added to your treat jar.`,'jar')}
function openCart(){document.querySelector('#cartDrawer')?.classList.add('open');document.querySelector('#scrim')?.classList.add('open');document.body.classList.add('locked')}
function closeCart(){document.querySelector('#cartDrawer')?.classList.remove('open');document.querySelector('#scrim')?.classList.remove('open');document.body.classList.remove('locked')}
// Customer-facing URLs stay clean even though the static files behind them use
// .html names. This also covers links injected by catalogue, cart and blog UI.
const cleanPageUrls={'index.html':'/','products.html':'/products','product.html':'/product','our-story.html':'/our-story','bundles.html':'/bundles','blog.html':'/blog','contact.html':'/contact','rewards.html':'/rewards','track.html':'/track','learn.html':'/learn','cart.html':'/cart','checkout.html':'/checkout','login.html':'/login','account.html':'/account','policies.html':'/policies'};
function cleanStorefrontUrls(root=document){const links=[...(root.matches?.('a[href]')?[root]:[]),...(root.querySelectorAll?.('a[href]')||[])];links.forEach(link=>{const raw=link.getAttribute('href');if(!raw||/^(?:#|mailto:|tel:|https?:|\/\/)/i.test(raw))return;const match=raw.match(/^([^?#]+)(.*)$/);if(!match)return;const cleaned=cleanPageUrls[match[1]];if(cleaned)link.setAttribute('href',cleaned+match[2])})}
function ensureCart(){if(document.querySelector('#cartDrawer'))return;document.body.insertAdjacentHTML('beforeend','<div class="scrim" id="scrim"></div><aside class="drawer" id="cartDrawer" aria-label="Shopping bag"><div class="drawer-top"><h2>Your bag</h2><button class="close" data-close-cart aria-label="Close bag">×</button></div><div class="cart-items" id="cartItems"></div><div class="cart-total"><div><span>Subtotal</span><span id="cartTotal">₹0</span></div><a class="button" style="width:100%" href="/checkout">Checkout securely</a><a href="/cart" style="display:block;text-align:center;margin-top:10px;font-size:13px;text-decoration:underline">View or edit bag</a><p style="margin:8px 0 0;font-size:12px;text-align:center;opacity:.75">Free shipping · UPI, cards or Cash on Delivery</p></div></aside><div class="toast" id="toast" role="status"></div>')}
function enhanceHeader(){const actions=document.querySelector('.nav-actions'),links=document.querySelector('.nav-links');if(!actions)return;links?.classList.add('compact-nav');const track=links?.querySelector('a[href="track.html"]'),bundles=links?.querySelector('a[href="bundles.html"]');if(track&&bundles)bundles.insertAdjacentElement('afterend',track);if(!document.querySelector('.search-trigger'))actions.insertAdjacentHTML('afterbegin','<button class="search-trigger" type="button" aria-label="Search products" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4"></circle><path d="m16 16 4.3 4.3"></path></svg><span>Search</span></button>');if(!document.querySelector('.login-trigger'))actions.insertAdjacentHTML('afterbegin',(window.GOB_SIGNED_IN?'<a class="login-trigger" href="/account">Account</a>':'<a class="login-trigger" href="login.html">Log in</a>'));actions.querySelector('.icon-btn')?.remove();const jar=actions.querySelector('.cart-trigger');if(jar&&!jar.dataset.jarReady){jar.dataset.jarReady='true';jar.setAttribute('aria-label','Open treat jar');jar.innerHTML='<svg class="jar-icon" viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M9 8V5h14v3M7 9h18l2 22H5L7 9Z" stroke="currentColor" stroke-width="2"/><path d="M10 16h12M11 21h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="sr-only">Treat jar, </span><span class="jar-count" data-cart-count>0</span>'}if(!document.querySelector('link[data-gob-header]')){const styles=document.createElement('link');styles.rel='stylesheet';styles.href='header.css?v=header-4';styles.dataset.gobHeader='true';document.head.append(styles)}}
function setupAnnouncement(){const bar=document.querySelector('.notice'),text=bar?.querySelector('span');if(!bar||!text||bar.dataset.ready)return;bar.dataset.ready='true';const copy=()=> 'Free shipping on every order • Pay online & get ₹30 off • MEGA20: 20% off ₹2,199+';bar.innerHTML='<div class="notice-track"><span></span></div>';const label=bar.querySelector('.notice-track span'),paint=()=>label.textContent=copy();paint()}
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

// Pack aliases keep a selected pack priced correctly in the bag, but they are
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
// saved bag (TOKEN.c also applies the bag's coupon), then reloads cleanly.
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
  const tickerCopy = 'Free delivery across India · ₹30 off when you pay online';

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
    loyaltySummary: phone => request('/public-loyalty-summary', { method: 'POST', body: JSON.stringify({ phone }) }),
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
document.addEventListener('DOMContentLoaded',()=>{const root=document.querySelector('#liveCatalog');if(!root)return;const filters=document.querySelector('#catalogFilters');let category='All';const render=cat=>{category=cat;const items=window.GOB_LIVE_CATALOG.filter(x=>cat==='All'||x.c===cat);root.innerHTML=items.map((x,i)=>{const sale=Number(x.cp)>Number(x.p);const price=x.p?`${sale?`<span class="catalog-price"><s>₹${x.cp}</s><strong>₹${x.p}</strong></span>`:`₹${x.p}`}`:'Ask us';return `<article class="product-card">${sale?'<span class="sale-badge">Sale</span>':''}<a href="${x.id?'product.html?catalog='+x.id:'contact.html'}"><div class="product-image ${i%3===0?'cream':i%3===1?'sage':'brown'}"><img src="${x.i}" alt="${x.n} natural dog treat" width="600" height="600" loading="lazy" decoding="async"></div></a><div class="card-copy"><p class="tag">${x.c}</p><h3>${x.n}</h3><p class="catalog-desc">${x.d}</p><div class="card-bottom"><span>${x.w} · ${price}</span>${x.id?`<button class="quick-add" aria-label="Add ${x.n} to bag">+</button>`:`<a class="catalog-link" href="contact.html">Ask us</a>`}</div></div></article>`}).join('');root.querySelectorAll('.quick-add').forEach((button,index)=>button.addEventListener('click',()=>addToCart(items[index].id)))};const renderFilters=()=>{const categories=['All',...new Set(window.GOB_LIVE_CATALOG.map(x=>x.c))];filters.innerHTML=categories.map(c=>`<button class="filter ${c===category?'selected':''}" data-filter="${c}">${c}</button>`).join('');filters.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{filters.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));button.classList.add('selected');render(button.dataset.filter)}));};renderFilters();render(category);document.addEventListener('gob:catalog-sync',()=>{renderFilters();render(category)})});}
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
/* ===== catalog-enhance.js ===== */
const gobSlug = value => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const gobMethod = product => product.c === 'Jerky' ? ['Slow-dehydrated at 65°C', 'Training rewards & everyday treats'] : product.c === 'Chews & bones' ? ['Slow-dehydrated at 58°C', 'Supervised chew time'] : product.c === 'Organ treats' ? ['Slow-dehydrated at 52–55°C', 'Small, occasional rewards'] : product.c === 'Fish treats' ? ['Slow-dehydrated at low heat', 'High-value treat time'] : product.c === 'Whole prey' ? ['Slow-dehydrated at low heat', 'Supervised treat time'] : ['Curated by the Game of Bones team', 'Discovery and variety'];
const gobProducts = () => typeof GOB_PRODUCTS !== 'undefined' ? GOB_PRODUCTS : (window.GOB_PRODUCTS ||= {});
const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };

function currentProduct() {
  const params = new URLSearchParams(location.search);
  const routeSlug = location.pathname.match(/^\/products\/([^/]+)\/?$/)?.[1];
  const id = params.get('catalog') || params.get('product') || (routeSlug ? decodeURIComponent(routeSlug) : '');
  return id && window.GOB_LIVE_CATALOG.find(item => (item.id || gobSlug(item.n)) === id || gobSlug(item.n) === id);
}

function hydrateCatalogCards(root) {
  root.querySelectorAll('.product-card').forEach(card => {
    const product = window.GOB_LIVE_CATALOG.find(item => item.n === card.querySelector('h3')?.textContent.trim());
    if (!product) return;
    const id = product.id || gobSlug(product.n);
    gobProducts()[id] = { name: product.n, price: Number(product.p) || 0, image: product.i, tag: product.c, catalog_slug: gobSlug(product.n) };
    const link = card.querySelector('a');
    if (link) link.href = `/products/${encodeURIComponent(gobSlug(product.n))}`;
    const image = card.querySelector('.product-image img');
    if (image && product.i) { image.src = product.i; image.alt = product.n; }
    const price = card.querySelector('.card-bottom span');
    if (price) price.textContent = `${product.w || 'Pack'} · ${product.p ? `₹${Number(product.p).toLocaleString('en-IN')}` : 'Ask us'}`;
  });
}

function hydrateProduct() {
  const product = currentProduct();
  if (!product || !document.querySelector('#productName')) return;
  const [method, bestFor] = gobMethod(product);
  const id = product.id || gobSlug(product.n);
  window.GOB_CURRENT_PRODUCT = product;
  const catalogId = window.GOB_META?.productId?.(product, id) || gobSlug(product.n);
  gobProducts()[id] = { name: product.n, price: Number(product.p) || 0, comparePrice: Number(product.cp) || 0, image: product.i, tag: product.c, catalog_slug: catalogId };
  // Crawlable /products/<slug> pages ship hand-written titles, descriptions, canonicals and schema; keep them.
  const staticSeo = /^\/products\/[a-z0-9-]+\/?$/.test(location.pathname) && document.getElementById('gob-static-product-schema');
  if (!staticSeo) document.title = `${product.n} — Game of Bones`;
  const cleanUrl = `https://gameofbones.in/products/${encodeURIComponent(gobSlug(product.n))}`;
  if (!staticSeo) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = cleanUrl;
    window.GOB_SEO?.setProductSchema(product, cleanUrl);
    const description = `${product.n}: ${product.d || 'single-ingredient dog treat from Game of Bones.'}`;
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) { descriptionMeta = document.createElement('meta'); descriptionMeta.name = 'description'; document.head.append(descriptionMeta); }
    descriptionMeta.content = description;
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', cleanUrl);
  }
  setText('#productName', product.n);
  setText('#productPrice', product.p ? `₹${Number(product.p).toLocaleString('en-IN')}` : 'Contact us');
  setText('#productTag', `${product.c} · Made in Kalyan`);
  setText('#productDesc', product.d);
  const contentsSection = document.querySelector('#bundleContents');
  const contentsList = document.querySelector('#bundleContentsList');
  if (contentsSection && contentsList) {
    const contents = Array.isArray(product.contents) ? product.contents : [];
    contentsSection.hidden = contents.length === 0;
    contentsList.replaceChildren(...contents.map(item => {
      const line = document.createElement('li');
      line.textContent = item;
      return line;
    }));
  }
  setText('#inside', `${product.n}. That’s the only ingredient — nothing else is added. A treat, not a complete meal.`);
  setText('#labelIngredient', `${product.n}.`);
  setText('#specMethod', method);
  setText('#specPack', `${product.w} · packed fresh`);
  setText('#specBest', bestFor);
  /* Keep the gallery aligned with the product title immediately; the complete
     admin gallery replaces this single safe fallback as soon as it arrives. */
  if (window.GOB_SET_PRODUCT_MEDIA) {
    if (product.media?.length) window.GOB_SET_PRODUCT_MEDIA(id, product.media);
    else if (!window.GOB_PRODUCT_MEDIA?.[id]?.length && product.i) {
      window.GOB_SET_PRODUCT_MEDIA(id, [{ type: 'image', src: product.i, alt: product.n, label: 'Product photo' }]);
    }
  }
  // Catalog sync may hydrate this page more than once. Send exactly one view
  // event for the product currently represented by this URL.
  if (window.__gobViewContentSlug !== catalogId) {
    window.__gobViewContentSlug = catalogId;
    window.GOB_META?.track('ViewContent', {
      content_ids: [catalogId],
      content_type: 'product',
      content_name: product.n,
      currency: 'INR',
      value: Number(product.p) || 0,
    });
  }
  document.dispatchEvent(new CustomEvent('gob:product-ready', { detail: { product } }));
}

document.addEventListener('DOMContentLoaded', () => {
  const catalog = document.querySelector('#liveCatalog');
  if (catalog) {
    hydrateCatalogCards(catalog);
    new MutationObserver(() => hydrateCatalogCards(catalog)).observe(catalog, { childList: true, subtree: true });
  }
  hydrateProduct();
});
document.addEventListener('gob:catalog-sync', () => {
  const catalog = document.querySelector('#liveCatalog');
  if (catalog) hydrateCatalogCards(catalog);
  hydrateProduct();
});
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
/* ===== product-context.js ===== */
/* Keep the explanatory product-page copy aligned with the active catalogue item. */
(() => {
  const firstPack = product => Array.isArray(product?.packs) && product.packs.length
    ? product.packs[0]
    : { label: '1 pack', weight: product?.w || '', price: product?.p || 0 };

  const squash = value => String(value || '').toLowerCase().replace(/\s+/g, '');
  // Describe where each product's single ingredient comes from, by protein.
  const sourceFor = product => {
    const text = `${product.n} ${product.c}`.toLowerCase();
    if (/bundle|box/.test(text)) return 'Our single-ingredient range, mixed';
    if (/fish|anchov|sardine|mackerel|tuna|bombay duck|prawn|shrimp/.test(text)) return 'Indian coastal fish & seafood';
    if (/quail/.test(text)) return 'Indian quail farms';
    if (/buff/.test(text)) return 'Indian buffalo meat';
    if (/goat/.test(text)) return 'Indian goat farms';
    if (/chicken/.test(text)) return 'Indian poultry farms';
    return 'Sourced in India';
  };

  const apply = product => {
    if (!product?.n) return;
    const pack = firstPack(product);
    const packText = [pack.label, squash(pack.weight) !== squash(pack.label) ? pack.weight : ''].filter(Boolean).join(' · ') || 'resealable pack';
    const journeySource = document.querySelector('.product-journey .spec-grid .spec:nth-child(1) strong');
    const journeyPack = document.querySelector('.product-journey .spec-grid .spec:nth-child(3) strong');
    const journeyUse = document.querySelector('.product-journey .spec-grid .spec:nth-child(4) strong');
    const labelCopy = document.querySelector('.label-test .label-copy > p:not(.eyebrow)');
    const serveCopy = document.querySelector('.serve-copy > p:not(.eyebrow)');
    if (journeySource) journeySource.textContent = sourceFor(product);
    if (journeyPack) journeyPack.textContent = `${packText} · vacuum-sealed`;
    if (journeyUse) journeyUse.textContent = /chew|bone|feet|neck|wing|trotter|trachea|ear/i.test(`${product.n} ${product.c}`) ? 'Supervised chew time' : 'Training rewards & everyday treats';
    if (labelCopy) labelCopy.textContent = `There is no long ingredient list to interpret. For ${product.n}, the named ingredient is the complete label. Nothing else is added.`;
    if (serveCopy) serveCopy.textContent = `Offer ${product.n} as a treat alongside a complete and balanced diet. Start with a small amount when introducing anything new, make fresh water available, and supervise every dog while treating.`;
  };

  document.addEventListener('gob:product-ready', event => apply(event.detail?.product));
  document.addEventListener('DOMContentLoaded', () => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      apply(window.GOB_CURRENT_PRODUCT);
      attempts += 1;
      if (window.GOB_CURRENT_PRODUCT || attempts >= 20) window.clearInterval(timer);
    }, 100);
  });
})();
;
/* ===== product-packs.js ===== */
/* Product purchase controls. Kept in an external file so Vercel's security
   policy can run it consistently on every product page. */
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const routeSlug = location.pathname.match(/^\/products\/([^/]+)\/?$/)?.[1];
    const requestedProductId = params.get('catalog') || params.get('product') || (routeSlug ? decodeURIComponent(routeSlug) : '') || 'chicken-jerky';
    const legacyProductId = { 'chicken-jerky': 'jerky', 'goat-trachea': 'trachea', 'goat-trotter': 'trotter' }[requestedProductId] || requestedProductId;
    const fallback = {
      jerky: { n: 'Chicken Jerky', c: 'Jerky', w: '70 g', p: 329, i: 'assets/chicken-jerky-pouch.webp', id: 'jerky', packs: [{ label: '1 pouch', weight: '70 g', price: 329 }, { label: '2 pouches', weight: '140 g', price: 658 }, { label: '3 pouches', weight: '210 g', price: 987 }, { label: '4 pouches', weight: '280 g', price: 1316 }] },
      trachea: { n: 'Goat Trachea', c: 'Chews & bones', w: '60 g', p: 100, i: 'assets/goat-trachea-pouch.webp', id: 'trachea' },
      trotter: { n: 'Goat Trotter', c: 'Chews & bones', w: '60 g', p: 250, i: 'assets/goat-trotter-plate.webp', id: 'trotter' },
    }[legacyProductId];
    const packOptions = document.querySelector('#packOptions');
    const addButton = document.querySelector('#addProduct');
    if (!packOptions || !addButton) return;

    let quantity = 1;
    let selectedPack = 0;
    const format = value => Number(value || 0).toLocaleString('en-IN');
    const packsFor = product => Array.isArray(product?.packs) && product.packs.length ? product.packs : [{ label: '1 pouch', weight: product?.w || '', price: Number(product?.p) || 0 }];
    const comparePriceFor = (pack, product) => Number(pack?.compare_price || pack?.comparePrice || product?.cp || product?.compare_price || 0);
    // Many catalogue packs store the same text as label and weight ("60 g" / "60 g").
    // Show the weight only when it adds information.
    const squash = value => String(value || '').toLowerCase().replace(/\s+/g, '');
    const extraWeight = pack => pack?.weight && !squash(pack.label).includes(squash(pack.weight)) ? pack.weight : '';
    const onSale = (pack, product) => Number(pack?.price || 0) > 0 && comparePriceFor(pack, product) > Number(pack?.price || 0);

    function render(product) {
      if (!product) return;
      const packs = packsFor(product);
      selectedPack = Math.min(selectedPack, packs.length - 1);
      packOptions.innerHTML = packs.map((pack, index) => {
        const comparePrice = comparePriceFor(pack, product);
        const priceText = onSale(pack, product)
          ? `<s>₹${format(comparePrice)}</s> <strong>₹${format(pack.price)}</strong>`
          : `₹${format(pack.price)}`;
        return `<button class="option${index === selectedPack ? ' selected' : ''}" type="button">${pack.label}<small>${extraWeight(pack) || 'Pack'} · ${priceText}</small></button>`;
      }).join('');

      const choose = index => {
        selectedPack = index;
        const pack = packs[index];
        packOptions.querySelectorAll('.option').forEach((button, buttonIndex) => button.classList.toggle('selected', buttonIndex === index));
        addButton.textContent = `Add to treat jar · ₹${format(pack.price)}`;
        const stickyPrice = document.querySelector('#stickyPrice');
        const stickyLabel = document.querySelector('#stickyPackLabel');
        if (stickyPrice) stickyPrice.textContent = `₹${format(pack.price)}`;
        if (stickyLabel) stickyLabel.textContent = extraWeight(pack) ? `${pack.label} · ${extraWeight(pack)}` : pack.label;
      };

      packOptions.querySelectorAll('.option').forEach((button, index) => button.addEventListener('click', () => choose(index)));
      choose(selectedPack);
      document.querySelector('#restockGuidanceProduct')?.remove();
      document.querySelector('#restockNotifyProduct')?.remove();
      const guidance = document.createElement('aside');
      guidance.id = 'restockGuidanceProduct'; guidance.className = 'restock-notify-area';
      guidance.setAttribute('aria-label', 'Fresh stock notifications');
      guidance.innerHTML = '<strong>Fresh batches, every day</strong><span>We make fresh batches of treats every day. If a treat is out of stock or you would like more, tap <b>Notify me</b> on that treat and enter your email address or mobile number. We’ll let you know as soon as it is freshly stocked.</span>';
      addButton.insertAdjacentElement('afterend', guidance);
      if (product.low_stock) {
        const restockArea = document.createElement('aside');
        restockArea.id = 'restockNotifyProduct'; restockArea.className = 'restock-notify-area';
        restockArea.innerHTML = '<strong>This treat is running low</strong><span>Get a quick heads-up when the next fresh batch is ready.</span>';
        const restock = document.createElement('button');
        restock.type = 'button'; restock.className = 'restock-notify-button';
        restock.dataset.restockProduct = encodeURIComponent(String(product.inventory_id || product.id || requestedProductId));
        restock.dataset.restockName = encodeURIComponent(String(product.n || 'this treat'));
        restock.textContent = 'Notify me when fresh stock is ready';
        restockArea.append(restock);
        guidance.insertAdjacentElement('afterend', restockArea);
      }
      addButton.onclick = () => {
        const pack = packs[selectedPack];
        const catalogId = window.GOB_META?.productId?.(product, requestedProductId) || String(requestedProductId || '');
        const cartId = selectedPack === 0 ? catalogId : `${catalogId}-pack-${selectedPack + 1}`;
        GOB_PRODUCTS[cartId] = { name: `${product.n} — ${pack.label}`, price: Number(pack.price) || 0, comparePrice: Number(pack.compare_price) || Number(product.cp) || 0, image: product.i, tag: `${product.c} · ${pack.weight || pack.label || 'Pack'}`, packLabel: pack.label || '', catalog_slug: catalogId };
        addToCart(cartId, quantity);
      };
    }

    document.querySelector('#minus')?.addEventListener('click', () => {
      quantity = Math.max(1, quantity - 1);
      document.querySelector('#quantity').textContent = String(quantity);
    });
    document.querySelector('#plus')?.addEventListener('click', () => {
      quantity += 1;
      document.querySelector('#quantity').textContent = String(quantity);
    });
    // Single handler: other scripts also assign onclick, so assign (not add) to avoid adding twice.
    const stickyAdd = document.querySelector('#stickyAdd');
    if (stickyAdd) stickyAdd.onclick = () => addButton.click();

    render(window.GOB_CURRENT_PRODUCT || fallback);
    document.addEventListener('gob:product-ready', event => render(event.detail.product));
  });
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
/* ===== bogo-promo.js ===== */
/* Buy 1 Get 1 is automatic for the two selected treats. The checkout service
   remains authoritative for the discount and exclusivity rules. */
(() => {
  const eligible = value => ['chicken feet', 'chicken neck'].includes(String(value || '').replace(/\s+—\s+.+$/, '').trim().toLowerCase());
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
/* ===== catalog-purchase.js ===== */
document.addEventListener('DOMContentLoaded',()=>{const id=new URLSearchParams(location.search).get('catalog');if(!id)return;const product=window.GOB_LIVE_CATALOG?.find(item=>(item.id||gobSlug(item.n))===id);if(!product)return;document.querySelector('#packValue').hidden=true;document.querySelector('#stickyPrice').textContent=product.p?`₹${product.p}`:'Ask us';document.querySelector('#stickyPackLabel').textContent=product.w||'Single pack';document.querySelector('#stickyAdd').textContent=product.p?'Add to jar':'Ask us'});
;
/* ===== product-loyalty.js ===== */
function installProductLoyalty(){const buy=document.querySelector('.buy-row');if(!buy||document.querySelector('.product-loyalty'))return;buy.insertAdjacentHTML('afterend','<aside class="product-loyalty" aria-live="polite"><span class="loyalty-mark" aria-hidden="true">G</span><span><small>Game of Bones rewards</small><strong>Earn <b data-product-points>0</b> points with this order</strong><em>1 point for every ₹10 spent · redeem on a future order</em></span></aside>');const update=()=>{const price=Number((document.querySelector('#productPrice')?.textContent||'0').replace(/[^0-9.]/g,'')),qty=Number(document.querySelector('#quantity')?.textContent||1);document.querySelectorAll('[data-product-points]').forEach(el=>el.textContent=Math.floor(price*qty/10).toLocaleString('en-IN'))};document.querySelectorAll('.option,#minus,#plus').forEach(el=>el.addEventListener('click',()=>setTimeout(update,0)));new MutationObserver(update).observe(document.querySelector('#productPrice'),{childList:true,subtree:true,characterData:true});new MutationObserver(update).observe(document.querySelector('#quantity'),{childList:true,subtree:true,characterData:true});update()}
document.addEventListener('DOMContentLoaded',installProductLoyalty)
;
/* ===== product-media.js ===== */
/* Per-product media accepts up to six items: five photos plus one video, or any other mix. */
window.GOB_PRODUCT_MEDIA = window.GOB_PRODUCT_MEDIA || {
  jerky: [
    { type: 'image', src: 'https://gameofbones.in/assets/catalogue-plates/chicken-jerky.webp', alt: 'Chicken Jerky front pack', label: 'Front pack' },
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/293b7ba0-37a7-4626-b97e-0f6aa8d86fa4/image-1-1782712557758.png', alt: 'Chicken Jerky product photo 2', label: 'Product photo 2' },
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/293b7ba0-37a7-4626-b97e-0f6aa8d86fa4/image-2-1782712480316.png', alt: 'Chicken Jerky product photo 3', label: 'Product photo 3' },
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/293b7ba0-37a7-4626-b97e-0f6aa8d86fa4/image-3-1782712483596.png', alt: 'Chicken Jerky product photo 4', label: 'Product photo 4' },
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/293b7ba0-37a7-4626-b97e-0f6aa8d86fa4/image-4-1782797388440.png', alt: 'Chicken Jerky product photo 5', label: 'Product photo 5' }
  ],
  'chicken-bones': [
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/937c9539-b00d-4e93-9291-1af00893a061/image-0-1782712130859.png', alt: 'Chicken Bones', label: 'Product photo 1' },
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/937c9539-b00d-4e93-9291-1af00893a061/image-2-1782797344360.png', alt: 'Chicken Bones product information', label: 'Product photo 2' }
  ]
}

function productMediaId(){
  const params=new URLSearchParams(location.search)
  const routeSlug=location.pathname.match(/^\/products\/([^/]+)\/?$/)?.[1]
  // Product detail pages have clean URLs in production. The old query-only
  // lookup silently treated every clean URL as Chicken Jerky.
  return params.get('catalog')||params.get('product')||(routeSlug?decodeURIComponent(routeSlug):'jerky')
}
function galleryMedia(){
  const id=productMediaId(),configured=window.GOB_PRODUCT_MEDIA[id]
  if(configured?.length)return configured.slice(0,6)
  const image=document.querySelector('#productImage')
  return image?[{type:'image',src:image.src,alt:image.alt,label:'Product photo'}]:[]
}
function renderProductMedia(){
  const thumbs=document.querySelector('#productMediaThumbs'),stage=document.querySelector('#productMediaStage'),count=document.querySelector('#productMediaCount')
  if(!thumbs||!stage)return
  const media=galleryMedia(); if(!media.length)return
  const select=index=>{
    const item=media[index]
    thumbs.querySelectorAll('.thumb').forEach((button,buttonIndex)=>{button.classList.toggle('active',buttonIndex===index);button.setAttribute('aria-pressed',String(buttonIndex===index))})
    if(item.type==='video'){
      stage.innerHTML=item.src?`<video controls playsinline poster="${item.poster||''}" aria-label="${item.alt||item.label}"><source src="${item.src}"></video>`:`<div class="media-video-poster"><img src="${item.poster||''}" alt="${item.alt||item.label||'Product video preview'}"><span aria-hidden="true">▶</span><strong>Product video</strong><small>Video slot ready for upload</small></div>`
    }else stage.innerHTML=`<img id="productImage" src="${item.src}" alt="${item.alt||item.label||'Product photo'}" width="1000" height="1000" decoding="async" fetchpriority="high">`
    count.textContent=`${index+1} of ${media.length} media`
  }
  thumbs.innerHTML=media.map((item,index)=>`<button class="thumb media-thumb${index===0?' active':''}" type="button" aria-pressed="${index===0}" aria-label="View ${item.label||`media ${index+1}`}"><img src="${item.type==='video'?(item.poster||''):item.src}" alt="" width="120" height="120" loading="lazy" decoding="async"><span>${item.type==='video'?'▶':''}</span></button>`).join('')
  thumbs.querySelectorAll('.thumb').forEach((button,index)=>button.addEventListener('click',()=>select(index)))
  select(0)
}
document.addEventListener('DOMContentLoaded',renderProductMedia)
window.GOB_SET_PRODUCT_MEDIA=(id,items)=>{
  if(!id||!Array.isArray(items)||!items.length)return
  window.GOB_PRODUCT_MEDIA[id]=items.slice(0,6)
  if(productMediaId()===id&&document.readyState!=='loading')renderProductMedia()
}
window.GOB_RENDER_PRODUCT_MEDIA=renderProductMedia
;
/* ===== product-benefits.js ===== */
const benefitProfile=()=>{const name=document.querySelector('#productName')?.textContent.trim()||'this treat',tag=document.querySelector('#productTag')?.textContent||'';const lower=`${name} ${tag}`.toLowerCase();const isChew=/trachea|trotter|feet|neck|ear|bone|wing/.test(lower),isTraining=/jerky|bite|gizzard|heart|liver|lung|spleen|anchov|sardine|prawn|fish|tuna|mackerel/.test(lower);return{ingredient:document.querySelector('#inside')?.textContent.replace(/That’s it\.|This product.*$/,'').trim()||name,role:isChew?'A supervised chew-time activity for dogs that enjoy working through a firmer texture.':isTraining?'A high-value treat option for rewards, recall practice, scent games or simply a small moment together.':'An occasional single-ingredient treat to use within your dog’s usual complete, balanced diet.',texture:isChew?'Firm texture means slower chewing for many dogs—always choose a size that matches your dog and supervise.':isTraining?'Break or portion it to suit the moment; a smaller reward is often enough for repeat training.':'Serve in dog-appropriate pieces and introduce new treats gradually.',note:isChew?'Not a dental treatment and not for unsupervised chewing. Remove small end pieces if they could become a choking risk.':'Treats are not a complete meal or a substitute for veterinary advice.'}};
function renderProductBenefits(){const anchor=document.querySelector('.delivery');if(!anchor||document.querySelector('.benefit-panel'))return;const b=benefitProfile();anchor.insertAdjacentHTML('afterend',`<section class="benefit-panel" aria-labelledby="benefitTitle"><div class="benefit-intro"><p class="eyebrow">Why this treat, in plain language</p><h2 id="benefitTitle">A clear role in your dog’s <span class="accent">treat routine.</span></h2><p>What it is, when it fits and how to use it well.</p></div><div class="benefit-grid"><article><span class="benefit-icon" aria-hidden="true">01</span><h3>What’s in it</h3><p><strong>${b.ingredient}</strong> The simple ingredient list helps you know exactly what you are offering. It is not a complete and balanced meal.</p></article><article><span class="benefit-icon" aria-hidden="true">02</span><h3>When it fits</h3><p>${b.role}</p></article><article><span class="benefit-icon" aria-hidden="true">03</span><h3>How to use it well</h3><p>${b.texture}</p></article></div><div class="benefit-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm0 5v5m0 3h.01"/></svg><p><strong>Good to know:</strong> ${b.note} Keep fresh water available. If your dog has a medical condition, dietary sensitivity, or prescribed diet, check with your veterinarian before introducing a new treat.</p></div></section>`)}
document.addEventListener('DOMContentLoaded',renderProductBenefits);
/* The purchase column stays concise; the editorial explainer belongs below the hero. */
document.addEventListener('DOMContentLoaded',()=>{const panel=document.querySelector('.benefit-panel'),detail=document.querySelector('.detail');if(panel&&detail)detail.insertAdjacentElement('afterend',panel)});
;
/* ===== nutrient-profile.js ===== */
function nutrientContext(){const name=document.querySelector('#productName')?.textContent.trim()||'this treat',tag=document.querySelector('#productTag')?.textContent||'';const key=`${name} ${tag}`.toLowerCase();if(/fish|anchov|mackerel|sardine|tuna|prawn|bombay duck/.test(key))return{title:'Fish ingredient profile',items:[['Animal-source protein','Naturally present in fish'],['Naturally occurring fats','The type and amount vary by fish and batch'],['Marine micronutrients','Nutrient content varies by species and processing']],note:'Fish can be a useful source of dietary variety. This treat is not a fish-oil supplement or a complete diet.'};if(/liver|heart|kidney|gizzard|spleen|lung|organ/.test(key))return{title:'Organ ingredient profile',items:[['Animal-source protein','Naturally present in organ meat'],['Naturally occurring micronutrients','Levels vary by organ and batch'],['Rich flavour','Useful as a small, high-value reward']],note:'Organ treats are best used in small portions alongside a complete and balanced diet.'};if(/trachea|trotter|feet|neck|wing|bone|ear|chew/.test(key))return{title:'Chew ingredient profile',items:[['Animal-source protein','Naturally present in the ingredient'],['Connective tissue','Texture comes from the ingredient itself'],['Mineral content','Varies by the edible parts and batch']],note:'A chew is an activity and treat—not a dental treatment or a replacement for veterinary dental care.'};return{title:'Muscle-meat ingredient profile',items:[['Animal-source protein','Naturally present in the named meat'],['Fat content','Varies by cut and batch'],['Single ingredient','No filler is listed in this recipe']],note:'Use as a treat or training reward, not as a complete and balanced meal.'}}
function renderNutrientProfile(){const target=document.querySelector('.benefit-panel');if(!target||document.querySelector('.nutrient-panel'))return;const profile=nutrientContext();target.insertAdjacentHTML('afterend',`<section class="nutrient-panel" aria-labelledby="nutrientTitle"><div class="nutrient-heading"><p class="eyebrow">Nutrient profile</p><h2 id="nutrientTitle">What the ingredient <span class="accent">naturally brings.</span></h2><p>${profile.title}. These are ingredient-level characteristics, not guaranteed percentages for this individual pouch.</p></div><div class="nutrient-grid">${profile.items.map(([label,value])=>`<article><small>${label}</small><strong>${value}</strong></article>`).join('')}</div><div class="analysis-note"><span>Transparency note</span><p>${profile.note}</p></div></section>`)}
document.addEventListener('DOMContentLoaded',renderNutrientProfile);
;
/* ===== pincode-checker.js ===== */
function setupPincodeChecker(){
  const form=document.querySelector('#pincodeForm'),input=document.querySelector('#pincodeInput'),result=document.querySelector('#pincodeResult')
  if(!form||!input||!result)return
  input.addEventListener('input',()=>{
    input.value=input.value.replace(/\D/g,'').slice(0,6)
    result.className='pincode-result'
    result.textContent=input.value.length===6?'Ready to check live Delhivery delivery.':'Enter your six-digit Indian PIN code.'
  })
  form.addEventListener('submit',async event=>{
    event.preventDefault()
    const pin=input.value
    if(!/^[1-9]\d{5}$/.test(pin)){
      result.className='pincode-result error';result.textContent='Please enter a valid six-digit Indian PIN code.';input.focus();return
    }
    result.className='pincode-result checking';result.textContent='Checking Delhivery serviceability and delivery estimate…'
    try{
      const delivery=window.GOB_PINCODE_CHECKER?await window.GOB_PINCODE_CHECKER(pin):null
      if(delivery?.serviceable){
        result.className='pincode-result success'
        const place=[delivery.city,delivery.state].filter(Boolean).join(', ')
        const payment=delivery.cod?'COD available.':delivery.prepaid?'Prepaid delivery available.':'Payment availability confirmed at checkout.'
        result.textContent=`Delhivery delivers${place?` to ${place}`:''}. ${delivery.dispatch||'Dispatches in 1–2 working days'} · estimated arrival ${delivery.eta||'will be confirmed at checkout'}. ${payment}`
        return
      }
      if(delivery&&!delivery.serviceable){
        result.className='pincode-result error';result.textContent='Delhivery does not currently service this PIN code. Please try another address or contact us on WhatsApp.';return
      }
      throw new Error('Delivery lookup unavailable')
    }catch{
      result.className='pincode-result error';result.textContent='Live Delhivery delivery lookup is temporarily unavailable. Please try again shortly.'
    }
  })
}
document.addEventListener('DOMContentLoaded',setupPincodeChecker)
;
/* ===== key-benefits.js ===== */
function keyBenefitContent(){const name=document.querySelector('#productName')?.textContent.trim()||'This treat',tag=document.querySelector('#productTag')?.textContent||'';const key=`${name} ${tag}`.toLowerCase();if(/fish|anchov|mackerel|sardine|tuna|prawn|bombay duck/.test(key))return[['Naturally occurring marine fats','Oily fish can contain omega-3 fats; the exact EPA/DHA amount needs a batch analysis.'],['Animal-source protein','Fish contributes protein as part of your dog’s overall balanced diet.'],['High-value aroma','Aromatic fish can make a small reward especially engaging for training.']];if(/trachea|trotter|feet|neck|wing|bone|ear|chew/.test(key))return[['Cartilage & connective tissue','These naturally occur in the named chew; this is not a joint or dental treatment.'],['Chewing enrichment','A firmer texture can create a longer, supervised treat-time activity.'],['Animal-source protein','The ingredient contributes protein within a complete, balanced feeding plan.']];if(/liver|heart|kidney|gizzard|spleen|lung|organ/.test(key))return[['Naturally occurring micronutrients','Organ meats can contain vitamins and minerals; the exact profile varies by organ and batch.'],['Animal-source protein','A concentrated ingredient to use in small portions within a balanced diet.'],['High-value reward','The rich flavour and aroma can make a tiny piece feel special in training.']];return[['Animal-source protein','The named meat contributes protein within your dog’s complete, balanced diet.'],['Simple ingredient list','One clear ingredient means no filler or flavouring is listed to decode.'],['Reward-ready texture','Use small pieces for training, recall and everyday positive reinforcement.']];}
function renderKeyBenefits(){const chips=document.querySelector('.chip-row'),checker=document.querySelector('.pincode-checker'),whats=document.querySelector('.whats');if(checker&&whats)whats.before(checker);if(!chips||document.querySelector('.key-benefits'))return;const items=keyBenefitContent();chips.insertAdjacentHTML('afterend',`<section class="key-benefits" aria-labelledby="keyBenefitsTitle"><div class="key-benefits-head"><span class="benefit-paw" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 10c-1.3-2.6-4-2.2-4 0 0 2.8 2.3 3.1 4 1.5M16 10c1.3-2.6 4-2.2 4 0 0 2.8-2.3 3.1-4 1.5M10 6c0-3.2 4-3.2 4 0M8 18c0-2.7 8-2.7 8 0 0 2-1.8 3-4 3s-4-1-4-3Z"/></svg></span><div><p class="eyebrow">Key benefits</p><h2 id="keyBenefitsTitle">Why dog parents choose it.</h2></div></div><div class="key-benefit-list">${items.map((item,index)=>`<article><span>0${index+1}</span><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('')}</div></section>`)}
document.addEventListener('DOMContentLoaded',renderKeyBenefits);
/* Move the three benefit cards out of the purchase decision column. */
document.addEventListener('DOMContentLoaded',()=>{const panel=document.querySelector('.key-benefits'),detail=document.querySelector('.detail');if(panel&&detail)detail.insertAdjacentElement('afterend',panel)});
;
/* ===== product-hero.js ===== */
/* Product page "first screen": the facts, proof and a real treat-time clip a shopper
   needs in the first few seconds, placed right under the price (moves with the price
   into the mobile head). Pack sizes match the admin product record; review quotes come
   only from published, verified reviews. */
(() => {
  if (window.__gobProductHero) return;
  window.__gobProductHero = true;
  if (!document.querySelector('script[src*="product-why.js"]')) { const w = document.createElement('script'); w.src = '/product-why.js?v=1'; w.defer = true; document.head.append(w); }

  // pack = first pack the page sells · best = what it is for · dogs = who it suits · clip = treat-time video
  const FACTS = {
    'chicken-jerky':        { pack: '60 g pouch', best: 'Training & everyday rewards', dogs: 'All sizes · breaks into small bites', clip: 'train' },
    'chicken-bites':        { pack: '60 g pouch', best: 'Training rewards on the go', dogs: 'All sizes · ready-cut bites', clip: 'train' },
    'buff-jerky':           { pack: '60 g pouch', best: 'Picky eaters & chicken-sensitive dogs', dogs: 'All sizes · break for small dogs', clip: 'train' },
    'chicken-feet':         { pack: '70 g pouch · Buy 1 Get 1', best: 'Short, crunchy chew', dogs: 'Small to large dogs', clip: 'chew-feet' },
    'chicken-neck':         { pack: '70 g pouch · Buy 1 Get 1', best: 'Crunchy chew', dogs: 'Medium & large dogs', clip: 'chew-neck' },
    'chicken-wings':        { pack: '5 pieces', best: 'Crunchy chew', dogs: 'Medium & large dogs', clip: 'chew-neck' },
    'chicken-wing-tips':    { pack: '100 g pouch', best: 'Light crunchy chew', dogs: 'Small & medium dogs', clip: 'chew-feet' },
    'chicken-bones':        { pack: '100 g pouch', best: 'Crunchy chew', dogs: 'Medium & large dogs', clip: 'chew-trotter' },
    'goat-trotter':         { pack: '1 piece', best: 'Long-lasting chew', dogs: 'Medium & large dogs', clip: 'chew-trotter' },
    'goat-trachea':         { pack: '1 piece', best: 'Long, crunchy chew', dogs: 'All sizes · supervise', clip: 'chew-trotter' },
    'goat-ear':             { pack: '6 pieces', best: 'Quick, crunchy chew', dogs: 'All sizes', clip: 'chew-feet' },
    'chicken-gizzards':     { pack: '60 g pouch', best: 'High-value rewards', dogs: 'All sizes · small portions', clip: 'bowl' },
    'chicken-heart-liver':  { pack: '60 g pouch', best: 'High-value rewards', dogs: 'All sizes · small portions', clip: 'bowl' },
    'goat-liver':           { pack: '60 g pouch', best: 'High-value rewards', dogs: 'All sizes · small portions', clip: 'bowl' },
    'goat-lungs':           { pack: '60 g pouch', best: 'Light, airy rewards', dogs: 'All sizes · good for small dogs', clip: 'bowl' },
    'goat-heart-kidney-mix':{ pack: '60 g pouch', best: 'High-value rewards', dogs: 'All sizes · small portions', clip: 'bowl' },
    'goat-spleen':          { pack: '60 g pouch', best: 'High-value rewards', dogs: 'All sizes · small portions', clip: 'bowl' },
    'anchovies':            { pack: '60 g pouch', best: 'Small, crunchy fish treat', dogs: 'Dogs & cats · all sizes', clip: 'cat-bite' },
    'sardines':             { pack: '60 g pouch', best: 'Fish treat for picky eaters', dogs: 'Dogs & cats · all sizes', clip: 'cat-fish' },
    'white-sardines':       { pack: '60 g pouch', best: 'Fish treat for picky eaters', dogs: 'Dogs & cats · all sizes', clip: 'cat-fish' },
    'bombay-duck':          { pack: '60 g pouch', best: 'Light, crunchy fish treat', dogs: 'Dogs & cats · all sizes', clip: 'cat-fish' },
    'tuna':                 { pack: '60 g pouch', best: 'Lean fish reward', dogs: 'Dogs & cats · all sizes', clip: 'cat-bite' },
    'mackerel-fillet':      { pack: '60 g pouch', best: 'Boneless fish reward', dogs: 'Dogs & cats · all sizes', clip: 'cat-bite' },
    'whole-mackerel':       { pack: '100 g pouch', best: 'Whole fish chew', dogs: 'Medium & large dogs', clip: 'bowl' },
    'prawns':               { pack: '60 g pouch', best: 'Crunchy special treat', dogs: 'Dogs & cats · all sizes', clip: 'cat-bite' },
    'whole-quail':          { pack: '1 piece', best: 'Whole-prey chew', dogs: 'Medium & large dogs', clip: 'quail' },
    'cat-trial-box':        { pack: '130 g · 5 fish treats', best: 'Trying what your cat likes', dogs: 'Cats', clip: 'cat-fish' },
    'small-treat-box':      { pack: '9 mini packs · 120 g+', best: 'Finding your dog’s favourite', dogs: 'All sizes', clip: 'bowl' },
    'medium-treat-box':     { pack: '7 full packs · 360 g+', best: 'A month of variety', dogs: 'All sizes', clip: 'bowl' },
    'large-treat-box':      { pack: '10 full packs · 700 g+', best: 'Multi-dog homes & gifting', dogs: 'All sizes', clip: 'bowl' },
    'surprise-me-box':      { pack: '200 g assorted', best: 'A surprise mix to try', dogs: 'All sizes', clip: 'bowl' },
  };
  window.GOB_HERO_FACTS = FACTS;

  const slug = () => {
    const m = location.pathname.match(/\/products\/([a-z0-9-]+)/);
    if (m) return m[1].replace('chicken-heart-and-liver', 'chicken-heart-liver').replace('goat-heart-and-kidney-mix', 'goat-heart-kidney-mix');
    const name = document.querySelector('#productName')?.textContent || '';
    return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      .replace('chicken-heart-and-liver', 'chicken-heart-liver').replace('goat-heart-and-kidney-mix', 'goat-heart-kidney-mix');
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const css = `
  .gob-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0 4px}
  .gob-facts div{background:#fffdf8;border:1px solid rgba(16,44,34,.14);border-radius:10px;padding:7px 8px;min-width:0}
  .gob-facts small{display:block;font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#bd812a;margin-bottom:2px}
  .gob-facts strong{display:block;font-size:12.5px;line-height:1.25;color:#102c22;font-weight:700}
  .gob-quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;margin:12px 0 4px}.gallery .gob-quotes{margin:8px 0 4px}
  .gob-quotes blockquote{margin:0;padding:8px 10px;background:#f7f0e4;border-left:3px solid #bd812a;border-radius:6px;font-size:13px;line-height:1.4;color:#102c22}
  .gob-quotes cite{display:block;margin-top:3px;font-style:normal;font-size:11px;font-weight:700;color:#557064}
  .gob-quotes .gob-stars{color:#bd812a;letter-spacing:1px;margin-right:4px}
  #productMediaStage{position:relative}
  .gob-clip{position:absolute;right:10px;bottom:10px;width:38%;max-width:190px;aspect-ratio:1;border-radius:14px;overflow:hidden;border:3px solid #fffdf8;box-shadow:0 8px 22px rgba(16,44,34,.28);background:#102c22;z-index:3;cursor:pointer}
  .gob-clip video{width:100%;height:100%;object-fit:cover;display:block}
  .gob-clip span{position:absolute;left:0;right:0;bottom:0;padding:3px 6px;font-size:10px;font-weight:800;letter-spacing:.04em;color:#fff;background:linear-gradient(transparent,rgba(16,44,34,.85));text-align:center}
  .gob-clip.is-big{width:92%;max-width:none;right:4%;bottom:4%}
  @media(max-width:760px){.gob-facts strong{font-size:12px}.gob-clip{width:40%}}
  `;

  function ensureStyle() {
    if (document.getElementById('gob-hero-style')) return;
    const s = document.createElement('style'); s.id = 'gob-hero-style'; s.textContent = css; document.head.append(s);
  }

  function renderFacts() {
    const f = FACTS[slug()];
    const price = document.querySelector('#productPrice');
    if (!f || !price) return;
    let box = document.getElementById('gobQuickFacts');
    if (!box) {
      box = document.createElement('div'); box.id = 'gobQuickFacts'; box.className = 'gob-facts';
      // Mobile: price lives in .mobile-buy-head; keep the facts right after it either way.
      price.after(box);
    } else if (box.previousElementSibling !== price && !price.parentElement.contains(box)) {
      price.after(box);
    }
    box.innerHTML = `<div><small>Pack</small><strong>${esc(f.pack)}</strong></div><div><small>Best for</small><strong>${esc(f.best)}</strong></div><div><small>Suits</small><strong>${esc(f.dogs)}</strong></div>`;
  }

  function renderClip() {
    const f = FACTS[slug()];
    const stage = document.querySelector('#productMediaStage');
    if (!f || !f.clip || !stage) return;
    if (stage.querySelector('.gob-clip')) return;
    const wrap = document.createElement('button');
    wrap.type = 'button'; wrap.className = 'gob-clip'; wrap.setAttribute('aria-label', 'Real treat time video — tap to enlarge');
    wrap.innerHTML = `<video src="/assets/treat-clips/${f.clip}.mp4" poster="/assets/treat-clips/${f.clip}.jpg" muted loop playsinline autoplay preload="metadata"></video><span>Real treat time</span>`;
    wrap.addEventListener('click', e => { e.preventDefault(); wrap.classList.toggle('is-big'); });
    stage.append(wrap);
    const v = wrap.querySelector('video'); v.muted = true; v.play?.().catch(() => {});
  }

  let quotesFor = '';
  async function renderQuotes() {
    const name = document.querySelector('#productName')?.textContent?.trim();
    if (!name || !window.GOB_API?.publicProductReviews || quotesFor === name) return;
    quotesFor = name;
    let rows = [];
    try { const data = await window.GOB_API.publicProductReviews(name); rows = Array.isArray(data.reviews) ? data.reviews : []; } catch { rows = []; }
    document.getElementById('gobQuotes')?.remove();
    const picks = rows.filter(r => String(r.review || '').trim().length > 12).slice(0, 2);
    if (!picks.length) return;
    const box = document.createElement('div'); box.id = 'gobQuotes'; box.className = 'gob-quotes';
    box.innerHTML = picks.map(r => {
      const text = String(r.review).replace(/\s+/g, ' ').trim();
      const short = text.length > 110 ? text.slice(0, 107).replace(/\s+\S*$/, '') + '…' : text;
      return `<blockquote><span class="gob-stars" aria-label="${Number(r.rating) || 5} out of 5">${'★'.repeat(Math.max(1, Math.min(5, Number(r.rating) || 5)))}</span>“${esc(short)}”<cite>${esc(r.name || 'Verified dog parent')}</cite></blockquote>`;
    }).join('');
    const desktop = window.matchMedia('(min-width: 761px)').matches;
    const anchor = desktop
      ? (document.getElementById('gobQuickFacts') || document.querySelector('#productPrice'))
      : (document.querySelector('#productMediaCount') || document.querySelector('#productMediaStage') || document.getElementById('gobQuickFacts'));
    anchor?.after(box);
  }

  const NEW_PRODUCTS = new Set(['white-sardines', 'chicken-wing-tips']);
  function renderNewTag() {
    const tag = document.querySelector('#productTag');
    if (!tag || !NEW_PRODUCTS.has(slug()) || tag.querySelector('.gob-new')) return;
    tag.insertAdjacentHTML('afterbegin', '<span class="gob-new" style="display:inline-block;margin-right:8px;padding:3px 8px;border-radius:4px;background:#bd812a;color:#fff;font-size:10px;font-weight:800;letter-spacing:.08em;vertical-align:1px">NEW</span>');
  }
  function run() { ensureStyle(); renderNewTag(); renderFacts(); renderQuotes(); document.querySelectorAll('.gob-clip').forEach(n => n.remove()); }
  const start = () => {
    run();
    setTimeout(run, 600); setTimeout(run, 1800);
    document.addEventListener('gob:product-ready', () => { quotesFor = ''; run(); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
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
        <span>Free shipping across India · plus ₹30 off when you pay online.</span>
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
        <span><b>Free shipping</b><small>Across India</small></span>
        <span><b>₹30 off prepaid</b><small>UPI, cards & wallets</small></span>
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
/* ===== product-layout.js ===== */
/* Keep the product hero focused on media and purchase. Long reference material uses the full page width. */
document.addEventListener('DOMContentLoaded',()=>{
  const detail=document.querySelector('.detail'), accordion=document.querySelector('.product-info .accordion')
  if(!detail||!accordion||accordion.dataset.fullWidth)return
  accordion.dataset.fullWidth='true'
  accordion.classList.add('product-accordion-panel')
  detail.insertAdjacentElement('afterend',accordion)
})
;
/* ===== mobile-buy-summary.js ===== */
/* Mobile product page: ad visitors decide in seconds, so on phones the
   product name, rating and sale price sit above the photo, the gallery is
   tighter, and the sticky purchase bar shows the saving.
   The original elements are moved (not copied), so the single <h1> and every
   id that other scripts update (#productName, #productPrice, ...) stay intact.
   On wider screens they are put back exactly where they came from. */
(() => {
  const mq = window.matchMedia('(max-width: 760px)');

  const style = document.createElement('style');
  style.textContent = `
@media (max-width: 760px) {
  .mobile-buy-head { margin: 0 0 12px; }
  .mobile-buy-head .eyebrow { margin: 0 0 4px; }
  .mobile-buy-head h1 { margin: 0 0 4px; font-size: clamp(32px, 9vw, 40px); line-height: 1.02; }
  .mobile-buy-head .rating { margin: 0 0 8px; }
  .mobile-buy-head .sale-price-presentation, .mobile-buy-head .price { margin: 0; }
  .main-product-image { aspect-ratio: 4 / 3 !important; }
  .gallery .media-count, .gallery .gallery-notes { display: none !important; }
  .gob-back-compact { margin: 0 0 8px !important; }
  .gob-back-compact a { display: inline-block; padding: 6px 0; border: 0 !important; background: none !important; box-shadow: none !important; font-size: 12px; }
  .mobile-purchase-bar .sticky-compare { display: flex; gap: 6px; align-items: baseline; font-size: 12px; line-height: 1.2; }
  .mobile-purchase-bar .sticky-compare s { opacity: .65; }
  .mobile-purchase-bar .sticky-compare b { color: var(--gold, #a8681c); font-weight: 800; }
}`;
  document.head.append(style);

  const head = document.createElement('div');
  head.className = 'mobile-buy-head';
  const moved = new Map();

  function headNodes() {
    const info = document.querySelector('.product-info');
    if (!info) return [];
    return [
      document.querySelector('#productTag'),
      document.querySelector('#productName'),
      info.querySelector(':scope > .rating'),
      document.querySelector('#productPrice'),
      document.querySelector('#salePricePresentation'),
      document.querySelector('#gobQuickFacts'),
    ].filter(node => node && !moved.has(node));
  }

  function backRow() {
    const link = [...document.querySelectorAll('a[href="/products"]')].find(a => /back to all/i.test(a.textContent));
    return link && link.parentElement !== document.body ? link.parentElement : null;
  }

  function place() {
    const gallery = document.querySelector('.detail > .gallery');
    if (!gallery) return;
    if (mq.matches) {
      if (!head.isConnected) gallery.before(head);
      headNodes().forEach(node => {
        const marker = document.createComment('mobile-buy-head');
        node.before(marker);
        moved.set(node, marker);
        head.append(node);
      });
      backRow()?.classList.add('gob-back-compact');
    } else {
      moved.forEach((marker, node) => { if (marker.isConnected) marker.replaceWith(node); });
      moved.clear();
      head.remove();
      backRow()?.classList.remove('gob-back-compact');
    }
  }

  const rupees = text => Number(String(text || '').replace(/[^\d.]/g, '')) || 0;
  const format = value => `₹${Math.round(value).toLocaleString('en-IN')}`;

  function updateStickyCompare() {
    const price = document.querySelector('#stickyPrice');
    if (!price) return;
    let compare = document.querySelector('.mobile-purchase-bar .sticky-compare');
    const option = document.querySelector('#packOptions .option.selected');
    const was = rupees(option?.querySelector('s')?.textContent);
    const now = rupees(option?.querySelector('strong')?.textContent);
    const shown = rupees(price.textContent);
    if (!was || !now || was <= now || !shown) { compare?.remove(); return; }
    const percent = Math.round((1 - now / was) * 100);
    if (!compare) {
      compare = document.createElement('span');
      compare.className = 'sticky-compare';
      price.after(compare);
    }
    const strike = format(was * shown / now);
    const html = `<s aria-label="Was ${strike}">${strike}</s><b>${percent}% off</b>`;
    if (compare.innerHTML !== html) compare.innerHTML = html;
  }

  function init() {
    place();
    updateStickyCompare();
    const info = document.querySelector('.product-info');
    // Sale pricing and catalogue sync can add or replace these elements later.
    if (info) new MutationObserver(() => { if (mq.matches) place(); }).observe(info, { childList: true });
    if (head) new MutationObserver(updateStickyCompare).observe(head, { childList: true, subtree: true, characterData: true });
    const bar = document.querySelector('.mobile-purchase-bar');
    if (bar) new MutationObserver(updateStickyCompare).observe(bar.querySelector('#stickyPrice') || bar, { childList: true, subtree: true, characterData: true });
    const packs = document.querySelector('#packOptions');
    if (packs) new MutationObserver(updateStickyCompare).observe(packs, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  mq.addEventListener?.('change', place);
  document.addEventListener('gob:product-ready', () => { place(); updateStickyCompare(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
;
/* ===== product-v2.js ===== */
/* Product page v2 (mobile first).
   Turns the long product page into: name + what it is + price -> photos -> quick facts ->
   pack choice (with price per 100 g / per piece) -> "before you buy" -> add to jar -> delivery.
   Below: why it's good (product-why.js), then one tidy accordion with label facts, feeding,
   nutrition, storage and delivery, then complementary products.
   Facts come from the printed pouch labels where we have them. Nothing unverified is shown:
   if a measurement or lab value is not known, the line is simply left out.
   Existing purchase controls (#packOptions, #addProduct, sticky bar, PIN check) are reused, never copied. */
(() => {
  if (window.__gobV2) return;
  window.__gobV2 = true;

  const LABEL_FEED = [['Small dog', '2–3 pieces'], ['Medium dog', '3–4 pieces'], ['Large dog', '4–5 pieces']];
  const LABEL_STORE = ['Use within <b>15 days</b> of opening.', 'After opening, keep it in the original pouch or an airtight container.', 'Best before <b>12 months</b> from the month of manufacture (printed on the pack).'];
  const GEN_STORE = ['Keep the pack sealed, cool and dry, away from sunlight.', 'After opening, store in an airtight container and use it up soon.', 'Shelf life: <b>12 months</b> from the date of manufacture (printed on the pack).'];
  const TEN = 'Treats and chews should stay under about 10% of your pet’s daily food.';

  const W = {
    bone: { hard: true, t: 'Contains bone', p: 'A bone-containing chew, not a dental treatment.', li: ['Pieces can injure teeth or cause choking or a tummy upset, so watch the whole time.', 'Not for dogs that gulp. Take it away once it’s small enough to swallow whole.', 'Keep fresh water nearby.'] },
    hard: { hard: true, t: 'Hard chew with bone: read before buying', p: 'Hard chews can crack teeth, and bone pieces can cause choking or a stomach blockage.', li: ['Not for puppies, small dogs, older dogs with worn teeth, or dogs that gulp.', 'Watch the whole time. Take it away when it’s small enough to swallow whole, or if it splinters or gets sharp edges.', 'Not a training treat and not a dental treatment. Ask your vet if you’re unsure.'] },
    chew: { hard: true, t: 'Chew safely', p: 'Every piece is a little different in size and firmness.', li: ['Pick a piece your dog can’t fit fully in its mouth.', 'Watch the whole time and take it away once it’s small enough to swallow.', 'Skip it for dogs that gulp food.'] },
    fish: { hard: false, t: 'Good to know', p: 'Whole fish naturally have small, soft bones. Break larger fish for small dogs and cats, introduce slowly, and keep water nearby. Skip fish if your pet has a fish allergy.' },
    boneless: { hard: false, t: 'Good to know', p: 'Boneless fillet pieces. Break into small pieces for cats and small dogs, introduce slowly, and keep water nearby. Skip fish if your pet has a fish allergy.' },
    fillet: { hard: false, t: 'Good to know', p: 'Fillets are deboned by hand, so the odd tiny bone can remain. Break into small pieces for cats and small dogs, and keep water nearby.' },
    shell: { hard: false, t: 'Good to know', p: 'Shellfish is a common allergen. Offer one piece first and watch for itching or an upset tummy. Supervise while your pet eats.' },
    soft: { hard: false, t: 'Good to know', p: 'Break into small pieces for puppies and small dogs. Introduce slowly, keep water nearby and supervise while treating.' },
    organ: { hard: false, t: 'Good to know', p: 'Organ treats are rich, so a little goes a long way. Start with a few small pieces a day and supervise while treating.' },
    box: { hard: false, t: 'Good to know', p: 'Open one pack at a time and follow the serving note for that treat. Supervise with chews, and keep water nearby.' }
  };

  // id: [ident, texture, chew level 1-5, chew label, warning, pairs, extras]
  const D = {
    'chicken-jerky': ['100% chicken breast · single ingredient', 'Thin, crunchy strips', 1, 'Easy · snaps by hand', 'soft', ['buff-jerky', 'chicken-bites', 'goat-lungs'], { label: '100% Real Chicken Breast', printed: true, lede: 'Chicken breast, slow-dehydrated into thin, crunchy strips. Snap into small pieces for training, or give a few as an everyday treat.', care: 'Chicken is a common food sensitivity: if you see itching or loose stools, pause and try Buff Jerky.' }],
    'chicken-bites': ['100% chicken · single ingredient', 'Small, ready-cut bites', 1, 'Easy · bite-sized', 'soft', ['chicken-jerky', 'goat-lungs', 'chicken-heart-liver']],
    'buff-jerky': ['100% water buffalo meat · single ingredient', 'Firm, crunchy strips', 2, 'Firm · break for small dogs', 'soft', ['chicken-jerky', 'goat-lungs', 'goat-trachea'], { label: '100% Real Water Buffalo Meat', printed: true }],
    'chicken-feet': ['100% chicken feet · contains small bones', 'Crunchy, with small bones', 3, 'Medium-firm · small bones', 'bone', ['chicken-neck', 'goat-trachea', 'chicken-jerky'], { label: '100% Real Chicken Feet', printed: true, lede: 'Whole chicken feet, slow-dehydrated until crunchy: skin, cartilage, tendon and small bones. A short chew for dogs that are used to chews.', nutri: [['Energy', '444 kcal'], ['Protein', '50.7 g'], ['Fat', '26.8 g'], ['Carbohydrates', 'Below detectable level'], ['Calcium', '4,872 mg'], ['Glucosamine', '9,035 mg']], faq: [['Are dehydrated bones safe?', 'No bone chew is risk-free. Dehydrated feet crunch rather than splinter like cooked bone, but pieces can still break off, so always supervise.'], ['Will it help my dog’s joints?', 'Feet naturally contain glucosamine (see the analysis), but they’re a treat, not a joint treatment.']] }],
    'chicken-neck': ['100% chicken neck · contains bone', 'Meaty and crunchy, with bone', 3, 'Medium-firm · bone inside', 'bone', ['chicken-feet', 'chicken-wings', 'buff-jerky'], { label: '100% Real Chicken Neck', printed: true, nutri: [['Energy', '372 kcal'], ['Protein', '42.8 g'], ['Carbohydrates', '13.4 g'], ['Fat', '16.4 g'], ['Calcium', '49.8 mg'], ['Iron', '12.6 mg']] }],
    'chicken-wings': ['100% chicken wing · contains bone', 'Meaty and crunchy, with bone', 3, 'Medium-firm · bone inside', 'bone', ['chicken-neck', 'chicken-feet', 'goat-trachea']],
    'chicken-wing-tips': ['100% chicken wing tips · contains small bones', 'Light and crunchy, small bones', 2, 'Light crunch · small bones', 'bone', ['chicken-feet', 'goat-ear', 'chicken-jerky']],
    'chicken-bones': ['100% chicken bones', 'Hard and crunchy', 4, 'Hard · bone', 'hard', ['chicken-neck', 'goat-trachea', 'buff-jerky']],
    'goat-trotter': ['100% goat lower leg · skin, tendon & bone', 'Hard and dense, with bone', 5, 'Hard · bone inside', 'hard', ['goat-trachea', 'goat-ear', 'buff-jerky'], { lede: 'A dense, long-lasting chew with bone inside. Only for medium and large dogs who chew steadily, and only with you watching.', faq: [['Can puppies have it?', 'No. Choose a softer treat such as Chicken Jerky or Goat Lungs for puppies.'], ['Does it clean teeth?', 'We don’t claim that. Chewing isn’t a replacement for brushing or vet dental care.']] }],
    'goat-trachea': ['100% goat windpipe · single ingredient · no bone', 'Crunchy rings of cartilage', 3, 'Medium · crunchy', 'chew', ['goat-ear', 'chicken-feet', 'goat-lungs'], { lede: 'A goat windpipe, slow-dehydrated into a ridged, crunchy chew. Made for chew time with you watching, not for quick training rewards.' }],
    'goat-ear': ['100% goat ear · single ingredient', 'Thin and crunchy', 2, 'Easy-medium · crunchy', 'chew', ['goat-trachea', 'chicken-feet', 'goat-lungs']],
    'chicken-gizzards': ['100% chicken gizzard · single ingredient', 'Firm and chewy', 2, 'Chewy · cut small', 'organ', ['chicken-heart-liver', 'goat-lungs', 'chicken-jerky']],
    'chicken-heart-liver': ['Chicken heart & liver · two organs, nothing else', 'Firm, crisp pieces', 1, 'Easy · breaks small', 'organ', ['chicken-gizzards', 'goat-lungs', 'chicken-jerky']],
    'goat-liver': ['100% goat liver · single ingredient', 'Firm, crisp pieces', 1, 'Easy · breaks small', 'organ', ['goat-lungs', 'goat-spleen', 'chicken-jerky']],
    'goat-lungs': ['100% goat lung · single ingredient', 'Light and airy', 1, 'Very easy · light', 'organ', ['goat-liver', 'chicken-jerky', 'goat-trachea']],
    'goat-heart-kidney-mix': ['Goat heart & kidney · two organs, nothing else', 'Firm, chewy pieces', 2, 'Chewy · cut small', 'organ', ['goat-lungs', 'goat-liver', 'buff-jerky']],
    'goat-spleen': ['100% goat spleen · single ingredient', 'Firm, crisp pieces', 1, 'Easy · breaks small', 'organ', ['goat-lungs', 'goat-liver', 'goat-trachea']],
    'anchovies': ['100% anchovies · whole small fish', 'Small and crunchy', 1, 'Easy · tiny fish', 'fish', ['sardines', 'bombay-duck', 'mackerel-fillet']],
    'sardines': ['100% sardines · whole fish', 'Crunchy whole fish', 2, 'Easy-medium · soft bones', 'fish', ['anchovies', 'white-sardines', 'tuna']],
    'white-sardines': ['100% white sardines · whole fish', 'Crunchy whole fish', 2, 'Easy-medium · soft bones', 'fish', ['sardines', 'anchovies', 'bombay-duck']],
    'bombay-duck': ['100% Bombay duck (bombil) fish', 'Light and crisp', 1, 'Easy · light', 'fish', ['anchovies', 'prawns', 'tuna']],
    'tuna': ['100% tuna · boneless · single ingredient', 'Firm, flaky pieces', 1, 'Easy · breaks small', 'boneless', ['mackerel-fillet', 'anchovies', 'sardines']],
    'mackerel-fillet': ['100% mackerel fillet · boneless · single ingredient', 'Firm fillet pieces', 1, 'Easy · breaks small', 'boneless', ['tuna', 'whole-mackerel', 'anchovies']],
    'whole-mackerel': ['100% mackerel · whole fish with bones', 'Whole fish, firm', 3, 'Medium · fish bones', 'bone', ['mackerel-fillet', 'sardines', 'chicken-neck']],
    'prawns': ['100% prawns · single ingredient', 'Crunchy', 2, 'Easy-medium · crunchy', 'shell', ['bombay-duck', 'anchovies', 'tuna']],
    'whole-quail': ['100% quail · whole bird with bones', 'Whole bird, crunchy', 3, 'Medium · bones inside', 'bone', ['chicken-neck', 'goat-trotter', 'chicken-feet']],
    'cat-trial-box': ['5 fish treats for cats', null, 0, '', 'box', ['anchovies', 'sardines', 'tuna']],
    'small-treat-box': ['9 mini packs to try', null, 0, '', 'box', ['chicken-jerky', 'goat-trachea', 'sardines']],
    'medium-treat-box': ['7 full packs', null, 0, '', 'box', ['chicken-jerky', 'goat-trachea', 'sardines']],
    'large-treat-box': ['10 full packs', null, 0, '', 'box', ['chicken-jerky', 'goat-trachea', 'sardines']],
    'surprise-me-box': ['200 g assorted treats', null, 0, '', 'box', ['chicken-jerky', 'goat-trachea', 'sardines']]
  };
  const PUBLIC = { 'chicken-heart-liver': 'chicken-heart-and-liver', 'goat-heart-kidney-mix': 'goat-heart-and-kidney-mix' };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const norm = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').replace('chicken-heart-and-liver', 'chicken-heart-liver').replace('goat-heart-and-kidney-mix', 'goat-heart-kidney-mix');
  const slug = () => {
    const m = location.pathname.match(/\/products\/([a-z0-9-]+)/);
    return norm(m ? m[1] : document.querySelector('#productName')?.textContent);
  };
  const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const $ = s => document.querySelector(s);

  function ensureCss() {
    if (document.querySelector('link[href*="product-v2.css"]')) return;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/product-v2.css?v=1'; document.head.append(l);
  }

  function meter(n) { return n ? `<div class="v2-meter" aria-hidden="true">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div>` : ''; }

  function facts(id, d) {
    const hero = (window.GOB_HERO_FACTS || {})[id] || {};
    const f = [];
    if (d[1]) f.push(['Texture', esc(d[1]), '']);
    if (hero.best) f.push(['Best for', esc(hero.best), '']);
    if (hero.dogs) f.push(['Suits', esc(hero.dogs), '']);
    if (d[2]) f.push(['Chew level', esc(d[3]), meter(d[2])]);
    if (!d[1] && hero.pack) f.unshift(['In the box', esc(hero.pack), '']);
    return f.length ? `<div class="v2-facts" id="v2Facts">${f.slice(0, 4).map(([k, v, m]) => `<div class="v2-fact"><small>${k}</small><strong>${v}</strong>${m}</div>`).join('')}</div>` : '';
  }

  function beforeBox(d) {
    const x = d[6] || {}, w = W[d[4]] || W.soft;
    const p = x.care && !w.hard ? `${w.p} ${x.care}` : w.p;
    return `<div class="v2-before${w.hard ? ' hard' : ''}" id="v2Before" role="note"><h3>${w.hard ? '⚠ ' : ''}${esc(w.t)}</h3><p>${esc(p)}</p>${w.li ? `<ul>${w.li.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}</div>`;
  }

  // Reads one pack button: its price and its size (grams or pieces), ignoring anything we added.
  function packInfo(btn) {
    const c = btn.cloneNode(true);
    c.querySelectorAll('.v2-unit,.v2-save').forEach(e => e.remove());
    const txt = c.textContent.replace(/\s+/g, ' ');
    const prices = [...txt.matchAll(/₹\s?([\d,]+)/g)].map(m => Number(m[1].replace(/,/g, '')));
    const price = prices[prices.length - 1] || 0;
    const g = txt.match(/(\d+(?:\.\d+)?)\s?(kg|gm|g)(?![a-z])/);
    const pc = txt.match(/(\d+)\s?(pieces|piece|pcs)/i);
    if (g) return { price, kind: 'g', qty: Number(g[1]) * (g[2] === 'kg' ? 1000 : 1) };
    if (pc) return { price, kind: 'pc', qty: Number(pc[1]) };
    return { price, kind: '', qty: 0 };
  }

  // The restock "Fresh batches / Notify me" note is only useful when the treat is out of stock.
  function syncStockNote() {
    const add = document.getElementById('addProduct');
    const oos = !add || add.disabled || /notify|sold out|out of stock/i.test(add.textContent);
    document.body.classList.toggle('gob-oos', oos);
  }

  function perUnit() {
    syncStockNote();
    const opts = [...document.querySelectorAll('#packOptions .option')];
    const infos = opts.map(packInfo);
    const base = infos.find(i => i.price && i.qty && i.kind);   // smallest (first) pack sets the normal rate
    opts.forEach((btn, i) => {
      const info = infos[i];
      if (!info.price) return;
      if (!btn.querySelector('.v2-unit')) {
        let unit = '';
        if (info.kind === 'g' && info.qty >= 20) unit = money(info.price / info.qty * 100) + ' / 100 g';
        else if (info.kind === 'pc' && info.qty > 1) unit = money(info.price / info.qty) + ' each';
        if (unit) btn.insertAdjacentHTML('beforeend', `<span class="v2-unit">${unit}</span>`);
      }
      // Real saving vs buying the smallest pack several times — shown only when it's at least ₹10
      if (!btn.querySelector('.v2-save') && base && info.kind === base.kind && info.qty > base.qty) {
        const save = Math.round(base.price / base.qty * info.qty - info.price);
        if (save >= 10) btn.insertAdjacentHTML('beforeend', `<span class="v2-save">Save ${money(save)}</span>`);
      }
    });
  }

  const ICON = {
    one: '<svg viewBox="0 0 64 64" fill="none" stroke="#133C21" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="32" cy="32" r="26"/><path d="M27 24l7-5v26M26 45h16" stroke="#D89A16" stroke-width="4.5"/></svg>',
    nopres: '<svg viewBox="0 0 64 64" fill="none" stroke="#133C21" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M25 9h14M27 9v14L15 47a5 5 0 0 0 4.5 7h25a5 5 0 0 0 4.5-7L37 23V9"/><path d="M20 40h24"/><path d="M9 9l46 46" stroke="#D89A16" stroke-width="4.5"/></svg>',
    slow: '<svg viewBox="0 0 64 64" fill="none" stroke="#133C21" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="32" cy="36" r="20"/><path d="M32 24v12l8 5"/><path d="M22 6c-2 3 2 4 0 7M32 4c-2 3 2 4 0 7M42 6c-2 3 2 4 0 7" stroke="#D89A16"/></svg>',
    batch: '<svg viewBox="0 0 64 64" fill="none" stroke="#133C21" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 30h44l-4 22a4 4 0 0 1-4 3H18a4 4 0 0 1-4-3z"/><path d="M6 30h52"/><path d="M24 30c0-7 3-12 8-16M32 30c0-6 2-10 6-13" stroke="#D89A16"/><path d="M22 41h20"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9v.01M18 15v.01"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
  };
  const BENEFITS = [['one', 'Single ingredient'], ['nopres', 'No preservatives'], ['slow', 'Slow-dehydrated'], ['batch', 'Small batches']];
  const TRUST = [['truck', 'Free delivery'], ['cash', 'Cash on delivery'], ['pin', 'Made in Kalyan'], ['clock', 'Ships in 1–2 days']];

  function catalogItem(id) {
    const list = window.GOB_LIVE_CATALOG || [];
    return list.find(p => norm(p.id) === id || norm(p.n) === id);
  }

  function pairsHtml(d) {
    const cards = d[5].map(id => {
      const c = catalogItem(id); if (!c) return '';
      const img = String(c.i || '').replace(/^(?!https?:|\/)/, '/');
      return `<a class="v2-pair" href="/products/${PUBLIC[id] || id}"><img src="${esc(img)}" alt="${esc(c.n)}" loading="lazy" width="300" height="300"><span><b>${esc(c.n)}</b>${c.p ? `<small>from ${money(c.p)}</small>` : ''}</span></a>`;
    }).join('');
    return cards ? `<section class="v2-pairs" id="v2Pairs" aria-labelledby="v2PairsTitle"><p class="eyebrow">Pairs well with</p><h2 id="v2PairsTitle">Good next treats to try</h2><div class="v2-pair-row">${cards}</div></section>` : '';
  }

  function accordion(id, d) {
    const x = d[6] || {};
    const name = $('#productName')?.textContent.trim() || 'this treat';
    const sec = [];
    const ingr = x.label ? `<p>The pouch lists one ingredient: <b>“${esc(x.label)}”</b>. No salt, spices, preservatives or fillers are added.</p>` : `<p>${esc(d[0].split(' · ')[0])}. Nothing else is added: no salt, spices, preservatives or fillers.</p>`;
    sec.push(['Ingredients & label', ingr + '<p>Slow-dehydrated at low heat in small batches in Kalyan, Maharashtra.</p>', true]);
    if (x.printed) sec.push(['Feeding guide (from the pack)', `<table class="v2-tbl"><tr><th>Dog size</th><th>Per day</th></tr>${LABEL_FEED.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table><p class="v2-note">Don’t overfeed, keep fresh water out, and supervise. ${TEN}</p>`]);
    if (x.nutri) sec.push(['Nutrition (per 100 g)', `<table class="v2-tbl"><tr><th>Per 100 g</th><th>Amount</th></tr>${x.nutri.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table><p class="v2-note">Guaranteed analysis as printed on the pack.</p>`]);
    sec.push(['Storage & shelf life', `<ul>${(x.printed ? LABEL_STORE : GEN_STORE).map(s => `<li>${s}</li>`).join('')}</ul>`]);
    sec.push(['Delivery & returns', '<ul><li>Dispatched in 1–2 working days; tracking by SMS / WhatsApp.</li><li>Free delivery across India. Pay online and save ₹30, or pay cash on delivery (₹40 fee).</li><li>If something arrives damaged or isn’t right, message us with your order number and we’ll help.</li></ul>']);
    if (x.faq && !document.getElementById('gobFaq')) sec.push(['Questions', x.faq.map(([q, a]) => `<p><b>${esc(q)}</b><br>${esc(a)}</p>`).join('')]);
    return `<section class="v2-acc" id="v2Acc" aria-label="${esc(name)} details">${sec.map(([h, b, o]) => `<details${o ? ' open' : ''}><summary>${h}</summary><div class="v2-body">${b}</div></details>`).join('')}<p class="v2-help">Still unsure? <a href="https://wa.me/919082503295?text=${encodeURIComponent('Hi Game of Bones, I have a question about ' + name)}" target="_blank" rel="noreferrer">WhatsApp us</a>. A real person replies.</p></section>`;
  }

  function apply() {
    const id = slug(), d = D[id];
    const info = $('.product-info'), buyRow = $('.buy-row');
    if (!d || !info || !buyRow || $('#v2Before')) return !!$('#v2Before');
    ensureCss();
    document.body.classList.add('gob-v2');
    const x = d[6] || {};

    // identity line under the name, and a plainer description
    const h1 = $('#productName');
    if (h1 && !$('#v2Ident')) h1.insertAdjacentHTML('afterend', `<p class="v2-ident" id="v2Ident">${esc(d[0])}</p>`);
    const identEl = $('#v2Ident');
    const GAIN = {"chicken-jerky": "Lean protein that snaps into tiny rewards, so you can train more without overfeeding.", "chicken-bites": "Ready-cut lean protein bites, so every “good dog” is a quick, light reward.", "buff-jerky": "A different protein from chicken – a good switch for picky eaters and dogs chicken doesn’t suit.", "chicken-feet": "Naturally contains glucosamine and collagen, and the crunch keeps your dog happily busy.", "chicken-neck": "High in protein (42.8 g per 100 g) with a satisfying bone-in crunch for medium and large dogs.", "chicken-wings": "A meaty, bone-in chew that gives your dog a natural outlet for the urge to chew.", "chicken-wing-tips": "A light, crunchy chew sized for small and medium dogs who love to crunch.", "chicken-bones": "A hard, crunchy chew that keeps steady chewers busy – instead of your furniture.", "goat-trotter": "A long-lasting chew that keeps strong chewers busy, with natural collagen from skin and tendon.", "goat-trachea": "Naturally contains cartilage, a natural source of glucosamine and chondroitin, in a long crunchy chew.", "goat-ear": "A thin, crunchy chew for a quick, satisfying chew session – suits most dogs.", "chicken-gizzards": "Naturally protein-rich and chewy – a high-value reward dogs will work hard for.", "chicken-heart-and-liver": "Naturally contains iron and vitamin A – so rich that a few small pieces go a long way.", "goat-liver": "Naturally contains vitamin A, iron and B vitamins – a rich, high-value reward for big moments.", "goat-lungs": "Light and airy, so you can give lots of rewards in one session without overfeeding.", "goat-heart-and-kidney-mix": "Naturally contains taurine from heart and iron from kidney – rich organ variety in small pieces.", "goat-spleen": "Naturally contains iron – a rich organ treat that adds variety to your dog’s rewards.", "anchovies": "Naturally contains omega-3 fatty acids and calcium from tiny soft bones – loved by cats and dogs.", "sardines": "Naturally contains omega-3 fatty acids, and the strong smell wins over picky dogs and cats.", "white-sardines": "Naturally contains omega-3 fatty acids, with a milder taste for fussy dogs and cats.", "bombay-duck": "A lean, light fish treat that even small dogs and cats can enjoy.", "tuna": "Lean, boneless fish protein – easy to break into tiny pieces for cats and small dogs.", "mackerel-fillet": "Boneless, and naturally contains omega-3 fatty acids – a rich fish reward for dogs and cats.", "whole-mackerel": "A whole oily fish that naturally contains omega-3 fatty acids, eaten as a crunchy chew.", "whole-quail": "Whole prey – meat, bone and organs together, the way dogs naturally eat.", "cat-trial-box": "Five fish treats in one box, so you find out what your cat loves before buying full packs.", "small-treat-box": "Nine single-ingredient treats to try, so you find your dog’s favourite without buying full packs.", "medium-treat-box": "Seven full packs – a month of variety so treat time never gets boring.", "large-treat-box": "Ten full packs – the best value for multi-dog homes and gifting.", "surprise-me-box": "A surprise mix of single-ingredient treats that keeps treat time exciting."};
    if (identEl && GAIN[id] && !$('#v2Gain')) identEl.insertAdjacentHTML('afterend', `<p class="v2-gain" id="v2Gain">${esc(GAIN[id])}</p>`);
    if (identEl && !$('#v2Benefits')) ($('#v2Gain') || identEl).insertAdjacentHTML('afterend', `<ul class="v2-benefits" id="v2Benefits" aria-label="Why this treat">${BENEFITS.map(([k, t]) => `<li>${ICON[k]}<span>${t}</span></li>`).join('')}</ul>`);
    if (x.lede && $('#productDesc')) $('#productDesc').textContent = x.lede;

    // quick facts after the description
    const desc = $('#productDesc');
    if (desc && !$('#v2Facts')) desc.insertAdjacentHTML('afterend', facts(id, d));

    // before-you-buy right above the add-to-jar row
    buyRow.insertAdjacentHTML('beforebegin', beforeBox(d));

    // one short delivery line after the buy row (replaces three repeated blocks)
    buyRow.insertAdjacentHTML('afterend', `<div class="v2-trust" id="v2Ship"><ul>${TRUST.map(([k, t]) => `<li>${ICON[k]}<span>${t}</span></li>`).join('')}</ul><p>Pay online and save ₹30 · COD fee ₹40</p></div>`);

    // per-unit pricing on pack buttons (packs re-render when data arrives)
    perUnit();
    const addBtn = document.getElementById('addProduct');
    if (addBtn) new MutationObserver(syncStockNote).observe(addBtn, { attributes: true, childList: true, characterData: true, subtree: true });
    const po = $('#packOptions');
    if (po) new MutationObserver(perUnit).observe(po, { childList: true, subtree: true });

    // replace the generic accordion with the product-specific one
    const oldAcc = $('.accordion');
    const anchor = $('#gobWhy') || $('.detail');
    if (anchor && !$('#v2Acc')) anchor.insertAdjacentHTML('afterend', accordion(id, d));
    if (oldAcc) oldAcc.classList.add('v2-hidden');

    // complementary products instead of the generic "make it a bundle" block
    const quote = $('.quote-section');
    const pairs = pairsHtml(d);
    if (pairs) (quote || $('#v2Acc')).insertAdjacentHTML(quote ? 'beforebegin' : 'afterend', pairs);
    return true;
  }

  function start() {
    let tries = 0;
    const tick = () => { if (apply() || ++tries > 12) return; setTimeout(tick, 350); };
    tick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 60), { once: true });
  else setTimeout(start, 60);
})();
;
