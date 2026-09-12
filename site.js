/* SEO essentials are kept here because this file is loaded by every customer
   page. That makes canonical URLs and baseline business markup resilient when
   a static page is added later. Product pages replace the WebPage node with a
   product-specific Product, Offer and BreadcrumbList as their live catalogue
   record becomes available. */
const GOB_SEO=(()=>{
  const origin='https://gameofbones.in';
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
  const baseUrl=ensureCanonical(origin+cleanPath());
  script('gob-site-schema',{'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':origin+'/#organization',name:'Game of Bones',url:origin+'/',logo:absoluteImage('assets/gob-logo.png'),description:'Single-ingredient, naturally dehydrated dog treats made in Kalyan, Maharashtra.'},
    {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'Game of Bones',publisher:{'@id':origin+'/#organization'}},
    {'@type':'WebPage','@id':baseUrl+'#webpage',url:baseUrl,name:document.title,isPartOf:{'@id':origin+'/#website'}}
  ]});
  const setProductSchema=(product,url)=>{
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

const GOB_PRODUCTS={jerky:{name:'Chicken Jerky',price:329,image:'assets/chicken-jerky-pouch.png',tag:'Boneless jerky'},'jerky-pack-2':{name:'Chicken Jerky — 2 pouch value pack',price:625,image:'assets/chicken-jerky-pouch.png',tag:'Boneless jerky · save ₹33'},trachea:{name:'Goat Trachea',price:100,image:'assets/goat-trachea-pouch.png',tag:'Chews & bones'},trotter:{name:'Goat Trotter',price:250,image:'assets/goat-trotter-plate.png',tag:'Chews & bones'}};
// Keep the catalogue store on window as well, so every deferred storefront script shares it reliably.
window.GOB_PRODUCTS = GOB_PRODUCTS;
const money=n=>`₹${Number(n).toLocaleString('en-IN')}`;
const cart=()=>JSON.parse(localStorage.getItem('gob-preview-cart')||'[]');
const saveCart=value=>localStorage.setItem('gob-preview-cart',JSON.stringify(value));
// Cart lines keep the product snapshot from add-to-cart time. Prefer it so a
// later catalogue sync cannot silently change an existing basket's image,
// name, or displayed price; checkout still revalidates current server pricing.
const cartProduct=item=>item.product||GOB_PRODUCTS[item.id]||null;
function cartCount(){return cart().reduce((total,item)=>total+item.quantity,0)}
function notice(message,kind='info'){const el=document.querySelector('#toast');if(!el)return;el.className=`toast${kind==='jar'?' jar-toast':''}`;el.innerHTML=kind==='jar'?`<span class="toast-jar" aria-hidden="true"><svg viewBox="0 0 32 36" fill="none"><path d="M9 8V5h14v3M7 9h18l2 22H5L7 9Z" stroke="currentColor" stroke-width="2"/><path d="M10 16h12M11 21h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><span><b>In your treat jar</b>${message}</span>`:message;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),3200)}
function updateCart(){const items=cart(),count=cartCount();document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=count);const list=document.querySelector('#cartItems'),total=document.querySelector('#cartTotal');if(!list||!total)return;if(!items.length){list.innerHTML='<p class="empty">Your bag is waiting for something delicious.</p>';total.textContent=money(0);return}list.innerHTML=items.map(item=>{const p=cartProduct(item);if(!p)return '';return `<div class="cart-item"><img src="${p.image}" alt=""><div><strong>${p.name}</strong><small>${item.quantity} × ${money(p.price)}</small></div><button class="remove" data-remove="${item.id}">Remove</button></div>`}).join('');total.textContent=money(items.reduce((sum,item)=>sum+(cartProduct(item)?.price||0)*item.quantity,0));document.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{saveCart(cart().filter(item=>item.id!==button.dataset.remove));updateCart();notice('Removed from your bag.')}))}
function addToCart(id,quantity=1){const items=cart(),product=GOB_PRODUCTS[id],snapshot=product?{name:product.name,price:Number(product.price)||0,image:product.image||'',tag:product.tag||'',packLabel:product.packLabel||''}:null,found=items.find(item=>item.id===id);if(found){found.quantity+=quantity;if(snapshot)found.product=snapshot}else items.push({id,quantity,product:snapshot});saveCart(items);updateCart();notice(`${product?.name||'Treat'} added.`,'jar')}
function openCart(){document.querySelector('#cartDrawer')?.classList.add('open');document.querySelector('#scrim')?.classList.add('open');document.body.classList.add('locked')}
function closeCart(){document.querySelector('#cartDrawer')?.classList.remove('open');document.querySelector('#scrim')?.classList.remove('open');document.body.classList.remove('locked')}
// Customer-facing URLs stay clean even though the static files behind them use
// .html names. This also covers links injected by catalogue, cart and blog UI.
const cleanPageUrls={'index.html':'/','products.html':'/products','product.html':'/product','our-story.html':'/our-story','bundles.html':'/bundles','blog.html':'/blog','contact.html':'/contact','rewards.html':'/rewards','track.html':'/track','learn.html':'/learn','cart.html':'/cart','checkout.html':'/checkout','login.html':'/login','account.html':'/account','policies.html':'/policies'};
function cleanStorefrontUrls(root=document){const links=[...(root.matches?.('a[href]')?[root]:[]),...(root.querySelectorAll?.('a[href]')||[])];links.forEach(link=>{const raw=link.getAttribute('href');if(!raw||/^(?:#|mailto:|tel:|https?:|\/\/)/i.test(raw))return;const match=raw.match(/^([^?#]+)(.*)$/);if(!match)return;const cleaned=cleanPageUrls[match[1]];if(cleaned)link.setAttribute('href',cleaned+match[2])})}
function ensureCart(){if(document.querySelector('#cartDrawer'))return;document.body.insertAdjacentHTML('beforeend','<div class="scrim" id="scrim"></div><aside class="drawer" id="cartDrawer" aria-label="Shopping bag"><div class="drawer-top"><h2>Your bag</h2><button class="close" data-close-cart aria-label="Close bag">×</button></div><div class="cart-items" id="cartItems"></div><div class="cart-total"><div><span>Subtotal</span><span id="cartTotal">₹0</span></div><a class="button" style="width:100%" href="cart.html">View bag & checkout</a></div></aside><div class="toast" id="toast" role="status"></div>')}
function enhanceHeader(){const actions=document.querySelector('.nav-actions'),links=document.querySelector('.nav-links');if(!actions)return;links?.classList.add('compact-nav');const track=links?.querySelector('a[href="track.html"]'),bundles=links?.querySelector('a[href="bundles.html"]');if(track&&bundles)bundles.insertAdjacentElement('afterend',track);if(!document.querySelector('.search-trigger'))actions.insertAdjacentHTML('afterbegin','<button class="search-trigger" type="button" aria-label="Search products" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4"></circle><path d="m16 16 4.3 4.3"></path></svg><span>Search</span></button>');if(!document.querySelector('.login-trigger'))actions.insertAdjacentHTML('afterbegin','<a class="login-trigger" href="login.html">Log in</a>');actions.querySelector('.icon-btn')?.remove();const jar=actions.querySelector('.cart-trigger');if(jar&&!jar.dataset.jarReady){jar.dataset.jarReady='true';jar.setAttribute('aria-label','Open treat jar');jar.innerHTML='<svg class="jar-icon" viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M9 8V5h14v3M7 9h18l2 22H5L7 9Z" stroke="currentColor" stroke-width="2"/><path d="M10 16h12M11 21h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="sr-only">Treat jar, </span><span class="jar-count" data-cart-count>0</span>'}if(!document.querySelector('link[data-gob-header]')){const styles=document.createElement('link');styles.rel='stylesheet';styles.href='header.css?v=header-4';styles.dataset.gobHeader='true';document.head.append(styles)}}
function setupAnnouncement(){const bar=document.querySelector('.notice'),text=bar?.querySelector('span');if(!bar||!text||bar.dataset.ready)return;bar.dataset.ready='true';const message='🎉 Free shipping on all orders   •   💰 Pay online & get ₹30 off   •   📦 MEGA20: 20% off orders ₹2,199+   •   🚚 Pan-India delivery via Delhivery   •   🌿 100% natural, single ingredient   •   🐾 Refer a friend, earn 300 points   •   ';bar.innerHTML=`<div class="notice-track"><span>${message}</span><span aria-hidden="true">${message}</span></div>`}
function setupSearch(){const trigger=document.querySelector('.search-trigger');if(!trigger||document.querySelector('#productSearch'))return;document.body.insertAdjacentHTML('beforeend','<section class="search-sheet" id="productSearch" aria-hidden="true"><div class="search-panel" role="dialog" aria-modal="true" aria-labelledby="searchTitle"><div class="search-top"><div><p class="eyebrow">Find a treat</p><h2 id="searchTitle">Search the treat cupboard.</h2></div><button class="search-close" type="button" aria-label="Close search">×</button></div><label class="search-field" for="productSearchInput"><span class="sr-only">Search products</span><input id="productSearchInput" type="search" autocomplete="off" placeholder="Try chicken, goat or chew"><span>⌕</span></label><div class="search-results" id="productSearchResults"></div></div></section>');const sheet=document.querySelector('#productSearch'),input=document.querySelector('#productSearchInput'),results=document.querySelector('#productSearchResults');const products=()=>Object.entries(window.GOB_PRODUCTS||GOB_PRODUCTS);const render=value=>{const query=value.trim().toLowerCase(),matches=products().filter(([id,p])=>!query||`${p.name} ${p.tag||''}`.toLowerCase().includes(query)).slice(0,6);results.innerHTML=matches.length?matches.map(([id,p])=>`<a href="product.html?catalog=${encodeURIComponent(id)}"><img src="${p.image}" alt=""><span><b>${p.name}</b><small>${p.tag||'Single-ingredient treat'} · ${money(p.price)}</small></span><i>→</i></a>`).join(''):'<p>No treats found. Try “chicken” or “goat”.</p>'};const close=()=>{sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');trigger.setAttribute('aria-expanded','false');document.body.classList.remove('locked')};trigger.addEventListener('click',()=>{sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');document.body.classList.add('locked');render('');setTimeout(()=>input.focus(),10)});input.addEventListener('input',()=>render(input.value));sheet.querySelector('.search-close').addEventListener('click',close);sheet.addEventListener('click',event=>{if(event.target===sheet)close()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&sheet.classList.contains('open'))close()})}
function installFooter(){let footer=document.querySelector('footer.footer');if(!footer){footer=document.createElement('footer');footer.className='footer';document.body.appendChild(footer)}footer.dataset.gobFooter='true';footer.innerHTML='<div class="footer-grid"><div><h3>Good treats.<br>Good dogs.</h3><p>Single-ingredient treats, made in Maharashtra for the everyday moments that matter.</p><form class="email-row" data-demo-form><label class="sr-only" for="footerEmail">Email address</label><input id="footerEmail" type="email" required placeholder="Your email for treat notes"><button type="submit">Join →</button><p class="form-success">You’re on the list.</p></form></div><div><h4>Shop</h4><a href="products.html">All treats</a><a href="bundles.html">Bundles</a><a href="rewards.html">Rewards</a><a href="cart.html">Your treat jar</a></div><div><h4>Learn</h4><a href="our-story.html">Our story</a><a href="blog.html">Journal</a><a href="learn.html">Treat guide</a><a href="blog.html#transition-plan">Transition plan</a></div><div><h4>Help</h4><a href="track.html">Track an order</a><a href="contact.html">Contact us</a><a href="login.html">Your account</a><a href="https://www.instagram.com/gameofbones.in/" target="_blank" rel="noopener">Instagram ↗</a></div></div><div class="footer-bottom"><span>© 2026 Game of Bones · Made in Kalyan, Maharashtra</span><span>UPI · Cards · Cash on Delivery</span></div>'}
function addPolicyLinks(){const help=document.querySelector('footer.footer .footer-grid>div:last-child');if(!help||help.dataset.policyLinks)return;help.dataset.policyLinks='true';help.insertAdjacentHTML('beforeend','<a href="policies.html#privacy">Privacy policy</a><a href="policies.html#shipping">Shipping policy</a><a href="policies.html#returns">Returns policy</a>')}
function installRewardShortcut(){if(document.querySelector('.reward-shortcut')||location.pathname.endsWith('rewards.html')||location.pathname.replace(/\/+$/,'')==='/rewards')return;if(!document.querySelector('link[data-gob-reward-shortcut]')){const styles=document.createElement('link');styles.rel='stylesheet';styles.href='reward-shortcut.css?v=1';styles.dataset.gobRewardShortcut='true';document.head.append(styles)}document.body.insertAdjacentHTML('beforeend','<a class="reward-shortcut" href="rewards.html" aria-label="Open Game of Bones rewards" title="Rewards"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9L9.6 7 12 2Z"/><path d="M7 20h10"/></svg><span>Rewards</span></a>')}
function init(){ensureCart();enhanceHeader();setupAnnouncement();setupSearch();installFooter();addPolicyLinks();installRewardShortcut();cleanStorefrontUrls();new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)cleanStorefrontUrls(node)}))).observe(document.body,{childList:true,subtree:true});document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>addToCart(button.dataset.add,Number(button.dataset.quantity||1))));document.querySelectorAll('[data-open-cart]').forEach(button=>button.addEventListener('click',openCart));document.querySelectorAll('[data-close-cart]').forEach(button=>button.addEventListener('click',closeCart));document.querySelector('#scrim')?.addEventListener('click',closeCart);document.querySelector('.menu-toggle')?.addEventListener('click',()=>{const links=document.querySelector('.nav-links'),open=links.classList.toggle('open');document.querySelector('.menu-toggle').setAttribute('aria-expanded',open)});document.querySelectorAll('.option').forEach(button=>button.addEventListener('click',()=>{button.parentElement.querySelectorAll('.option').forEach(x=>x.classList.remove('selected'));button.classList.add('selected')}));document.querySelectorAll('[data-demo-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();form.querySelector('.form-success')?.classList.add('show');form.reset()}));const io='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.14}):null;document.querySelectorAll('.reveal').forEach(el=>io?io.observe(el):el.classList.add('visible'));updateCart()}
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
        const response=await fetch('/api/public-email-capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,source:'footer_newsletter'})});
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
