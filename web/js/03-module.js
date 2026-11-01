
// ===== FASE 3: mezcla, estabilizador, caché de vista previa en disco, UX =====
let sm=null,lastRaw=null,prevTool=null,VC=Date.now(),cbusy=0;
const CK=new Set(),PB=new Map(),PL=new Set();
const _da=dirty.add;dirty.add=function(c){if(c)c._v=++VC;return _da.call(this,c)};
// estabilizador
// mezcla
$('#lb').onchange=e=>{L[al].bm=e.target.value;render();thumbsAll();persist()};
const _mk=mark;mark=function(){_mk();if(L[al])$('#lb').value=L[al].bm||'n'};
// historial de colores + cuentagotas
function addHist(c){const r=S.rc||[];if(r[0]===c)return;S.rc=[c,...r.filter(x=>x!==c)].slice(0,12);save()}
IC.eye='m2 22 1-1h3l9-9M3 21v-3l9-9M15 6l3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z';NAMES.eye='Cuentagotas';if(S.tools.eye===undefined)S.tools.eye=1;
FLY.col.plus.push(()=>'<h3 style="margin-top:12px">Recientes</h3><div class="sws">'+((S.rc||[]).map((c,i)=>'<button class="sw2" data-r="'+i+'" style="background:'+c+'" aria-label="Color reciente '+(i+1)+'"></button>').join('')||'<small style="color:var(--muted)">Aún no hay</small>')+'</div>');
FLY.col.wirePlus.push(()=>{
  fly.querySelectorAll('.sw2').forEach(b=>b.onclick=()=>{S.pal[ci]=S.rc[+b.dataset.r];save();fly.innerHTML=flyHTML('col');wireFly('col');rail()});
  const cp=$('#cp');if(cp)cp.onchange=()=>addHist(S.pal[ci])});
const _tap=tap;tap=function(id){if(id==='eye'&&tool!=='eye')prevTool=tool;_tap(id)};
const _sd=selDown;selDown=function(e){if(tool==='eye')return pick(pos(e));_sd(e)};
const _bk=bucket;bucket=function(p){addHist(S.pal[ci]);_bk(p)};
function pick(p){const c=document.createElement('canvas');c.width=c.height=1;const g=c.getContext('2d');g.fillStyle=S.paper;g.fillRect(0,0,1,1);g.translate(-Math.round(p.x),-Math.round(p.y));
  L.forEach(l=>{const q=l.v&&l.a[cur];if(q){g.globalAlpha=l.o/100;g.globalCompositeOperation=BM[l.bm]||'source-over';g.drawImage(q,0,0)}});
  const d=g.getImageData(0,0,1,1).data,hx='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('');S.pal[ci]=hx;addHist(hx);save();setT(prevTool||'pen');toast('Color '+hx)}
// atajos
const KS=[['B / E','Pincel / Borrador'],['G / M / I','Relleno / Selección / Cuentagotas'],['[  ]','Tamaño del pincel'],['Ctrl+Z','Deshacer'],['← →  Inicio  Fin','Cuadro anterior/siguiente/primero/último'],['↑ ↓','Cambiar de capa'],['Enter','Reproducir / pausar'],['N','Cuadro nuevo'],['D','Duplicar cuadro(s) seleccionados'],['H  /  Mayús+H','Hold +1 / −1'],['L','Capa nueva'],['Supr','Borrar selección'],['Esc','Deseleccionar'],['Espacio + arrastrar','Mover el lienzo'],['+  −  0','Zoom / restablecer'],['Ctrl+S','Guardar proyecto'],['?','Esta ayuda']];
addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();
  if((e.ctrlKey||e.metaKey)&&k==='s'){e.preventDefault();saveProj(PN).then(()=>toast('Guardado: '+PN));return}
  if(e.ctrlKey||e.metaKey||playing&&k!=='enter')return;
  if(k==='i')tap('eye');else if(k==='home')go(0);else if(k==='end')go(T()-1);else if(k==='d')dupR();else if(k==='h')hold(e.shiftKey?-1:1);else if(k==='l')lAdd();
  else if(k==='arrowup'){al=Math.min(L.length-1,al+1);mark();e.preventDefault()}else if(k==='arrowdown'){al=Math.max(0,al-1);mark();e.preventDefault()}
  else if(k==='+'||k==='='){Z.z=Math.min(8,Z.z*1.25);applyZ()}else if(k==='-'){Z.z=Math.max(.25,Z.z/1.25);applyZ()}
  else if(k==='?'||k==='f1'){e.preventDefault();help()}});
// ----- caché de vista previa en disco -----
const CD={db:null,ready:new Promise(ok=>{try{const q=indexedDB.open(STORE.cache,1);q.onupgradeneeded=()=>q.result.createObjectStore('c');q.onsuccess=()=>{CD.db=q.result;ok()};q.onerror=()=>ok()}catch(e){ok()}})};
const cdb=(m,f)=>new Promise((ok,no)=>{const t=CD.db.transaction('c',m),r=f(t.objectStore('c'));t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>no(t.error);t.onabort=()=>no(t.error)});
const h53=s=>{let a=0xdeadbeef,b=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}
  a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return(4294967296*(2097151&b)+(a>>>0)).toString(36)};
const pvs=()=>Math.min(1,854/Math.max(W,H));const CVER='|cache3-480p-webp';
function fkey(t){return h53(L.map(l=>{const c=l.v&&l.a[t];return c?c._id+'.'+(c._v||0)+'.'+l.o+'.'+(l.bm||'n')+(l.br&&l.br!==100?'b'+l.br:'')+'.'+(c.m?c.m._v||0:'')+(l.cl?'c':'')+(l.alk?'a':'')+(l.gid?l.gid+JSON.stringify(GP[l.gid]):''):''}).join('|')+S.paper+W+H+CVER)}
const allCached=()=>{for(let t=0;t<T();t++)if(!CK.has(fkey(t)))return false;return true};
const _th=thumb;thumb=function(t){_th(t);const h=strip.querySelector('[data-h="'+t+'"]');if(h)h.classList.toggle('cc',CK.has(fkey(t)))};
async function buildCache(prog){await CD.ready;await CKR;if(!CD.db)return true;cbusy=1;
  try{const n=T(),sc=pvs(),w=Math.round(W*sc),h=Math.round(H*sc),need=[],seen=new Set(),all=new Set();
    for(let t=0;t<n;t++){const k=fkey(t);all.add(k);if(!CK.has(k)&&!seen.has(k)){seen.add(k);need.push([t,k])}}
    for(let i=0;i<need.length;i++){if(cbusy===2)return false;prog&&prog(i+1,need.length);const[t,k]=need[i],c=document.createElement('canvas');c.width=w;c.height=h;
      const g=c.getContext('2d');g.fillStyle=S.paper;g.fillRect(0,0,w,h);comp(t,g);
      const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));c.width=1;await cdb('readwrite',s=>s.put(b,k));CK.add(k)}
    for(const k of await cdb('readonly',s=>s.getAllKeys()))if(!all.has(k)){await cdb('readwrite',s=>s.delete(k));CK.delete(k)}
    return true}
  catch(e){S.pvc=0;save();toast('No hay espacio para la caché; se reproduce sin ella.');return true}
  finally{cbusy=0}}
async function clearCache(){await CD.ready;if(CD.db)await cdb('readwrite',s=>s.clear());CK.clear();thumbsAll();toast('Caché borrada')}
const CKR=CD.ready.then(async()=>{if(!CD.db)return;try{(await cdb('readonly',s=>s.getAllKeys())).forEach(k=>CK.add(k))}catch(e){}if(L.length)thumbsAll()});
function prefetch(pk,c,n){const N=Math.min(n,Math.max(6,Math.round(S.fps*1.5))),need=new Set();for(let k=0;k<N;k++)need.add(pk[(c+k)%n]);
  PB.forEach((b,k)=>{if(!need.has(k)){b.close();PB.delete(k)}});
  need.forEach(k=>{if(PB.has(k)||PL.has(k)||!CK.has(k))return;PL.add(k);
    cdb('readonly',s=>s.get(k)).then(b=>b&&createImageBitmap(b)).then(bm=>{PL.delete(k);if(!bm)return;if(playing)PB.set(k,bm);else bm.close()}).catch(()=>PL.delete(k))})}
function drawF(pk,c){const b=PB.get(pk[c]);if(b){vctx.globalAlpha=1;vctx.drawImage(b,0,0,W,H);$('#cnt').textContent=(c+1)+' / '+pk.length}else render()}
function lite(c){const o=strip.querySelector('.hd.on');if(o)o.classList.remove('on');const h=strip.querySelector('[data-h="'+c+'"]');if(h){h.classList.add('on');h.scrollIntoView({block:'nearest',inline:'nearest'})}phMove(c)}
function startPlay(btn){playing=true;btn.classList.add('on');closeFly();const n=T(),pk=[...Array(n)].map((_,t)=>fkey(t));let t0=performance.now(),c0=cur,lp=cur;
  aPlay(cur);prefetch(pk,cur,n);
  timer=setInterval(()=>{const c=(c0+Math.floor((performance.now()-t0)*S.fps/1000))%n;if(c===lp)return;if(c<lp){t0=performance.now();c0=0;aPlay(0)}cur=lp=c;drawF(pk,c);lite(c);prefetch(pk,c,n)},1000/S.fps/3)}
function stopPlay(){playing=false;$('#play').classList.remove('on');clearInterval(timer);aStop();PB.forEach(b=>b.close());PB.clear();render();mark()}
$('#play').onclick=async e=>{if(playing)return stopPlay();if(cbusy){toast('La caché manual está en proceso; puedes cancelarla desde Precalcular.');return}const btn=e.currentTarget;
  startPlay(btn)};
$('#pcb').onclick=async()=>{if(cbusy){cbusy=2;return}const ok=await buildCache((i,n)=>$('#mb').textContent='Caché '+i+' / '+n);thumbsAll();memBadge();toast(ok?'Caché lista':'Caché cancelada')};

// ----- precálculo progresivo: una previsualización por tarea, sin bloquear la reproducción -----
const PVQ=[];let PVSet=new Set(),PVBusy=0,PVT=0;
function queuePreview(center=cur,all=false){
  if(S.pvc===0||!CD.db||!L.length)return;
  const n=T(),order=[];
  // Prioridad: fotograma actual, próximos, anteriores y después el resto.
  order.push(Math.max(0,Math.min(n-1,center)));
  for(let d=1;d<=Math.min(8,n);d++){if(center+d<n)order.push(center+d);if(center-d>=0)order.push(center-d)}
  if(all)for(let t=0;t<n;t++)order.push(t);
  const seen=new Set();
  for(const t of order){if(seen.has(t))continue;seen.add(t);const k=fkey(t);if(CK.has(k)||PVSet.has(k))continue;PVSet.add(k);PVQ.push([t,k])}
  if(!PVT)PVT=setTimeout(runPreviewJob,180);
}
async function runPreviewJob(){PVT=0;if(PVBusy||!PVQ.length)return;
  if(playing||drawing||cbusy){PVT=setTimeout(runPreviewJob,350);return}
  await CD.ready;if(!CD.db){PVQ.length=0;PVSet.clear();return}
  const item=PVQ.shift();if(!item)return;const[t,k]=item;PVBusy=1;
  try{
    // La clave puede haber cambiado mientras esperaba en cola; nunca guardar una imagen obsoleta.
    if(k!==fkey(t)||CK.has(k))return;
    const sc=pvs(),w=Math.max(1,Math.round(W*sc)),h=Math.max(1,Math.round(H*sc));
    const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{alpha:false});
    g.fillStyle=S.paper;g.fillRect(0,0,w,h);comp(t,g);
    let blob=await new Promise(resolve=>c.toBlob(resolve,'image/webp',.82));
    if(!blob||!blob.size)blob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.84));
    c.width=1;c.height=1;
    if(blob&&k===fkey(t)){await cdb('readwrite',store=>store.put(blob,k));CK.add(k);const h=strip.querySelector('[data-h="'+t+'"]');if(h)h.classList.add('cc')}
  }catch(e){/* Fallo de caché no debe interrumpir el dibujo ni la reproducción. */}
  finally{PVBusy=0;PVSet.delete(k);if(PVQ.length&&!PVT)PVT=setTimeout(runPreviewJob,playing||drawing?350:25)}
}
const _goPV=go;go=function(i){_goPV(i);queuePreview(cur,true)};
const _markPV=mark;mark=function(){_markPV();if(!playing)queuePreview(cur,false)};
addEventListener('visibilitychange',()=>{if(!document.hidden&&PVQ.length&&!PVT)PVT=setTimeout(runPreviewJob,100)});
// ----- memoria -----
const _mc=memCheck;memCheck=function(){_mc();while(hist.length>1&&hist.length*W*H*4>3e8)hist.shift();memBadge()};
rail();

