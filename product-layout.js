/* Keep the product hero focused on media and purchase. Long reference material uses the full page width. */
document.addEventListener('DOMContentLoaded',()=>{
  const detail=document.querySelector('.detail'), accordion=document.querySelector('.product-info .accordion')
  if(!detail||!accordion||accordion.dataset.fullWidth)return
  accordion.dataset.fullWidth='true'
  accordion.classList.add('product-accordion-panel')
  detail.insertAdjacentElement('afterend',accordion)
})
