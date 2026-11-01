/* ===== Puente Android (módulo 10) =====
   Sólo actúa dentro del WebView de la app (cuando existe window.FilmframeAndroid,
   inyectado por DownloadBridge.kt). En un navegador normal no hace nada.
   Reemplaza dos comportamientos que el WebView no resuelve solo:
   1) dl(blob, nombre): descargas por <a download> con blob: -> se guardan en Descargas/Filmframe.
   2) window.open(url): abre enlaces https (p. ej. el APK nuevo en MediaFire) en el navegador. */
(()=>{
  const B=window.FilmframeAndroid;
  if(!B)return;
  const say=m=>{try{typeof toast==='function'?toast(m):console.log(m)}catch(_){}};
  const CH=3*1024*1024; // múltiplo de 3: cada trozo base64 sale sin relleno intermedio
  const b64=buf=>{const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
  async function save(blob,name){
    if(!B.begin(String(name||'archivo'),blob.type||'application/octet-stream')){say('No se pudo crear el archivo');return}
    try{
      for(let o=0;o<blob.size;o+=CH){
        if(!B.chunk(b64(await blob.slice(o,o+CH).arrayBuffer())))throw new Error('write');
      }
      const where=B.end();
      say(where?'Guardado en '+where:'Guardado');
    }catch(e){try{B.abort()}catch(_){}say('Error al guardar el archivo')}
  }
  // dl es una declaración de función global (módulo 01): se puede reasignar sin tocarla.
  window.dl=function(b,n){return save(b,n)};
  window.open=function(u){
    try{const url=String(u||'');if(/^https:\/\//i.test(url)){B.openUrl(url);return null}}catch(_){}
    return null;
  };
  // Lo llama MainActivity.onPause(): reutiliza los guardados que ya hace el módulo 00.
  window.__ffSave=()=>{try{dispatchEvent(new Event('pagehide'))}catch(_){}};
})();
