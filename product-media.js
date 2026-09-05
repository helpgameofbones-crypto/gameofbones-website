/* Per-product media accepts up to six items: five photos plus one video, or any other mix. */
window.GOB_PRODUCT_MEDIA = window.GOB_PRODUCT_MEDIA || {
  jerky: [
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/293b7ba0-37a7-4626-b97e-0f6aa8d86fa4/image-0-1782712553501.png', alt: 'Chicken Jerky front pack', label: 'Front pack' },
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/293b7ba0-37a7-4626-b97e-0f6aa8d86fa4/image-1-1782712557758.png', alt: 'Chicken Jerky product photo 2', label: 'Product photo 2' },
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/293b7ba0-37a7-4626-b97e-0f6aa8d86fa4/image-2-1782712480316.png', alt: 'Chicken Jerky product photo 3', label: 'Product photo 3' },
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/293b7ba0-37a7-4626-b97e-0f6aa8d86fa4/image-3-1782712483596.png', alt: 'Chicken Jerky product photo 4', label: 'Product photo 4' },
    { type: 'image', src: 'https://syuostlqzzinigqwjzap.supabase.co/storage/v1/object/public/product-images/293b7ba0-37a7-4626-b97e-0f6aa8d86fa4/image-4-1782797388440.png', alt: 'Chicken Jerky product photo 5', label: 'Product photo 5' }
  ]
}

function productMediaId(){return new URLSearchParams(location.search).get('catalog')||'jerky'}
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
      stage.innerHTML=item.src?`<video controls playsinline poster="${item.poster||''}" aria-label="${item.alt||item.label}"><source src="${item.src}"></video>`:`<div class="media-video-poster"><img src="${item.poster||''}" alt="${item.alt||''}"><span aria-hidden="true">▶</span><strong>Product video</strong><small>Video slot ready for upload</small></div>`
    }else stage.innerHTML=`<img id="productImage" src="${item.src}" alt="${item.alt||item.label||'Product photo'}">`
    count.textContent=`${index+1} of ${media.length} media`
  }
  thumbs.innerHTML=media.map((item,index)=>`<button class="thumb media-thumb${index===0?' active':''}" type="button" aria-pressed="${index===0}" aria-label="View ${item.label||`media ${index+1}`}"><img src="${item.type==='video'?(item.poster||''):item.src}" alt=""><span>${item.type==='video'?'▶':''}</span></button>`).join('')
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
