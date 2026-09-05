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
