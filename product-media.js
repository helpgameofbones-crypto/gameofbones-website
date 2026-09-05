/* Per-product media accepts up to six items: five photos plus one video, or any other mix. */
window.GOB_PRODUCT_MEDIA = window.GOB_PRODUCT_MEDIA || {
  jerky: [
    { type: 'image', src: 'assets/chicken-jerky-pouch.png', alt: 'Chicken Jerky pouch', label: 'Front pack' },
    { type: 'image', src: 'assets/chicken-jerky-pouch.png', alt: 'Chicken Jerky pack detail', label: 'Pack detail' },
    { type: 'image', src: 'assets/chicken-jerky-pouch.png', alt: 'Chicken Jerky ingredient detail', label: 'Ingredient detail' },
    { type: 'image', src: 'assets/chicken-jerky-pouch.png', alt: 'Chicken Jerky serving detail', label: 'Serving idea' },
    { type: 'image', src: 'assets/chicken-jerky-pouch.png', alt: 'Chicken Jerky back-of-pack detail', label: 'Back of pack' },
    { type: 'video', src: '', poster: 'assets/chicken-jerky-pouch.png', alt: 'Chicken Jerky product video', label: 'Watch video' }
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
