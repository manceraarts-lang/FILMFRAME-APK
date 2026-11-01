
// ===== FASE 4: audio en el video, rotoscopio, audio flexible =====
async function addAudio(blob,n,off=0,m=0,x={}){const ac=AC||(AC=new(window.AudioContext||window.webkitAudioContext)());let buf;
  try{buf=await ac.decodeAudioData(await blob.arrayBuffer())}catch(e){return toast('No se pudo leer ese audio')}
  const d=buf.getChannelData(0),pk=new Float32Array(Math.ceil(buf.duration*100)+2),k=Math.floor(buf.sampleRate/100);
  for(let i=0;i<d.length;i++){const v=Math.abs(d[i]),j=(i/k)|0;if(v>pk[j])pk[j]=v}
  AU.push({n,blob,buf,off,m,pk,vol:x.vol??1,tr:x.tr||0,te:x.te||0,fi:x.fi||0,fo:x.fo||0});audSave();buildStrip()}
function audSave(){DB.put('audio',AU.map(a=>({n:a.n,off:a.off,m:a.m,vol:a.vol,tr:a.tr,te:a.te,fi:a.fi,fo:a.fo})));AU.forEach((a,i)=>DB.put('a'+i,a.blob))}
// programa todas las pistas (con recorte, volumen y fundidos) en un contexto/destino; f = cuadro de inicio
function aSched(ctx,dest,f,when){const out=[],ts=f/S.fps;
  AU.forEach(a=>{if(a.m)return;const len=a.buf.duration-a.tr-a.te;if(len<=0)return;const u0=ts-a.off/S.fps;if(u0>=len)return;
    const s=ctx.createBufferSource(),g=ctx.createGain(),cst=when-u0,ga=u=>Math.max(0,a.vol*(S.mvol??1)*(a.fi?Math.min(1,Math.max(0,u)/a.fi):1)*(a.fo?Math.min(1,(len-u)/a.fo):1)),us=Math.max(u0,0);
    s.buffer=a.buf;s.connect(g);g.connect(dest);
    g.gain.setValueAtTime(ga(us),Math.max(when,cst));[a.fi,len-a.fo,len].forEach(u=>{if(u>us)g.gain.linearRampToValueAtTime(ga(u),cst+u)});
    if(u0>=0)s.start(when,a.tr+u0,len-u0);else s.start(cst,a.tr,len);out.push(s)});return out}
function aPlay(f){aStop();if(!AC)return;AC.resume();AS=aSched(AC,AC.destination,f,AC.currentTime)}
$('#au').onclick=()=>{if(AU.length>=4)return toast('Máximo 4 pistas de audio');$('#af').click()};
function audRows(){const n=T();AU.forEach((a,i)=>{const r=document.createElement('div');r.className='rw';r.title=a.n+' (toca la onda para editar)';
  r.innerHTML='<div class="lb"><button data-ao="'+i+',-1" aria-label="Adelantar audio">◀</button><button data-ao="'+i+',1" aria-label="Retrasar audio">▶</button><button data-am="'+i+'" aria-label="Silenciar">'+(a.m?'🔇':'🔊')+'</button><button data-ax="'+i+'" aria-label="Quitar audio">✕</button></div><canvas class="wv" data-i="'+i+'" width="'+n*46+'" height="26" style="width:'+n*46+'px;height:26px;border-radius:5px;background:var(--bg)"></canvas>';
  const c=r.querySelector('canvas'),g=c.getContext('2d'),len=a.buf.duration-a.tr-a.te;
  for(let x=0;x<c.width;x++){const u=(x/46-a.off)/S.fps;if(u<0||u>=len)continue;g.fillStyle='rgba(224,145,42,.18)';g.fillRect(x,0,1,26);
    const v=a.pk[((u+a.tr)*100)|0]||0,h=Math.max(1,v*24*Math.min(1,a.vol));g.fillStyle=a.m?'#999':'#e0912a';g.fillRect(x,13-h/2,1,h)}
  strip.appendChild(r)})}
strip.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('canvas.wv');if(c)audSheet(+c.dataset.i)});
function audSheet(i){const a=AU[i],fld=(k,l,st)=>'<label class="row">'+l+'<input type="number" data-k="'+k+'" step="'+st+'" value="'+a[k]+'"></label>';
  $('#sheet').innerHTML='<h3>♪ '+esc(a.n)+'</h3><label class="f">Volumen: <b id="vv">'+Math.round(a.vol*100)+'</b>%<input id="vl" type="range" min="0" max="150" value="'+Math.round(a.vol*100)+'"></label>'+
    fld('off','Empieza en el cuadro',1)+fld('tr','Recortar inicio (s)',.1)+fld('te','Recortar final (s)',.1)+fld('fi','Fundido de entrada (s)',.1)+fld('fo','Fundido de salida (s)',.1)+
    '<div class="chips"><button class="chip" id="ap">▶ Probar desde el cuadro actual</button></div><button class="done" id="ok5">Listo</button>';
  $('#ov').classList.add('show');
  $('#vl').oninput=e=>{a.vol=e.target.value/100;$('#vv').textContent=e.target.value};$('#vl').onchange=()=>{audSave();buildStrip()};
  $('#sheet').querySelectorAll('[data-k]').forEach(n=>n.onchange=()=>{const k=n.dataset.k;let v=+n.value||0;if(k!=='off')v=Math.max(0,v);a[k]=v;audSave();buildStrip()});
  $('#ap').onclick=()=>{aPlay(cur);setTimeout(aStop,4000)};$('#ok5').onclick=()=>{aStop();$('#ov').classList.remove('show')}}
// ----- video exportado con audio -----
async function xVid(sc){const ms=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'],
  m=window.MediaRecorder&&ms.find(x=>MediaRecorder.isTypeSupported(x));if(!m)return xm('Este navegador no puede grabar video');
  const c=fc(0,sc,1),x=c.getContext('2d'),vs=c.captureStream(S.fps),act=AC&&AU.some(a=>!a.m);let dest=null;
  if(act){await AC.resume();dest=AC.createMediaStreamDestination();dest.stream.getAudioTracks().forEach(t=>vs.addTrack(t))}
  const r=new MediaRecorder(vs,{mimeType:m,videoBitsPerSecond:(S.vbr||8)*1e6,audioBitsPerSecond:(S.abr||192)*1e3}),ch=[],fin=new Promise(z=>r.onstop=z),n=T(),dt=1000/S.fps;let src=[];
  r.ondataavailable=e=>e.data.size&&ch.push(e.data);r.start();const t0=performance.now()+60;if(act)src=aSched(AC,dest,0,AC.currentTime+.06);
  for(let t=0;t<n;t++){xm('Video '+(t+1)+' / '+n);x.globalAlpha=1;x.fillStyle=S.paper;x.fillRect(0,0,c.width,c.height);XPT=1;comp(t,x);XPT=0;
    await new Promise(z=>setTimeout(z,Math.max(0,t0+(t+1)*dt-performance.now())))}
  r.stop();src.forEach(s=>{try{s.stop()}catch(e){}});await fin;const mp=m.includes('mp4');
  dl(new Blob(ch,{type:m}),'animacion.'+(mp?'mp4':'webm'));xm('Listo: '+(mp?'MP4':'WebM (este navegador no graba MP4)')+(act?' con audio':' sin audio'))}
XP.mp4=xVid;
// ----- rotoscopio -----
const _mk5=mark;mark=function(){_mk5();$('#rf').classList.toggle('on',!!(L[al]&&L[al].ref))};
$('#rf').onclick=()=>{const l=L[al];l.ref=l.ref?0:1;mark();persist();toast(l.ref?'Capa de referencia: no se exporta':'Capa normal: se exporta')};
$('#rt').onclick=()=>$('#vf').click();
$('#vf').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)roto(f)};
const seek=(v,t)=>new Promise(ok=>{if(Math.abs(v.currentTime-t)<1e-3&&v.readyState>=2)return ok();const d=()=>{v.removeEventListener('seeked',d);ok()};v.addEventListener('seeked',d);v.currentTime=Math.min(t,Math.max(0,v.duration-.001));setTimeout(d,2500)});
async function roto(f){if(playing)$('#play').click();const v=document.createElement('video'),url=URL.createObjectURL(f);v.muted=true;v.playsInline=true;v.preload='auto';v.src=url;
  const ok=await new Promise(r=>{v.onloadeddata=()=>r(1);v.onerror=()=>r(0)});
  if(!ok||!isFinite(v.duration)){URL.revokeObjectURL(url);return toast('No se pudo leer ese video')}
  const dur=v.duration,t0=cur;let cancel=0;
  $('#sheet').innerHTML='<h3>Rotoscopio</h3><div style="font-size:13px;color:var(--muted);margin-bottom:10px">'+esc(f.name)+'<br>'+v.videoWidth+'×'+v.videoHeight+' · '+dur.toFixed(1)+' s</div><label class="row">Desde (s)<input id="rd" type="number" min="0" step=".1" value="0"></label><label class="row">Hasta (s)<input id="rh" type="number" min="0" step=".1" value="'+Math.min(dur,5).toFixed(1)+'"></label><label class="row">Importar también el audio<input id="ra" type="checkbox"></label><div id="rp" style="font-size:13px;color:var(--muted);margin:6px 0"></div><button class="done" id="rg2">Importar</button><button class="done" id="rc" style="background:var(--line);color:var(--text)">Cancelar</button>';
  $('#ov').classList.add('show');
  const info=()=>{const a=Math.max(0,+$('#rd').value||0),b=Math.min(dur,+$('#rh').value||0),n=Math.max(0,Math.round((b-a)*S.fps));$('#rp').textContent=n+' cuadros a '+S.fps+' fps · ≈ '+Math.round(n*W*H*4/1048576)+' MB de RAM';return[a,b,n]};
  $('#rd').oninput=$('#rh').oninput=info;info();
  $('#rc').onclick=()=>{cancel=1;URL.revokeObjectURL(url);$('#ov').classList.remove('show')};
  $('#rg2').onclick=async()=>{const[a,b,n]=info();if(n<1)return;if(n>600)return toast('Máximo 600 cuadros por importación');
    if(n*W*H*4/1048576>S.memWarn&&!confirm('Esto usará mucha memoria. ¿Continuar?'))return;
    $('#rg2').disabled=true;const lay={...nl('Rotoscopio'),o:50,k:1,ref:1,a:Array(t0).fill(null)},sc=Math.min(W/v.videoWidth,H/v.videoHeight),dw=v.videoWidth*sc,dh=v.videoHeight*sc;
    for(let i=0;i<n&&!cancel;i++){$('#rp').textContent='Extrayendo '+(i+1)+' / '+n;await seek(v,a+i/S.fps);const c=mk();c.getContext('2d').drawImage(v,(W-dw)/2,(H-dh)/2,dw,dh);lay.a.push(c)}
    URL.revokeObjectURL(url);if(cancel)return;
    L.splice(0,0,lay);al++;hist=[];sel={a:t0,b:t0};if($('#ra').checked)await addAudio(f,f.name,t0,0,{tr:a});
    $('#ov').classList.remove('show');buildStrip();render();toast('Rotoscopio importado en una capa de referencia (bloqueada, no se exporta)')}}

