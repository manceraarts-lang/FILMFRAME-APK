
// ===== 1.1.15: zoom horizontal de Timeline y selección rápida de rango =====
(()=>{
  const bar=document.getElementById('tlzoom'),slider=document.getElementById('tlz'),readout=document.getElementById('tlzv');
  if(!bar||!slider||!readout)return;
  let cell=44;
  try{const saved=Number(localStorage.getItem('filmframe_tl_zoom_1115'));if(Number.isFinite(saved)&&saved>=32&&saved<=76)cell=saved}catch(e){}
  const apply=value=>{cell=Math.max(32,Math.min(76,Math.round(value/2)*2));slider.value=String(cell);strip.style.setProperty('--tl-cell',cell+'px');readout.value=Math.round(cell/44*100)+'%';readout.textContent=Math.round(cell/44*100)+'%';try{localStorage.setItem('filmframe_tl_zoom_1115',String(cell))}catch(e){}};
  slider.addEventListener('input',()=>apply(+slider.value));
  document.getElementById('tlzout').addEventListener('click',()=>apply(cell-4));
  document.getElementById('tlzin').addEventListener('click',()=>apply(cell+4));
  // Ctrl/Meta + rueda sobre Timeline ajusta el zoom; la rueda normal conserva el desplazamiento.
  strip.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();apply(cell+(e.deltaY<0?4:-4))},{passive:false});
  // Shift + toque/clic en un encabezado selecciona desde el fotograma actual hasta el destino.
  strip.addEventListener('click',e=>{const h=e.target.closest('.hd');if(!h||!e.shiftKey)return;const target=Number(h.dataset.h);if(!Number.isInteger(target))return;e.preventDefault();e.stopImmediatePropagation();sel={a:Math.min(cur,target),b:Math.max(cur,target)};go(target);mark();const tools=document.getElementById('tools');if(tools)tools.classList.add('visible')},true);
  apply(cell);
})();
