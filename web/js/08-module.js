
// ===== Avisos de actualización (GitHub Releases) =====
const UPD={manifest:'https://raw.githubusercontent.com/manceraarts-lang/FILMFRAME/main/version.json',every:864e5,k:{last:'upd-last',skip:'upd-skip'}};
const verCmp=(a,b)=>{const x=String(a).replace(/^v/i,'').split('.').map(n=>parseInt(n)||0),y=String(b).replace(/^v/i,'').split('.').map(n=>parseInt(n)||0);
  for(let i=0;i<Math.max(x.length,y.length);i++){const d=(x[i]||0)-(y[i]||0);if(d)return d>0?1:-1}return 0};
const escH=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function checkUpdate(manual){
  try{
    if(!manual&&Date.now()-(+localStorage.getItem(UPD.k.last)||0)<UPD.every)return;
    const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);
    const r=await fetch(UPD.manifest+'?t='+Date.now(),{cache:'no-store',signal:c.signal});
    clearTimeout(t);
    if(!r.ok)throw new Error(r.status);
    const j=await r.json();localStorage.setItem(UPD.k.last,Date.now());
    const v=String(j.version||'').replace(/^v/i,''),dl=String(j.url||'');
    if(!v||verCmp(v,APP.version)<=0){if(manual)toast('Ya tienes la última versión ('+APP.version+')');return}
    if(!manual&&localStorage.getItem(UPD.k.skip)===v)return;
    if(!/^https:\/\//.test(dl))throw new Error('url');updDialog(v,j.notes||'',dl)
  }catch(e){if(manual)toast('No se pudo buscar actualizaciones')}
}
function updDialog(v,notes,url){
  if(document.getElementById('upd'))return;
  const d=document.createElement('div');d.id='upd';
  d.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:20px';
  d.innerHTML='<div role="dialog" aria-modal="true" style="background:var(--panel,#262626);color:var(--text,#fff);border-radius:12px;padding:20px;max-width:340px;width:100%;font:14px system-ui,sans-serif">'
   +'<h3 style="margin:0 0 4px">Nueva versión '+escH(v)+'</h3><div style="color:var(--muted,#aaa);margin-bottom:10px">Tienes la '+escH(APP.version)+'</div>'
   +'<div style="max-height:30vh;overflow:auto;white-space:pre-wrap;margin-bottom:14px">'+escH(notes.slice(0,600)||'Mejoras y correcciones.')+'</div>'
   +'<button id="updGo" class="chip on" style="width:100%;padding:10px">Descargar</button>'
   +'<button id="updLater" class="chip" style="width:100%;padding:10px;margin-top:6px">Más tarde</button>'
   +'<button id="updSkip" class="chip" style="width:100%;padding:6px;margin-top:6px;font-size:12px">Omitir esta versión</button></div>';
  document.body.appendChild(d);
  d.querySelector('#updGo').onclick=()=>{window.open(url,'_blank');d.remove()};
  d.querySelector('#updLater').onclick=()=>d.remove();
  d.querySelector('#updSkip').onclick=()=>{localStorage.setItem(UPD.k.skip,v);d.remove()};
}
window.addEventListener('load',()=>setTimeout(checkUpdate,3000));
