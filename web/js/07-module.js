
// ===== 1.1.7: dock de timeline, pestaña de opciones, playhead, brillo =====
(()=>{const tl=$('#tl'),dr=$('#ldrawer'),ar=$('#tla'),br=$('#lbr');
  const drawer=on=>{dr.classList.toggle('show',!!on);ar.classList.toggle('on',!!on);ar.setAttribute('aria-expanded',!!on)};
  ar.onclick=()=>drawer(!dr.classList.contains('show'));$('#dx').onclick=()=>drawer(0);
  view.addEventListener('pointerdown',()=>drawer(0));
  const h=$('#tlh');let y0=null;
  h.onpointerdown=e=>{y0=e.clientY;h.setPointerCapture(e.pointerId)};
  h.onpointerup=e=>{if(y0==null)return;const d=e.clientY-y0;y0=null;const m=Math.abs(d)<12?!tl.classList.contains('min'):d>0;tl.classList.toggle('min',m);if(m)drawer(0)};
  h.onpointercancel=()=>{y0=null};
  new ResizeObserver(()=>{document.documentElement.style.setProperty('--tlh',(tl.classList.contains('show')?tl.offsetHeight+8:0)+'px');applyZ()}).observe(tl);
  window.phMove=(c,full)=>{let p=$('#ph');if(!p){p=document.createElement('div');p.id='ph'}
    if(p.parentNode!==strip){strip.appendChild(p);full=1}
    p.style.left=(114+c*46+22)+'px';if(full){p.style.height='0';p.style.height=strip.scrollHeight+'px'}};
  // La Timeline se vuelve translúcida únicamente mientras se arrastra Opacidad o Brillo.
  const previewSliders=[$('#lo'),br];let previewPointer=false,previewKey=false;
  const previewState=()=>tl.classList.toggle('preview-adjusting',previewPointer||previewKey);
  previewSliders.forEach(sl=>{
    sl.addEventListener('pointerdown',()=>{previewPointer=true;previewState()});
    sl.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key)){previewKey=true;previewState()}});
    sl.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key)){previewKey=false;previewState()}});
    sl.addEventListener('pointerup',()=>{previewPointer=false;previewState()});
    sl.addEventListener('pointercancel',()=>{previewPointer=false;previewState()});
    sl.addEventListener('change',()=>{previewPointer=false;previewKey=false;previewState()});
    sl.addEventListener('blur',()=>{previewPointer=false;previewKey=false;previewState()});
  });
  window.addEventListener('pointerup',()=>{if(previewPointer){previewPointer=false;previewState()}});
  window.addEventListener('pointercancel',()=>{previewPointer=false;previewState()});
  br.oninput=()=>{const l=L[al];if(!l)return;l.br=+br.value===100?undefined:+br.value;$('#vbr').textContent=br.value;render()};
  br.onchange=()=>{thumbsAll();persist()};
  const _mk9=mark;mark=function(){_mk9();const l=L[al];if(!l)return;$('#dtn').textContent=GA&&GP[GA]?(GP[GA].n||'Grupo'):l.n;$('#vo').textContent=$('#lo').value;const b=l.br||100;br.value=b;$('#vbr').textContent=b;phMove(cur,1)};
  const _bs9=buildStrip;buildStrip=function(){_bs9();phMove(cur,1)};
  $('#lo').addEventListener('input',()=>{$('#vo').textContent=$('#lo').value});
  addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.ctrlKey||e.metaKey)return;const s=st.getBoundingClientRect(),cx=s.left+s.width/2,cy=s.top+s.height/2;
    if(e.key==='+'||e.key==='=')zoomAt(cx,cy,Z.z*1.25);else if(e.key==='-')zoomAt(cx,cy,Z.z/1.25);else if(e.key==='1')zoomAt(cx,cy,actualZ())});
  mark();
})();
