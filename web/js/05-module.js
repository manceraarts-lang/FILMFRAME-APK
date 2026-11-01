
// ===== VERSIÓN 1.1: pincel, capas tipo Procreate, color, transformación =====
let cq=null,ctl=null,PR=null,VF=1,vl=null,TF=null,EYD=null,lpT=null,lpS=null,LC=null,prevT=null;
Object.assign(BM,{dk:'darken',lt:'lighten',cd:'color-dodge',cb:'color-burn',sl:'soft-light',hl:'hard-light',df:'difference',ad:'lighter',co:'color'});
const alk=()=>{const l=L[al];return !!(l&&l.alk&&!me)};
// ---------- 1.1.1 pincel ----------
function prs(e){const r=Math.pow(Math.min(1,Math.max(.01,e.pressure||.5)),S.pg||1);PR=PR==null?r:PR+(r-PR)*.5;return PR}
function dynK(e){let k=1;if(e.pointerType==='pen'&&S.tl)k*=1+Math.min(1,Math.hypot(e.tiltX||0,e.tiltY||0)/70)*S.tl/100*1.5;if(S.vel)k*=1-(1-VF)*S.vel/100*.7;return k}
function tiltRot(e){return e.pointerType==='pen'&&S.tl&&(e.tiltX||e.tiltY)?Math.atan2(e.tiltY,e.tiltX):0}
function stab(p){const k=S.stab||0;if(!k)return p;const md=S.sm||'e';sm=sm&&sm.h?sm:{x:p.x,y:p.y,h:[]};
  if(md==='a'){sm.h.push(p);if(sm.h.length>1+Math.round(k/8))sm.h.shift();return{x:sm.h.reduce((s,q)=>s+q.x,0)/sm.h.length,y:sm.h.reduce((s,q)=>s+q.y,0)/sm.h.length}}
  if(md==='r'){const R=k*.6*(W/1000),d=Math.hypot(p.x-sm.x,p.y-sm.y);if(d>R){const f=(d-R)/d;sm.x+=(p.x-sm.x)*f;sm.y+=(p.y-sm.y)*f}return{x:sm.x,y:sm.y}}
  const q=Math.min(.92,k/100*.92);sm.x+=(p.x-sm.x)*(1-q);sm.y+=(p.y-sm.y)*(1-q);return{x:sm.x,y:sm.y}}
function strokeMove(e){const ev=(e.getCoalescedEvents&&e.getCoalescedEvents())||[];
  for(const q of(ev.length?ev:[e])){const pp=gsn(pos(q));LC={clientX:q.clientX,clientY:q.clientY};
    if(lpT&&lpS&&Math.hypot(pp.x-lpS.x,pp.y-lpS.y)>8*W/view.getBoundingClientRect().width)lpCancel();
    if(vl){const v=Math.hypot(pp.x-vl.x,pp.y-vl.y)/(W/1000)/Math.max(1,q.timeStamp-vl.t);VF+=(1/(1+v*1.2)-VF)*.2}vl={x:pp.x,y:pp.y,t:q.timeStamp};
    lastRaw=pp;SP.push(pp);LE=q;qsA();const p=stab(pp);
    if(S.crv===0){seg(last,p,q);last=p;continue}
    if(!cq){cq={x:last.x,y:last.y};ctl=last}
    const m={x:(ctl.x+p.x)/2,y:(ctl.y+p.y)/2},n=Math.max(1,Math.min(8,Math.ceil(Math.hypot(m.x-cq.x,m.y-cq.y)/(6*W/1000))));let a=cq;
    for(let i=1;i<=n;i++){const t=i/n,u=1-t,b={x:u*u*cq.x+2*u*t*ctl.x+t*t*m.x,y:u*u*cq.y+2*u*t*ctl.y+t*t*m.y};seg(a,b,q);a=b}
    cq=m;ctl=p;last=p}}
function strokeEnd(e){if(cq&&ctl)seg(cq,ctl,e);if(S.stab&&S.sm!=='r'&&lastRaw&&ctl)seg(ctl,lastRaw,e);cq=ctl=null}
function advSet(){const R=(id,l,v,mx)=>'<label class="row">'+l+': <b id="'+id+'v">'+v+'</b><input id="'+id+'" type="range" min="0" max="'+mx+'" value="'+v+'" style="width:120px"></label>',m=S.sm||'e';
  return '<label class="row">Modo de estabilizador<select id="sm"><option value="e"'+(m==='e'?' selected':'')+'>Retardo suave</option><option value="a"'+(m==='a'?' selected':'')+'>Promedio</option><option value="r"'+(m==='r'?' selected':'')+'>Cuerda</option></select></label>'+
    R('t1','Inclinación del lápiz',S.tl||0,100)+R('t2','Tamaño por velocidad',S.vel||0,100)+R('t3','Curva de presión (×10)',Math.round((S.pg||1)*10),30)+
    '<label class="row">Suavizado de curva<input id="t4" type="checkbox"'+(S.crv!==0?' checked':'')+'></label><label class="row">Cuentagotas con pulsación larga<input id="t5" type="checkbox"'+(S.lp!==0?' checked':'')+'></label>'}
function advWire(){$('#sm').onchange=e=>{S.sm=e.target.value;save()};
  [['t1','tl',1],['t2','vel',1],['t3','pg',.1]].forEach(([id,k,f])=>$('#'+id).oninput=e=>{S[k]=+e.target.value*f;$('#'+id+'v').textContent=e.target.value;save()});
  $('#t4').onchange=e=>{S.crv=e.target.checked?1:0;save()};$('#t5').onchange=e=>{S.lp=e.target.checked?1:0;save()}}
// ---------- 1.1.2 capas: máscaras, recorte, grupos, alpha lock, mezcla ----------
let TMP=document.createElement('canvas'),GT=document.createElement('canvas');
const sz=(c,w,h)=>{if(c.width!==w||c.height!==h){c.width=w;c.height=h}else c.getContext('2d').clearRect(0,0,w,h);return c.getContext('2d')};
function ef(c){if(c&&c._ev)return null;if(!c||!c.m)return c;const dr=drawing&&L[al]&&L[al].a[cur]===c;
  if(!dr&&c._e&&c._mv===c._v+'.'+c.m._v)return c._e;
  const e=c._e||(c._e=document.createElement('canvas'));e.width=c.width;e.height=c.height;const g=e.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='destination-in';g.drawImage(c.m,0,0);c._mv=c._v+'.'+c.m._v;return e}
function drw(ls,t,x,m){const w=x.canvas.width,h=x.canvas.height;let base=null;
  for(const l of ls){const raw=l.a[t],c=l.v&&!(XPT&&l.ref)&&raw?ef(raw):null;if(!l.cl)base=c;if(!c)continue;let src=c;
    if(l.cl){if(!base)continue;const g=sz(TMP,w,h);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.drawImage(c,0,0,w,h);g.globalCompositeOperation='destination-in';g.drawImage(base,0,0,w,h);g.globalCompositeOperation='source-over';src=TMP}
    x.globalAlpha=l.o/100*m;x.globalCompositeOperation=BM[l.bm]||'source-over';const bf=l.br&&l.br!==100;if(bf)x.filter='brightness('+l.br+'%)';x.drawImage(src,0,0,w,h);if(bf)x.filter='none'}
  x.globalAlpha=1;x.globalCompositeOperation='source-over'}
function comp(t,x,m=1){let i=0;const w=x.canvas.width,h=x.canvas.height;
  while(i<L.length){const l=L[i];if(!l.gid){drw([l],t,x,m);i++;continue}
    let j=i;while(j<L.length&&L[j].gid===l.gid)j++;const gp=GP[l.gid]||{v:1,o:100},ls=L.slice(i,j);i=j;if(!gp.v)continue;
    if(gp.o>=100)drw(ls,t,x,m);else{const g=sz(GT,w,h);drw(ls,t,g,1);x.globalAlpha=gp.o/100*m;x.globalCompositeOperation='source-over';x.drawImage(GT,0,0,w,h);x.globalAlpha=1}}
  x.globalAlpha=1;x.globalCompositeOperation='source-over'}
const ghead=g=>{const p=GP[g]||{};return '<div class="rw"><div class="lb"><button data-gv="'+g+'" aria-label="Visibilidad del grupo">'+(p.v?'👁':'—')+'</button><button data-gc="'+g+'" aria-label="Plegar grupo">'+(p.c?'▸':'▾')+'</button><button class="nm gn" data-gs="'+g+'">▤ '+esc(p.n||'Grupo')+'</button></div></div>'};
strip.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.gv){GP[d.gv].v=GP[d.gv].v?0:1;buildStrip();render()}else if(d.gc){GP[d.gc].c=GP[d.gc].c?0:1;buildStrip()}else if(d.gs){GA=d.gs;mark()}else if(d.l!=null||d.c){GA=null;mark()}});
function grpToggle(){const l=L[al];if(l.gid){delete l.gid;toast('Capa fuera del grupo')}
  else{const b=L[al-1];if(!b)return toast('Necesitas otra capa debajo');let g=b.gid;if(!g){g='g'+Date.now().toString(36);GP[g]={n:'Grupo '+(Object.keys(GP).length+1),v:1,o:100,c:0};b.gid=g}l.gid=g;toast('Capa añadida al grupo')}
  buildStrip();render();persist()}
$('#gr1').onclick=grpToggle;
$('#mk1').onclick=()=>{const l=L[al],c=l.a[cur];if(!c)return toast('Dibuja algo en este cuadro primero');if(l.k)return toast('La capa está bloqueada');
  if(!c.m){const m=mk(),g=m.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,W,H);c.m=m;me=1;toast('Máscara creada: el pincel revela y el borrador oculta')}else{me=me?0:1;toast(me?'Editando la máscara':'Editando la capa')}
  buildStrip();render();mark()};
$('#mk2').onclick=()=>{const c=L[al].a[cur];if(c&&c.m){delete c.m;me=0;buildStrip();render();toast('Máscara quitada')}};
$('#al1').onclick=()=>{const l=L[al];l.alk=l.alk?0:1;buildStrip();persist();toast(l.alk?'Alpha Lock: solo pintas donde ya hay trazo':'Alpha Lock desactivado')};
$('#cl1').onclick=()=>{const l=L[al];if(al===0)return toast('No hay capa debajo');l.cl=l.cl?0:1;buildStrip();render();persist();toast(l.cl?'Recortada a la capa de abajo':'Recorte desactivado')};
$('#lo').oninput=e=>{if(GA&&GP[GA])GP[GA].o=+e.target.value;else L[al].o=+e.target.value;render()};
$('#ln').onclick=()=>{const o=GA&&GP[GA]?GP[GA]:L[al],n=prompt('Nombre',o.n);if(n){o.n=n;buildStrip();persist()}};
const _mk6=mark;mark=function(){_mk6();const l=L[al],c=l&&l.a[cur];if(!l)return;
  if(GA&&GP[GA])$('#lo').value=GP[GA].o;$('#mk1').classList.toggle('on',!!(me&&c&&c.m));$('#al1').classList.toggle('on',!!l.alk);$('#cl1').classList.toggle('on',!!l.cl);$('#gr1').classList.toggle('on',!!l.gid);
  strip.querySelectorAll('.gn').forEach(x=>x.classList.toggle('on',x.dataset.gs===GA))};
// ---------- 1.1.3 color ----------
const hr=(h,s,v)=>{const f=n=>{const k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1))};return[f(5),f(3),f(1)].map(x=>Math.round(x*255))};
const h2x=(h,s,v)=>'#'+hr(h,s,v).map(x=>x.toString(16).padStart(2,'0')).join('');
function x2h(x){const r=parseInt(x.slice(1,3),16)/255,g=parseInt(x.slice(3,5),16)/255,b=parseInt(x.slice(5,7),16)/255,mx=Math.max(r,g,b),d=mx-Math.min(r,g,b);let h=0;
  if(d){h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}return[h,mx?d/mx:0,mx]}
const HN=['Complementario','Análogos','Triada','Tetrada','Triada dividida','Monocromático'],HA=[[180],[-30,30],[120,240],[90,180,270],[150,210]];
const harm=(H,s,v,m)=>m===5?[.25,.45,.65,.85].map(k=>h2x(H,s,k)):HA[m].map(a=>h2x((H+a+360)%360,s,v));
function palEnsure(){if(!S.pals||!S.pals.length){S.pals=[{n:'Básica',c:['#000000','#ffffff','#e63946','#f4a261','#e9c46a','#2a9d8f','#457b9d','#9b5de5']}];S.pi=0}S.pi=Math.min(S.pi||0,S.pals.length-1)}
let PRM=0,svT=null;
const sw3=(c,a)=>'<button class="sw3" '+a+' style="background:'+c+'" aria-label="'+c+'"></button>';
function colExtra(){palEnsure();const[H,Sa,V]=x2h(S.pal[ci]),p=S.pals[S.pi],hm=S.hm||0;
  return '<h3 style="margin-top:12px">Rueda de color</h3><canvas id="wh" width="180" height="180" style="touch-action:none;border-radius:50%"></canvas><label class="f">Brillo<input id="wv" type="range" min="0" max="100" value="'+Math.round(V*100)+'"></label>'+
    '<label class="row">Armonía<select id="hm">'+HN.map((n,i)=>'<option value="'+i+'"'+(i===hm?' selected':'')+'>'+n+'</option>').join('')+'</select></label><div id="hs">'+harm(H,Sa,V,hm).map(c=>sw3(c,'data-c="'+c+'"')).join('')+'</div>'+
    '<h3 style="margin-top:12px">Paletas</h3><div class="chips"><select id="pl">'+S.pals.map((q,i)=>'<option value="'+i+'"'+(i===S.pi?' selected':'')+'>'+esc(q.n)+'</option>').join('')+'</select><button class="chip" id="pn1">Nueva</button><button class="chip" id="pa">+ Color actual</button><button class="chip'+(PRM?' on':'')+'" id="pr">− Quitar color</button><button class="chip" id="px">Borrar paleta</button></div><div>'+p.c.map((c,i)=>sw3(c,'data-c="'+c+'" data-pi="'+i+'"')).join('')+'</div>'}
function setCol(hx){S.pal[ci]=hx;rail();const cp=$('#cp');if(cp)cp.value=hx;const w=fly.querySelectorAll('.sw');if(w[ci])w[ci].style.background=hx;clearTimeout(svT);svT=setTimeout(()=>{addHist(hx);save()},400)}
function wireWheel(){const c=$('#wh');if(!c)return;const g=c.getContext('2d'),rr=()=>fly.innerHTML=flyHTML('col')||'';
  const draw=()=>{const[H,Sa]=x2h(S.pal[ci]),v=$('#wv').value/100,im=g.createImageData(180,180);
    for(let y=0;y<180;y++)for(let x=0;x<180;x++){const dx=x-90,dy=y-90,r=Math.hypot(dx,dy)/90;if(r>1)continue;const i=(y*180+x)*4,q=hr((Math.atan2(dy,dx)*180/Math.PI+360)%360,r,v);im.data[i]=q[0];im.data[i+1]=q[1];im.data[i+2]=q[2];im.data[i+3]=255}
    g.putImageData(im,0,0);const a=H*Math.PI/180;g.beginPath();g.arc(90+Math.cos(a)*Sa*90,90+Math.sin(a)*Sa*90,7,0,7);g.lineWidth=2;g.strokeStyle='#fff';g.stroke();g.lineWidth=1;g.strokeStyle='#000';g.stroke()};
  const hs=()=>{const[H,Sa,V]=x2h(S.pal[ci]);$('#hs').innerHTML=harm(H,Sa,V,S.hm||0).map(x=>sw3(x,'data-c="'+x+'"')).join('')};
  const pk=e=>{const r=c.getBoundingClientRect(),dx=(e.clientX-r.left)*180/r.width-90,dy=(e.clientY-r.top)*180/r.height-90;setCol(h2x((Math.atan2(dy,dx)*180/Math.PI+360)%360,Math.min(1,Math.hypot(dx,dy)/90),$('#wv').value/100));draw();hs()};
  c.onpointerdown=e=>{c.setPointerCapture(e.pointerId);pk(e)};c.onpointermove=e=>{if(e.buttons)pk(e)};
  $('#wv').oninput=e=>{const[H,Sa]=x2h(S.pal[ci]);setCol(h2x(H,Sa,e.target.value/100));draw();hs()};
  $('#hm').onchange=e=>{S.hm=+e.target.value;save();hs()};
  $('#pl').onchange=e=>{S.pi=+e.target.value;save();rr();wireFly('col')};
  $('#pn1').onclick=()=>{const n=prompt('Nombre de la paleta');if(n){S.pals.push({n,c:[]});S.pi=S.pals.length-1;save();rr();wireFly('col')}};
  $('#pa').onclick=()=>{const p=S.pals[S.pi];if(!p.c.includes(S.pal[ci]))p.c.push(S.pal[ci]);save();rr();wireFly('col')};
  $('#pr').onclick=()=>{PRM^=1;rr();wireFly('col')};
  $('#px').onclick=()=>{if(S.pals.length<2)return toast('Debe quedar una paleta');if(!confirm('¿Borrar la paleta «'+S.pals[S.pi].n+'»?'))return;S.pals.splice(S.pi,1);S.pi=0;save();rr();wireFly('col')};
  draw()}
fly.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.sw3');if(!b)return;
  if(PRM&&b.dataset.pi!==undefined){S.pals[S.pi].c.splice(+b.dataset.pi,1);save();fly.innerHTML=flyHTML('col');wireFly('col');return}
  setCol(b.dataset.c);fly.innerHTML=flyHTML('col');wireFly('col')});
// cuentagotas
function sampleAt(p){const r=S.er||0,n=2*r+1,c=document.createElement('canvas'),all=S.ea!==0;c.width=c.height=n;const g=c.getContext('2d');
  if(all){g.fillStyle=S.paper;g.fillRect(0,0,n,n)}g.translate(r-Math.round(p.x),r-Math.round(p.y));
  (all?L:[L[al]]).forEach(l=>{const q=l.v&&l.a[cur];if(q){g.globalAlpha=all?l.o/100:1;g.globalCompositeOperation=all?(BM[l.bm]||'source-over'):'source-over';{const z=ef(q);if(z)g.drawImage(z,0,0)}}});
  const d=g.getImageData(0,0,n,n).data;let R=0,G=0,B=0,A=0;for(let i=0;i<d.length;i+=4){const a=d[i+3];R+=d[i]*a;G+=d[i+1]*a;B+=d[i+2]*a;A+=a}
  return A?'#'+[R,G,B].map(v=>Math.round(v/A).toString(16).padStart(2,'0')).join(''):null}
const ER=document.createElement('div');ER.style.cssText='position:fixed;display:none;z-index:50;width:56px;height:56px;border-radius:50%;border:4px solid #fff;box-shadow:0 0 0 2px #000,0 2px 10px #0006;pointer-events:none';document.body.appendChild(ER);
function eyeMove(c){const r=view.getBoundingClientRect(),hx=sampleAt({x:(c.clientX-r.left)*W/r.width,y:(c.clientY-r.top)*H/r.height});if(hx){EYD.c=hx;ER.style.background=hx}ER.style.display='block';ER.style.left=(c.clientX-28)+'px';ER.style.top=(c.clientY-95)+'px'}
function eyeStart(c,lp){EYD={lp,c:null};eyeMove(c)}
function eyeEnd(){if(!EYD)return;ER.style.display='none';const d=EYD;EYD=null;if(d.c){S.pal[ci]=d.c;addHist(d.c);save();rail();toast('Color '+d.c)}if(!d.lp&&tool==='eye')setT(prevTool||'pen')}
view.addEventListener('pointermove',e=>{if(EYD)eyeMove(e)});view.addEventListener('pointerup',eyeEnd);view.addEventListener('pointercancel',eyeEnd);
function lpStart(e){lpCancel();LC={clientX:e.clientX,clientY:e.clientY};if(e.altKey)return lpFire();if(S.lp===0||tool!=='pen')return;lpS=pos(e);lpT=setTimeout(lpFire,550)}
function lpCancel(){clearTimeout(lpT);lpT=null}
function lpFire(){lpCancel();if(!drawing)return;drawing=false;cq=ctl=null;const h=hist.pop();if(h)h.c.getContext('2d').putImageData(h.d,0,0);render();eyeStart(LC,1)}
FLY.eye.html=()=>'<h3>Cuentagotas</h3><div class="chips">'+[[0,'1×1'],[1,'3×3'],[2,'5×5'],[4,'9×9']].map(([v,l])=>'<button class="chip'+((S.er||0)===v?' on':'')+'" data-er="'+v+'">'+l+'</button>').join('')+'</div><label class="row">Muestrear todas las capas<input id="ea" type="checkbox"'+(S.ea!==0?' checked':'')+'></label><small style="color:var(--muted)">Mantén pulsado y arrastra para ver el color antes de soltar. Con el pincel: pulsación larga o Alt+clic.</small>';
FLY.col.plus.push(()=>colExtra());
FLY.col.wirePlus.push(()=>wireWheel());
FLY.eye.wire=()=>{fly.querySelectorAll('[data-er]').forEach(b=>b.onclick=()=>{S.er=+b.dataset.er;save();fly.innerHTML=flyHTML('eye');wireFly('eye')});$('#ea').onchange=e=>{S.ea=e.target.checked?1:0;save()}};
// ---------- 1.1.4 selección y transformación ----------
const ell=(a,p)=>{const cx=(a.x+p.x)/2,cy=(a.y+p.y)/2,rx=Math.abs(p.x-a.x)/2,ry=Math.abs(p.y-a.y)/2,o=[];for(let i=0;i<72;i++){const t=i/72*2*Math.PI;o.push({x:cx+rx*Math.cos(t),y:cy+ry*Math.sin(t)})}return o};
const bbw=p=>{let a=1e9,b=-1e9,c=1e9,d=-1e9;p.forEach(q=>{a=Math.min(a,q.x);b=Math.max(b,q.x);c=Math.min(c,q.y);d=Math.max(d,q.y)});return Math.min(b-a,d-c)};
const lerp=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}),tfC=()=>({x:TF.q.reduce((s,p)=>s+p.x,0)/4,y:TF.q.reduce((s,p)=>s+p.y,0)/4});
function tri(g,im,s,d){const[x0,y0]=s[0],[x1,y1]=s[1],[x2,y2]=s[2],cx=(d[0].x+d[1].x+d[2].x)/3,cy=(d[0].y+d[1].y+d[2].y)/3,
  e=d.map(q=>{const l=Math.hypot(q.x-cx,q.y-cy)||1;return{x:q.x+(q.x-cx)/l*.7,y:q.y+(q.y-cy)/l*.7}}),
  u0=d[0].x,u1=d[1].x,u2=d[2].x,v0=d[0].y,v1=d[1].y,v2=d[2].y,dt=x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);if(!dt)return;
  g.save();g.beginPath();g.moveTo(e[0].x,e[0].y);g.lineTo(e[1].x,e[1].y);g.lineTo(e[2].x,e[2].y);g.closePath();g.clip();
  g.transform((u0*(y1-y2)+u1*(y2-y0)+u2*(y0-y1))/dt,(v0*(y1-y2)+v1*(y2-y0)+v2*(y0-y1))/dt,(u0*(x2-x1)+u1*(x0-x2)+u2*(x1-x0))/dt,(v0*(x2-x1)+v1*(x0-x2)+v2*(x1-x0))/dt,
    (u0*(x1*y2-x2*y1)+u1*(x2*y0-x0*y2)+u2*(x0*y1-x1*y0))/dt,(v0*(x1*y2-x2*y1)+v1*(x2*y0-x0*y2)+v2*(x0*y1-x1*y0))/dt);
  g.drawImage(im,0,0);g.restore()}
function warp(g,fl,q,N=6){const w=fl.width,h=fl.height,P=(u,v)=>lerp(lerp(q[0],q[1],u),lerp(q[3],q[2],u),v);
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=i/N,b=(i+1)/N,c=j/N,d=(j+1)/N,s=[[a*w,c*h],[b*w,c*h],[b*w,d*h],[a*w,d*h]],t=[P(a,c),P(b,c),P(b,d),P(a,d)];
    tri(g,fl,[s[0],s[1],s[2]],[t[0],t[1],t[2]]);tri(g,fl,[s[0],s[2],s[3]],[t[0],t[2],t[3]])}}
function tfStart(){if(TF)return;const c=cv();if(!c)return;if(!SL.path){SL.pts=[{x:0,y:0},{x:W,y:0},{x:W,y:H},{x:0,y:H}];SL.path=mkPath(SL.pts)}
  let a=1e9,b=-1e9,c2=1e9,d=-1e9;SL.pts.forEach(q=>{a=Math.min(a,q.x);b=Math.max(b,q.x);c2=Math.min(c2,q.y);d=Math.max(d,q.y)});
  const bx=Math.max(0,Math.floor(a)),by=Math.max(0,Math.floor(c2)),bw=Math.max(1,Math.min(W,Math.ceil(b))-bx),bh=Math.max(1,Math.min(H,Math.ceil(d))-by),
    fl=document.createElement('canvas'),bs=document.createElement('canvas');fl.width=bw;fl.height=bh;bs.width=W;bs.height=H;
  const fg=fl.getContext('2d'),bg=bs.getContext('2d'),g=c.getContext('2d');hist.push({c,d:g.getImageData(0,0,W,H)});trimH();
  fg.translate(-bx,-by);fg.save();fg.clip(SL.path);fg.drawImage(c,0,0);fg.restore();bg.drawImage(c,0,0);bg.globalCompositeOperation='destination-out';bg.fill(SL.path);
  TF={c,fl,bs,q:[{x:bx,y:by},{x:bx+bw,y:by},{x:bx+bw,y:by+bh},{x:bx,y:by+bh}],mode:'u',d:null};$('#t3').textContent='Uniforme';TB.style.display='flex';tfRender()}
function tfRender(){const g=TF.c.getContext('2d');g.clearRect(0,0,W,H);g.drawImage(TF.bs,0,0);warp(g,TF.fl,TF.q);requestAnimationFrame(render)}
function tfRotH(sc){const q=TF.q,cc=tfC(),tm=lerp(q[0],q[1],.5),l=Math.hypot(tm.x-cc.x,tm.y-cc.y)||1;return{x:tm.x+(tm.x-cc.x)/l*40*sc,y:tm.y+(tm.y-cc.y)/l*40*sc}}
function tfDown(e){view.setPointerCapture(e.pointerId);const p=pos(e),sc=W/view.getBoundingClientRect().width,R=22*sc,q=TF.q,r=tfRotH(sc);let h=null;
  if(Math.hypot(p.x-r.x,p.y-r.y)<R)h=['rot'];else{for(let i=0;i<4;i++)if(Math.hypot(p.x-q[i].x,p.y-q[i].y)<R){h=['cor',i];break}}
  if(!h&&vctx.isPointInPath(mkPath(q),p.x,p.y))h=['mov'];if(h)TF.d={t:h[0],i:h[1],lp:p}}
view.addEventListener('pointermove',e=>{if(!TF||!TF.d||G)return;const p=pos(e),d=TF.d,q=TF.q,cc=tfC();
  if(d.t==='mov'){const dx=p.x-d.lp.x,dy=p.y-d.lp.y;q.forEach(a=>{a.x+=dx;a.y+=dy})}
  else if(d.t==='rot'){const a=Math.atan2(p.y-cc.y,p.x-cc.x)-Math.atan2(d.lp.y-cc.y,d.lp.x-cc.x),co=Math.cos(a),si=Math.sin(a);q.forEach(m=>{const x=m.x-cc.x,y=m.y-cc.y;m.x=cc.x+x*co-y*si;m.y=cc.y+x*si+y*co})}
  else if(TF.mode==='f')q[d.i]={x:p.x,y:p.y};
  else{const k=Math.hypot(p.x-cc.x,p.y-cc.y)/(Math.hypot(d.lp.x-cc.x,d.lp.y-cc.y)||1);q.forEach(m=>{m.x=cc.x+(m.x-cc.x)*k;m.y=cc.y+(m.y-cc.y)*k})}
  d.lp=p;tfRender()});
view.addEventListener('pointerup',()=>{if(TF)TF.d=null});
function tfApply(){if(!TF)return;SL.pts=TF.q.map(p=>({...p}));SL.path=mkPath(SL.pts);dirty.add(TF.c);TF=null;TB.style.display='none';thumb(cur);persist();render();if(newCell){newCell=0;buildStrip()}}
function tfCancel(){if(!TF)return;const h=hist.pop();if(h)h.c.getContext('2d').putImageData(h.d,0,0);TF=null;TB.style.display='none';render()}
const TB=document.createElement('div');TB.style.cssText='position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:40;display:none;gap:6px;background:var(--panel);padding:6px;border-radius:12px;box-shadow:0 2px 12px #0005';
TB.innerHTML='<button class="pill sm" id="t1">Aplicar</button><button class="pill sm" id="t2">Cancelar</button><button class="pill sm" id="t3">Uniforme</button><button class="pill sm" id="t4" aria-label="Voltear horizontal">↔</button><button class="pill sm" id="t5" aria-label="Voltear vertical">↕</button>';document.body.appendChild(TB);
$('#t1').onclick=tfApply;$('#t2').onclick=tfCancel;
$('#t3').onclick=e=>{TF.mode=TF.mode==='u'?'f':'u';e.target.textContent=TF.mode==='u'?'Uniforme':'Libre (distorsión)'};
$('#t4').onclick=()=>{const q=TF.q;TF.q=[q[1],q[0],q[3],q[2]];tfRender()};$('#t5').onclick=()=>{const q=TF.q;TF.q=[q[3],q[2],q[1],q[0]];tfRender()};
function drawTF(){const q=TF.q,lw=2*W/view.getBoundingClientRect().width,sc=lw/2,r=tfRotH(sc),tm=lerp(q[0],q[1],.5),pa=mkPath(q);
  vctx.save();vctx.setLineDash([]);vctx.lineWidth=lw;vctx.strokeStyle='#fff';vctx.stroke(pa);vctx.lineWidth=lw/2;vctx.strokeStyle='#000';vctx.stroke(pa);
  vctx.beginPath();vctx.moveTo(tm.x,tm.y);vctx.lineTo(r.x,r.y);vctx.stroke();
  [...q,r].forEach(p=>{vctx.beginPath();vctx.arc(p.x,p.y,9*sc,0,7);vctx.fillStyle='#fff';vctx.fill();vctx.lineWidth=lw/2;vctx.stroke()});vctx.restore()}
const _rd6=render;render=function(){_rd6();if(TF)drawTF()};
const _sd6=selDown;selDown=function(e){if(TF)return tfDown(e);if(tool==='eye'){view.setPointerCapture(e.pointerId);return eyeStart(e)}_sd6(e)};
const _go6=go;go=function(i){if(TF)tfApply();_go6(i)};const _tap6=tap;tap=function(id){if(TF)tfApply();_tap6(id)};
addEventListener('keydown',e=>{if(!TF)return;if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();tfApply()}else if(e.key==='Escape'){e.stopImmediatePropagation();tfCancel()}},true);
rail();

