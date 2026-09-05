function cartValue(){return cart().reduce((total,item)=>total+(GOB_PRODUCTS[item.id]?.price||0)*item.quantity,0)}
function bulkRate(count){return count>=10?.15:count>=8?.12:count>=5?.08:count>=3?.05:0}

function renderCommerceCart(){
  const root=document.querySelector('#commerceCart')
  if(!root)return
  const items=cart()
  if(!items.length){
    root.innerHTML='<div class="empty-cart"><h2>Your bowl is ready when you are.</h2><p>Pick a single-ingredient treat and come back when you are ready to check out.</p><a class="button" href="products.html">Shop all treats</a></div>'
    document.querySelector('#checkoutLink')?.setAttribute('href','products.html')
    updateCommerceTotals()
    return
  }
  root.innerHTML=items.map(item=>{
    const product=GOB_PRODUCTS[item.id]
    if(!product)return ''
    return `<article class="cart-line"><img src="${product.image}" alt="${product.name}"><div><h2>${product.name}</h2><p>${product.tag||'Game of Bones treat'}</p><div class="line-actions"><div class="mini-qty"><button data-change="${item.id}" data-amount="-1" aria-label="Decrease ${product.name}">−</button><span>${item.quantity}</span><button data-change="${item.id}" data-amount="1" aria-label="Increase ${product.name}">+</button></div><button class="remove-link" data-delete="${item.id}">Remove</button></div></div><div class="line-price">${money(product.price*item.quantity)}</div></article>`
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
}

function updateCommerceTotals(){
  const subtotal=cartValue(),count=cartCount(),rate=bulkRate(count),bulk=Math.round(subtotal*rate)
  const coupon=document.querySelector('[name="coupon"]:checked')?.value||'none'
  const eligibility=window.GOB_CHECKOUT_ELIGIBILITY||{signedIn:false,firstOrder:false,checking:false,points:0}
  const couponRate=coupon==='WELCOME15'&&eligibility.firstOrder ? .15 : coupon==='MEGA20'&&subtotal>=2199 ? .2 : 0
  const couponDiscount=Math.round(subtotal*couponRate),saving=Math.max(bulk,couponDiscount)
  const payment=document.querySelector('[name="payment"]:checked')?.value||'online'
  const paymentChange=payment==='cod'?40:-30,total=Math.max(0,subtotal-saving+paymentChange)
  const pointsEarned=Math.floor(total/10),pointsValue=pointsEarned*.3
  document.querySelectorAll('[data-commerce-subtotal]').forEach(el=>el.textContent=money(subtotal))
  document.querySelectorAll('[data-commerce-total]').forEach(el=>el.textContent=money(total))
  document.querySelectorAll('[data-bulk-discount]').forEach(el=>el.textContent=bulk?`−${money(bulk)}`:'Add 3 items to save 5%')
  document.querySelectorAll('[data-bulk-label]').forEach(el=>el.textContent=bulk?`${rate*100}% buy-more saving`:'Buy more, save more')
  document.querySelectorAll('[data-coupon-discount]').forEach(el=>el.textContent=saving?`−${money(saving)}`:'—')
  document.querySelectorAll('[data-payment-change]').forEach(el=>el.textContent=payment==='cod'?`+${money(40)}`:`−${money(30)}`)
  document.querySelectorAll('[data-loyalty-points]').forEach(el=>el.textContent=pointsEarned.toLocaleString('en-IN'))
  document.querySelectorAll('[data-loyalty-value]').forEach(el=>el.textContent=pointsValue.toFixed(pointsValue%1?2:0))
  document.querySelectorAll('[data-commerce-count]').forEach(el=>el.textContent=count)
  const status=document.querySelector('[data-coupon-status]')
  if(status){
    if(coupon==='WELCOME15'){
      status.textContent=!eligibility.signedIn?'WELCOME15 is not applied: log in with your email OTP first. It is for a verified account with no completed orders, is limited to one use, and cannot be combined with buy-more savings.':eligibility.checking?'Checking whether this account is eligible for WELCOME15…':eligibility.firstOrder?'WELCOME15 is available for this first order. It replaces, rather than stacks with, buy-more savings.':'WELCOME15 is not applied: this account already has a completed order, or its first-order status could not be verified.'
    } else if(coupon==='MEGA20'){
      const remaining=Math.max(0,2199-subtotal)
      status.textContent=remaining?`MEGA20 is not applied: add ${money(remaining)} of eligible treats to reach the ₹2,199 minimum. It cannot be combined with buy-more savings.`:'MEGA20 is available on this basket. It replaces, rather than stacks with, buy-more savings.'
    } else {
      status.textContent=bulk?'Your best automatic buy-more tier is applied. Codes cannot be combined with this saving.':'Automatic savings unlock at 3 items. You can instead choose a qualifying coupon; only one offer applies per order.'
    }
  }
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
  if(!total||document.querySelector('.bulk-discount'))return
  const styles=document.createElement('link');styles.rel='stylesheet';styles.href='commerce-bulk.css';document.head.append(styles)
  total.insertAdjacentHTML('beforebegin','<div class="order-row bulk-discount"><span data-bulk-label>Buy more, save more</span><strong data-bulk-discount>Add 3 items to save 5%</strong></div>')
}

function ensureCheckoutOptions(){
  const form=document.querySelector('#checkoutForm'),total=document.querySelector('.order-row.total')
  if(!form||document.querySelector('.checkout-perks'))return
  form.querySelectorAll('[name="payment"]').forEach((input,index)=>input.value=index?'cod':'online')
  const payment=form.querySelector('.form-section:last-of-type')
  payment.insertAdjacentHTML('beforebegin',`<section class="form-section checkout-perks">
    <h3>Offers & rewards</h3>
    <label><input type="radio" name="coupon" value="none" checked><span>Use automatic buy-more saving <small>We’ll apply your best eligible saving. It cannot be combined with a code.</small></span></label>
    <label data-welcome-offer><input type="radio" name="coupon" value="WELCOME15"><span>WELCOME15 — 15% off your first order <small>Verified new accounts only · one use · disappears after the first completed order.</small></span></label>
    <label><input type="radio" name="coupon" value="MEGA20"><span>MEGA20 — 20% off orders ₹2,199+ <small>Eligible treat subtotal must reach ₹2,199 · excludes buy-more savings.</small></span></label>
    <label><input type="checkbox" disabled><span>Use reward points <small><a href="login.html">Log in</a> to see your available balance and redeem eligible points.</small></span></label>
    <p class="perk-status" data-coupon-status role="status" aria-live="polite"></p>
  </section>`)
  total.insertAdjacentHTML('beforebegin','<div class="order-row"><span>Offer saving</span><span data-coupon-discount>—</span></div><div class="order-row"><span>Payment adjustment</span><span data-payment-change>−₹30</span></div>')
  form.querySelectorAll('[name="coupon"],[name="payment"]').forEach(input=>input.addEventListener('change',updateCommerceTotals))
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
}

async function loadCheckoutEligibility(){
  const token=window.sessionStorage.getItem('gob-customer-token')
  window.GOB_CHECKOUT_ELIGIBILITY={signedIn:Boolean(token),firstOrder:false,checking:Boolean(token),points:0}
  updateCommerceTotals()
  updateWelcomeOfferVisibility()
  if(!token)return
  try{
    const account=await window.GOB_API?.account(token)
    const orders=Array.isArray(account?.orders)?account.orders:[]
    window.GOB_CHECKOUT_ELIGIBILITY={signedIn:true,firstOrder:orders.length===0,checking:false,points:Number(account?.points?.available||0)}
  }catch(error){
    window.GOB_CHECKOUT_ELIGIBILITY={signedIn:true,firstOrder:false,checking:false,points:0}
  }
  updateWelcomeOfferVisibility()
  updateCommerceTotals()
}

function setupCommerce(){
  ensureLoyaltyEarn();ensureBulkDiscount();ensureCheckoutOptions();renderCommerceCart();loadCheckoutEligibility()
  document.querySelector('#promoForm')?.addEventListener('submit',event=>{
    event.preventDefault()
    const code=document.querySelector('#promoCode').value.trim().toUpperCase(),message=document.querySelector('#promoMessage')
    message.textContent=code==='MEGA20'&&cartValue()>=2199?'MEGA20 will be applied by the live checkout.':code==='MEGA20'?'MEGA20 applies to orders of ₹2,199 or more.':'Enter MEGA20 for 20% off orders ₹2,199+.'
  })
  document.querySelector('#checkoutForm')?.addEventListener('submit',event=>{event.preventDefault();const success=document.querySelector('#checkoutSuccess');success.classList.add('show');success.focus()})
}

document.addEventListener('DOMContentLoaded',setupCommerce)
