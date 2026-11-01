
// ===== FASE 2: audio, relleno, selección, proyectos =====
Object.assign(IC,{fil:'m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11ZM5 2l5 5M2 13h15M22 20a2 2 0 1 1-4 0c0-1.1 2-4 2-4s2 2.9 2 4Z',sel:'M5 3a2 2 0 0 0-2 2M19 3a2 2 0 0 1 2 2M21 19a2 2 0 0 1-2 2M5 21a2 2 0 0 1-2-2M9 3h1M9 21h1M14 3h1M14 21h1M3 9v1M21 9v1M3 14v1M21 14v1'});
Object.assign(NAMES,{fil:'Relleno',sel:'Selección'});
['fil','sel'].forEach(k=>{if(S.tools[k]===undefined)S.tools[k]=1});
FLY.fil.html=()=>'<h3>Relleno</h3><label class="f">Tolerancia: <b id="vt">'+(S.tol??24)+'</b><input id="tl2" type="range" min="0" max="100" value="'+(S.tol??24)+'"></label><label class="row">Usar todas las capas<input id="fa" type="checkbox"'+(S.fall!==0?' checked':'')+'></label><label class="row">Preservar transparencia<input id="fp" type="checkbox"'+(S.fpt?' checked':'')+'></label>';
FLY.sel.html=()=>'<h3>Selección</h3><div class="chips"><button class="chip'+(S.st!=='l'&&S.st!=='e'?' on':'')+'" data-s="r">Rectángulo</button><button class="chip'+(S.st==='l'?' on':'')+'" data-s="l">Lazo</button><button class="chip'+(S.st==='e'?' on':'')+'" data-s="e">Elipse</button></div><div class="chips"><button class="chip" id="sd2">Borrar selección</button><button class="chip" id="stf">Transformar</button><button class="chip" id="sn">Deseleccionar</button></div><small style="color:var(--muted)">Arrastra dentro de la selección para moverla.</small>';
FLY.fil.wire=()=>{$('#tl2').oninput=e=>{S.tol=+e.target.value;$('#vt').textContent=S.tol;save()};$('#fa').onchange=e=>{S.fall=e.target.checked?1:0;save()};$('#fp').onchange=e=>{S.fpt=e.target.checked?1:0;save()};return};
FLY.sel.wire=()=>{fly.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{S.st=b.dataset.s;save();fly.innerHTML=flyHTML('sel');wireFly('sel')});$('#sd2').onclick=delSel;$('#stf').onclick=()=>{closeFly();tfStart()};$('#sn').onclick=()=>{SL.path=SL.pts=null;render()};return};
// --- relleno ---
function bucket(p){const c=cv();if(!c)return;const x0=Math.round(p.x),y0=Math.round(p.y);if(x0<0||y0<0||x0>=W||y0>=H)return;
  let rc=c;if(S.fall!==0){rc=document.createElement('canvas');rc.width=W;rc.height=H;const g=rc.getContext('2d');g.fillStyle=S.paper;g.fillRect(0,0,W,H);comp(cur,g)}
  const rd=rc.getContext('2d').getImageData(0,0,W,H).data,tg=c.getContext('2d'),id=tg.getImageData(0,0,W,H);
  hist.push({c,d:new ImageData(new Uint8ClampedArray(id.data),W,H)});trimH();
  const t=(S.tol??24)*2.55,s0=(y0*W+x0)*4,r=rd[s0],g=rd[s0+1],b=rd[s0+2],a=rd[s0+3],m=new Uint8Array(W*H),st=[x0,y0];
  const ok=i=>Math.abs(rd[i]-r)<=t&&Math.abs(rd[i+1]-g)<=t&&Math.abs(rd[i+2]-b)<=t&&Math.abs(rd[i+3]-a)<=t;
  while(st.length){const y=st.pop(),x=st.pop();let xl=x;while(xl>=0&&!m[y*W+xl]&&ok((y*W+xl)*4))xl--;xl++;let up=0,dn=0;
    for(let xx=xl;xx<W&&!m[y*W+xx]&&ok((y*W+xx)*4);xx++){m[y*W+xx]=1;
      if(y>0){const k=(y-1)*W+xx,o=!m[k]&&ok(k*4);if(o&&!up)st.push(xx,y-1);up=o}
      if(y<H-1){const k=(y+1)*W+xx,o=!m[k]&&ok(k*4);if(o&&!dn)st.push(xx,y+1);dn=o}}}
  const cc=S.pal[ci],R=parseInt(cc.slice(1,3),16),G2=parseInt(cc.slice(3,5),16),B=parseInt(cc.slice(5,7),16),d=id.data;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x,f=m[k]||(x>0&&m[k-1])||(x<W-1&&m[k+1])||(y>0&&m[k-W])||(y<H-1&&m[k+W]);
    const pt=alk()||S.fpt,a0=d[k*4+3];if(f&&(m[k]||a0<10)&&(!pt||a0>10)){const i=k*4;d[i]=R;d[i+1]=G2;d[i+2]=B;d[i+3]=255}else if(!pt&&a0<10&&((x>1&&m[k-2])||(x<W-2&&m[k+2])||(y>1&&m[k-2*W])||(y<H-2&&m[k+2*W]))){const i=k*4;d[i]=R;d[i+1]=G2;d[i+2]=B;d[i+3]=110}}
  tg.putImageData(id,0,0);dirty.add(c);thumb(cur);persist();render();if(newCell){newCell=0;buildStrip()}}
// --- selección ---
const SL={pts:null,path:null,mode:null,d:null};
const mkPath=pts=>{const p=new Path2D();pts.forEach((q,i)=>i?p.lineTo(q.x,q.y):p.moveTo(q.x,q.y));p.closePath();return p};
function selDown(e){view.setPointerCapture(e.pointerId);const p=pos(e);
  if(tool==='fil')return bucket(p);
  if(SL.path&&vctx.isPointInPath(SL.path,p.x,p.y))return mvStart(p);
  SL.path=null;SL.pts=[p];SL.mode='draw';render()}
function mvStart(p){const c=cv();if(!c)return;const g=c.getContext('2d');hist.push({c,d:g.getImageData(0,0,W,H)});trimH();
  const f=document.createElement('canvas'),b=document.createElement('canvas');f.width=b.width=W;f.height=b.height=H;
  const fg=f.getContext('2d'),bg=b.getContext('2d');fg.save();fg.clip(SL.path);fg.drawImage(c,0,0);fg.restore();
  bg.drawImage(c,0,0);bg.globalCompositeOperation='destination-out';bg.fill(SL.path);SL.fl=f;SL.bs=b;SL.s=p;SL.d=null;SL.mode='move'}
function delSel(){if(!SL.path)return;const c=cv();if(!c)return;const g=c.getContext('2d');hist.push({c,d:g.getImageData(0,0,W,H)});trimH();
  g.save();g.globalCompositeOperation='destination-out';g.fill(SL.path);g.restore();dirty.add(c);thumb(cur);persist();render()}
view.addEventListener('pointermove',e=>{if(!SL.mode||G)return;const p=pos(e);
  if(SL.mode==='draw'){const a=SL.pts[0];if(S.st==='l')SL.pts.push(p);else if(S.st==='e')SL.pts=ell(a,p);else SL.pts=[a,{x:p.x,y:a.y},p,{x:a.x,y:p.y}]}
  else{const c=cv(1),dx=p.x-SL.s.x,dy=p.y-SL.s.y,g=c.getContext('2d');SL.d={dx,dy};g.clearRect(0,0,W,H);g.drawImage(SL.bs,0,0);g.drawImage(SL.fl,dx,dy)}
  requestAnimationFrame(render)});
function selUp(){if(SL.mode==='draw'){const p=SL.pts,ok=p.length>3&&(S.st==='l'||bbw(p)>3);
    if(ok)SL.path=mkPath(p);else SL.pts=null;SL.mode=null;render()}
  else if(SL.mode==='move'){const d=SL.d;SL.mode=null;if(d){SL.pts=SL.pts.map(q=>({x:q.x+d.dx,y:q.y+d.dy}));SL.path=mkPath(SL.pts);dirty.add(cv(1));thumb(cur);persist()}SL.d=SL.fl=SL.bs=null;render()}}
view.addEventListener('pointerup',selUp);view.addEventListener('pointercancel',selUp);
function drawSel(){const p=SL.pts;if(playing||!p||p.length<2)return;const o=SL.mode==='move'&&SL.d?SL.d:{dx:0,dy:0},lw=2*W/view.getBoundingClientRect().width,pa=mkPath(p);
  vctx.save();vctx.translate(o.dx,o.dy);vctx.lineWidth=lw;vctx.setLineDash([]);vctx.strokeStyle='#fff';vctx.stroke(pa);vctx.setLineDash([6*lw,6*lw]);vctx.lineDashOffset=-(performance.now()/60)%(12*lw);vctx.strokeStyle='#000';vctx.stroke(pa);vctx.restore()}
const _rd=render;render=function(){_rd();drawSel()};
addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();
  if(k==='g')setT('fil');else if(k==='m')setT('sel');else if((k==='delete'||k==='backspace')&&SL.path){e.preventDefault();delSel()}else if(k==='escape'){SL.path=SL.pts=null;render()}});
// --- audio ---
let AU=[],AC=null,AS=[];
function aStop(){AS.forEach(s=>{try{s.stop()}catch(e){}});AS=[]}
$('#af').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)addAudio(f,f.name)};
const _bs=buildStrip;buildStrip=function(){_bs();audRows()};
strip.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.ao){const[i,k]=d.ao.split(',').map(Number);AU[i].off+=k;audSave();buildStrip()}
  else if(d.am!=null){AU[+d.am].m^=1;audSave();buildStrip()}
  else if(d.ax!=null){AU.splice(+d.ax,1);audSave();buildStrip()}});
(async()=>{for(let i=0;i<50&&!DB.db;i++)await new Promise(r=>setTimeout(r,60));if(!DB.db)return;const m=await DB.get('audio');
  for(let i=0;m&&i<m.length;i++){const b=await DB.get('a'+i);if(b)await addAudio(b,m[i].n,m[i].off,m[i].m,m[i])}})();
// --- proyectos ---
let PN=S.pn||'Sin título';
const PD={db:null,ready:new Promise(ok=>{try{const q=indexedDB.open(STORE.projects,1);q.onupgradeneeded=()=>{q.result.createObjectStore('p');q.result.createObjectStore('m')};q.onsuccess=()=>{PD.db=q.result;ok()};q.onerror=()=>ok()}catch(e){ok()}})};
const idb=(s,m,f)=>new Promise((ok,no)=>{const t=PD.db.transaction(s,m),r=f(t.objectStore(s));t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>no(t.error)});
async function saveProj(name){const cs=[],ix=new Map();L.forEach(l=>l.a.forEach(c=>{if(c&&!ix.has(c)){ix.set(c,cs.length);cs.push(c)}if(c&&c.m&&!ix.has(c.m)){ix.set(c.m,cs.length);cs.push(c.m)}}));
  const bl=await Promise.all(cs.map(c=>new Promise(r=>c.toBlob(r)))),th=document.createElement('canvas');th.width=160;th.height=90;
  const g=th.getContext('2d');g.fillStyle=S.paper;g.fillRect(0,0,160,90);comp(0,g);
  const rec={name,date:Date.now(),w:W,h:H,fps:S.fps,paper:S.paper,gp:GP,bl,L:L.map(l=>({n:l.n,v:l.v,k:l.k,o:l.o,bm:l.bm,br:l.br,ref:l.ref,alk:l.alk,cl:l.cl,gid:l.gid,ms:l.a.map(c=>c&&c.m?ix.get(c.m):-1),a:l.a.map(c=>c?ix.get(c):-1)})),au:AU.map(a=>({n:a.n,off:a.off,m:a.m,vol:a.vol,tr:a.tr,te:a.te,fi:a.fi,fo:a.fo,b:a.blob}))};
  await idb('p','readwrite',s=>s.put(rec,name));await idb('m','readwrite',s=>s.put({name,date:rec.date,th:th.toDataURL('image/jpeg',.7),n:T()},name));PN=name}
async function loadProj(name){const r=await idb('p','readonly',s=>s.get(name));if(!r)return toast('No se encontró el proyecto');
  if(playing)$('#play').click();W=S.w=r.w;H=S.h=r.h;S.fps=r.fps;S.paper=r.paper;view.width=W;view.height=H;
  const cs=await Promise.all(r.bl.map(async b=>{const c=mk();c.getContext('2d').drawImage(await createImageBitmap(b),0,0);return c}));
  GP=r.gp||{};L=r.L.map(l=>{const a=l.a.map(i=>i<0?null:cs[i]);(l.ms||[]).forEach((j,i)=>{if(j>=0&&a[i])a[i].m=cs[j]});return{...l,a}});al=0;cur=0;sel={a:0,b:0};hist=[];SL.path=SL.pts=null;PN=name;S.pn=name;save();
  AU=[];for(const a of r.au||[])await addAudio(a.b,a.n,a.off,a.m,a);render();buildStrip();dirtyAll();persist()}
async function prjSheet(){closeFly();await PD.ready;if(!PD.db)return toast('Este navegador no permite guardar proyectos');
  const ms=((await idb('m','readonly',s=>s.getAll()))||[]).sort((a,b)=>b.date-a.date);
  $('#sheet').innerHTML='<h3>Proyectos</h3><label class="f">Nombre<input id="pn" type="text" value="'+esc(PN)+'"></label><div class="chips"><button class="chip" id="ps">Guardar</button><button class="chip" id="pnw">Nuevo</button></div><h4>Recientes</h4>'+
    (ms.length?ms.map((m,i)=>'<div class="pr"><img src="'+m.th+'" alt=""><div><b>'+esc(m.name)+'</b><br><small>'+new Date(m.date).toLocaleString()+' · '+m.n+' cuadros</small></div><button class="chip" data-o="'+i+'">Abrir</button><button class="chip" data-d="'+i+'" aria-label="Borrar">🗑</button></div>').join(''):'<small style="color:var(--muted)">Aún no hay proyectos guardados</small>')+
    '<div id="pm" style="font-size:13px;color:var(--muted)"></div><button class="done" id="ok3">Cerrar</button>';
  $('#ov').classList.add('show');$('#ok3').onclick=()=>$('#ov').classList.remove('show');
  $('#ps').onclick=async()=>{const n=($('#pn').value||'').trim()||'Sin título';if(ms.some(m=>m.name===n)&&n!==PN&&!confirm('Ya existe «'+n+'». ¿Sobrescribir?'))return;
    $('#pm').textContent='Guardando…';await saveProj(n);S.pn=n;save();prjSheet()};
  $('#pnw').onclick=()=>{if(!confirm('¿Empezar un proyecto nuevo? Lo que no hayas guardado se perderá.'))return;if(playing)$('#play').click();
    L=[nl('Capa 1')];al=cur=0;sel={a:0,b:0};hist=[];AU=[];audSave();SL.path=SL.pts=null;PN='Sin título';S.pn=PN;save();render();buildStrip();$('#ov').classList.remove('show')};
  $('#sheet').querySelectorAll('[data-o]').forEach(b=>b.onclick=async()=>{$('#pm').textContent='Abriendo…';await loadProj(ms[+b.dataset.o].name);$('#ov').classList.remove('show')});
  $('#sheet').querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{const n=ms[+b.dataset.d].name;if(!confirm('¿Borrar «'+n+'»?'))return;
    await idb('p','readwrite',s=>s.delete(n));await idb('m','readwrite',s=>s.delete(n));prjSheet()})}
$('#prj').onclick=prjSheet;
rail();

