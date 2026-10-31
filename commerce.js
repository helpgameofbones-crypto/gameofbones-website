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
const BOGO_TREATS=new Set(['chicken feet','chicken neck'])
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
  const coupon=privateCoupon||storedCoupon||document.querySelector('[name="coupon"]:checked')?.value||(!document.querySelector('[name="coupon"]')&&cartOfferClaimed()?CART_OFFER_CODE:'none')
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
    <label data-cart-offer hidden><input type="radio" name="coupon" value="CART50"><span>CART50 — ₹50 off your first order <small>Unlocked with your WhatsApp number on the treat jar page · first order only · checked at payment.</small></span></label>
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
  // The ₹50 bag offer is applied automatically unless another code was chosen.
  const cartOfferInput=form.querySelector('[name="coupon"][value="CART50"]')
  if(cartOfferInput&&cartOfferClaimed()){
    cartOfferInput.closest('label').hidden=false
    if(!requestedInput&&!isPreviewablePrivateOffer(storedCoupon))cartOfferInput.checked=true
  }
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
  set('[autocomplete="given-name"]',parts[0]);set('[autocomplete="family-name"]',parts.slice(1).join(' '))
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
