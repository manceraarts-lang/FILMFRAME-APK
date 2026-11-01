
// ===== VERSIÓN 1.2 =====
let SP=[],BB=null,LE=null,qsT=null,TP=null,SYN=0,CAP=null,lastPen=0,ERT=null,GS0=null,GSR=1,gdD=null,tlT=null,thT=null;
const redoS=[],THC=new Map(),TLR={on:0,f:[]},sleep=ms=>new Promise(r=>setTimeout(r,ms));
Object.assign(IC,{txt:'M4 7V4h16v3M9 20h6M12 4v16',gd:'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18'});Object.assign(NAMES,{txt:'Texto',gd:'Guías'});
['txt','gd'].forEach(k=>{if(S.tools[k]===undefined)S.tools[k]=1});
// ---------- 1.2.4 undo profundo (parches por región) ----------
const HB=()=>hist.reduce((s,h)=>s+h.d.data.length,0);
function trimH(){redoS.length=0;while(hist.length>100||(hist.length>1&&HB()>192e6))hist.shift()}
function bbAdd(a,b,r){const x0=Math.min(a.x,b.x)-r,y0=Math.min(a.y,b.y)-r,x1=Math.max(a.x,b.x)+r,y1=Math.max(a.y,b.y)+r;BB=BB?{x0:Math.min(BB.x0,x0),y0:Math.min(BB.y0,y0),x1:Math.max(BB.x1,x1),y1:Math.max(BB.y1,y1)}:{x0,y0,x1,y1}}
function cropH(){const h=hist[hist.length-1];if(!h||h.x!==undefined||!BB||h.d.width!==W)return;const x=Math.max(0,Math.floor(BB.x0)),y=Math.max(0,Math.floor(BB.y0)),w=Math.min(W,Math.ceil(BB.x1))-x,hh=Math.min(H,Math.ceil(BB.y1))-y;BB=null;
  if(w<=0||hh<=0||w*hh>=W*H*.9)return;const o=new ImageData(w,hh),s=h.d.data,d=o.data;for(let r=0;r<hh;r++)d.set(s.subarray(((y+r)*W+x)*4,((y+r)*W+x+w)*4),r*w*4);h.d=o;h.x=x;h.y=y}
async function undo(){const h=hist.pop();if(!h)return;if(h.c._ev)await reload(h.c,1);const g=h.c.getContext('2d'),x=h.x||0,y=h.y||0;redoS.push({c:h.c,x,y,d:g.getImageData(x,y,h.d.width,h.d.height)});g.putImageData(h.d,x,y);dirty.add(h.c);render();thumbsAll();persist()}
async function redo(){const h=redoS.pop();if(!h)return;if(h.c._ev)await reload(h.c,1);const g=h.c.getContext('2d');hist.push({c:h.c,x:h.x,y:h.y,d:g.getImageData(h.x,h.y,h.d.width,h.d.height)});g.putImageData(h.d,h.x,h.y);dirty.add(h.c);render();thumbsAll();persist()}
// ---------- 1.2.1 gestos ----------
const _gd=gestDown,_gu=gestUp;
gestDown=function(e){const r=_gd(e);if(e.pointerType==='touch'){if(P.size===1)TP={t:e.timeStamp,n:1,mv:0,s:{}};if(TP){TP.n=Math.max(TP.n,P.size);TP.s[e.pointerId]={x:e.clientX,y:e.clientY}}}return r};
gestUp=function(e){_gu(e);if(TP&&e.pointerType==='touch'&&P.size===0){const t=TP;TP=null;if(t.n>=2&&t.n<=3&&e.timeStamp-t.t<350&&t.mv<14){if(t.n===2){undo();toast('Deshacer')}else{redo();toast('Rehacer')}}}};
view.addEventListener('pointermove',e=>{if(TP&&TP.s[e.pointerId])TP.mv=Math.max(TP.mv,Math.hypot(e.clientX-TP.s[e.pointerId].x,e.clientY-TP.s[e.pointerId].y))});
// QuickShape
const qsC=()=>{clearTimeout(qsT);qsT=null};
function qsA(){qsC();if(S.qs!==0&&tool==='pen'&&SP.length>6)qsT=setTimeout(qsFire,650)}
function qsFire(){qsT=null;if(!drawing||SP.length<8||!LE)return;const u=W/1000,a=SP[0],b=SP[SP.length-1],L0=Math.hypot(b.x-a.x,b.y-a.y);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,mx=0;
  SP.forEach(p=>{x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y);mx=Math.max(mx,Math.abs((b.x-a.x)*(a.y-p.y)-(a.x-p.x)*(b.y-a.y))/(L0||1))});
  let pts=null,nm='';const rx=(x1-x0)/2,ry=(y1-y0)/2,cx=(x0+x1)/2,cy=(y0+y1)/2;
  if(L0>25*u&&mx<L0*.06){pts=[a,b];nm='Línea'}
  else if(L0<Math.max(rx,ry)*.7&&rx>8*u&&ry>8*u){let err=0;SP.forEach(p=>{err+=Math.abs(Math.hypot((p.x-cx)/rx,(p.y-cy)/ry)-1)});err/=SP.length;
    if(err<.2){const ci2=Math.abs(rx-ry)<Math.max(rx,ry)*.18,r=(rx+ry)/2;pts=ci2?ell({x:cx-r,y:cy-r},{x:cx+r,y:cy+r}):ell({x:x0,y:y0},{x:x1,y:y1});pts=[...pts,pts[0]];nm=ci2?'Círculo':'Elipse'}}
  if(!pts)return;const h=hist[hist.length-1],c=cv(1);if(!h||!c||h.d.width!==W)return;
  c.getContext('2d').putImageData(h.d,0,0);BB=null;acc=1e9;pd=null;for(let i=1;i<pts.length;i++)seg(pts[i-1],pts[i],LE);
  drawing=false;cq=ctl=null;cropH();dirty.add(c);thumb(cur);persist();render();toast('Forma: '+nm);if(newCell){newCell=0;buildStrip()}}
// (1.1.7) las opciones de capa viven ahora en la pestaña #ldrawer
bc.style.background='radial-gradient(circle,rgba(0,0,0,.65) 1.5px,transparent 2px)';
setInterval(()=>{if(SL.pts&&!drawing&&!playing&&!TF&&tool==='sel')render()},150);
// ---------- 1.2.5 guías, texto, atajos, lápiz ----------
const GD=()=>S.gd||(S.gd={m:'off',gs:100,vx:.5,vy:.35,ra:{x:.2,y:.6},rb:{x:.8,y:.6},sn:1,rl:0,th:0});
function gsn(p,first){const g=GD();if(!g.sn||g.m==='off')return p;
  if(g.m==='grid'){const s=g.gs*W/1000;return{x:Math.round(p.x/s)*s,y:Math.round(p.y/s)*s}}
  if(g.m==='ruler'){const a={x:g.ra.x*W,y:g.ra.y*H},b={x:g.rb.x*W,y:g.rb.y*H},dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1,t=((p.x-a.x)*dx+(p.y-a.y)*dy)/l2,q={x:a.x+t*dx,y:a.y+t*dy};
    if(first)GSR=Math.hypot(p.x-q.x,p.y-q.y)<90*W/1000;return GSR?q:p}
  if(g.m==='persp'){const px=g.vx*W,py=g.vy*H;if(first)GS0=p;const s=GS0||p,dx=s.x-px,dy=s.y-py,l2=dx*dx+dy*dy||1,t=((p.x-px)*dx+(p.y-py)*dy)/l2;return{x:px+t*dx,y:py+t*dy}}
  return p}
function drawGD(){const g=GD();if(playing||(g.m==='off'&&!g.rl&&!g.th))return;const lw=2*W/view.getBoundingClientRect().width,sc=lw/2,u=W/1000,c=vctx;
  c.save();c.setLineDash([]);c.lineWidth=sc;c.strokeStyle='rgba(60,140,255,.6)';c.beginPath();
  if(g.m==='grid'){const s=g.gs*u;for(let x=s;x<W;x+=s){c.moveTo(x,0);c.lineTo(x,H)}for(let y=s;y<H;y+=s){c.moveTo(0,y);c.lineTo(W,y)}}
  if(g.m==='persp'){const px=g.vx*W,py=g.vy*H;for(let i=0;i<36;i++){const a=i/36*Math.PI*2;c.moveTo(px,py);c.lineTo(px+Math.cos(a)*W*3,py+Math.sin(a)*W*3)}}
  if(g.m==='ruler'){const a={x:g.ra.x*W,y:g.ra.y*H},b={x:g.rb.x*W,y:g.rb.y*H};c.moveTo(a.x-(b.x-a.x)*10,a.y-(b.y-a.y)*10);c.lineTo(b.x+(b.x-a.x)*10,b.y+(b.y-a.y)*10)}
  if(g.th){[1/3,2/3].forEach(f=>{c.moveTo(W*f,0);c.lineTo(W*f,H);c.moveTo(0,H*f);c.lineTo(W,H*f)});c.moveTo(W/2-10*sc,H/2);c.lineTo(W/2+10*sc,H/2);c.moveTo(W/2,H/2-10*sc);c.lineTo(W/2,H/2+10*sc)}
  c.stroke();
  if(g.rl){c.fillStyle='rgba(60,140,255,.95)';c.font=(11*sc)+'px sans-serif';for(let x=0;x<=W;x+=50*u){const big=Math.round(x/u)%100===0;c.fillRect(x,0,sc,(big?18:9)*sc);if(big)c.fillText(Math.round(x/u),x+3*sc,30*sc)}
    for(let y=0;y<=H;y+=50*u){const big=Math.round(y/u)%100===0;c.fillRect(0,y,(big?18:9)*sc,sc);if(big)c.fillText(Math.round(y/u),22*sc,y+4*sc)}}
  if(tool==='gd'){const hs=g.m==='persp'?[{x:g.vx*W,y:g.vy*H}]:g.m==='ruler'?[{x:g.ra.x*W,y:g.ra.y*H},{x:g.rb.x*W,y:g.rb.y*H}]:[];hs.forEach(p=>{c.beginPath();c.arc(p.x,p.y,11*sc,0,7);c.fillStyle='#fff';c.fill();c.strokeStyle='#3c8cff';c.lineWidth=2*sc;c.stroke()})}
  c.restore()}
function gdDown(e){view.setPointerCapture(e.pointerId);const p=pos(e),g=GD(),sc=W/view.getBoundingClientRect().width,R=28*sc,H2=g.m==='persp'?[['vp',g.vx*W,g.vy*H]]:g.m==='ruler'?[['ra',g.ra.x*W,g.ra.y*H],['rb',g.rb.x*W,g.rb.y*H]]:[];
  gdD=null;H2.forEach(h=>{if(Math.hypot(p.x-h[1],p.y-h[2])<R)gdD=h[0]})}
view.addEventListener('pointermove',e=>{if(!gdD)return;const p=pos(e),g=GD(),f={x:p.x/W,y:p.y/H};if(gdD==='vp'){g.vx=f.x;g.vy=f.y}else g[gdD]=f;render()});
view.addEventListener('pointerup',()=>{if(gdD){gdD=null;save()}});
function textDown(e){const p=pos(e),t=prompt('Texto');if(!t)return;const c=cv();if(!c)return;const g=c.getContext('2d'),u=W/1000,sz=(S.tsz||48)*u,
  fam={s:'sans-serif',f:'Georgia,serif',m:'monospace',c:'cursive'}[S.tf||'s'],ls=t.split('\n');
  hist.push({c,d:g.getImageData(0,0,W,H)});trimH();g.save();g.font=(S.tb?'bold ':'')+sz+'px '+fam;g.textBaseline='top';g.fillStyle=S.pal[ci];g.globalCompositeOperation=alk()?'source-atop':'source-over';
  let mw=0;ls.forEach((l,i)=>{g.fillText(l,p.x,p.y+i*sz*1.2);mw=Math.max(mw,g.measureText(l).width)});g.restore();
  BB={x0:p.x-4,y0:p.y-4,x1:p.x+mw+4,y1:p.y+ls.length*sz*1.2+4};cropH();dirty.add(c);thumb(cur);persist();render();if(newCell){newCell=0;buildStrip()}}
FLY.txt.html=()=>{const g=GD();return '<h3>Texto</h3><label class="f">Tamaño: <b id="tv">'+(S.tsz||48)+'</b><input id="ts" type="range" min="8" max="300" value="'+(S.tsz||48)+'"></label><label class="row">Fuente<select id="tf">'+[['s','Sans'],['f','Serif'],['m','Mono'],['c','Cursiva']].map(([v,l])=>'<option value="'+v+'"'+((S.tf||'s')===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label><label class="row">Negrita<input id="tb" type="checkbox"'+(S.tb?' checked':'')+'></label><small style="color:var(--muted)">Toca el lienzo para escribir. El color es el actual.</small>';}
FLY.gd.html=()=>{const g=GD();return '<h3>Guías</h3><div class="chips">'+[['off','Ninguna'],['grid','Cuadrícula'],['persp','Perspectiva'],['ruler','Regla']].map(([v,l])=>'<button class="chip'+(g.m===v?' on':'')+'" data-gm="'+v+'">'+l+'</button>').join('')+'</div><label class="row">Imán (el trazo sigue la guía)<input id="gn" type="checkbox"'+(g.sn?' checked':'')+'></label><label class="row">Reglas en los bordes<input id="gr" type="checkbox"'+(g.rl?' checked':'')+'></label><label class="row">Tercios y centro<input id="gt" type="checkbox"'+(g.th?' checked':'')+'></label><label class="f">Cuadrícula: <b id="gv">'+g.gs+'</b><input id="gs" type="range" min="20" max="400" value="'+g.gs+'"></label><small style="color:var(--muted)">Con la herramienta Guías, arrastra los puntos blancos.</small>';}
FLY.txt.wire=()=>{const g=GD();$('#ts').oninput=e=>{S.tsz=+e.target.value;$('#tv').textContent=S.tsz;save()};$('#tf').onchange=e=>{S.tf=e.target.value;save()};$('#tb').onchange=e=>{S.tb=e.target.checked?1:0;save()}};
FLY.gd.wire=()=>{const g=GD();fly.querySelectorAll('[data-gm]').forEach(b=>b.onclick=()=>{g.m=b.dataset.gm;save();fly.innerHTML=flyHTML('gd');wireFly('gd');render()});
    $('#gn').onchange=e=>{g.sn=e.target.checked?1:0;save()};$('#gr').onchange=e=>{g.rl=e.target.checked?1:0;save();render()};$('#gt').onchange=e=>{g.th=e.target.checked?1:0;save();render()};$('#gs').oninput=e=>{g.gs=+e.target.value;$('#gv').textContent=g.gs;save();render()}};
const _sd7=selDown;selDown=function(e){if(!TF&&tool==='txt')return textDown(e);if(!TF&&tool==='gd')return gdDown(e);_sd7(e)};
const _r7=rail;rail=function(){_r7();view.style.cursor=tool==='txt'?'text':(['fil','sel','eye','gd'].includes(tool)?'crosshair':'none')};
const _rd7=render;render=function(){_rd7();drawGD();if(TLR.on)$('#cnt').textContent+=' ⏺'};
// atajos personalizables
const ACT=[['pen','b','Pincel'],['era','e','Borrador'],['fil','g','Relleno'],['sel','m','Selección'],['eye','i','Cuentagotas'],['txt','t','Texto'],['gd','r','Guías'],['nf','n','Cuadro nuevo'],['dp','d','Duplicar cuadro'],['hp','h','Hold +1'],['ly','l','Capa nueva'],['db','[','Pincel más pequeño'],['ub',']','Pincel más grande']];
const kk=a=>(S.keys&&S.keys[a])||ACT.find(x=>x[0]===a)[1],kd=k=>({' ':'Espacio'}[k]||k.toUpperCase());
addEventListener('keydown',e=>{if(SYN||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();
  if(CAP){e.preventDefault();e.stopImmediatePropagation();if(['shift','control','alt','meta'].includes(k))return;
    if(k!=='escape'){S.keys=S.keys||{};const o=ACT.find(a=>a[0]!==CAP&&kk(a[0])===k);if(o)S.keys[o[0]]=kk(CAP);S.keys[CAP]=k;save()}CAP=null;help();return}
  if((e.ctrlKey||e.metaKey)&&(k==='y'||(k==='z'&&e.shiftKey))){e.preventDefault();e.stopImmediatePropagation();redo();return}
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  const hit=ACT.find(a=>kk(a[0])===k);
  if(hit){if(hit[1]!==k){e.stopImmediatePropagation();e.preventDefault();SYN=1;window.dispatchEvent(new KeyboardEvent('keydown',{key:hit[1],shiftKey:e.shiftKey,bubbles:true}));SYN=0}}
  else if(S.keys&&ACT.some(a=>a[1]===k))e.stopImmediatePropagation()},true);
addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey||playing)return;const k=e.key.toLowerCase();if(k==='t')tap('txt');else if(k==='r')tap('gd')});
const KS2=[['← →  Inicio  Fin','Cuadro anterior/siguiente/primero/último'],['↑ ↓','Cambiar de capa'],['Enter','Reproducir / pausar'],['Ctrl+Z / Ctrl+Mayús+Z','Deshacer / rehacer (2 dedos / 3 dedos en pantalla táctil)'],['Supr · Esc','Borrar selección · deseleccionar'],['Espacio + arrastrar','Mover el lienzo'],['+  −  0','Zoom / restablecer'],['Ctrl+S','Guardar proyecto'],['Alt+clic (pincel)','Cuentagotas rápido'],['Mantener al final del trazo','QuickShape: línea, círculo o elipse perfectos']];
function help(){$('#sheet').innerHTML='<h3>Atajos de teclado</h3><small style="color:var(--muted)">Toca una tecla para cambiarla.</small>'+ACT.map(a=>'<div class="pr"><div style="flex:1">'+a[2]+'</div><button class="chip" data-ka="'+a[0]+'">'+(CAP===a[0]?'Pulsa una tecla…':kd(kk(a[0])))+'</button></div>').join('')+'<h4>Fijos</h4>'+KS2.map(k=>'<div class="pr"><div><b>'+k[0]+'</b></div><div style="flex:2">'+k[1]+'</div></div>').join('')+'<div class="chips"><button class="chip" id="kr">Restablecer atajos</button></div><button class="done" id="ok4">Cerrar</button>';
  $('#ov').classList.add('show');$('#ok4').onclick=()=>{CAP=null;$('#ov').classList.remove('show')};
  $('#sheet').querySelectorAll('[data-ka]').forEach(b=>b.onclick=()=>{CAP=b.dataset.ka;help()});$('#kr').onclick=()=>{delete S.keys;save();help()}}
// lápiz: botón lateral, borrador, rechazo de palma
view.addEventListener('pointerdown',e=>{if(e.pointerType==='pen'){lastPen=e.timeStamp;
    if(e.buttons&32){ERT=tool;tool='era'}
    else if(e.buttons&2){const a=S.bb||'eye';if(a==='eye'){e.stopImmediatePropagation();view.setPointerCapture(e.pointerId);eyeStart(e,1)}else if(a==='era'){ERT=tool;tool='era'}else if(a==='und'){e.stopImmediatePropagation();undo()}}}
  else if(e.pointerType==='touch'&&S.palm!==0&&e.timeStamp-lastPen<1200)e.stopImmediatePropagation()},true);
const _up7=()=>{if(ERT){tool=ERT;ERT=null}};view.addEventListener('pointerup',_up7);view.addEventListener('pointercancel',_up7);
const _as=advSet,_aw=advWire;
advSet=function(){return _as()+'<label class="row">Botón lateral del lápiz<select id="bb">'+[['eye','Cuentagotas'],['era','Borrador'],['und','Deshacer'],['off','Nada']].map(([v,l])=>'<option value="'+v+'"'+((S.bb||'eye')===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label><label class="row">Rechazo de palma<input id="pm" type="checkbox"'+(S.palm!==0?' checked':'')+'></label><label class="row">QuickShape (mantener al final)<input id="qs" type="checkbox"'+(S.qs!==0?' checked':'')+'></label><label class="row">Descargar cuadros lejanos a disco<input id="ev" type="checkbox"'+(S.evn?' checked':'')+'></label>'};
advWire=function(){_aw();$('#bb').onchange=e=>{S.bb=e.target.value;save()};$('#pm').onchange=e=>{S.palm=e.target.checked?1:0;save()};$('#qs').onchange=e=>{S.qs=e.target.checked?1:0;save()};$('#ev').onchange=e=>{S.evn=e.target.checked?1:0;save();if(!S.evn)ensureAll()}};
// ---------- 1.2.2 referencia e imágenes ----------
const RC=document.createElement('div');RC.style.cssText='position:fixed;z-index:30;display:none;left:12px;top:70px;width:200px;background:var(--panel);border:1px solid var(--line);border-radius:10px;box-shadow:0 4px 18px #0006;overflow:hidden;touch-action:none';
RC.innerHTML='<div id="rch" style="display:flex;gap:4px;align-items:center;padding:4px;cursor:move;font-size:12px"><span id="rcn" style="flex:1">Referencia (toca la imagen para tomar color)</span><button class="pill sm" id="rcs">Cambiar</button><button class="pill sm" id="rcx" aria-label="Ocultar">✕</button></div><img id="rci" alt="Referencia" style="display:block;width:100%;user-select:none" draggable="false"><input id="rco" type="range" min="20" max="100" value="100" style="width:100%" aria-label="Opacidad de la referencia"><div id="rcz" style="position:absolute;right:0;bottom:24px;width:28px;height:28px;cursor:nwse-resize;background:linear-gradient(135deg,transparent 50%,var(--muted) 50%)"></div>';document.body.appendChild(RC);
const RI=RC.querySelector('#rci');let rd=null,rUrl=null;
function refSave(on){const r=S.rf||(S.rf={});r.x=RC.offsetLeft;r.y=RC.offsetTop;r.w=RC.offsetWidth;r.o=+RC.querySelector('#rco').value;if(on!==undefined)r.on=on;save()}
function showRef(b){if(rUrl)URL.revokeObjectURL(rUrl);rUrl=URL.createObjectURL(b);RI.src=rUrl;const r=S.rf||{};RC.style.left=(r.x??12)+'px';RC.style.top=(r.y??70)+'px';RC.style.width=(r.w??200)+'px';RC.style.opacity=(r.o??100)/100;RC.querySelector('#rco').value=r.o??100;RC.style.display='block'}
$('#rc1').onclick=async()=>{if(RC.style.display==='block'){RC.style.display='none';refSave(0)}else{const b=await DB.get('ref');if(b){showRef(b);refSave(1)}else $('#rcf').click()}};
$('#rcs').onclick=()=>$('#rcf').click();$('#rcx').onclick=()=>{RC.style.display='none';refSave(0)};
$('#rcf').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f){DB.put('ref',f);showRef(f);refSave(1)}};
$('#rco').oninput=e=>{RC.style.opacity=e.target.value/100};$('#rco').onchange=()=>refSave();
RC.addEventListener('pointerdown',e=>{const t=e.target;if(t.id==='rch'||t.id==='rcn'){rd={m:'mv',x:e.clientX,y:e.clientY,l:RC.offsetLeft,t:RC.offsetTop};RC.setPointerCapture(e.pointerId)}else if(t.id==='rcz'){rd={m:'rz',x:e.clientX,w:RC.offsetWidth};RC.setPointerCapture(e.pointerId)}});
RC.addEventListener('pointermove',e=>{if(!rd)return;if(rd.m==='mv'){RC.style.left=(rd.l+e.clientX-rd.x)+'px';RC.style.top=(rd.t+e.clientY-rd.y)+'px'}else RC.style.width=Math.max(90,rd.w+e.clientX-rd.x)+'px'});
RC.addEventListener('pointerup',()=>{if(rd){rd=null;refSave()}});
RI.onclick=e=>{const r=RI.getBoundingClientRect(),x=(e.clientX-r.left)*RI.naturalWidth/r.width,y=(e.clientY-r.top)*RI.naturalHeight/r.height,c=document.createElement('canvas');c.width=c.height=1;const g=c.getContext('2d');g.drawImage(RI,-Math.floor(x),-Math.floor(y));
  const d=g.getImageData(0,0,1,1).data,hx='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('');S.pal[ci]=hx;addHist(hx);save();rail();toast('Color '+hx)};
(async()=>{for(let i=0;i<50&&!DB.db;i++)await sleep(60);if(!DB.db||!(S.rf&&S.rf.on))return;const b=await DB.get('ref');if(b)showRef(b)})();
$('#rv').onclick=()=>{const on=L.some(l=>l.ref&&l.v);L.forEach(l=>{if(l.ref)l.v=on?0:1});buildStrip();render();toast(on?'Referencias ocultas':'Referencias visibles')};
$('#im1').onclick=()=>$('#if').click();
$('#if').onchange=e=>{const fs=[...e.target.files].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));e.target.value='';if(fs.length)imgSheet(fs)};
function imgSheet(fs){$('#sheet').innerHTML='<h3>Importar imagen</h3><div style="font-size:13px;color:var(--muted)">'+fs.length+(fs.length>1?' imágenes: se colocan en cuadros consecutivos':' imagen')+'</div><label class="row">Ajuste<select id="iF"><option value="c">Ajustar (entera)</option><option value="r">Rellenar</option><option value="o">Tamaño original</option></select></label><label class="row">Cuadros por imagen<input id="iD" type="number" min="1" value="1"></label><label class="row">Como capa de referencia<input id="iR" type="checkbox"></label><div id="iP" style="font-size:13px;color:var(--muted);margin:6px 0"></div><button class="done" id="iG">Importar</button><button class="done" id="iX" style="background:var(--line);color:var(--text)">Cancelar</button>';
  $('#ov').classList.add('show');$('#iX').onclick=()=>$('#ov').classList.remove('show');
  $('#iG').onclick=async()=>{$('#iG').disabled=true;const fit=$('#iF').value,dur=Math.max(1,+$('#iD').value||1),ref=$('#iR').checked,t0=cur,lay={...nl(ref?'Referencia':fs.length>1?'Secuencia':'Imagen'),a:Array(t0).fill(null)};if(ref){lay.ref=1;lay.k=1;lay.o=60}
    for(let i=0;i<fs.length;i++){$('#iP').textContent='Importando '+(i+1)+' / '+fs.length;let bm;try{bm=await createImageBitmap(fs[i])}catch(e){continue}
      const c=mk(),g=c.getContext('2d'),s=fit==='o'?1:fit==='r'?Math.max(W/bm.width,H/bm.height):Math.min(W/bm.width,H/bm.height),w=bm.width*s,h=bm.height*s;g.drawImage(bm,(W-w)/2,(H-h)/2,w,h);if(bm.close)bm.close();for(let k=0;k<dur;k++)lay.a.push(c)}
    L.splice(ref?0:al+1,0,lay);al++;hist=[];sel={a:t0,b:t0};$('#ov').classList.remove('show');buildStrip();render();toast('Imagen importada')}}
// ---------- 1.2.3 exportación ----------
const be=(v,n)=>{const a=new Uint8Array(n);for(let i=n-1;i>=0;i--){a[i]=v&255;v=Math.floor(v/256)}return a};
function pack(r){const o=[],n=r.length;let i=0;while(i<n){let j=i;if(i+1<n&&r[i]===r[i+1]){while(j+1<n&&r[j+1]===r[i]&&j-i<127)j++;o.push(257-(j-i+1),r[i]);i=j+1}
  else{while(j+1<n&&j-i<127&&!(j+2<n&&r[j+1]===r[j+2]))j++;o.push(j-i);for(let k=i;k<=j;k++)o.push(r[k]);i=j+1}}return o}
function chan(pl,w,h){const rows=[];for(let y=0;y<h;y++)rows.push(pack(pl.subarray(y*w,(y+1)*w)));const out=new Uint8Array(2+h*2+rows.reduce((s,r)=>s+r.length,0));out[1]=1;let p=2;rows.forEach(r=>{out[p]=r.length>>8;out[p+1]=r.length&255;p+=2});rows.forEach(r=>{out.set(r,p);p+=r.length});return out}
const PK={n:'norm',m:'mul ',s:'scrn',o:'over',dk:'dark',lt:'lite',cd:'div ',cb:'idiv',sl:'sLit',hl:'hLit',df:'diff',ad:'lddg',co:'colr'};
function psd(t){const w=W,h=H,recs=[],datas=[];
  L.forEach(l=>{const raw=l.a[t],c=raw&&ef(raw);let ch,rect=[0,0,0,0];
    if(c){const d=c.getContext('2d').getImageData(0,0,w,h).data,pl=[0,1,2,3].map(()=>new Uint8Array(w*h));for(let i=0,j=0;i<w*h;i++,j+=4){pl[0][i]=d[j];pl[1][i]=d[j+1];pl[2][i]=d[j+2];pl[3][i]=d[j+3]}ch=pl.map(p=>chan(p,w,h));rect=[0,0,h,w]}
    else ch=[0,1,2,3].map(()=>new Uint8Array(2));
    const ids=[0,1,2,65535],nm=(l.n||'Capa').replace(/[^\x20-\x7e]/g,'?').slice(0,60),pn=[nm.length,...[...nm].map(x=>x.charCodeAt(0))];while(pn.length%4)pn.push(0);
    const extra=[0,0,0,0,0,0,0,0,...pn],r=[...be(rect[0],4),...be(rect[1],4),...be(rect[2],4),...be(rect[3],4),...be(4,2)];
    ch.forEach((x,i)=>r.push(...be(ids[i],2),...be(x.length,4)));
    r.push(56,66,73,77,...[...(PK[l.bm]||'norm')].map(x=>x.charCodeAt(0)),Math.round(l.o*2.55),l.cl?1:0,l.v?0:2,0,...be(extra.length,4),...extra);
    recs.push(Uint8Array.from(r));datas.push(...ch)});
  let li=2+recs.reduce((s,r)=>s+r.length,0)+datas.reduce((s,r)=>s+r.length,0);const pad=li%2;li+=pad;
  const m=fc(t,1,1).getContext('2d').getImageData(0,0,w,h).data,mp=[0,1,2].map(()=>new Uint8Array(w*h));for(let i=0,j=0;i<w*h;i++,j+=4){mp[0][i]=m[j];mp[1][i]=m[j+1];mp[2][i]=m[j+2]}
  return new Blob([Uint8Array.from([56,66,80,83,0,1,0,0,0,0,0,0,0,3]),be(h,4),be(w,4),be(8,2),be(3,2),be(0,4),be(0,4),be(li+8,4),be(li,4),be(L.length,2),...recs,...datas,new Uint8Array(pad),be(0,4),be(0,2),...mp],{type:'image/vnd.adobe.photoshop'})}
function tiff(c){const w=c.width,h=c.height,d=c.getContext('2d').getImageData(0,0,w,h).data,o=8+w*h*4,N=11,bp=o+2+N*12+4,buf=new ArrayBuffer(bp+8),v=new DataView(buf);
  new Uint8Array(buf).set(d,8);v.setUint16(0,0x4949);v.setUint16(2,42,true);v.setUint32(4,o,true);v.setUint16(o,N,true);
  [[256,4,w],[257,4,h],[258,3,bp,4],[259,3,1],[262,3,2],[273,4,8],[277,3,4],[278,4,h],[279,4,w*h*4],[284,3,1],[338,3,2]].forEach((t,i)=>{const p=o+2+i*12;v.setUint16(p,t[0],true);v.setUint16(p+2,t[1],true);v.setUint32(p+4,t[3]||1,true);if(t[1]===3&&!t[3])v.setUint16(p+8,t[2],true);else v.setUint32(p+8,t[2],true)});
  v.setUint32(o+2+N*12,0,true);for(let i=0;i<4;i++)v.setUint16(bp+i*2,8,true);return new Blob([buf],{type:'image/tiff'})}
async function xPsd(){xm('Generando PSD…');await tick();dl(psd(cur),'cuadro_'+(cur+1)+'.psd');xm('Listo: PSD con capas, opacidad, mezcla y recorte (los grupos quedan como capas sueltas)')}
async function xPsdz(){const n=T(),fs=[];for(let t=0;t<n;t++){xm('PSD '+(t+1)+' / '+n);await tick();fs.push([String(t+1).padStart(4,'0')+'.psd',new Uint8Array(await psd(t).arrayBuffer())])}dl(zip(fs),'animacion_psd.zip');xm('Listo: ZIP con un PSD por cuadro')}
async function xPng1(sc){const b=await new Promise(r=>fc(cur,sc,0).toBlob(r));dl(b,'cuadro_'+(cur+1)+'.png');xm('Listo: PNG con transparencia')}
async function xTiff(sc){dl(tiff(fc(cur,sc,0)),'cuadro_'+(cur+1)+'.tif');xm('Listo: TIFF RGBA sin compresión')}
function tlSnap(){if(!TLR.on||playing)return;clearTimeout(tlT);tlT=setTimeout(()=>{fc(cur,Math.min(1,960/Math.max(W,H)),1).toBlob(b=>{if(b){TLR.f.push(b);if(TLR.f.length>3000)TLR.f.shift();const e=$('#tlb');if(e)e.textContent='⏹ Detener ('+TLR.f.length+')'}},'image/jpeg',.8)},250)}
async function xTl(){const n=TLR.f.length;if(!n)return xm('No hay time-lapse: pulsa ⏺ Grabar y dibuja');
  const ms=['video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9','video/webm'],m=window.MediaRecorder&&ms.find(x=>MediaRecorder.isTypeSupported(x));if(!m)return xm('Este navegador no puede grabar video');
  const b0=await createImageBitmap(TLR.f[0]),c=document.createElement('canvas');c.width=b0.width&~1;c.height=b0.height&~1;const x=c.getContext('2d'),r=new MediaRecorder(c.captureStream(15),{mimeType:m,videoBitsPerSecond:(S.vbr||8)*1e6}),ch=[],fin=new Promise(z=>r.onstop=z);
  r.ondataavailable=e=>e.data.size&&ch.push(e.data);x.drawImage(b0,0,0,c.width,c.height);r.start();
  for(let i=0;i<n;i++){const b=await createImageBitmap(TLR.f[i]);x.drawImage(b,0,0,c.width,c.height);b.close();xm('Time-lapse '+(i+1)+' / '+n);await sleep(1000/15)}
  await sleep(1000);r.stop();await fin;const mp=m.includes('mp4');dl(new Blob(ch,{type:m}),'timelapse.'+(mp?'mp4':'webm'));xm('Listo: time-lapse de '+n+' pasos')}
Object.assign(XP,{psd:xPsd,psdz:xPsdz,png1:xPng1,tiff:xTiff,tl:xTl});
$('#exp').onclick=()=>{closeFly();const op=(id,l,a,cu)=>'<label class="row">'+l+'<select id="'+id+'">'+a.map(([v,t])=>'<option value="'+v+'"'+(+cu===v?' selected':'')+'>'+t+'</option>').join('')+'</select></label>';
  $('#sheet').innerHTML='<h3>Exportar</h3><label class="row">Escala<select id="xs"><option value="2">200%</option><option value="1" selected>100%</option><option value=".5">50%</option><option value=".25">25%</option></select></label><h4>Animación</h4><div class="chips"><button class="chip" data-x="gif">GIF</button><button class="chip" data-x="png">PNG transparente (ZIP)</button><button class="chip" data-x="mp4">Video</button></div>'+
    op('xv','Calidad de video',[[3,'Baja · 3 Mbps'],[8,'Media · 8 Mbps'],[16,'Alta · 16 Mbps'],[30,'Máxima · 30 Mbps']],S.vbr||8)+op('xa','Calidad de audio',[[96,'96 kbps'],[192,'192 kbps'],[320,'320 kbps']],S.abr||192)+
    '<label class="f">Volumen maestro: <b id="xmv">'+Math.round((S.mvol??1)*100)+'</b>%<input id="xm2" type="range" min="0" max="150" value="'+Math.round((S.mvol??1)*100)+'"></label><h4>Cuadro actual</h4><div class="chips"><button class="chip" data-x="png1">PNG</button><button class="chip" data-x="tiff">TIFF</button><button class="chip" data-x="psd">PSD con capas</button></div><h4>Todos los cuadros</h4><div class="chips"><button class="chip" data-x="psdz">PSD por cuadro (ZIP)</button></div><h4>Time-lapse del dibujo</h4><div class="chips"><button class="chip" id="tlb">'+(TLR.on?'⏹ Detener ('+TLR.f.length+')':'⏺ Grabar')+'</button><button class="chip" data-x="tl">Exportar time-lapse</button></div><div id="xm" style="font-size:13px;color:var(--muted);margin:6px 0">'+T()+' cuadros a '+S.fps+' fps</div><button class="done" id="ok2">Cerrar</button>';
  $('#ov').classList.add('show');$('#ok2').onclick=()=>$('#ov').classList.remove('show');
  $('#xv').onchange=e=>{S.vbr=+e.target.value;save()};$('#xa').onchange=e=>{S.abr=+e.target.value;save()};$('#xm2').oninput=e=>{S.mvol=e.target.value/100;$('#xmv').textContent=e.target.value;save()};
  $('#tlb').onclick=e=>{TLR.on^=1;if(TLR.on){TLR.f=[];tlSnap()}e.target.textContent=TLR.on?'⏹ Detener ('+TLR.f.length+')':'⏺ Grabar';xm(TLR.on?'Grabando: cada cambio en el dibujo añade un paso':'Grabación detenida: '+TLR.f.length+' pasos');render()};
  $('#sheet').querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>XP[b.dataset.x](+$('#xs').value))};
// ---------- 1.2.4 memoria: descarga de cuadros a disco, miniaturas y proyectos largos ----------
const allCells=()=>{const s=new Set();L.forEach(l=>l.a.forEach(c=>c&&s.add(c)));return s};
async function reload(c,q){if(!c._ev||c._ld)return;c._ld=1;try{const b=await DB.get('c'+c._id);c.width=W;c.height=H;if(b)c.getContext('2d').drawImage(await createImageBitmap(b),0,0)}catch(e){c.width=W;c.height=H}c._ev=0;c._mv=null;c._ld=0;if(!q){render();thumbsAll()}}
async function ensureAll(){let n=0;for(const c of[...allCells()])if(c._ev){await reload(c,1);n++}if(n){render();thumbsAll()}}
function ensureWin(){for(let t=cur-3;t<=cur+3;t++)L.forEach(l=>{const c=l.a[t];if(c&&c._ev)reload(c)})}
function evict(){if(!S.evn||playing||drawing||TF||cbusy)return;const keep=new Set(),hs=new Set([...hist,...redoS].map(h=>h.c));for(let t=cur-6;t<=cur+6;t++)L.forEach(l=>{const c=l.a[t];if(c)keep.add(c)});let n=0;
  allCells().forEach(c=>{if(!keep.has(c)&&!c._ev&&c._sv===c._v&&!dirty.has(c)&&!hs.has(c)){c.width=c.height=1;c._ev=1;if(c._e){c._e.width=1;c._mv=null}n++}});if(n)memBadge()}
setInterval(evict,3000);
['dupR','lDup','lMerge','moveCols','delR','setSize','saveProj','buildCache'].forEach(n=>{const f=window[n];window[n]=async function(...a){await ensureAll();return f.apply(this,a)}});
Object.keys(XP).forEach(k=>{if(k==='tl')return;const f=XP[k];XP[k]=async(...a)=>{await ensureAll();return f(...a)}});
{const f=$('#play').onclick;$('#play').onclick=async e=>{if(!playing&&S.evn&&S.pvc===0)await ensureAll();return f({currentTarget:$('#play')})}}
const _go7=go;go=function(i){_go7(i);ensureWin()};
const _th7=thumb;thumb=function(t){const b=strip.querySelector('[data-h="'+t+'"] canvas');if(!b)return;
  const k=fkey(t);
  if(b._k!==k){let s=THC.get(k);
    if(s)b.getContext('2d').drawImage(s,0,0);
    else{let ev=0;L.forEach(l=>{const c=l.a[t];if(c&&c._ev)ev=1});if(ev)return;
      _th7(t);if(THC.size>=2000){let n=0;for(const q of THC.keys()){THC.delete(q);if(++n>=500)break}}
      s=document.createElement('canvas');s.width=80;s.height=45;s.getContext('2d').drawImage(b,0,0);THC.set(k,s);
      if(TLR.on&&t===cur)tlSnap()}
    b._k=k}
  b.parentNode.classList.toggle('cc',CK.has(k))};
function thumbsAll(){const n=T(),sl=strip.scrollLeft,a=Math.max(0,Math.floor((sl-114)/46)-8),b=Math.min(n-1,Math.ceil((sl+strip.clientWidth)/46)+8);for(let t=a;t<=b;t++)thumb(t)}
strip.addEventListener('scroll',()=>{clearTimeout(thT);thT=setTimeout(thumbsAll,80)});
let mbT=null;function memBadge(){clearTimeout(mbT);mbT=setTimeout(memBadgeNow,250)}
async function memBadgeNow(){let mb=0,ev=0;allCells().forEach(c=>c._ev?ev++:mb+=W*H*4/1048576);mb+=hist.reduce((s,h)=>s+h.d.data.length,0)/1048576;PB.forEach(b=>mb+=b.width*b.height*4/1048576);
  let ds='';try{const e=await navigator.storage.estimate();ds=' · disco '+Math.round(e.usage/1048576)+' MB'}catch(e){}
  const el=$('#mb');if(el&&!cbusy){el.textContent='RAM ≈ '+Math.round(mb)+' MB'+(ev?' ('+ev+' cuadros en disco)':'')+ds;el.style.color=mb>S.memWarn?'#d33':mb>S.memWarn*.6?'var(--accent)':'var(--muted)'}}
const _mc7=memCheck;memCheck=function(){_mc7();if(S.evn===undefined&&allCells().size*W*H*4/1048576>S.memWarn){S.evn=1;save();toast('Memoria alta: se activó la descarga de cuadros lejanos a disco (Ajustes)')}};
rail();

