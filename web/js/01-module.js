
// ===== FASE 1: capas, timeline con holds por capa, exportación =====
let me=0,GP={},GA=null,CID=0,L=[],al=0,sel={a:0,b:0},rm=0,newCell=0,dg=null;
const nl=n=>({n,v:1,k:0,o:100,a:[]}),T=()=>Math.max(1,...L.map(l=>l.a.length)),esc=s=>String(s).replace(/[<&>"]/g,c=>'&#'+c.charCodeAt(0)+';');
function mk(){const c=document.createElement('canvas');c.width=W;c.height=H;c._id=++CID;dirty.add(c);return c}
const cl=c=>{const n=mk();n.getContext('2d').drawImage(c,0,0);if(c.m)n.m=cl(c.m);return n};
const cpy=a=>{const m=new Map();return a.map(r=>r?(m.get(r)||(m.set(r,cl(r)),m.get(r))):null)};
const fit=()=>{const n=T();L.forEach(l=>{while(l.a.length<n)l.a.push(null)})};
const rng=()=>{const n=T()-1;return[Math.min(sel.a,sel.b,n),Math.min(Math.max(sel.a,sel.b),n)]};
function cv(q){const l=L[al];if(!l)return null;if(l.k||!l.v){if(!q)toast(l.k?'La capa está bloqueada':'La capa está oculta');return null}
  while(l.a.length<=cur)l.a.push(null);if(!l.a[cur]){l.a[cur]=mk();newCell=1}const c=l.a[cur];if(c._ev){reload(c);return null}return me&&c.m?c.m:c}
let XPT=0;const BM={n:'source-over',m:'multiply',s:'screen',o:'overlay'};
function compOld(t,x,m=1){L.forEach(l=>{const c=l.v&&!(XPT&&l.ref)&&l.a[t];if(c){x.globalAlpha=l.o/100*m;x.globalCompositeOperation=BM[l.bm]||'source-over';x.drawImage(c,0,0,x.canvas.width,x.canvas.height)}});x.globalAlpha=1;x.globalCompositeOperation='source-over'}
function render(){vctx.globalAlpha=1;vctx.fillStyle=S.paper;vctx.fillRect(0,0,W,H);
  if(!playing){const a=S.oop/100;for(let k=S.before;k>=1;k--)if(cur-k>=0)comp(cur-k,vctx,a*(1-(k-1)*.3));
    for(let k=S.after;k>=1;k--)if(cur+k<T())comp(cur+k,vctx,a*(1-(k-1)*.3))}
  comp(cur,vctx);$('#cnt').textContent=(cur+1)+' / '+T()}
function thumb(t){const b=strip.querySelector('[data-h="'+t+'"] canvas');if(!b)return;const x=b.getContext('2d');x.fillStyle=S.paper;x.fillRect(0,0,b.width,b.height);comp(t,x)}
function buildStrip(){const n=T();let s='<div class="rw rl"><div class="lb" style="font-size:11px;color:var(--muted)">Capas</div>';
  for(let t=0;t<n;t++)s+='<button class="hd" data-h="'+t+'" aria-label="Cuadro '+(t+1)+'"><canvas width="80" height="45"></canvas>'+(t+1)+'</button>';
  s+='</div>';
  for(let i=L.length-1;i>=0;i--){const l=L[i];if(l.gid&&(i===L.length-1||L[i+1].gid!==l.gid))s+=ghead(l.gid);if(l.gid&&GP[l.gid]&&GP[l.gid].c&&i!==al)continue;
    s+='<div class="rw"><div class="lb"><button data-v="'+i+'" aria-label="Visibilidad">'+(l.v?'👁':'—')+'</button><button data-k="'+i+'" aria-label="Bloqueo">'+(l.k?'🔒':'🔓')+'</button><button class="nm" data-l="'+i+'">'+(l.gid?'┆ ':'')+(l.cl?'↳ ':'')+(l.alk?'α ':'')+(l.ref?'📌 ':'')+esc(l.n)+'</button></div>';
    for(let t=0;t<n;t++){const r=l.a[t];s+='<button class="ce'+(r?(r===l.a[t-1]?' h':' k'):'')+(r&&r.m?' mk':'')+(r&&r!==l.a[t+1]?' e':'')+(l.v?'':' off')+'" data-c="'+i+','+t+'"></button>'}s+='</div>'}
  strip.innerHTML=s;thumbsAll();mark();persist();memCheck()}
function mark(){strip.querySelectorAll('.on,.sel,.cu').forEach(x=>x.classList.remove('on','sel','cu'));
  const[a,b]=rng();strip.querySelectorAll('.hd').forEach(x=>{const t=+x.dataset.h;if(t===cur)x.classList.add('on');if(a!==b&&t>=a&&t<=b)x.classList.add('sel')});
  const c=strip.querySelector('[data-c="'+al+','+cur+'"]');if(c){c.classList.add('cu');c.scrollIntoView({block:'nearest',inline:'center'})}
  strip.querySelectorAll('.nm').forEach(x=>x.classList.toggle('on',+x.dataset.l===al));if(L[al])$('#lo').value=L[al].o}
function go(i){if(playing)return;cur=Math.max(0,Math.min(T()-1,i));render();mark();const tb=document.getElementById("tools");if(tb)tb.classList.add("visible")}
strip.onclick=e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.v!=null){L[+d.v].v^=1;buildStrip();render()}
  else if(d.k!=null){L[+d.k].k^=1;buildStrip()}
  else if(d.l!=null){al=+d.l;mark();const tb=document.getElementById('tools');if(tb)tb.classList.add('visible')}
  else if(d.c){const[i,t]=d.c.split(',').map(Number);al=i;sel={a:t,b:t};go(t)}};
strip.addEventListener('pointerdown',e=>{const h=e.target.closest('.hd');if(h)dg={t:+h.dataset.h,x:e.clientX,m:0,to:null}});
const clr=()=>strip.querySelectorAll('.tg2').forEach(x=>x.classList.remove('tg2'));
addEventListener('pointermove',e=>{if(!dg)return;if(Math.abs(e.clientX-dg.x)>12)dg.m=1;
  if(dg.m){const el=document.elementFromPoint(e.clientX,e.clientY),h=el&&el.closest&&el.closest('.hd');clr();dg.to=h?+h.dataset.h:null;if(h)h.classList.add('tg2')}});
addEventListener('pointercancel',()=>{dg=null;clr()});
addEventListener('pointerup',()=>{if(!dg)return;const d=dg;dg=null;clr();
  if(d.m){if(d.to!=null&&d.to!==d.t){let[a,b]=rng();if(d.t<a||d.t>b)a=b=d.t;moveCols(a,b,d.to)}return}
  if(rm)sel.b=d.t;else sel={a:d.t,b:d.t};go(d.t)});
function dd(){L.forEach(l=>{const s=new Set();for(let t=0;t<l.a.length;t++){const r=l.a[t];if(!r||r===l.a[t-1])continue;
  if(s.has(r)){const c=cl(r);let j=t;while(l.a[j]===r)l.a[j++]=c}else s.add(r)}})}
function moveCols(a,b,to){fit();const n=b-a+1,i=to>b?to-n+1:to;L.forEach(l=>{const k=l.a.splice(a,n);l.a.splice(i,0,...k)});
  dd();hist=[];cur=i;sel={a:i,b:i+n-1};buildStrip();render()}
function addCol(){fit();L.forEach(l=>l.a.splice(cur+1,0,null));cur++;sel={a:cur,b:cur};buildStrip();render()}
function dupR(){fit();const[a,b]=rng(),n=b-a+1;L.forEach(l=>l.a.splice(b+1,0,...cpy(l.a.slice(a,b+1))));cur=b+1;sel={a:b+1,b:b+n};buildStrip();render()}
function delR(){fit();const[a,b]=rng();if(b-a+1>=T())return toast('No se pueden borrar todos los cuadros');
  L.forEach(l=>l.a.splice(a,b-a+1));dd();hist=[];cur=Math.min(a,T()-1);sel={a:cur,b:cur};buildStrip();render()}
function hold(d){fit();const t=cur,ls=$('#hg').checked?L:[L[al]];
  if(d>0)ls.forEach(l=>l.a.splice(t+1,0,l.a[t]));
  else{if(!ls.every(l=>t+1<l.a.length&&l.a[t+1]===l.a[t]))return toast('No hay hold que quitar aquí');ls.forEach(l=>l.a.splice(t+1,1))}
  buildStrip();render()}
function lAdd(){L.splice(al+1,0,nl('Capa '+(L.length+1)));al++;buildStrip();render()}
function lMove(d){const j=al+d;if(j<0||j>=L.length)return;[L[al],L[j]]=[L[j],L[al]];al=j;buildStrip();render()}
function lDup(){const o=L[al];L.splice(al+1,0,{...o,n:o.n+' copia',a:cpy(o.a)});al++;buildStrip();render()}
function lDel(){if(L.length<2)return toast('Debe quedar al menos una capa');L.splice(al,1);al=Math.min(al,L.length-1);hist=[];buildStrip();render()}
function lMerge(){if(al<1)return toast('No hay capa debajo');const u=L[al],b=L[al-1],m=new Map();
  for(let t=0;t<u.a.length;t++){const r=u.a[t];if(!r)continue;const q=b.a[t]||null;let k=m.get(q);if(!k)m.set(q,k=new Map());let c=k.get(r);
    if(!c){c=q?cl(ef(q)):mk();const x=c.getContext('2d');x.globalAlpha=u.v?u.o/100:0;x.drawImage(ef(r),0,0);k.set(r,c)}
    while(b.a.length<=t)b.a.push(null);b.a[t]=c}
  L.splice(al,1);al--;hist=[];buildStrip();render()}
$('#add').onclick=()=>{if(!playing)addCol()};$('#dup').onclick=()=>{if(!playing)dupR()};$('#del').onclick=()=>{if(!playing&&confirm('¿Borrar el rango de cuadros seleccionado?'))delR()};
$('#rg').onclick=e=>{rm^=1;e.currentTarget.classList.toggle('on',!!rm)};$('#hp').onclick=()=>hold(1);$('#hm').onclick=()=>hold(-1);
$('#la').onclick=lAdd;$('#lu').onclick=()=>lMove(1);$('#ld').onclick=()=>lMove(-1);$('#lc').onclick=lDup;$('#lm').onclick=()=>{if(confirm('¿Fusionar "'+L[al].n+'" con la capa de abajo? No se puede deshacer.'))lMerge()};$('#lx').onclick=()=>{if(L.length<2)return;const nm=L[al].n,cnt=L[al].a.filter(Boolean).length;if(cnt&&confirm('¿Borrar la capa "'+nm+'" con '+cnt+' cuadro(s) dibujados? No se puede deshacer.'))lDel();else if(!cnt)lDel()};
$('#lo').onchange=()=>{thumbsAll();persist()};
function setSize(w,h){const mp=new Map(),old=L;W=S.w=w;H=S.h=h;view.width=W;view.height=H;
  L=old.length?old.map(l=>({...l,a:l.a.map(c=>{if(!c)return null;if(!mp.has(c)){const n=mk();n.getContext('2d').drawImage(c,0,0,W,H);if(c.m){n.m=mk();n.m.getContext('2d').drawImage(c.m,0,0,W,H)}mp.set(c,n)}return mp.get(c)})})):[nl('Capa 1')];
  hist=[];save();render();buildStrip()}
function dirtyAll(){L.forEach(l=>l.a.forEach(c=>c&&dirty.add(c)))}
let _mbk=0,_persistChain=Promise.resolve();
function persist(){clearTimeout(pt);pt=setTimeout(()=>persistNow(),700)}
function persistNow(){clearTimeout(pt);pt=0;
  _persistChain=_persistChain.then(async()=>{
    if(!DB.db)throw new Error('La base de datos no está disponible');
    const pending=[...dirty],writes=[];
    for(const c of pending){
      const version=c._v;
      const blob=await new Promise(resolve=>{try{c.toBlob(resolve)}catch(e){resolve(null)}});
      if(!blob)throw new Error('No se pudo preparar un fotograma para guardar');
      const ok=await DB.putCell(c._id,blob,version);
      if(!ok)throw new Error('IndexedDB rechazó la escritura de un fotograma');
      writes.push([c,version]);
    }
    const meta={v:2,w:W,h:H,cur,al,gp:GP,L:L.map(l=>({n:l.n,v:l.v,k:l.k,o:l.o,bm:l.bm,br:l.br,ref:l.ref,alk:l.alk,cl:l.cl,gid:l.gid,ms:l.a.map(c=>c&&c.m?c.m._id:0),a:l.a.map(c=>c?c._id:0)}))};
    if(!_mbk){const previous=await DB.get('meta');if(previous){const backed=await DB.put('meta-bak',previous);if(!backed)throw new Error('No se pudo crear la copia de seguridad previa')}_mbk=1}
    const saved=await DB.put('meta',meta);
    if(!saved)throw new Error('No se pudo confirmar el índice del proyecto');
    for(const [c,version] of writes){if(c._v===version){c._sv=version;dirty.delete(c)}}
    return true;
  }).catch(e=>{toast('⚠ Guardado incompleto: '+(e&&e.message?e.message:'error de almacenamiento'));return false});
  return _persistChain;
}
function memCheck(){const s=new Set();L.forEach(l=>l.a.forEach(c=>c&&s.add(c)));const mb=W*H*4/1048576*s.size;
  if(mb>S.memWarn){if(!warned){warned=true;toast('Proyecto grande: unos '+(mb/1024).toFixed(1)+' GB en memoria.')}}else warned=false}
// ----- Exportación -----
const xm=t=>{const e=$('#xm');if(e)e.textContent=t},tick=()=>new Promise(r=>setTimeout(r));
function fc(t,sc,bg){const c=document.createElement('canvas');c.width=Math.round(W*sc);c.height=Math.round(H*sc);const x=c.getContext('2d');if(bg){x.fillStyle=S.paper;x.fillRect(0,0,c.width,c.height)}XPT=1;comp(t,x);XPT=0;return c}
function dl(b,n){const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5e3)}
const CT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t.push(c>>>0)}return t})();
const crc=u=>{let c=-1;for(let i=0;i<u.length;i++)c=CT[(c^u[i])&255]^(c>>>8);return(c^-1)>>>0};
function zip(fs){const P=[],C=[],enc=new TextEncoder();let o=0,cs=0;
  fs.forEach(([n,u])=>{const nm=enc.encode(n),cr=crc(u),h=new DataView(new ArrayBuffer(30)),g=new DataView(new ArrayBuffer(46));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint32(14,cr,true);h.setUint32(18,u.length,true);h.setUint32(22,u.length,true);h.setUint16(26,nm.length,true);P.push(h.buffer,nm,u);
    g.setUint32(0,0x02014b50,true);g.setUint16(4,20,true);g.setUint16(6,20,true);g.setUint32(16,cr,true);g.setUint32(20,u.length,true);g.setUint32(24,u.length,true);g.setUint16(28,nm.length,true);g.setUint32(42,o,true);
    C.push(g.buffer,nm);cs+=46+nm.length;o+=30+nm.length+u.length});
  const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,fs.length,true);e.setUint16(10,fs.length,true);e.setUint32(12,cs,true);e.setUint32(16,o,true);
  return new Blob([...P,...C,e.buffer],{type:'application/zip'})}
function lzw(px){const B=[];let cu=0,nb=0,bits=9,nx=258,d=new Map();
  const e=c=>{cu|=c<<nb;nb+=bits;while(nb>=8){B.push(cu&255);cu>>>=8;nb-=8}};
  e(256);let p=px[0];
  for(let i=1;i<px.length;i++){const k=px[i],key=p<<8|k,v=d.get(key);
    if(v===undefined){e(p);if(nx===4096){e(256);nx=258;bits=9;d=new Map()}else{if(nx>=(1<<bits))bits++;d.set(key,nx++)}p=k}else p=v}
  e(p);e(257);if(nb>0)B.push(cu&255);return B}
async function xGif(sc){const n=T(),w=Math.round(W*sc),h=Math.round(H*sc),dy=Math.max(2,Math.round(100/S.fps)),
  o=[71,73,70,56,57,97,w&255,w>>8,h&255,h>>8,0xF7,0,0];
  for(let r=0;r<6;r++)for(let g=0;g<7;g++)for(let b=0;b<6;b++)o.push(r*51,Math.round(g*255/6),b*51);
  for(let i=0;i<12;i++)o.push(0);o.push(33,255,11,...Array.from('NETSCAPE2.0',c=>c.charCodeAt(0)),3,1,0,0,0);
  for(let t=0;t<n;t++){xm('GIF '+(t+1)+' / '+n);await tick();const d=fc(t,sc,1).getContext('2d').getImageData(0,0,w,h).data,px=new Uint8Array(w*h);
    for(let i=0,j=0;i<px.length;i++,j+=4)px[i]=Math.round(d[j]/51)*42+Math.round(d[j+1]*6/255)*6+Math.round(d[j+2]/51);
    o.push(33,249,4,0,dy&255,dy>>8,0,0,44,0,0,0,0,w&255,w>>8,h&255,h>>8,0,8);
    const z=lzw(px);for(let i=0;i<z.length;i+=255){const c=z.slice(i,i+255);o.push(c.length,...c)}o.push(0)}
  o.push(59);dl(new Blob([new Uint8Array(o)],{type:'image/gif'}),'animacion.gif');xm('Listo: GIF descargado')}
async function xPng(sc){const n=T(),fs=[];for(let t=0;t<n;t++){xm('PNG '+(t+1)+' / '+n);await tick();
  const b=await new Promise(r=>fc(t,sc,0).toBlob(r));fs.push([String(t+1).padStart(4,'0')+'.png',new Uint8Array(await b.arrayBuffer())])}
  dl(zip(fs),'animacion_png.zip');xm('Listo: ZIP con PNG transparentes')}
const XP={gif:xGif,png:xPng};/* mp4 se asigna más abajo: XP.mp4=xVid */
// ----- Arranque -----
(async()=>{applyTheme();rail();
  if(await DB.open()){const m=await DB.get('meta');
    if(m&&m.w*m.h<=16777216){W=S.w=m.w;H=S.h=m.h;view.width=W;view.height=H;const mp=new Map();let lvn=0;
      const ld=async id=>{if(!id)return null;if(mp.has(id))return mp.get(id);const b=await DB.get('c'+id),c=document.createElement('canvas');c.width=W;c.height=H;c._id=id;CID=Math.max(CID,id);
        if(b)try{c.getContext('2d').drawImage(await createImageBitmap(b),0,0)}catch(e){}let cvr=await DB.get('cv'+id);if(typeof cvr!=='number'){cvr=-(Date.now()*1000+(lvn++));DB.put('cv'+id,cvr)}c._v=c._sv=cvr;mp.set(id,c);return c};
      if(m.L){for(const l of m.L){const a=[];for(const id of l.a)a.push(await ld(id));if(l.ms)for(let i=0;i<a.length;i++)if(l.ms[i]&&a[i]&&!a[i].m)a[i].m=await ld(l.ms[i]);L.push({...l,a})}al=Math.min(m.al||0,L.length-1);GP=m.gp||{}}
      else if(m.n>0){const l=nl('Capa 1');for(let i=0;i<m.n;i++){const b=await DB.get('f'+i),c=mk();if(b)try{c.getContext('2d').drawImage(await createImageBitmap(b),0,0)}catch(e){}l.a.push(c)}L.push(l)}
      if(L.length){cur=Math.min(m.cur||0,T()-1);sel={a:cur,b:cur};render();buildStrip();return}}}
  setSize(W,H)})();

