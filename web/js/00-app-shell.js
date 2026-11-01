
const APP={name:'Filmframe 2D Animation',version:'1.1.18'};
// Claves de almacenamiento: NO cambiar (compatibilidad con proyectos guardados)
const STORE={cfg:'anim-v2',frames:'anim-v2-frames',projects:'anim-projects',cache:'anim-cache',errors:'anim-errors'};
const $=s=>document.querySelector(s);
window.addEventListener('error',e=>{try{const log=JSON.parse(localStorage.getItem(STORE.errors)||'[]');log.push({t:Date.now(),m:String(e.message||''),f:(e.filename||'').split('/').pop(),l:e.lineno});while(log.length>20)log.shift();localStorage.setItem(STORE.errors,JSON.stringify(log))}catch(_){}});
window.addEventListener('unhandledrejection',e=>{try{const log=JSON.parse(localStorage.getItem(STORE.errors)||'[]'),r=e.reason;log.push({t:Date.now(),m:'promesa: '+String((r&&r.message)||r||''),f:'',l:0});while(log.length>20)log.shift();localStorage.setItem(STORE.errors,JSON.stringify(log))}catch(_){}});
const IC={pen:'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',era:'m7 21-4.3-4.3a1 1 0 0 1 0-1.4l9.6-9.6a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L13 21H7ZM22 21H7',oni:'m12 2 10 5-10 5L2 7ZM2 17l10 5 10-5M2 12l10 5 10-5',und:'M3 7v6h6M3 13a9 9 0 1 0 3-7.7L3 8',tl:'M2 4h20v16H2zM7 4v16M17 4v16M2 12h20',set:'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6'};
const NAMES={pen:'Pincel',era:'Borrador',col:'Color',oni:'Papel cebolla',und:'Deshacer',tl:'Línea de tiempo'};
const D={side:'left',theme:'auto',w:1920,h:1080,fps:12,before:1,after:0,oop:25,press:true,paper:'#ffffff',tools:{pen:1,era:1,col:1,oni:1,und:1,tl:1},pal:['#111111','#e63946','#f4a261','#2a9d8f','#3a86ff','#ffffff'],sz:{pen:6,era:16},bi:0,memWarn:1500,perf:0,brushes:[{n:'Lápiz',size:6,op:80,hard:85,sp:8,grain:45,scat:0,ps:1,po:1},{n:'Tinta',size:5,op:100,hard:100,sp:4,grain:0,scat:0,ps:1,po:0},{n:'Marcador',size:18,op:60,hard:100,sp:6,grain:0,scat:0,ps:0,po:0},{n:'Aerógrafo',size:40,op:10,hard:0,sp:10,grain:10,scat:0,ps:0,po:1},{n:'Carbón',size:16,op:65,hard:55,sp:10,grain:85,scat:35,ps:1,po:1},{n:'Boceto',size:3,op:60,hard:90,sp:6,grain:30,scat:3,ps:1,po:1},{n:'Lápiz de color',size:7,op:55,hard:70,sp:9,grain:70,scat:6,ps:1,po:1},{n:'Fineliner',size:2,op:100,hard:100,sp:3,grain:0,scat:0,ps:0,po:0},{n:'Pincel tinta',size:14,op:100,hard:95,sp:3,grain:0,scat:0,ps:1,po:0},{n:'Acuarela',size:30,op:14,hard:20,sp:12,grain:35,scat:6,ps:0,po:1},{n:'Gouache',size:24,op:90,hard:75,sp:7,grain:15,scat:0,ps:1,po:0},{n:'Tiza',size:20,op:70,hard:45,sp:12,grain:95,scat:20,ps:0,po:1},{n:'Pastel',size:28,op:50,hard:35,sp:10,grain:70,scat:25,ps:1,po:1},{n:'Spray',size:50,op:25,hard:0,sp:6,grain:90,scat:100,ps:0,po:0},{n:'Acrílico',size:26,op:95,hard:80,sp:6,grain:8,scat:0,ps:1,po:0},{n:'Difuminar',size:30,op:55,hard:40,sp:8,grain:0,scat:0,ps:0,po:0,sm:1}]};
let S=load();
function load(){try{const j=JSON.parse(localStorage.getItem(STORE.cfg)||'{}'),s={...D,...j,tools:{...D.tools,...j.tools},sz:{...D.sz,...j.sz}};
  if(!j.brushes)s.brushes=D.brushes.map(b=>({...b}));
  D.brushes.forEach((b,i)=>{if(b.id==null)b.id='p'+(i+1)});
  if((j.bv||0)<4){const byName={};D.brushes.forEach(b=>byName[b.n]=b.id);
    s.brushes=(s.brushes||[]).map(b=>{if(b.id==null&&byName[b.n])return{...b,id:byName[b.n]};return b});
    s.brushes.forEach((b,i)=>{if(b.id==null)b.id='u'+i})}
  s.bv=4;return s}catch(e){return{...D}}}
function save(){let ok=1;try{localStorage.setItem(STORE.cfg,JSON.stringify(S))}catch(e){ok=0;toast('⚠ No se pudo guardar la configuración (almacenamiento lleno o bloqueado)')}if($('#mem'))memEst();return ok}
{const mx=16777216;if(S.w*S.h>mx){const k=Math.sqrt(mx/(S.w*S.h));S.w=Math.round(S.w*k);S.h=Math.round(S.h*k)}if(S.w<64)S.w=64;if(S.h<64)S.h=64}
let W=S.w,H=S.h,cur=0,tool='pen',ci=0,playing=false,timer=null,hist=[],drawing=false,last=null,openFly=null;
const view=$('#view'),vctx=view.getContext('2d'),strip=$('#strip'),fly=$('#fly');


function pos(e){const r=view.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
view.addEventListener('pointerdown',e=>{if(gestDown(e)||playing)return;closeFly();if(TF||tool==='fil'||tool==='sel'||tool==='eye'||tool==='txt'||tool==='gd')return selDown(e);view.setPointerCapture(e.pointerId);
  const c0=cv();if(!c0)return;hist.push({c:c0,d:c0.getContext('2d').getImageData(0,0,W,H)});trimH();
  drawing=true;acc=1e9;pd=null;sm=null;lastRaw=null;cq=ctl=null;PR=null;VF=1;vl=null;SP=[];BB=null;qsC();tool==='pen'&&addHist(S.pal[ci]);last=stab(gsn(pos(e),1));seg(last,{x:last.x+.01,y:last.y},e);lpStart(e)});
view.addEventListener('pointermove',e=>{if(gestMove(e)||!drawing)return;strokeMove(e)});
const end=e=>{lpCancel();gestUp(e);if(drawing){strokeEnd(e);qsC();cropH();drawing=false;dirty.add(cv(1));thumb(cur);persist();if(newCell){newCell=0;buildStrip()}}};
view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);

$('#prev').onclick=()=>go(cur-1);$('#next').onclick=()=>go(cur+1);

function svg(d){return '<svg viewBox="0 0 24 24"><path d="'+d+'"/></svg>'}
function rail(){
  const r=$('#rail');r.innerHTML='';
  const groups=[{label:'Dibujo',ids:['pen','era','fil','sel','eye','txt','gd']},{label:'Color',ids:['col']},{label:'Animación',ids:['oni','und','tl']},{label:'Sistema',ids:['set']}];
  groups.forEach((group,gi)=>{
    const visible=group.ids.filter(id=>id==='set'||S.tools[id]);
    if(!visible.length)return;
    if(gi){const sep=document.createElement('div');sep.className='rail-separator';sep.setAttribute('aria-hidden','true');r.appendChild(sep)}
    visible.forEach(id=>{
      const b=document.createElement('button');b.className='ic'+(id===tool?' on':'');b.setAttribute('aria-label',NAMES[id]||'Ajustes');b.title=group.label+' · '+(NAMES[id]||'Ajustes');
      b.innerHTML=id==='col'?'<span class="dot" style="background:'+S.pal[ci]+'"></span>':svg(IC[id]);
      b.onclick=()=>tap(id);r.appendChild(b)
    })
  });
  document.body.classList.toggle('r',S.side==='right');
}
function tap(id){
  if(id==='und')return undo();
  if(id==='tl'){$('#tl').classList.toggle('show');return}
  if(id==='set')return sheet();
  if(id==='pen'||id==='era'||id==='fil'||id==='sel'||id==='eye'||id==='txt'||id==='gd'){const same=tool===id;tool=id;rail();same?toggleFly(id):closeFly();return}
  toggleFly(id);
}
function closeFly(){openFly=null;fly.classList.remove('show')}
function toggleFly(id){if(openFly===id)return closeFly();openFly=id;fly.innerHTML=flyHTML(id);fly.classList.add('show');wireFly(id)}
// ===== Panel flotante: un registro por herramienta =====
// Cada herramienta define html() y wire(); plus/wirePlus son extensiones que otros módulos añaden (orden de registro = orden de ejecución).
const FLY=Object.fromEntries(['era','pen','col','oni','fil','sel','eye','txt','gd'].map(k=>[k,{plus:[],wirePlus:[]}]));
function flyHTML(id){const t=FLY[id];if(!t||!t.html)return;return t.html()+t.plus.map(f=>f()).join('')}
function wireFly(id){const t=FLY[id];if(!t)return;if(t.wire)t.wire();t.wirePlus.forEach(f=>f())}
FLY.era.html=()=>'<h3>Borrador</h3><label class="f">Tamaño<input id="fs" type="range" min="1" max="120" value="'+S.sz.era+'"></label>';
FLY.pen.html=()=>brushHTML();
FLY.col.html=()=>'<h3>Color</h3><div class="sws">'+S.pal.map((c,i)=>'<button class="sw'+(i===ci?' sel':'')+'" data-i="'+i+'" style="background:'+c+'" aria-label="Color '+(i+1)+'"></button>').join('')+'</div><label class="f">Editar el color elegido<input id="cp" type="color" value="'+S.pal[ci]+'"></label>';
FLY.oni.html=()=>'<h3>Papel cebolla</h3><label class="f">Cuadros anteriores: <b id="vb">'+S.before+'</b><input id="ob" type="range" min="0" max="4" value="'+S.before+'"></label><label class="f">Cuadros siguientes: <b id="va">'+S.after+'</b><input id="oa" type="range" min="0" max="4" value="'+S.after+'"></label><label class="f">Opacidad<input id="oo" type="range" min="5" max="80" value="'+S.oop+'"></label>';
FLY.era.wire=()=>$('#fs').oninput=e=>{S.sz.era=+e.target.value;save()};
FLY.pen.wire=()=>wireBrush();
FLY.col.wire=()=>{fly.querySelectorAll('.sw').forEach(b=>b.onclick=()=>{ci=+b.dataset.i;fly.innerHTML=flyHTML('col');wireFly('col');rail()});
    $('#cp').oninput=e=>{S.pal[ci]=e.target.value;fly.querySelectorAll('.sw')[ci].style.background=e.target.value;rail();save()}};
FLY.oni.wire=()=>{$('#ob').oninput=e=>{S.before=+e.target.value;$('#vb').textContent=S.before;save();render()};
    $('#oa').oninput=e=>{S.after=+e.target.value;$('#va').textContent=S.after;save();render()};
    $('#oo').oninput=e=>{S.oop=+e.target.value;save();render()}};

S.bi=Math.min(S.bi||0,S.brushes.length-1);
let acc=0;const SPR=new Map();
function sprite(col,hard,d,era){const k=col+hard+'|'+d+era;let c=SPR.get(k);if(c)return c;if(SPR.size>300)SPR.clear();
  d=Math.max(2,d);c=document.createElement('canvas');c.width=c.height=d;const g=c.getContext('2d'),r=d/2,rgb=era?'0,0,0':[1,3,5].map(i=>parseInt(col.slice(i,i+2),16)).join(',');
  const gr=g.createRadialGradient(r,r,0,r,r,r),h=Math.min(.99,hard/100);gr.addColorStop(0,'rgba('+rgb+',1)');gr.addColorStop(h,'rgba('+rgb+',1)');gr.addColorStop(1,'rgba('+rgb+',0)');
  g.fillStyle=gr;g.fillRect(0,0,d,d);SPR.set(k,c);return c}
function seg(a,b,e){
  const x=cv(1).getContext('2d'),era=tool==='era',B=era?{size:S.sz.era,op:100,hard:80,sp:6,grain:0,scat:0,ps:0,po:0}:S.brushes[S.bi],
  pen=e.pointerType==='pen'&&S.press,p=pen?prs(e):.5,
  baseDia=Math.max(1,B.size*(W/1000)*(B.ps&&pen?.2+p*1.6:1)*dynK(e)),
  stepBase=Math.max(1,B.sp/100*baseDia),dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy),
  baseRot=(B.tip&&(B.ang||B.fol)?((B.fol&&dist?Math.atan2(dy,dx):0)+(B.ang||0)*Math.PI/180):0)+(B.tip?tiltRot(e):0);
  bbAdd(a,b,baseDia*(1+(B.scat||0)/25+(B.jz||0)/100)+4);if(alk()&&era)return;
  x.globalCompositeOperation=alk()?'source-atop':era?'destination-out':'source-over';x.imageSmoothingEnabled=true;x.imageSmoothingQuality=S.perf?'low':'high';
  let need=Math.max(0,stepBase-acc),s=0;
  while(s+need<=dist){
    s+=need;const f=dist?s/dist:0;let px=a.x+dx*f,py=a.y+dy*f;
    const sizeJ=1+(Math.random()-.5)*(B.jz||0)/100;
    const dia=Math.max(1,baseDia*sizeJ),step=Math.max(1,stepBase*(1+(Math.random()-.5)*(B.js||0)/100));
    if(B.scat){px+=(Math.random()-.5)*B.scat/50*baseDia;py+=(Math.random()-.5)*B.scat/50*baseDia}
    const opJ=Math.max(0,1+(Math.random()-.5)*(B.jo||0)/100);
    const pressureOpacity=B.po&&pen?(1-(1-p)*(B.poAmt==null?70:B.poAmt)/100):1;
    const alpha=Math.max(0,Math.min(1,B.op/100*pressureOpacity*opJ));
    const d=Math.max(2,Math.round(dia));
    let sp=(B.tip&&tipOf(B))?tipSprite(B,S.pal[ci],d,era):sprite(S.pal[ci],B.hard,d,era);
    if(B.grainTip&&grainOf(B))sp=grainSprite(B,S.pal[ci],d,era,sp);
    const rot=baseRot+(Math.random()-.5)*(B.jr||0)*Math.PI/180;
    x.globalAlpha=B.grain?alpha*(1-B.grain/100*Math.random()):alpha;
    if(B.sm){if(pd){const sg=(smt.width=smt.height=d,smt.getContext('2d'));sg.drawImage(cv(1),pd.x-d/2,pd.y-d/2,d,d,0,0,d,d);sg.globalCompositeOperation='destination-in';sg.drawImage(sprite('#000000',B.hard,d,false),0,0);x.globalAlpha=alpha;x.drawImage(smt,px-d/2,py-d/2)}pd={x:px,y:py}}
    else if(rot){x.save();x.translate(px,py);x.rotate(rot);x.drawImage(sp,-sp.width/2,-sp.height/2);x.restore()}
    else x.drawImage(sp,px-sp.width/2,py-sp.height/2);
    acc=0;need=step;
  }
  acc+=dist-s;x.globalAlpha=1;x.globalCompositeOperation='source-over';requestAnimationFrame(render)}
const BP=[['size','Tamaño',1,120],['op','Opacidad',1,100],['hard','Dureza',0,100],['sp','Espaciado',1,100],['grain','Grano',0,100],['scat','Dispersión',0,100]];
let pd=null;const smt=document.createElement('canvas'),TIPS=new Map();let tid=0;
const GR=['Lápices','Tintas','Acrílicos','Acuarelas','Secos','Sintéticos','Aerógrafo','Difuminado','Mis pinceles'];
const GM={'Lápiz':'Lápices','Boceto':'Lápices','Lápiz de color':'Lápices','Tinta':'Tintas','Fineliner':'Tintas','Pincel tinta':'Tintas','Marcador':'Sintéticos','Aerógrafo':'Aerógrafo','Spray':'Aerógrafo','Carbón':'Secos','Tiza':'Secos','Pastel':'Secos','Acuarela':'Acuarelas','Gouache':'Acrílicos','Acrílico':'Acrílicos','Difuminar':'Difuminado'};
let gSel=null;const grp=b=>b.g||GM[b.n]||'Mis pinceles';
function tipOf(b){return b.tip&&TIPS.get(b.tip)}
const GRAINS=new Map(),GSPR=new Map();let gid=0;
function grainOf(b){return b.grainTip&&GRAINS.get(b.grainTip)}
function loadGrain(url,cb){if(GRAINS.has(url)){cb&&cb();return}const im=new Image();im.onload=()=>{GRAINS.set(url,{im,id:++gid});cb&&cb()};im.src=url}
function grainSprite(b,col,d,era,base){
  const gr=grainOf(b);if(!gr)return base;const key='g'+gr.id+'|'+col+'|'+d+'|'+era+'|'+(b.gd==null?55:b.gd);
  let c=GSPR.get(key);if(c)return c;if(GSPR.size>160)GSPR.clear();
  c=document.createElement('canvas');c.width=c.height=d;const g=c.getContext('2d');
  g.drawImage(base,0,0,d,d);g.globalCompositeOperation='multiply';
  g.globalAlpha=Math.max(0,Math.min(1,(b.gd==null?55:b.gd)/100));
  const im=gr.im,s=Math.max(d/im.width,d/im.height),w=im.width*s,h=im.height*s;
  g.drawImage(im,(d-w)/2,(d-h)/2,w,h);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  GSPR.set(key,c);return c;
}
function loadTip(url,cb){if(TIPS.has(url)){cb&&cb();return}const im=new Image();im.onload=()=>{TIPS.set(url,{im,id:++tid});cb&&cb()};im.src=url}
function tipSprite(b,col,d,era){const t=tipOf(b);d=Math.max(2,d);const k=t.id+col+d+era+(S.perf?'q1':'q0');let c=SPR.get(k);if(c)return c;if(SPR.size>300)SPR.clear();
  c=document.createElement('canvas');c.width=c.height=d;const g=c.getContext('2d');g.imageSmoothingQuality=S.perf?'low':'high';
  const s=d/Math.max(t.im.width,t.im.height),w=t.im.width*s,h=t.im.height*s;g.drawImage(t.im,(d-w)/2,(d-h)/2,w,h);
  g.globalCompositeOperation='source-in';g.fillStyle=era?'#000':col;g.fillRect(0,0,d,d);SPR.set(k,c);return c}
function brushHTML(){const B=S.brushes[S.bi],g=gSel||grp(B),has=GR.filter(x=>x===g||S.brushes.some(b=>grp(b)===x));
  const val=k=>B[k]==null?(k==='poAmt'?70:0):B[k];
  const range=p=>'<label class="f">'+p[1]+': <b id="v_'+p[0]+'">'+val(p[0])+'</b><input type="range" data-p="'+p[0]+'" min="'+p[2]+'" max="'+p[3]+'" value="'+val(p[0])+'"></label>';
  return '<h3>Biblioteca de pinceles</h3><div class="ui-subtitle">Categorías</div><div class="chips">'+has.map(x=>'<button class="chip'+(x===g?' on':'')+'" data-g="'+x+'">'+x+'</button>').join('')+'</div><div class="brush-library">'+S.brushes.map((b,i)=>grp(b)===g?'<button class="chip'+(i===S.bi?' on':'')+'" data-b="'+i+'">'+b.n+'</button>':'').join('')+'</div>'+
  '<details class="ui-section" open><summary>Identidad y trazo</summary><div class="ui-section-body">'+
  '<label class="f">Nombre<input id="bn" type="text" value="'+B.n+'"></label><label class="f">Categoría<select id="bg">'+GR.map(x=>'<option'+(x===grp(B)?' selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
  BP.map(range).join('')+'</div></details>'+
  '<details class="ui-section"><summary>Presión y respuesta</summary><div class="ui-section-body">'+
  '<label class="row">La presión modifica el tamaño<input type="checkbox" data-c="ps"'+(B.ps?' checked':'')+'></label><label class="row">La presión modifica la opacidad<input type="checkbox" data-c="po"'+(B.po?' checked':'')+'></label>'+
  '<div class="ui-subtitle">Variación por sello</div>'+[['jz','Variación de tamaño',0,100],['jo','Variación de opacidad',0,100],['jr','Variación de rotación',0,180],['js','Variación de espaciado',0,100],['poAmt','Respuesta de opacidad a presión',0,100]].map(range).join('')+'</div></details>'+
  '<details class="ui-section"><summary>Punta y textura</summary><div class="ui-section-body">'+
  '<label class="f">Forma de punta · PNG transparente, máximo 1080 × 1080<input id="tipf" type="file" accept="image/png"></label><div id="tipm" class="ui-hint">'+(B.tip?'Forma personalizada activa':'Punta redonda predeterminada')+'</div>'+
  (B.tip?'<div class="chips"><button class="chip" id="tipx">Quitar forma</button></div><label class="f">Ángulo: <b id="v_ang">'+(B.ang||0)+'</b>°<input type="range" data-p="ang" min="0" max="359" value="'+(B.ang||0)+'"></label><label class="row">Gira con el trazo<input type="checkbox" data-c="fol"'+(B.fol?' checked':'')+'></label>':'')+
  '<label class="f">Textura de grano · PNG<input id="grainf" type="file" accept="image/png"></label><div id="grainm" class="ui-hint">'+(B.grainTip?'Textura personalizada activa':'Sin textura personalizada')+'</div>'+
  (B.grainTip?'<div class="chips"><button class="chip" id="grainx">Quitar textura</button></div>':'')+range(['gd','Profundidad de textura',0,100])+'</div></details>'+
  '<details class="ui-section"><summary>Acciones del pincel</summary><div class="ui-section-body"><div class="chips"><button class="chip" id="bdup">Duplicar</button><button class="chip" id="bpro">Crear perfil Brush Pen</button>'+(S.brushes.length>1?'<button class="chip" id="bdel">Eliminar</button>':'')+'</div></div></details>'}
function wireBrush(){
  const B=()=>S.brushes[S.bi],re=()=>{fly.innerHTML=brushHTML();wireBrush()};
  fly.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{gSel=b.dataset.g;re()});
  fly.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{S.bi=+b.dataset.b;save();re()});
  $('#bn').onchange=e=>{B().n=e.target.value||'Pincel';save();re()};
  $('#bg').onchange=e=>{B().g=e.target.value;gSel=e.target.value;save();re()};
  fly.querySelectorAll('[data-p]').forEach(r=>r.oninput=()=>{B()[r.dataset.p]=+r.value;$('#v_'+r.dataset.p).textContent=r.value;save()});
  fly.querySelectorAll('[data-c]').forEach(c=>c.onchange=()=>{B()[c.dataset.c]=c.checked?1:0;save()});
  $('#bdup').onclick=()=>{S.brushes.push({...B(),n:B().n+' copia',g:grp(B())});S.bi=S.brushes.length-1;save();re()};
  const d=$('#bdel');if(d)d.onclick=()=>{S.brushes.splice(S.bi,1);S.bi=Math.max(0,S.bi-1);save();re()};
  const tx=$('#tipx');if(tx)tx.onclick=()=>{delete B().tip;save();re()};
  const gx=$('#grainx');if(gx)gx.onclick=()=>{delete B().grainTip;save();re()};
  const addImage=(file,kind)=>{if(!file)return;const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{
    const m=Math.min(1,1080/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*m));c.height=Math.max(1,Math.round(im.height*m));c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    const url=c.toDataURL('image/png');(kind==='tip'?loadTip:loadGrain)(url,()=>{B()[kind==='tip'?'tip':'grainTip']=url;save();re();const msg=$('#'+(kind==='tip'?'tipm':'grainm'));if(msg)msg.textContent=(m<1?'Reducida a '+c.width+'×'+c.height+'. ':'')+(kind==='tip'?'Forma cargada':'Textura cargada')})};im.src=fr.result};fr.readAsDataURL(file)};
  $('#tipf').onchange=e=>addImage(e.target.files[0],'tip');
  $('#grainf').onchange=e=>addImage(e.target.files[0],'grain');
  $('#bpro').onclick=()=>{const ref={...B(),n:'Brush Pen · Filmframe',g:'Mis pinceles',size:38,op:100,hard:92,sp:5,grain:0,scat:0,ps:1,po:1,poAmt:47,jz:0,jo:0,jr:0,js:0};delete ref.grainTip;
    const oval=document.createElement('canvas');oval.width=oval.height=128;const og=oval.getContext('2d');og.fillStyle='#000';og.beginPath();og.ellipse(64,64,57,61,0,0,Math.PI*2);og.fill();ref.tip=oval.toDataURL('image/png');
    S.brushes.push(ref);S.bi=S.brushes.length-1;gSel='Mis pinceles';loadTip(ref.tip,()=>{});save();re();toast('Perfil Brush Pen creado con una punta ovalada aproximada y parámetros interpretados del archivo de referencia')};
}
S.brushes.forEach(b=>{if(b.tip)loadTip(b.tip);if(b.grainTip)loadGrain(b.grainTip)});
const dirty=new Set();let pt;
const DB={db:null,
  open(){return new Promise(r=>{try{const q=indexedDB.open(STORE.frames,1);q.onupgradeneeded=()=>q.result.createObjectStore('f');q.onsuccess=()=>{DB.db=q.result;r(1)};q.onerror=()=>r(0)}catch(e){r(0)}})},
  put(k,v){return new Promise(r=>{if(!DB.db)return r(false);try{const tx=DB.db.transaction('f','readwrite');tx.objectStore('f').put(v,k);tx.oncomplete=()=>r(true);tx.onerror=tx.onabort=()=>r(false)}catch(e){r(false)}})},
  putCell(id,b,v){return new Promise(r=>{if(!DB.db)return r(false);try{const x=DB.db.transaction('f','readwrite'),s=x.objectStore('f');s.put(b,'c'+id);if(v!=null)s.put(v,'cv'+id);x.oncomplete=()=>r(true);x.onerror=x.onabort=()=>r(false)}catch(e){r(false)}})},
  get(k){return new Promise(r=>{if(!DB.db)return r(null);try{const q=DB.db.transaction('f').objectStore('f').get(k);q.onsuccess=()=>r(q.result||null);q.onerror=()=>r(null)}catch(e){r(null)}})}};
function toast(t){let e=$('#toast');if(!e){e=document.createElement('div');e.id='toast';e.style.cssText='position:absolute;left:50%;top:14px;transform:translateX(-50%);background:var(--accent);color:var(--on);padding:10px 14px;border-radius:14px;font-size:13px;max-width:90%;z-index:5';document.body.appendChild(e)}
  e.textContent=t;e.style.display='block';clearTimeout(e.t);e.t=setTimeout(()=>e.style.display='none',6000)}
let warned=false;
const flushSave=()=>{try{if(pt)persistNow()}catch(e){}};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushSave()});
addEventListener('pagehide',flushSave);

const Z={z:1,x:0,y:0},P=new Map(),zl=$('#zl'),st=$('#stage');let G=null,spaceDown=false;
// Zoom/pan 1.1.7: el punto bajo los dedos/cursor se mantiene fijo, con límites de paneo y píxeles nítidos al acercar
const clampZ=z=>Math.max(.1,Math.min(32,z));
function applyZ(){const T=()=>view.style.transform='translate('+Z.x+'px,'+Z.y+'px) scale('+Z.z+')';T();
  const r=view.getBoundingClientRect(),s=st.getBoundingClientRect(),m=Math.min(80,r.width/3,r.height/3);let dx=0,dy=0;
  if(r.right<s.left+m)dx=s.left+m-r.right;else if(r.left>s.right-m)dx=s.right-m-r.left;
  if(r.bottom<s.top+m)dy=s.top+m-r.bottom;else if(r.top>s.bottom-m)dy=s.bottom-m-r.top;
  if(dx||dy){Z.x+=dx;Z.y+=dy;T()}
  view.style.imageRendering=r.width*(devicePixelRatio||1)>=W*2?'pixelated':'auto';zl.textContent=Math.round(Z.z*100)+'%'}
function resetZ(){Z.z=1;Z.x=Z.y=0;applyZ()}
function zoomAt(px,py,nz){nz=clampZ(nz);const r=view.getBoundingClientRect(),k=nz/Z.z;Z.x+=(px-r.left-r.width/2)*(1-k);Z.y+=(py-r.top-r.height/2)*(1-k);Z.z=nz;applyZ()}
function actualZ(){const r=view.getBoundingClientRect();return W/((devicePixelRatio||1)*r.width/Z.z)}
function pinchStart(){const[a,b]=[...P.values()],r=view.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  G={d:Math.hypot(a.x-b.x,a.y-b.y)||1,z:Z.z,u:{x:((a.x+b.x)/2-cx)/Z.z,y:((a.y+b.y)/2-cy)/Z.z},c:{x:cx-Z.x,y:cy-Z.y}}}
function gestDown(e){P.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(e.pointerType==='touch'&&P.size===2){
    if(drawing){drawing=false;const h=hist.pop();if(h){h.c.getContext('2d').putImageData(h.d,0,0);render()}}
    pinchStart();return true}
  if(e.button===1||spaceDown){G={pan:1,sx:e.clientX,sy:e.clientY,x:Z.x,y:Z.y};view.setPointerCapture(e.pointerId);return true}
  return !!G}
function gestMove(e){if(!G)return false;const p=P.get(e.pointerId);if(p){p.x=e.clientX;p.y=e.clientY}
  if(G.pan){Z.x=G.x+e.clientX-G.sx;Z.y=G.y+e.clientY-G.sy;applyZ();return true}
  if(P.size>=2){const[a,b]=[...P.values()],z=clampZ(G.z*Math.hypot(a.x-b.x,a.y-b.y)/G.d);
    Z.z=z;Z.x=(a.x+b.x)/2-G.u.x*z-G.c.x;Z.y=(a.y+b.y)/2-G.u.y*z-G.c.y;applyZ()}
  return true}
function gestUp(e){P.delete(e.pointerId);if(!G)return;if(G.pan){G=null;return}
  if(P.size>=2){pinchStart();return}
  G=null;if(Z.z!==1&&Math.abs(Z.z-1)<.07){const r=view.getBoundingClientRect();zoomAt(r.left+r.width/2,r.top+r.height/2,1);if(Math.hypot(Z.x,Z.y)<40)resetZ()}}
st.style.touchAction='none';
// gestos también desde el área vacía del escenario (un dedo = paneo, dos = pellizco)
st.addEventListener('pointerdown',e=>{if(e.target!==st||playing)return;if(!gestDown(e)&&!G)G={pan:1,sx:e.clientX,sy:e.clientY,x:Z.x,y:Z.y};st.setPointerCapture(e.pointerId)});
st.addEventListener('pointermove',e=>{if(e.target===st&&G)gestMove(e)});
const sUp=e=>{if(e.target===st&&P.has(e.pointerId))gestUp(e)};st.addEventListener('pointerup',sUp);st.addEventListener('pointercancel',sUp);
st.addEventListener('wheel',e=>{e.preventDefault();
  if(e.shiftKey){Z.x-=e.deltaY||e.deltaX;applyZ();return}
  if(e.deltaX&&!e.ctrlKey){Z.x-=e.deltaX;Z.y-=e.deltaY;applyZ();return}
  zoomAt(e.clientX,e.clientY,Z.z*Math.exp(-e.deltaY*(e.deltaMode?.05:.0016)*(e.ctrlKey?3:1)))},{passive:false});
zl.title='Tocar: ajustar / 1:1';
zl.onclick=()=>{if(Math.abs(Z.z-1)>.02)return resetZ();const s=st.getBoundingClientRect(),a=actualZ();zoomAt(s.left+s.width/2,s.top+s.height/2,a>1.05?a:2)};
const bc=document.createElement('div');bc.style.cssText='position:fixed;pointer-events:none;border:1.5px solid #fff;outline:1px solid #000;border-radius:50%;display:none;z-index:4;transform:translate(-50%,-50%)';document.body.appendChild(bc);
view.style.cursor='none';
view.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||playing||G||tool==='fil'||tool==='sel'||tool==='eye'||tool==='txt'||tool==='gd'){bc.style.display='none';return}
  const r=view.getBoundingClientRect(),s=Math.max(4,(tool==='era'?S.sz.era:S.brushes[S.bi].size)*r.width/1000);
  bc.style.width=bc.style.height=s+'px';bc.style.left=e.clientX+'px';bc.style.top=e.clientY+'px';bc.style.display='block'});
view.addEventListener('pointerleave',()=>bc.style.display='none');
function setT(t){tool=t;closeFly();rail()}
addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();
  if(k===' '){spaceDown=true;e.preventDefault()}
  else if((e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();undo()}
  else if(k==='b')setT('pen');else if(k==='e')setT('era');
  else if(k==='['||k===']'){const d=k===']'?2:-2,o=tool==='era'?S.sz:S.brushes[S.bi],f=tool==='era'?'era':'size';o[f]=Math.max(1,Math.min(120,o[f]+d));save()}
  else if(k==='arrowleft')go(cur-1);else if(k==='arrowright')go(cur+1);
  else if(k==='enter')$('#play').click();else if(k==='n')$('#add').click();else if(k==='0')resetZ()});
addEventListener('keyup',e=>{if(e.key===' ')spaceDown=false});
function memEst(){const mb=W*H*4/1048576,n=T(),live=(1+S.before+S.after)*mb,pre=Math.min(n,Math.ceil(S.fps*2))*mb,und=8*mb*.1,tot=live+pre+und;
  $('#mem').innerHTML='Cada cuadro sin comprimir: '+mb.toFixed(1)+' MB<br>Proyecto de '+n+' cuadros sin optimizar: '+(n*mb/1024).toFixed(2)+' GB<br>Con el diseño propuesto, en RAM: unos '+Math.round(tot)+' MB<br>Caché en disco: unos '+Math.round(n*.4)+' MB (suponiendo 0.4 MB por cuadro)'}
function applyTheme(){if(S.theme==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',S.theme)}
function sheet(){
  closeFly();
  const tg=Object.keys(S.tools).map(k=>'<label class="row">'+NAMES[k]+'<input type="checkbox" data-t="'+k+'"'+(S.tools[k]?' checked':'')+'></label>').join('');
  $('#sheet').innerHTML='<h3>Ajustes</h3><h4>Barra de herramientas</h4>'+
  '<label class="row">Posición<select id="sd"><option value="left">Izquierda</option><option value="right">Derecha</option></select></label><div class="tg">'+tg+'</div>'+
  '<h4>Lienzo y animación</h4><label class="row">Resolución<select id="rs"><option>1280x720</option><option>1920x1080</option><option>2048x1080</option><option>2048x2048</option><option value="">Personalizada…</option></select></label>'+
  '<div class="row" style="gap:10px"><label class="f" style="flex:1">Ancho<input id="cw" type="number" min="64" max="4096" value="'+W+'"></label><label class="f" style="flex:1">Alto<input id="ch" type="number" min="64" max="4096" value="'+H+'"></label></div>'+
  '<label class="row">Cuadros por segundo<input id="fp" type="number" min="1" max="60" value="'+S.fps+'"></label>'+
  '<label class="row">Color del papel<input id="pp" type="color" value="'+S.paper+'" style="width:64px;height:34px"></label>'+
  '<label class="row">Sensibilidad a la presión<input id="pr" type="checkbox"'+(S.press?' checked':'')+'></label>'+
  '<h4>Apariencia</h4><label class="row">Tema<select id="th"><option value="auto">Automático</option><option value="light">Claro</option><option value="dark">Oscuro</option></select></label>'+
  '<h4>Vista previa y trazo</h4><label class="row">Caché de vista previa en disco<input id="pc" type="checkbox"'+(S.pvc!==0?' checked':'')+'></label><label class="row">Estabilizador: <b id="vs">'+(S.stab||0)+'</b><input id="sb" type="range" min="0" max="100" value="'+(S.stab||0)+'" style="width:120px"></label><label class="row">Modo rendimiento (suavizado bajo, para dispositivos modestos)<input id="pf" type="checkbox"'+(S.perf?' checked':'')+'></label>'+advSet()+'<div class="chips"><button class="chip" id="pcl">Limpiar caché</button><button class="chip" id="hk">Atajos de teclado</button></div><h4>Memoria estimada</h4><label class="row">Avisar a partir de (MB)<input id="mw" type="number" min="200" step="100" value="'+S.memWarn+'"></label>'+'<div id="mem" style="font-size:13px;line-height:1.6;color:var(--muted)"></div><button class="done" id="ok">Listo</button>';
  $('#sd').value=S.side;{const v=W+'x'+H;$('#rs').value=[...$('#rs').options].some(o=>o.value===v)?v:''}$('#th').value=S.theme;$('#ov').classList.add('show');
  $('#sd').onchange=e=>{S.side=e.target.value;save();rail()};
  $('#sheet').querySelectorAll('[data-t]').forEach(c=>c.onchange=()=>{S.tools[c.dataset.t]=c.checked?1:0;save();rail()});
  const syncWH=()=>{const v=W+'x'+H;$('#rs').value=[...$('#rs').options].some(o=>o.value===v)?v:''};
  $('#rs').onchange=e=>{if(!e.target.value)return;const[w,h]=e.target.value.split('x').map(Number);$('#cw').value=w;$('#ch').value=h;setSize(w,h)};
  $('#cw').onchange=e=>{let w=Math.max(64,Math.min(4096,Math.round(+e.target.value)||W));e.target.value=w;setSize(w,Math.max(64,Math.min(4096,+$('#ch').value||H)));syncWH()};
  $('#ch').onchange=e=>{let h=Math.max(64,Math.min(4096,Math.round(+e.target.value)||H));e.target.value=h;setSize(Math.max(64,Math.min(4096,+$('#cw').value||W)),h);syncWH()};
  $('#fp').onchange=e=>{S.fps=Math.max(1,Math.min(60,+e.target.value||12));save()};
  $('#pp').oninput=e=>{S.paper=e.target.value;save();render();thumbsAll()};
  $('#pr').onchange=e=>{S.press=e.target.checked;save()};
  $('#th').onchange=e=>{S.theme=e.target.value;save();applyTheme()};
  $('#pc').onchange=e=>{S.pvc=e.target.checked?1:0;save()};$('#pf').onchange=e=>{S.perf=e.target.checked?1:0;SPR.clear();TIPS.clear();save();toast(S.perf?'Modo rendimiento activado':'Modo rendimiento desactivado')};$('#sb').oninput=e=>{S.stab=+e.target.value;$('#vs').textContent=S.stab;save()};$('#pcl').onclick=clearCache;advWire();$('#hk').onclick=help;$('#mw').onchange=e=>{S.memWarn=Math.max(200,+e.target.value||1500);save()};
  $('#ok').onclick=()=>$('#ov').classList.remove('show');
  memEst();
}
$('#ov').addEventListener('click',e=>{if(e.target.id==='ov')e.target.classList.remove('show')});


